import { google, type sheets_v4 } from "googleapis";
import { cellToString, normalizePhoneFromSheet } from "@/lib/sheet-utils";
import { sheetRowSchema, type SheetRowData } from "@/lib/validations";

const HEADER_ALIASES: Record<keyof SheetRowData, string[]> = {
  name: ["name", "full name", "user full name", "customer", "customer name"],
  phone: ["phone", "contact number", "mobile", "contact", "phone number"],
  email: ["email", "e-mail", "email address"],
  company: ["company", "organization", "business", "company name"],
  project_type: [
    "project type",
    "project_type",
    "proj type",
    "proj_type",
    "type",
  ],
  project_goal: [
    "project goal",
    "project_goal",
    "proj goal",
    "proj_goal",
    "goal",
  ],
  budget: ["budget", "price range", "estimated budget"],
  timeline: ["timeline", "time line", "time_line", "timeframe", "deadline"],
  source: ["source", "lead source", "channel"],
  submittedAt: [
    "date submitted",
    "date",
    "submitted",
    "submitted at",
    "timestamp",
    "created at",
  ],
};

export interface ParsedSheetRow {
  rowNumber: number;
  data: SheetRowData;
}

export interface InvalidSheetRow {
  rowNumber: number;
  reason: string;
}

export interface SheetFetchResult {
  rows: ParsedSheetRow[];
  invalidRows: InvalidSheetRow[];
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function mapHeaders(headers: string[]) {
  const mapping: Partial<Record<keyof SheetRowData, number>> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized)) {
        mapping[field as keyof SheetRowData] = index;
      }
    }
  });

  return mapping;
}

function getCell(row: string[], index?: number) {
  if (index === undefined) return "";
  return cellToString(String(row[index] ?? ""));
}

export function parseSubmittedAt(value: string): string | null {
  if (!value.trim()) return null;

  const match = value
    .trim()
    .match(/^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})-(\d{2})-(\d{4})$/);

  if (match) {
    const [, h, m, s, day, month, year] = match;
    const date = new Date(`${year}-${month}-${day}T${h}:${m}:${s}`);
    if (!isNaN(date.getTime())) return date.toISOString();
  }

  const fallback = new Date(value);
  if (!isNaN(fallback.getTime())) return fallback.toISOString();

  return null;
}

function formatSheetRange(sheetTitle: string, columns = "A:J") {
  const needsQuotes = /[^a-zA-Z0-9_]/.test(sheetTitle);
  const title = needsQuotes ? `'${sheetTitle.replace(/'/g, "''")}'` : sheetTitle;
  return `${title}!${columns}`;
}

async function getFirstSheetTitle(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const title = meta.data.sheets?.[0]?.properties?.title;
  if (!title) throw new Error("No sheets found in the spreadsheet.");
  return title;
}

async function fetchValues(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
) {
  try {
    return await sheets.spreadsheets.values.get({ spreadsheetId, range });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Unable to parse range")) throw error;

    const sheetTitle = await getFirstSheetTitle(sheets, spreadsheetId);
    return sheets.spreadsheets.values.get({
      spreadsheetId,
      range: formatSheetRange(sheetTitle),
    });
  }
}

export async function fetchSheetRows(): Promise<SheetFetchResult> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const configuredRange = process.env.GOOGLE_SHEET_RANGE;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Sheets config. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  let range = configuredRange;
  if (!range) {
    const sheetTitle = await getFirstSheetTitle(sheets, spreadsheetId);
    range = formatSheetRange(sheetTitle);
  }

  const response = await fetchValues(sheets, spreadsheetId, range);
  const values = response.data.values ?? [];

  if (values.length < 2) return { rows: [], invalidRows: [] };

  const headers = values[0].map((cell) => String(cell));
  const columnMap = mapHeaders(headers);

  const required: (keyof SheetRowData)[] = [
    "name",
    "phone",
    "project_type",
    "project_goal",
  ];
  const missing = required.filter((field) => columnMap[field] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Google Sheet is missing columns: ${missing.join(", ")}. Expected: Name, Phone, Email, Company, Project Type, Project Goal, Budget, Timeline, Source.`
    );
  }

  const rows: ParsedSheetRow[] = [];
  const invalidRows: InvalidSheetRow[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i].map((cell) => String(cell ?? ""));
    const isEmpty = row.every((cell) => !cellToString(cell));
    if (isEmpty) continue;

    const submittedRaw = getCell(row, columnMap.submittedAt);
    const emailRaw = getCell(row, columnMap.email);

    const raw = {
      name: getCell(row, columnMap.name),
      phone: normalizePhoneFromSheet(getCell(row, columnMap.phone)),
      email: emailRaw || undefined,
      company: getCell(row, columnMap.company) || undefined,
      project_type: getCell(row, columnMap.project_type),
      project_goal: getCell(row, columnMap.project_goal),
      budget: getCell(row, columnMap.budget) || undefined,
      timeline: getCell(row, columnMap.timeline) || undefined,
      source: getCell(row, columnMap.source) || "botcake",
      submittedAt: submittedRaw || undefined,
    };

    const parsed = sheetRowSchema.safeParse(raw);
    if (!parsed.success) {
      invalidRows.push({
        rowNumber: i + 1,
        reason: parsed.error.errors[0]?.message ?? "Invalid row data",
      });
      continue;
    }

    rows.push({
      rowNumber: i + 1,
      data: {
        ...parsed.data,
        submittedAt: parseSubmittedAt(submittedRaw) ?? submittedRaw,
      },
    });
  }

  return { rows, invalidRows };
}

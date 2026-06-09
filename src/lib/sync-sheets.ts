import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSheetRows } from "@/lib/google-sheets";
import type { SyncResult } from "@/types";

function buildSyncMessage(result: {
  sheetRowCount: number;
  imported: number;
  skipped: number;
  invalid: number;
  errors: string[];
  invalidRows: { rowNumber: number; reason: string }[];
}) {
  const parts: string[] = [];
  parts.push(`Found ${result.sheetRowCount} row(s) in sheet.`);
  if (result.imported > 0) parts.push(`${result.imported} new lead(s) imported.`);
  if (result.skipped > 0) parts.push(`${result.skipped} already in CRM (skipped).`);
  if (result.invalid > 0) parts.push(`${result.invalid} row(s) invalid.`);
  if (result.imported === 0 && result.skipped === 0 && result.invalid === 0) {
    parts.push("No new data to import.");
  }
  if (result.invalidRows.length > 0) {
    parts.push(
      result.invalidRows
        .slice(0, 2)
        .map((r) => `Row ${r.rowNumber}: ${r.reason}`)
        .join(" ")
    );
  }
  if (result.errors.length > 0) parts.push(result.errors[0]);
  return parts.join(" ");
}

export async function syncLeadsFromGoogleSheet(): Promise<SyncResult> {
  const fetched = await fetchSheetRows();
  const rows = Array.isArray(fetched) ? fetched : (fetched.rows ?? []);
  const invalidRows = Array.isArray(fetched) ? [] : (fetched.invalidRows ?? []);

  if (!Array.isArray(rows)) {
    throw new Error("Failed to read rows from Google Sheet.");
  }

  const supabase = createAdminClient();
  let imported = 0;
  let skipped = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const { rowNumber, data } of rows) {
    try {
      const phone = data.phone;
      const email = data.email || null;

      const { data: existingLeads, error: lookupError } = await supabase
        .from("leads")
        .select("id, project_goal, customer:customers(phone, email)")
        .eq("project_goal", data.project_goal);

      if (lookupError) throw new Error(lookupError.message);

      const alreadyImported = (existingLeads ?? []).find((lead) => {
        const customer = lead.customer as {
          phone?: string;
          email?: string | null;
        } | null;
        const samePhone = customer?.phone === phone;
        const sameEmail = email && customer?.email === email;
        return samePhone || sameEmail;
      });

      if (alreadyImported) {
        skipped++;
        continue;
      }

      let existingCustomer = null;

      if (email) {
        const { data: byEmail } = await supabase
          .from("customers")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        existingCustomer = byEmail;
      }

      if (!existingCustomer) {
        const { data: byPhone } = await supabase
          .from("customers")
          .select("id")
          .eq("phone", phone)
          .maybeSingle();
        existingCustomer = byPhone;
      }

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: data.name,
            phone,
            email,
            company: data.company ?? null,
          })
          .select("id")
          .single();

        if (customerError) throw new Error(customerError.message);
        customerId = newCustomer.id;
      } else {
        await supabase
          .from("customers")
          .update({
            name: data.name,
            email,
            company: data.company ?? null,
          })
          .eq("id", customerId);
        updated++;
      }

      const submittedAt =
        data.submittedAt && !isNaN(Date.parse(data.submittedAt))
          ? data.submittedAt
          : null;

      const { error: leadError } = await supabase.from("leads").insert({
        customer_id: customerId,
        project_type: data.project_type,
        project_goal: data.project_goal,
        budget: data.budget ?? null,
        timeline: data.timeline ?? null,
        source: data.source ?? "botcake",
        status: "Qualified Lead",
        sheet_row_id: rowNumber,
        submitted_at: submittedAt,
      });

      if (leadError) {
        if (leadError.message.includes("sheet_row_id")) {
          skipped++;
          continue;
        }
        throw new Error(leadError.message);
      }

      imported++;
    } catch (error) {
      errors.push(
        `Row ${rowNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  const sheetRowCount = rows.length + invalidRows.length;

  return {
    success: errors.length === 0,
    totalRows: sheetRowCount,
    imported,
    skipped,
    updated,
    invalid: invalidRows.length,
    invalidRows,
    errors,
    message: buildSyncMessage({
      sheetRowCount,
      imported,
      skipped,
      invalid: invalidRows.length,
      errors,
      invalidRows,
    }),
  };
}

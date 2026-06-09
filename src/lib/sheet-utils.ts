/** Normalize values returned by Google Sheets (numbers, scientific notation, etc.) */
export function cellToString(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d+(\.\d+)?[eE][+\-]?\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return num.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        useGrouping: false,
      });
    }
  }

  return trimmed;
}

export function normalizePhoneFromSheet(phone: string): string {
  let digits = cellToString(phone).replace(/[^\d]/g, "");

  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `0${digits}`;
  }

  return digits;
}

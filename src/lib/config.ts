export function isGoogleSheetsSyncEnabled() {
  return process.env.GOOGLE_SHEETS_SYNC_ENABLED === "true";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getLeadsApiUrl() {
  return `${getAppUrl()}/api/leads`;
}

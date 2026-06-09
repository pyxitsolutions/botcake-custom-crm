import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getLeadsApiUrl, isGoogleSheetsSyncEnabled } from "@/lib/config";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sheetsSyncEnabled = isGoogleSheetsSyncEnabled();
  const leadsApiUrl = getLeadsApiUrl();
  const apiSecretConfigured = Boolean(process.env.LEADS_API_SECRET);

  return (
    <>
      <Header
        title="Settings"
        description="Account and integration settings"
      />
      <div className="space-y-6 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">User ID</p>
              <p className="font-mono text-xs">{user?.id ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Botcake API (Active)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium">Receiving leads via POST</span>
            </div>

            <p className="text-muted-foreground">
              Point your Botcake HTTP Request action to this endpoint. Leads
              are saved directly to Supabase.
            </p>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-medium">Endpoint</p>
              <p className="font-mono text-xs break-all">{leadsApiUrl}</p>
              <p className="font-medium pt-2">Method</p>
              <p className="font-mono text-xs">POST</p>
              <p className="font-medium pt-2">Content-Type</p>
              <p className="font-mono text-xs">application/json</p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-medium">Sample JSON body</p>
              <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">{`{
  "name": "{{user_full_name}}",
  "contact": "{{contact}}",
  "email": "{{email}}",
  "company": "{{company}}",
  "project_type": "{{proj_type}}",
  "project_goal": "{{proj_goal}}",
  "budget": "{{budget}}",
  "timeline": "{{time_line}}",
  "source": "botcake",
  "status": "qualified_lead"
}`}</pre>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-medium">API security</p>
              <p className="text-muted-foreground">
                {apiSecretConfigured
                  ? "LEADS_API_SECRET is set. Include it in Botcake as a query param or header."
                  : "LEADS_API_SECRET is not set. The endpoint is open (dev only)."}
              </p>
              {apiSecretConfigured ? (
                <p className="font-mono text-xs break-all">
                  {leadsApiUrl}?api_key=your_secret
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="text-lg">Google Sheets Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  sheetsSyncEnabled ? "bg-emerald-500" : "bg-muted-foreground"
                }`}
              />
              <span className="font-medium">
                {sheetsSyncEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <p className="text-muted-foreground">
              {sheetsSyncEnabled
                ? "Sheet sync is active. Use the Sync button on the Dashboard."
                : "Sheet sync is turned off. Set GOOGLE_SHEETS_SYNC_ENABLED=true in .env.local to re-enable."}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

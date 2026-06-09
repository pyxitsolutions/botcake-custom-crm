import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { getDashboardStats, getLeads } from "@/lib/actions";
import { isGoogleSheetsSyncEnabled } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, leads] = await Promise.all([
    getDashboardStats(),
    getLeads(),
  ]);
  const sheetsSyncEnabled = isGoogleSheetsSyncEnabled();

  const SyncSheetsButton = sheetsSyncEnabled
    ? (await import("@/components/dashboard/sync-sheets-button")).SyncSheetsButton
    : null;

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your lead pipeline"
      >
        {SyncSheetsButton ? <SyncSheetsButton /> : null}
      </Header>
      <div className="space-y-8 p-4 sm:p-8">
        <StatsCards stats={stats} />
        <RecentLeads leads={leads} />
      </div>
    </>
  );
}

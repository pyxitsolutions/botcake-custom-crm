import { Header } from "@/components/layout/header";
import { EditHintBanner } from "@/components/leads/edit-hint-banner";
import { LeadsTable } from "@/components/leads/leads-table";
import { getLeads } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <>
      <Header
        title="Leads"
        description="Edit status inline or open a lead to update full details"
      />
      <div className="p-4 sm:p-8">
        <EditHintBanner />
        <LeadsTable leads={leads} />
      </div>
    </>
  );
}

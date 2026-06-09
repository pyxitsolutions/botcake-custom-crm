import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateStatusForm } from "@/components/leads/update-status-form";
import { AddNoteForm } from "@/components/leads/add-note-form";
import { NotesList } from "@/components/leads/notes-list";
import { EditCustomerForm } from "@/components/customers/edit-customer-form";
import { EditLeadForm } from "@/components/leads/edit-lead-form";
import { getLeadById, getNotesByLeadId } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const [lead, notes] = await Promise.all([
    getLeadById(id),
    getNotesByLeadId(id),
  ]);

  if (!lead) notFound();

  const customer = lead.customer;

  return (
    <>
      <Header title="Lead Details" description={`Lead for ${customer?.name}`}>
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </Header>

      <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Customer Details</CardTitle>
              <UpdateStatusForm leadId={lead.id} currentStatus={lead.status} />
            </CardHeader>
            <CardContent>
              {customer ? (
                <EditCustomerForm customer={customer} />
              ) : (
                <p className="text-sm text-muted-foreground">No customer linked.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <EditLeadForm lead={lead} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddNoteForm leadId={lead.id} />
              <NotesList notes={notes} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateStatusForm leadId={lead.id} currentStatus={lead.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{lead.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="font-medium capitalize">{lead.source}</p>
              </div>
              {lead.submitted_at && (
                <div>
                  <p className="text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{formatDate(lead.submitted_at)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Created in CRM</p>
                <p className="font-medium">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lead ID</p>
                <p className="font-mono text-xs">{lead.id}</p>
              </div>
              {customer && (
                <div>
                  <p className="text-muted-foreground">Customer Profile</p>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View customer page
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

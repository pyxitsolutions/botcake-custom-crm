import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Building2, Target, Wallet, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateStatusForm } from "@/components/leads/update-status-form";
import { AddNoteForm } from "@/components/leads/add-note-form";
import { NotesList } from "@/components/leads/notes-list";
import { getLeadById, getNotesByLeadId } from "@/lib/actions";
import { formatDate, formatPhone } from "@/lib/utils";

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
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl">{customer?.name}</CardTitle>
                <UpdateStatusForm leadId={lead.id} currentStatus={lead.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-medium">{formatPhone(customer?.phone ?? "")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{customer?.email ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-medium">{customer?.company ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Type</p>
                  <p className="font-medium">{lead.project_type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <Target className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Goal</p>
                  <p className="font-medium">{lead.project_goal}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="font-medium">{lead.budget ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="font-medium">{lead.timeline ?? "—"}</p>
                </div>
              </div>
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
                <p className="text-muted-foreground">Synced to CRM</p>
                <p className="font-medium">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lead ID</p>
                <p className="font-mono text-xs">{lead.id}</p>
              </div>
              {customer && (
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View customer profile
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

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/leads/status-badge";
import { formatDate, formatPhone } from "@/lib/utils";
import type { LeadWithCustomer } from "@/types";

interface RecentLeadsProps {
  leads: LeadWithCustomer[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Leads</CardTitle>
        <Link
          href="/leads"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No leads yet. New leads will appear here when sent from Botcake.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Project Goal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.slice(0, 5).map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium hover:underline"
                    >
                      {lead.customer?.name ?? "Unknown"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatPhone(lead.customer?.phone ?? "")}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {lead.project_goal}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

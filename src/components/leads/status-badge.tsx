import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/types";

const statusVariantMap: Record<
  LeadStatus,
  "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "muted"
> = {
  "Qualified Lead": "info",
  Contacted: "warning",
  "Proposal Sent": "default",
  Negotiation: "secondary",
  "Closed Won": "success",
  "Closed Lost": "destructive",
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}

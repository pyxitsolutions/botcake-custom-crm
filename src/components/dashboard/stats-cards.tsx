import { Users, UserPlus, Phone, Trophy, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statConfig = [
  {
    key: "totalLeads" as const,
    label: "Total Leads",
    icon: Users,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    key: "qualifiedLeads" as const,
    label: "Qualified Leads",
    icon: UserPlus,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "contactedLeads" as const,
    label: "Contacted",
    icon: Phone,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "closedWon" as const,
    label: "Closed Won",
    icon: Trophy,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "closedLost" as const,
    label: "Closed Lost",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statConfig.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats[stat.key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

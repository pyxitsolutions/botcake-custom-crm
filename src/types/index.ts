export const LEAD_STATUSES = [
  "Qualified Lead",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["botcake", "manual", "referral", "website"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  customer_id: string;
  project_type: string;
  project_goal: string;
  budget: string | null;
  timeline: string | null;
  source: string;
  status: LeadStatus;
  sheet_row_id: number | null;
  submitted_at: string | null;
  created_at: string;
}

export interface SyncResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  updated: number;
  invalid: number;
  invalidRows: { rowNumber: number; reason: string }[];
  errors: string[];
  message: string;
}

export interface Note {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
}

export interface LeadWithCustomer extends Lead {
  customer: Customer;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  contactedLeads: number;
  closedWon: number;
  closedLost: number;
}

export interface CreateLeadRequest {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  project_type: string;
  project_goal: string;
  budget?: string;
  timeline?: string;
  source?: string;
  status?: string;
}

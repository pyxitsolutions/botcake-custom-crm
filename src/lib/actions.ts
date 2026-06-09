"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  addNoteSchema,
  loginSchema,
  updateLeadStatusSchema,
} from "@/lib/validations";
import { isGoogleSheetsSyncEnabled } from "@/lib/config";
import { syncLeadsFromGoogleSheet } from "@/lib/sync-sheets";
import type {
  Customer,
  DashboardStats,
  Lead,
  LeadStatus,
  LeadWithCustomer,
  Note,
  SyncResult,
} from "@/types";

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getDbForUser();
  const { data: leads, error } = await supabase.from("leads").select("status");

  if (error) throw new Error(error.message);

  const statuses = leads ?? [];

  return {
    totalLeads: statuses.length,
    qualifiedLeads: statuses.filter((l) => l.status === "Qualified Lead").length,
    contactedLeads: statuses.filter((l) => l.status === "Contacted").length,
    closedWon: statuses.filter((l) => l.status === "Closed Won").length,
    closedLost: statuses.filter((l) => l.status === "Closed Lost").length,
  };
}

export async function getLeads(search?: string, status?: LeadStatus) {
  const supabase = await getDbForUser();

  let query = supabase
    .from("leads")
    .select("*, customer:customers(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  let leads = (data ?? []) as LeadWithCustomer[];

  if (search) {
    const term = search.toLowerCase();
    leads = leads.filter(
      (lead) =>
        lead.customer?.name?.toLowerCase().includes(term) ||
        lead.customer?.phone?.includes(term) ||
        lead.customer?.email?.toLowerCase().includes(term) ||
        lead.customer?.company?.toLowerCase().includes(term) ||
        lead.project_goal?.toLowerCase().includes(term) ||
        lead.project_type?.toLowerCase().includes(term)
    );
  }

  return leads;
}

export async function getLeadById(id: string): Promise<LeadWithCustomer | null> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("leads")
    .select("*, customer:customers(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as LeadWithCustomer;
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let customers = (data ?? []) as Customer[];

  if (search) {
    const term = search.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email?.toLowerCase().includes(term) ?? false) ||
        (c.company?.toLowerCase().includes(term) ?? false)
    );
  }

  return customers;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Customer;
}

export async function getCustomerLeads(customerId: string): Promise<Lead[]> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getNotesByLeadId(leadId: string): Promise<Note[]> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

export async function getAllNotes(): Promise<
  (Note & { lead: Lead & { customer: Customer } })[]
> {
  const supabase = await getDbForUser();

  const { data, error } = await supabase
    .from("notes")
    .select("*, lead:leads(*, customer:customers(*))")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as (Note & { lead: Lead & { customer: Customer } })[];
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to perform this action." };
  }

  return { user };
}

/** Authenticated CRM users get full DB access via service role (server-side only). */
async function getDbForUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return createAdminClient();
}

export async function updateLeadStatusAction(formData: FormData) {
  const auth = await requireAuthenticatedUser();
  if ("error" in auth) return auth;

  const raw = {
    leadId: formData.get("leadId") as string,
    status: formData.get("status") as string,
  };

  const parsed = updateLeadStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.leadId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function addNoteAction(formData: FormData) {
  const auth = await requireAuthenticatedUser();
  if ("error" in auth) return auth;

  const raw = {
    leadId: formData.get("leadId") as string,
    note: formData.get("note") as string,
  };

  const parsed = addNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("notes").insert({
    lead_id: parsed.data.leadId,
    note: parsed.data.note,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/leads/${parsed.data.leadId}`);
  revalidatePath("/notes");

  return { success: true };
}

export async function syncSheetsAction(): Promise<
  SyncResult | { error: string }
> {
  if (!isGoogleSheetsSyncEnabled()) {
    return { error: "Google Sheets sync is disabled." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to sync." };
  }

  try {
    const result = await syncLeadsFromGoogleSheet();

    revalidatePath("/dashboard");
    revalidatePath("/leads");
    revalidatePath("/customers");

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

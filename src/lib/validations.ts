import { z } from "zod";
import { LEAD_STATUSES } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function normalizeLeadApiPayload(body: unknown) {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const payload = { ...(body as Record<string, unknown>) };
    if (!payload.phone && payload.contact) {
      payload.phone = payload.contact;
    }
    return payload;
  }
  return body;
}

export const createLeadApiSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[\d\s+\-()]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().max(200).optional(),
  project_type: z.string().min(1, "Project type is required").max(100),
  project_goal: z.string().min(1, "Project goal is required").max(500),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  source: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
});

export type CreateLeadApiData = z.infer<typeof createLeadApiSchema>;

export const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
});

export type UpdateLeadStatusData = z.infer<typeof updateLeadStatusSchema>;

export const addNoteSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string().min(1, "Note cannot be empty").max(2000),
});

export type AddNoteData = z.infer<typeof addNoteSchema>;

export const updateCustomerSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(200),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone is too long")
    .regex(/^[\d\s+\-()]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
});

export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;

export const updateLeadSchema = z.object({
  leadId: z.string().uuid(),
  project_type: z.string().min(1, "Project type is required").max(100),
  project_goal: z.string().min(1, "Project goal is required").max(500),
  budget: z.string().max(100).optional().or(z.literal("")),
  timeline: z.string().max(100).optional().or(z.literal("")),
  source: z.string().max(50).optional(),
});

export type UpdateLeadData = z.infer<typeof updateLeadSchema>;

export const sheetRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone is too long")
    .regex(/^\d+$/, "Phone must contain digits only"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().optional(),
  project_type: z.string().min(1, "Project type is required"),
  project_goal: z.string().min(1, "Project goal is required"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  source: z.string().optional(),
  submittedAt: z.string().optional(),
});

export type SheetRowData = z.infer<typeof sheetRowSchema>;

export function mapIncomingStatus(status?: string): string {
  if (!status) return "Qualified Lead";
  const normalized = status.toLowerCase().replace(/_/g, " ");
  if (normalized === "qualified lead") return "Qualified Lead";
  if (LEAD_STATUSES.includes(normalized as (typeof LEAD_STATUSES)[number])) {
    return normalized;
  }
  return "Qualified Lead";
}

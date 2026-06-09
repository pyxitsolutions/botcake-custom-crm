import { NextResponse } from "next/server";
import { verifyLeadsApiSecret } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createLeadApiSchema,
  mapIncomingStatus,
  normalizeLeadApiPayload,
} from "@/lib/validations";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    if (!verifyLeadsApiSecret(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const parsed = createLeadApiSchema.safeParse(normalizeLeadApiPayload(body));

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message ?? "Validation failed",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      name,
      phone,
      email,
      company,
      project_type,
      project_goal,
      budget,
      timeline,
      source,
      status,
    } = parsed.data;

    const normalizedPhone = phone.replace(/\s/g, "");
    const normalizedEmail = email?.trim() || null;
    const leadStatus = mapIncomingStatus(status);

    const supabase = createAdminClient();

    const { data: existingLeads, error: lookupError } = await supabase
      .from("leads")
      .select("id, customer:customers(phone, email)")
      .eq("project_goal", project_goal);

    if (lookupError) {
      return NextResponse.json(
        { success: false, message: lookupError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    const duplicate = (existingLeads ?? []).find((lead) => {
      const customer = lead.customer as {
        phone?: string;
        email?: string | null;
      } | null;
      const samePhone = customer?.phone === normalizedPhone;
      const sameEmail =
        normalizedEmail && customer?.email === normalizedEmail;
      return samePhone || sameEmail;
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: true,
          message: "Lead already exists",
          duplicate: true,
          leadId: duplicate.id,
        },
        { headers: corsHeaders }
      );
    }

    let existingCustomer = null;

    if (normalizedEmail) {
      const { data } = await supabase
        .from("customers")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      existingCustomer = data;
    }

    if (!existingCustomer) {
      const { data } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();
      existingCustomer = data;
    }

    let customerId = existingCustomer?.id;

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name,
          phone: normalizedPhone,
          email: normalizedEmail,
          company: company ?? null,
        })
        .select("id")
        .single();

      if (customerError) {
        return NextResponse.json(
          { success: false, message: customerError.message },
          { status: 500, headers: corsHeaders }
        );
      }
      customerId = newCustomer.id;
    } else {
      await supabase
        .from("customers")
        .update({
          name,
          email: normalizedEmail,
          company: company ?? null,
        })
        .eq("id", customerId);
    }

    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        customer_id: customerId,
        project_type,
        project_goal,
        budget: budget ?? null,
        timeline: timeline ?? null,
        source: source ?? "botcake",
        status: leadStatus,
      })
      .select("id")
      .single();

    if (leadError) {
      return NextResponse.json(
        { success: false, message: leadError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        leadId: newLead.id,
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

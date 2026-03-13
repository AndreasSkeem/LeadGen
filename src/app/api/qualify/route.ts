import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/client";
import { buildQualificationSystemPrompt } from "@/lib/ai/prompts";
import { buildMissingInfoReply, getBidReadinessIssues } from "@/lib/qualification/validate";
import { storeBrief } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, Brief, QualificationProfile } from "@/lib/types";

interface QualifyRequest {
  messages: ChatMessage[];
  profile?: QualificationProfile | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QualifyRequest;
    const { messages, profile } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const assistantMessageCount = messages.filter((message) => message.role === "assistant").length;
    const forceBrief = assistantMessageCount >= 7;

    // Build the message array for OpenRouter
    const openRouterMessages = [
      {
        role: "system" as const,
        content: buildQualificationSystemPrompt({
          profile,
          assistantMessageCount,
          forceBrief,
          currentDate: new Date(),
        }),
      },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const assistantReply = await callOpenRouter(openRouterMessages);

    // Check if the reply contains a JSON brief
    const brief = extractBrief(assistantReply);
    let briefId: string | null = null;
    let storedBrief: Brief | null = null;

    if (brief) {
      // Assign real ID and timestamp, then store
      const now = new Date().toISOString();
      const id = uuidv4();
      if (profile?.preferred_language) {
        brief.language = profile.preferred_language;
      }
      brief.budget_indication = {
        provided:
          brief.budget_indication?.provided === true ||
          profile?.preferredBudget !== null ||
          profile?.hardMaxBudget !== null,
        range_dkk: brief.budget_indication?.range_dkk ?? null,
        preferredBudget: profile?.preferredBudget ?? brief.budget_indication?.preferredBudget ?? null,
        hardMaxBudget: profile?.hardMaxBudget ?? brief.budget_indication?.hardMaxBudget ?? null,
      };
      brief.bid_preferences = {
        allowAutoBids: profile?.allow_auto_bids ?? brief.bid_preferences?.allowAutoBids ?? true,
        preferredBudget: profile?.preferredBudget ?? brief.bid_preferences?.preferredBudget ?? brief.budget_indication?.preferredBudget ?? null,
        hardMaxBudget: profile?.hardMaxBudget ?? brief.bid_preferences?.hardMaxBudget ?? brief.budget_indication?.hardMaxBudget ?? null,
        readyToReceiveBidsNow: profile?.ready_for_bids ?? brief.bid_preferences?.readyToReceiveBidsNow ?? brief.ready_for_bids ?? true,
      };
      brief.preferred_contact_method = profile?.preferred_contact_method ?? brief.preferred_contact_method ?? "unknown";
      brief.ready_for_bids = profile?.ready_for_bids ?? brief.ready_for_bids ?? true;
      const issues = getBidReadinessIssues(brief, profile);

      if (issues.length === 0) {
        brief.brief_id = id;
        brief.created_at = now;
        storeBrief(brief);
        briefId = id;
        storedBrief = brief;
      } else {
        return NextResponse.json({
          reply: buildMissingInfoReply(profile?.preferred_language ?? brief.language ?? "en", issues),
          briefId: null,
          brief: null,
        });
      }
    }

    return NextResponse.json({
      reply: assistantReply,
      briefId,
      brief: storedBrief,
    });
  } catch (err) {
    console.error("[qualify]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function extractBrief(text: string): Brief | null {
  // Look for a ```json ... ``` block
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]) as Brief;
    // Minimal validation — must have move_type and origin
    if (!parsed.move_type || !parsed.origin) return null;
    parsed.budget_indication = {
      provided: parsed.budget_indication?.provided ?? false,
      range_dkk: parsed.budget_indication?.range_dkk ?? null,
      preferredBudget: parsed.budget_indication?.preferredBudget ?? null,
      hardMaxBudget: parsed.budget_indication?.hardMaxBudget ?? null,
    };
    parsed.date_flexibility = parsed.date_flexibility ?? "unknown";
    parsed.preferred_time_window = parsed.preferred_time_window ?? null;
    parsed.origin = {
      ...parsed.origin,
      address: parsed.origin.address ?? null,
      elevator_usable_for_furniture: parsed.origin.elevator_usable_for_furniture ?? null,
      parking_distance_meters: parsed.origin.parking_distance_meters ?? null,
      access_notes: parsed.origin.access_notes ?? null,
    };
    parsed.destination = {
      ...parsed.destination,
      address: parsed.destination.address ?? null,
      elevator_usable_for_furniture: parsed.destination.elevator_usable_for_furniture ?? null,
      parking_distance_meters: parsed.destination.parking_distance_meters ?? null,
      access_notes: parsed.destination.access_notes ?? null,
    };
    parsed.services_requested = {
      transport_only: parsed.services_requested?.transport_only ?? null,
      carrying_included: parsed.services_requested?.carrying_included ?? null,
      packing: parsed.services_requested?.packing ?? "undecided",
      packing_materials_needed: parsed.services_requested?.packing_materials_needed ?? null,
      unpacking: parsed.services_requested?.unpacking ?? null,
      disassembly_reassembly: parsed.services_requested?.disassembly_reassembly ?? null,
      storage: {
        needed: parsed.services_requested?.storage?.needed ?? false,
        duration: parsed.services_requested?.storage?.duration ?? null,
        climate_controlled: parsed.services_requested?.storage?.climate_controlled ?? null,
      },
      disposal_needed: parsed.services_requested?.disposal_needed ?? null,
      cleaning: parsed.services_requested?.cleaning ?? null,
    };
    parsed.bid_preferences = {
      allowAutoBids: parsed.bid_preferences?.allowAutoBids ?? true,
      preferredBudget: parsed.bid_preferences?.preferredBudget ?? parsed.budget_indication?.preferredBudget ?? null,
      hardMaxBudget: parsed.bid_preferences?.hardMaxBudget ?? parsed.budget_indication?.hardMaxBudget ?? null,
      readyToReceiveBidsNow: parsed.bid_preferences?.readyToReceiveBidsNow ?? parsed.ready_for_bids ?? true,
    };
    parsed.preferred_contact_method = parsed.preferred_contact_method ?? "unknown";
    parsed.ready_for_bids = parsed.ready_for_bids ?? true;
    parsed.can_customer_help_carry = parsed.can_customer_help_carry ?? null;
    parsed.strict_deadline = parsed.strict_deadline ?? null;
    parsed.key_handover_time = parsed.key_handover_time ?? null;
    parsed.high_value_items = parsed.high_value_items ?? null;
    return parsed;
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { buildBriefFromIntake } from "@/lib/intake/build-brief";
import type { IntakeData } from "@/lib/intake/types";
import { getBidReadinessIssues } from "@/lib/qualification/validate";
import { storeBrief, logEvent } from "@/lib/db/briefs";

export async function POST(req: NextRequest) {
  try {
    const intake = (await req.json()) as IntakeData;
    const brief = await buildBriefFromIntake(intake);
    const issues = getBidReadinessIssues(brief, {
      first_name: intake.fullName.trim().split(" ")[0] ?? "",
      email: intake.email,
      phone: intake.phone,
      preferred_language: intake.preferredLanguage,
      preferred_contact_method: intake.preferredContactMethod,
      ready_for_bids: intake.readyToReceiveBidsNow,
      allow_auto_bids: intake.allowAutoBids,
      preferredBudget: intake.preferredBudget,
      hardMaxBudget: intake.hardMaxBudget,
    });

    if (issues.length > 0) {
      return NextResponse.json(
        { error: `Missing required intake data: ${issues.join(", ")}` },
        { status: 400 }
      );
    }

    await storeBrief(brief, {
      firstName: intake.fullName.trim().split(" ")[0] ?? intake.fullName.trim(),
      email: intake.email,
      phone: intake.phone,
    });

    await logEvent("brief_created", brief.brief_id, brief.language, {
      move_type: brief.move_type,
      origin_country: brief.origin.country,
      destination_country: brief.destination.country,
      qualification_confidence: brief.qualification_confidence,
    });

    return NextResponse.json({
      briefId: brief.brief_id,
      brief,
    });
  } catch (error) {
    console.error("[intake]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create brief" },
      { status: 500 }
    );
  }
}

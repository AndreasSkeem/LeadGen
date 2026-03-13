import { NextRequest, NextResponse } from "next/server";
import { buildBriefFromIntake } from "@/lib/intake/build-brief";
import type { IntakeData } from "@/lib/intake/types";
import { getBidReadinessIssues } from "@/lib/qualification/validate";
import { storeBrief } from "@/lib/store";

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

    storeBrief(brief);

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

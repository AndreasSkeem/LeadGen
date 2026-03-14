// GET /api/provider/[providerId]/briefs
// Returns persisted briefs that match this provider, sorted by relevance score.
// Used by the provider inbox page.

import { NextRequest, NextResponse } from "next/server";
import { getMatchedBriefsForProvider } from "@/lib/db/providers";
import { logEvent } from "@/lib/db/briefs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;

  const matched = await getMatchedBriefsForProvider(providerId, 20);

  if (matched.length === 0) {
    // Could mean no briefs or provider not found — caller can distinguish
  }

  await logEvent(
    "provider_inbox_viewed",
    null,
    null,
    { providerId, matchCount: matched.length },
    "provider",
    providerId
  );

  // Return anonymized brief data — no customer contact info
  const results = matched.map(({ brief, score, briefId }) => ({
    briefId,
    score,
    moveType: brief.move_type,
    locale: brief.language,
    originMunicipality: brief.origin.municipality,
    originRegion: brief.origin.region,
    originCountry: brief.origin.country,
    destinationMunicipality: brief.destination.municipality,
    destinationCountry: brief.destination.country,
    volumeDescription: brief.volume.description,
    estimatedCbm: brief.volume.estimated_cbm,
    specialItems: brief.special_items,
    moveDateApprox: brief.move_date_approx,
    urgency: brief.urgency,
    summary: brief.summary,
    qualificationConfidence: brief.qualification_confidence,
    packingService: brief.services_requested.packing,
    storageNeeded: brief.services_requested.storage.needed,
    disposalNeeded: brief.services_requested.disposal_needed,
    createdAt: brief.created_at,
  }));

  return NextResponse.json({ providerId, briefs: results });
}

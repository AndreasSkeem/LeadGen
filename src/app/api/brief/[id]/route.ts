import { NextRequest, NextResponse } from "next/server";
import { getBrief, logEvent } from "@/lib/db/briefs";
import { getBidsForBrief } from "@/lib/db/bids";
import { getSelectionForBrief } from "@/lib/db/selections";
import { matchProviders } from "@/lib/matching/match";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brief = await getBrief(id);

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // Fetch real bids, simulated offers, and any existing selection in parallel.
  // SIMULATED offers are generated at request time and are never stored.
  const [stagedBids, simulatedOffers, selection] = await Promise.all([
    getBidsForBrief(id),
    Promise.resolve(matchProviders(brief, 3)),
    getSelectionForBrief(id),
  ]);

  const hasRealBids = stagedBids.length > 0;
  const hasSelection = selection !== null;

  await logEvent("offers_viewed", brief.brief_id, brief.language, {
    hasRealBids,
    realBidCount: stagedBids.length,
    simulatedOfferCount: simulatedOffers.length,
    hasSelection,
    move_type: brief.move_type,
  });

  if (hasSelection) {
    await logEvent(
      "selection_viewed",
      brief.brief_id,
      brief.language,
      { selectionId: selection!.selectionId, bidId: selection!.bidId },
      "customer"
    );
  }

  return NextResponse.json({
    brief,
    offers: simulatedOffers,  // always included as context / fallback
    stagedBids,               // real provider bids from DB (may be empty)
    hasRealBids,
    selection: selection ?? null,  // RevealedSelection if customer has selected a bid
  });
}

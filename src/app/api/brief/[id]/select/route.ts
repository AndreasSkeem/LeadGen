// POST /api/brief/[id]/select
// Customer selects a real persisted bid. Creates a Selection record and reveals contacts.
//
// This is the authoritative selection/reveal path for real provider bids.
// Simulated offers have a separate legacy demo flow in brief-ui.tsx (OffersBoard).

import { NextRequest, NextResponse } from "next/server";
import { getBrief, logEvent } from "@/lib/db/briefs";
import { createSelection } from "@/lib/db/selections";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: briefId } = await params;

  const body = (await req.json()) as { bidId?: string };
  const { bidId } = body;

  if (!bidId || typeof bidId !== "string") {
    return NextResponse.json({ error: "bidId is required" }, { status: 400 });
  }

  const brief = await getBrief(briefId);
  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  const result = await createSelection(bidId, briefId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { selectionId, selectedBid, providerContact } = result.data;

  // Log the full selection + reveal event sequence
  await logEvent(
    "bid_selected",
    briefId,
    brief.language,
    { bidId, selectionId, providerId: selectedBid.providerId, bidType: selectedBid.bidType },
    "customer"
  );

  await logEvent(
    "selection_created",
    briefId,
    brief.language,
    { selectionId, bidId, providerId: selectedBid.providerId },
    "system"
  );

  await logEvent(
    "contact_revealed",
    briefId,
    brief.language,
    {
      selectionId,
      bidId,
      providerId: selectedBid.providerId,
      providerContactAvailable: providerContact !== null,
    },
    "system"
  );

  return NextResponse.json({
    selectionId,
    bidId,
    briefId,
    selectedBid,
    providerContact,
    createdAt: new Date().toISOString(),
  });
}

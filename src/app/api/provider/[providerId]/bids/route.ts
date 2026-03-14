// POST /api/provider/[providerId]/bids — submit or update a bid
// GET  /api/provider/[providerId]/bids — list this provider's submitted bids

import { NextRequest, NextResponse } from "next/server";
import type { BidType } from "@/lib/types";
import { submitBid, getBidsByProvider, type BidSubmission } from "@/lib/db/bids";
import { getProviderFromDb } from "@/lib/db/providers";
import { getBrief, logEvent } from "@/lib/db/briefs";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateBid(
  bidType: BidType,
  priceMin: number | null,
  priceMax: number | null,
  message: string | null
): string | null {
  if (bidType === "binding") {
    if (priceMin === null) return "binding bid requires a price";
    if (priceMax !== null && priceMax !== priceMin)
      return "binding bid price must be a single value (set priceMin = priceMax)";
  }

  if (bidType === "bounded_estimate") {
    if (priceMin === null || priceMax === null)
      return "bounded_estimate requires both priceMin and priceMax";
    if (priceMin >= priceMax)
      return "bounded_estimate: priceMin must be less than priceMax";
  }

  if (bidType === "survey_required") {
    if (!message || message.trim().length < 10)
      return "survey_required bid must include a message explaining why a survey is needed (min 10 chars)";
  }

  return null;
}

// ─── POST — submit / update bid ───────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;

  const body = (await req.json()) as Partial<BidSubmission> & { briefId?: string };

  const { briefId, bidType, priceMin, priceMax, currency, message } = body;

  if (!briefId) return NextResponse.json({ error: "briefId is required" }, { status: 400 });
  if (!bidType) return NextResponse.json({ error: "bidType is required" }, { status: 400 });
  if (!currency) return NextResponse.json({ error: "currency is required" }, { status: 400 });

  // Verify provider and brief exist
  const [provider, brief] = await Promise.all([
    getProviderFromDb(providerId),
    getBrief(briefId),
  ]);
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  if (!brief) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  const validationError = validateBid(
    bidType as BidType,
    priceMin ?? null,
    priceMax ?? null,
    message ?? null
  );
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const submission: BidSubmission = {
    briefId,
    providerId,
    bidType: bidType as BidType,
    priceMin: priceMin ?? null,
    priceMax: bidType === "binding" ? (priceMin ?? null) : (priceMax ?? null),
    currency: currency as BidSubmission["currency"],
    estimatedHours: body.estimatedHours ?? null,
    estimatedCrew: body.estimatedCrew ?? null,
    estimatedVehicleCount: body.estimatedVehicleCount ?? null,
    availableDate: body.availableDate ?? null,
    validityDays: body.validityDays ?? 7,
    message: message ?? null,
    notes: body.notes ?? null,
    includedServices: body.includedServices ?? [],
    assumptions: body.assumptions ?? [],
  };

  const bidId = await submitBid(submission);

  const isUpdate = body.bidType !== undefined; // heuristic — log differently if updating

  await logEvent(
    isUpdate ? "bid_submitted" : "bid_updated",
    briefId,
    brief.language,
    {
      bidId,
      providerId,
      bidType,
      hasPrice: priceMin !== null,
      currency,
    },
    "provider",
    providerId
  );

  return NextResponse.json({ bidId, providerId, briefId });
}

// ─── GET — list provider's bids ───────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;

  const provider = await getProviderFromDb(providerId);
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const bids = await getBidsByProvider(providerId);
  return NextResponse.json({ providerId, bids });
}

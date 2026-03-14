// Database operations for Selection records.
// A Selection is created when a customer picks a real persisted bid.
// This is the single source of truth for the contact reveal flow.
//
// IMPORTANT: Only real bids (isSimulated=false) can be selected.
// Simulated offers have a separate, legacy demo-only reveal path in brief-ui.tsx.

import type { RevealedSelection, ProviderBid, BidType } from "@/lib/types";
import { prisma } from "@/lib/db";

// ─── Provider contact lookup (pilot-phase hardcoded) ──────────────────────────
// In production this would come from Provider.phone / Provider.email columns.

const PROVIDER_CONTACTS: Record<string, { phone: string; email: string }> = {
  "flyttegaranti": { phone: "+45 33 22 11 00", email: "kontakt@flyttegaranti.dk" },
  "3mand-flytte": { phone: "+45 40 55 66 77", email: "info@3mandflytte.dk" },
  "stark-flytte": { phone: "+45 86 11 22 33", email: "info@starkflytte.dk" },
  "bahns-flytteforretning": { phone: "+45 66 12 34 56", email: "info@bahns.dk" },
  "nordisk-flyttecenter": { phone: "+45 35 36 37 38", email: "info@nordiskflyttecenter.dk" },
  "flytt-ab": { phone: "+46 8 123 456 78", email: "info@flyttab.se" },
  "goteborgs-flytt": { phone: "+46 31 456 789 0", email: "kontakt@goteborgsflytt.se" },
  "nordic-relocations": { phone: "+46 8 999 888 77", email: "info@nordicrelocations.se" },
  "majorstuaflytting": { phone: "+47 22 44 55 66", email: "post@majorstuaflytting.no" },
  "bergen-flyttebyra": { phone: "+47 55 30 40 50", email: "kontakt@bergenflyttebyraa.no" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BidWithProvider = {
  id: string;
  briefId: string;
  providerId: string;
  bidType: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  estimatedHours: number | null;
  estimatedCrew: number | null;
  estimatedVehicleCount: number | null;
  availableDate: string | null;
  validityDays: number | null;
  message: string | null;
  notes: string | null;
  includedServices: string;
  assumptions: string;
  createdAt: Date;
  provider: { companyName: string; country: string };
};

function toBidShape(row: BidWithProvider): ProviderBid {
  return {
    id: row.id,
    briefId: row.briefId,
    providerId: row.providerId,
    providerName: row.provider.companyName,
    providerCountry: row.provider.country as ProviderBid["providerCountry"],
    bidType: row.bidType as BidType,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    currency: row.currency as ProviderBid["currency"],
    estimatedHours: row.estimatedHours,
    estimatedCrew: row.estimatedCrew,
    estimatedVehicleCount: row.estimatedVehicleCount,
    availableDate: row.availableDate,
    validityDays: row.validityDays,
    message: row.message,
    notes: row.notes,
    includedServices: JSON.parse(row.includedServices) as string[],
    assumptions: JSON.parse(row.assumptions) as string[],
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getSelectionForBrief(briefId: string): Promise<RevealedSelection | null> {
  const row = await prisma.selection.findFirst({
    where: { briefId },
    include: {
      bid: {
        include: { provider: { select: { companyName: true, country: true } } },
      },
    },
  });

  if (!row) return null;

  const selectedBid = toBidShape(row.bid);
  const providerContact = PROVIDER_CONTACTS[row.bid.providerId] ?? null;

  return {
    selectionId: row.id,
    bidId: row.bidId,
    briefId: row.briefId,
    selectedBid,
    providerContact,
    createdAt: row.createdAt.toISOString(),
  };
}

// Checks if a specific provider's bid on a brief has been selected.
// Used by provider-side pages to reveal customer contact.
export async function getSelectionForProviderBid(
  briefId: string,
  providerId: string
): Promise<{ selectionId: string; bidId: string; createdAt: string } | null> {
  const row = await prisma.selection.findFirst({
    where: {
      briefId,
      bid: { providerId },
    },
    select: { id: true, bidId: true, createdAt: true },
  });

  if (!row) return null;
  return { selectionId: row.id, bidId: row.bidId, createdAt: row.createdAt.toISOString() };
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export interface SelectionResult {
  selectionId: string;
  selectedBid: ProviderBid;
  providerContact: { phone: string; email: string } | null;
}

// Creates a Selection for a real bid. Returns error string on failure.
// Guards: bid must exist, belong to brief, be real (not simulated), no prior selection.
export async function createSelection(
  bidId: string,
  briefId: string
): Promise<{ ok: true; data: SelectionResult } | { ok: false; error: string }> {
  // Verify bid exists, belongs to brief, is not simulated
  const bid = await prisma.bid.findFirst({
    where: { id: bidId, briefId, isSimulated: false },
    include: { provider: { select: { companyName: true, country: true } } },
  });

  if (!bid) {
    return { ok: false, error: "Bid not found or not eligible for selection" };
  }

  // Guard: only one selection per brief
  const existing = await prisma.selection.findFirst({ where: { briefId } });
  if (existing) {
    return { ok: false, error: "A selection already exists for this brief" };
  }

  const selection = await prisma.selection.create({
    data: { bidId, briefId },
  });

  const selectedBid = toBidShape(bid);
  const providerContact = PROVIDER_CONTACTS[bid.providerId] ?? null;

  return {
    ok: true,
    data: {
      selectionId: selection.id,
      selectedBid,
      providerContact,
    },
  };
}

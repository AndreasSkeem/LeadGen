// Database operations for Bid records.
// Handles real provider bids only — simulated bids are generated at read time
// and are never stored in this table.

import type { ProviderBid, BidType } from "@/lib/types";
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BidSubmission {
  briefId: string;
  providerId: string;
  bidType: BidType;
  priceMin: number | null;
  priceMax: number | null;
  currency: "DKK" | "SEK" | "NOK";
  estimatedHours: number | null;
  estimatedCrew: number | null;
  estimatedVehicleCount: number | null;
  availableDate: string | null;
  validityDays: number | null;
  message: string | null;
  notes: string | null;
  includedServices: string[];
  assumptions: string[];
}

// ─── Conversion ───────────────────────────────────────────────────────────────

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

export async function getBidsForBrief(briefId: string): Promise<ProviderBid[]> {
  const rows = await prisma.bid.findMany({
    where: { briefId, isSimulated: false },
    include: { provider: { select: { companyName: true, country: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toBidShape);
}

export async function getBidsByProvider(
  providerId: string
): Promise<Array<ProviderBid & { briefLocale: string }>> {
  const rows = await prisma.bid.findMany({
    where: { providerId, isSimulated: false },
    include: {
      provider: { select: { companyName: true, country: true } },
      brief: { select: { locale: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({ ...toBidShape(row), briefLocale: row.brief.locale }));
}

export async function getExistingBid(
  briefId: string,
  providerId: string
): Promise<ProviderBid | null> {
  const row = await prisma.bid.findFirst({
    where: { briefId, providerId, isSimulated: false },
    include: { provider: { select: { companyName: true, country: true } } },
  });
  if (!row) return null;
  return toBidShape(row);
}

// ─── Writes ───────────────────────────────────────────────────────────────────

// Creates or updates a bid. Returns the bid ID.
export async function submitBid(data: BidSubmission): Promise<string> {
  const payload = {
    bidType: data.bidType,
    priceMin: data.priceMin,
    priceMax: data.priceMax,
    currency: data.currency,
    estimatedHours: data.estimatedHours,
    estimatedCrew: data.estimatedCrew,
    estimatedVehicleCount: data.estimatedVehicleCount,
    availableDate: data.availableDate ?? null,
    validityDays: data.validityDays,
    message: data.message,
    notes: data.notes,
    includedServices: JSON.stringify(data.includedServices),
    assumptions: JSON.stringify(data.assumptions),
    isSimulated: false,
  };

  const existing = await prisma.bid.findFirst({
    where: { briefId: data.briefId, providerId: data.providerId, isSimulated: false },
    select: { id: true },
  });

  if (existing) {
    await prisma.bid.update({ where: { id: existing.id }, data: payload });
    return existing.id;
  }

  const bid = await prisma.bid.create({
    data: { briefId: data.briefId, providerId: data.providerId, ...payload },
  });
  return bid.id;
}

export async function getBidCountsByBrief(): Promise<Record<string, number>> {
  const rows = await prisma.bid.groupBy({
    by: ["briefId"],
    where: { isSimulated: false },
    _count: { id: true },
  });
  return Object.fromEntries(rows.map((r) => [r.briefId, r._count.id]));
}

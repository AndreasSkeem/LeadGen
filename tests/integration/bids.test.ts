// Integration tests for Bid submission and retrieval.
// Uses the real test.db SQLite database.

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { submitBid, getBidsForBrief, getExistingBid } from "@/lib/db/bids";
import { storeBrief } from "@/lib/db/briefs";
import { prisma } from "@/lib/db";
import { cleanAll, makeTestBrief, seedTestProvider } from "../helpers/db";
import type { BidSubmission } from "@/lib/db/bids";

let providerId: string;
let briefId: string;

function makeBidSubmission(overrides: Partial<BidSubmission> = {}): BidSubmission {
  return {
    briefId,
    providerId,
    bidType: "binding",
    priceMin: 5000,
    priceMax: 5000,
    currency: "DKK",
    estimatedHours: 4,
    estimatedCrew: 2,
    estimatedVehicleCount: 1,
    availableDate: "2026-06-15",
    validityDays: 14,
    message: "Vi klarer flytningen professionelt.",
    notes: null,
    includedServices: ["transport", "carrying"],
    assumptions: ["Normal adgangsforhold"],
    ...overrides,
  };
}

beforeAll(async () => {
  await cleanAll();
  const provider = await seedTestProvider();
  providerId = provider.id;
  const brief = makeTestBrief();
  briefId = brief.brief_id;
  await storeBrief(brief);
});

beforeEach(async () => {
  // Clean bids between tests but keep provider + brief
  await prisma.selection.deleteMany();
  await prisma.bid.deleteMany();
});

afterAll(async () => {
  await cleanAll();
});

describe("submitBid — creation", () => {
  it("creates a bid and returns its ID", async () => {
    const bidId = await submitBid(makeBidSubmission());
    expect(bidId).toBeTruthy();
    expect(typeof bidId).toBe("string");
  });

  it("bid is retrievable by getBidsForBrief", async () => {
    await submitBid(makeBidSubmission());
    const bids = await getBidsForBrief(briefId);
    expect(bids).toHaveLength(1);
    expect(bids[0]!.providerId).toBe(providerId);
    expect(bids[0]!.bidType).toBe("binding");
  });

  it("stores includedServices and assumptions as arrays", async () => {
    await submitBid(makeBidSubmission());
    const bids = await getBidsForBrief(briefId);
    expect(Array.isArray(bids[0]!.includedServices)).toBe(true);
    expect(bids[0]!.includedServices).toContain("transport");
    expect(Array.isArray(bids[0]!.assumptions)).toBe(true);
  });

  it("sets provider name from the Provider table", async () => {
    await submitBid(makeBidSubmission());
    const bids = await getBidsForBrief(briefId);
    expect(bids[0]!.providerName).toBe("Test Movers ApS");
  });
});

describe("submitBid — upsert behavior", () => {
  it("second submit for same provider+brief updates the existing bid, not creates duplicate", async () => {
    await submitBid(makeBidSubmission({ priceMin: 5000, priceMax: 5000 }));
    await submitBid(makeBidSubmission({ priceMin: 4500, priceMax: 4500 }));

    const bids = await getBidsForBrief(briefId);
    expect(bids).toHaveLength(1); // still one bid
    expect(bids[0]!.priceMin).toBe(4500); // updated price
  });
});

describe("getBidsForBrief", () => {
  it("returns empty array when no bids exist", async () => {
    const bids = await getBidsForBrief(briefId);
    expect(bids).toHaveLength(0);
  });

  it("excludes simulated bids", async () => {
    // Insert a simulated bid directly via Prisma (bypassing submitBid which always sets isSimulated=false)
    await prisma.bid.create({
      data: {
        briefId,
        providerId,
        bidType: "binding",
        priceMin: 9999,
        priceMax: 9999,
        currency: "DKK",
        includedServices: "[]",
        assumptions: "[]",
        isSimulated: true, // simulated — should be excluded
      },
    });

    const bids = await getBidsForBrief(briefId);
    expect(bids.every((b) => b.priceMin !== 9999)).toBe(true);
  });
});

describe("getExistingBid", () => {
  it("returns null when no bid exists for provider+brief", async () => {
    const bid = await getExistingBid(briefId, providerId);
    expect(bid).toBeNull();
  });

  it("returns the bid when it exists", async () => {
    await submitBid(makeBidSubmission({ message: "Test message" }));
    const bid = await getExistingBid(briefId, providerId);
    expect(bid).not.toBeNull();
    expect(bid!.message).toBe("Test message");
  });
});

describe("bounded_estimate bid type", () => {
  it("stores price range correctly", async () => {
    await submitBid(makeBidSubmission({
      bidType: "bounded_estimate",
      priceMin: 4000,
      priceMax: 6000,
    }));
    const bids = await getBidsForBrief(briefId);
    expect(bids[0]!.priceMin).toBe(4000);
    expect(bids[0]!.priceMax).toBe(6000);
  });
});

describe("survey_required bid type", () => {
  it("allows null prices with a message", async () => {
    await submitBid(makeBidSubmission({
      bidType: "survey_required",
      priceMin: null,
      priceMax: null,
      message: "Besigtigelse nødvendig",
    }));
    const bids = await getBidsForBrief(briefId);
    expect(bids[0]!.priceMin).toBeNull();
    expect(bids[0]!.priceMax).toBeNull();
    expect(bids[0]!.message).toBe("Besigtigelse nødvendig");
  });
});

// Integration tests for the selection and contact reveal flow.
// This is the most critical business logic in the repo:
//   - One selection per brief
//   - Only real bids can be selected (isSimulated=false)
//   - Bid must belong to the correct brief
//   - Non-selected providers do not get customer contact reveal
//   - Customer contact is isolated from the public brief fetch

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { createSelection, getSelectionForBrief, getSelectionForProviderBid } from "@/lib/db/selections";
import { submitBid } from "@/lib/db/bids";
import { storeBrief, getCustomerContact } from "@/lib/db/briefs";
import { prisma } from "@/lib/db";
import { cleanAll, makeTestBrief, seedTestProvider, TEST_CONTACT } from "../helpers/db";
import type { BidSubmission } from "@/lib/db/bids";

let provider1Id: string;
let provider2Id: string;
let briefId: string;
let otherBriefId: string;
let realBidId: string;

function bidFor(bfId: string, pvId: string, extras: Partial<BidSubmission> = {}): BidSubmission {
  return {
    briefId: bfId,
    providerId: pvId,
    bidType: "binding",
    priceMin: 5000,
    priceMax: 5000,
    currency: "DKK",
    estimatedHours: 4,
    estimatedCrew: 2,
    estimatedVehicleCount: 1,
    availableDate: "2026-06-15",
    validityDays: 14,
    message: "Vi klarer det.",
    notes: null,
    includedServices: [],
    assumptions: [],
    ...extras,
  };
}

beforeAll(async () => {
  await cleanAll();

  const p1 = await seedTestProvider({ companyName: "Provider Alpha" });
  const p2 = await seedTestProvider({ companyName: "Provider Beta" });
  provider1Id = p1.id;
  provider2Id = p2.id;

  const brief = makeTestBrief();
  briefId = brief.brief_id;
  await storeBrief(brief, TEST_CONTACT);

  const otherBrief = makeTestBrief();
  otherBriefId = otherBrief.brief_id;
  await storeBrief(otherBrief);

  realBidId = await submitBid(bidFor(briefId, provider1Id));
  await submitBid(bidFor(briefId, provider2Id));
});

beforeEach(async () => {
  // Reset selections between tests — keep briefs/bids/providers
  await prisma.selection.deleteMany();
});

afterAll(async () => {
  await cleanAll();
});

// ─── createSelection — happy path ────────────────────────────────────────────

describe("createSelection — success", () => {
  it("creates a selection for a valid real bid", async () => {
    const result = await createSelection(realBidId, briefId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.selectionId).toBeTruthy();
    expect(result.data.selectedBid.id).toBe(realBidId);
  });

  it("returns the selected bid details", async () => {
    const result = await createSelection(realBidId, briefId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.selectedBid.providerId).toBe(provider1Id);
    expect(result.data.selectedBid.bidType).toBe("binding");
    expect(result.data.selectedBid.priceMin).toBe(5000);
  });
});

// ─── createSelection — guards ─────────────────────────────────────────────────

describe("createSelection — one-per-brief guard", () => {
  it("rejects a second selection on the same brief", async () => {
    const first = await createSelection(realBidId, briefId);
    expect(first.ok).toBe(true);

    const second = await createSelection(realBidId, briefId);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/selection already exists/i);
  });

  it("does not allow selecting a different bid on the same brief after first selection", async () => {
    const provider2BidId = await submitBid(bidFor(briefId, provider2Id));
    await createSelection(realBidId, briefId);

    const result = await createSelection(provider2BidId, briefId);
    expect(result.ok).toBe(false);
  });
});

describe("createSelection — bid ownership guard", () => {
  it("rejects bid that belongs to a different brief", async () => {
    // realBidId belongs to briefId, not otherBriefId
    const result = await createSelection(realBidId, otherBriefId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not found|not eligible/i);
  });

  it("rejects a non-existent bid ID", async () => {
    const result = await createSelection("nonexistent-bid-id", briefId);
    expect(result.ok).toBe(false);
  });
});

describe("createSelection — simulated bid guard", () => {
  it("rejects a simulated bid", async () => {
    // Insert a simulated bid directly — bypassing submitBid
    const simBid = await prisma.bid.create({
      data: {
        briefId,
        providerId: provider1Id,
        bidType: "binding",
        priceMin: 999,
        priceMax: 999,
        currency: "DKK",
        includedServices: "[]",
        assumptions: "[]",
        isSimulated: true,  // ← this is the guard being tested
      },
    });

    const result = await createSelection(simBid.id, briefId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not found|not eligible/i);

    // Cleanup
    await prisma.bid.delete({ where: { id: simBid.id } });
  });
});

// ─── getSelectionForBrief ────────────────────────────────────────────────────

describe("getSelectionForBrief", () => {
  it("returns null when no selection exists", async () => {
    const selection = await getSelectionForBrief(briefId);
    expect(selection).toBeNull();
  });

  it("returns the selection after it is created", async () => {
    await createSelection(realBidId, briefId);
    const selection = await getSelectionForBrief(briefId);
    expect(selection).not.toBeNull();
    expect(selection!.bidId).toBe(realBidId);
    expect(selection!.briefId).toBe(briefId);
  });

  it("returns the selected bid details in the selection", async () => {
    await createSelection(realBidId, briefId);
    const selection = await getSelectionForBrief(briefId);
    expect(selection!.selectedBid.id).toBe(realBidId);
    expect(selection!.selectedBid.priceMin).toBe(5000);
  });

  it("returns null for a different brief that has no selection", async () => {
    await createSelection(realBidId, briefId);
    const selection = await getSelectionForBrief(otherBriefId);
    expect(selection).toBeNull();
  });
});

// ─── getSelectionForProviderBid ───────────────────────────────────────────────

describe("getSelectionForProviderBid — reveal access control", () => {
  it("returns null for non-selected provider", async () => {
    await createSelection(realBidId, briefId); // provider1 selected

    // provider2 was NOT selected
    const result = await getSelectionForProviderBid(briefId, provider2Id);
    expect(result).toBeNull();
  });

  it("returns selection info for the selected provider", async () => {
    await createSelection(realBidId, briefId); // provider1 selected

    const result = await getSelectionForProviderBid(briefId, provider1Id);
    expect(result).not.toBeNull();
    expect(result!.bidId).toBe(realBidId);
  });

  it("returns null before any selection", async () => {
    const result = await getSelectionForProviderBid(briefId, provider1Id);
    expect(result).toBeNull();
  });
});

// ─── Customer contact reveal isolation ────────────────────────────────────────

describe("customer contact reveal — access isolation", () => {
  it("getCustomerContact is available after storeBrief with contact", async () => {
    const contact = await getCustomerContact(briefId);
    expect(contact).not.toBeNull();
    expect(contact!.firstName).toBe(TEST_CONTACT.firstName);
    expect(contact!.email).toBe(TEST_CONTACT.email);
  });

  it("non-selected provider gets null from getSelectionForProviderBid (no reveal)", async () => {
    await createSelection(realBidId, briefId);
    // Provider 2 was not selected — they cannot access customer contact via normal flow
    const reveal = await getSelectionForProviderBid(briefId, provider2Id);
    expect(reveal).toBeNull();
    // Application code: only shows customer contact when reveal is not null
  });
});

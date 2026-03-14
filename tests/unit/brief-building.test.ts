// Tests for deterministic parts of brief building.
// buildBriefFromIntake is tested end-to-end with a minimal intake,
// relying on the deterministic fallback when no API key is set.
// (vitest.config.ts sets API_KEY_OPENROUTER="" for all tests.)

import { describe, it, expect } from "vitest";
import { buildBriefFromIntake, defaultIntakeData } from "@/lib/intake/build-brief";
import type { IntakeData } from "@/lib/intake/types";

function makeIntake(overrides: Partial<IntakeData> = {}): IntakeData {
  return {
    ...defaultIntakeData(),
    moveType: "private",
    moveDate: "2026-06-15",
    dateFlexibility: "few_days",
    preferredTimeWindow: "morning",
    origin: {
      address: "Østerbrogade 1, Copenhagen",
      propertyType: "apartment",
      floor: 2,
      elevator: "no",
      elevatorUsable: null,
      parkingAccess: "restricted",
      parkingDistanceMeters: 30,
      accessNotes: "",
    },
    destination: {
      address: "Nørrebrogade 10, Copenhagen",
      propertyType: "apartment",
      floor: 1,
      elevator: "yes",
      elevatorUsable: true,
      parkingAccess: "easy",
      parkingDistanceMeters: 10,
      accessNotes: "",
    },
    moveSizeCategory: "three_room",
    roomCount: 3,
    estimatedVolumeM3: null,
    inventorySummary: "3-room apartment contents",
    fullMove: true,
    specialItems: [],
    specialItemsNotes: "",
    transportOnly: false,
    carryingIncluded: true,
    packing: "self",
    packingMaterialsNeeded: null,
    disassemblyReassembly: false,
    storageNeeded: false,
    storageDuration: "",
    climateControlledStorage: null,
    disposalNeeded: false,
    disposalDetails: "",
    cleaningNeeded: false,
    canHelpCarry: true,
    strictDeadline: false,
    keyHandoverTime: "",
    highValueItems: false,
    extraNotes: "",
    describeMove: "Standard 3-room move",
    fullName: "Lars Andersen",
    email: "lars@example.com",
    phone: "+45 12 34 56 78",
    preferredContactMethod: "email",
    preferredLanguage: "da",
    allowAutoBids: true,
    preferredBudget: null,
    hardMaxBudget: null,
    readyToReceiveBidsNow: true,
    ...overrides,
  };
}

describe("buildBriefFromIntake — structure", () => {
  it("returns a valid Brief object with a UUID", async () => {
    const brief = await buildBriefFromIntake(makeIntake());
    expect(brief.brief_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(brief.language).toBe("da");
    expect(brief.move_type).toBe("private");
  });

  it("preserves the move type", async () => {
    const brief = await buildBriefFromIntake(makeIntake({ moveType: "office" }));
    expect(brief.move_type).toBe("office");
  });

  it("infers urgency correctly for near-future date", async () => {
    // Move in 2 days = asap
    const nearDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const brief = await buildBriefFromIntake(makeIntake({ moveDate: nearDate }));
    expect(brief.urgency).toBe("asap");
  });

  it("infers volume from move size category", async () => {
    const brief = await buildBriefFromIntake(makeIntake({ moveSizeCategory: "three_room" }));
    // three_room = 34 cbm base
    expect(brief.volume.estimated_cbm).toBeGreaterThan(0);
  });

  it("infers region from Copenhagen address", async () => {
    const brief = await buildBriefFromIntake(makeIntake());
    expect(brief.origin.country).toBe("DK");
    expect(brief.origin.municipality).toBeTruthy();
  });

  it("generates a non-empty summary (deterministic fallback)", async () => {
    const brief = await buildBriefFromIntake(makeIntake());
    expect(brief.summary).toBeTruthy();
    expect(brief.summary.length).toBeGreaterThan(10);
  });

  it("detects special items from notes keywords", async () => {
    const brief = await buildBriefFromIntake(makeIntake({
      specialItemsNotes: "I have a piano and an american fridge",
    }));
    const items = brief.special_items.map((s) => s.toLowerCase());
    expect(items.some((i) => i.includes("piano"))).toBe(true);
  });
});

describe("buildBriefFromIntake — services", () => {
  it("includes packing service from intake", async () => {
    const brief = await buildBriefFromIntake(makeIntake({ packing: "full" }));
    expect(brief.services_requested.packing).toBe("full");
  });

  it("reflects storage needed flag", async () => {
    const brief = await buildBriefFromIntake(makeIntake({ storageNeeded: true, storageDuration: "1 month" }));
    expect(brief.services_requested.storage.needed).toBe(true);
  });
});

describe("defaultIntakeData", () => {
  it("returns a plain object with expected shape", () => {
    const defaults = defaultIntakeData();
    expect(defaults).toHaveProperty("moveType");
    expect(defaults).toHaveProperty("origin");
    expect(defaults).toHaveProperty("destination");
    expect(defaults).toHaveProperty("preferredLanguage");
  });
});

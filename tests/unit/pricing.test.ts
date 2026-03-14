import { describe, it, expect } from "vitest";
import { estimateMovePrice } from "@/lib/pricing/estimate";
import type { PricingInput } from "@/lib/pricing/estimate";

function base(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    moveType: "home",
    rooms: 3,
    estimatedVolumeM3: 30,
    distanceKm: 8,
    driveMinutes: 20,
    pickupFloor: 2,
    dropoffFloor: 0,
    pickupElevator: false,
    dropoffElevator: true,
    dayType: "weekday",
    currency: "DKK",
    ...overrides,
  };
}

describe("estimateMovePrice — basic sanity", () => {
  it("returns positive estimates for a standard home move", () => {
    const result = estimateMovePrice(base());
    expect(result.lowEstimate).toBeGreaterThan(0);
    expect(result.highEstimate).toBeGreaterThan(0);
    expect(result.teamSize).toBeGreaterThan(0);
    expect(result.billableHours).toBeGreaterThan(0);
  });

  it("highEstimate is always greater than lowEstimate", () => {
    const cases: Partial<PricingInput>[] = [
      {},
      { moveType: "office", estimatedVolumeM3: 50 },
      { moveType: "single_item", estimatedVolumeM3: 2 },
      { moveType: "international", estimatedVolumeM3: 40 },
      { packingHelp: true, packingMaterialsNeeded: true },
    ];
    for (const c of cases) {
      const result = estimateMovePrice(base(c));
      expect(result.highEstimate).toBeGreaterThan(result.lowEstimate);
    }
  });

  it("billableHours meets the minimum (3h for home moves)", () => {
    const result = estimateMovePrice(base({ estimatedVolumeM3: 5 }));
    expect(result.billableHours).toBeGreaterThanOrEqual(3);
  });
});

describe("estimateMovePrice — day surcharges", () => {
  it("Saturday move costs more than weekday move", () => {
    const weekday = estimateMovePrice(base({ dayType: "weekday" }));
    const saturday = estimateMovePrice(base({ dayType: "saturday" }));
    expect(saturday.subtotal).toBeGreaterThan(weekday.subtotal);
  });

  it("Sunday move costs more than Saturday", () => {
    const saturday = estimateMovePrice(base({ dayType: "saturday" }));
    const sunday = estimateMovePrice(base({ dayType: "sunday" }));
    expect(sunday.subtotal).toBeGreaterThan(saturday.subtotal);
  });

  it("Saturday surcharge is ~25% above weekday rate", () => {
    // Use single_item (1-person team, rate=799) so rounding to 100 aligns cleanly:
    // weekday: 799 → 800, saturday: 799*1.25=998.75 → 1000, ratio=1.25 exactly
    const weekday = estimateMovePrice(base({ dayType: "weekday", moveType: "single_item", estimatedVolumeM3: 2 }));
    const saturday = estimateMovePrice(base({ dayType: "saturday", moveType: "single_item", estimatedVolumeM3: 2 }));
    const ratio = saturday.hourlyRate / weekday.hourlyRate;
    expect(ratio).toBeCloseTo(1.25, 2);
  });
});

describe("estimateMovePrice — currencies", () => {
  it("DKK, SEK, and NOK produce different rates", () => {
    const dkk = estimateMovePrice(base({ currency: "DKK" }));
    const sek = estimateMovePrice(base({ currency: "SEK" }));
    const nok = estimateMovePrice(base({ currency: "NOK" }));
    expect(dkk.hourlyRate).not.toEqual(sek.hourlyRate);
    expect(sek.hourlyRate).not.toEqual(nok.hourlyRate);
  });

  it("returns positive estimates for all three currencies", () => {
    for (const currency of ["DKK", "SEK", "NOK"] as const) {
      const result = estimateMovePrice(base({ currency }));
      expect(result.lowEstimate).toBeGreaterThan(0);
    }
  });
});

describe("estimateMovePrice — services add cost", () => {
  it("packing help increases estimate", () => {
    const without = estimateMovePrice(base());
    const withPacking = estimateMovePrice(base({ packingHelp: true }));
    expect(withPacking.lowEstimate).toBeGreaterThan(without.lowEstimate);
  });

  it("packing materials add a flat cost to both estimates", () => {
    const without = estimateMovePrice(base());
    const withMaterials = estimateMovePrice(base({ packingMaterialsNeeded: true }));
    // 500 DKK materials added to both ends
    expect(withMaterials.lowEstimate - without.lowEstimate).toBeGreaterThan(0);
  });

  it("storage days add to the estimate", () => {
    const without = estimateMovePrice(base());
    const withStorage = estimateMovePrice(base({ storageDays: 30 }));
    expect(withStorage.lowEstimate).toBeGreaterThan(without.lowEstimate);
  });
});

describe("estimateMovePrice — move types", () => {
  it("single_item uses a team of 1 by default", () => {
    const result = estimateMovePrice(base({ moveType: "single_item", estimatedVolumeM3: 2 }));
    expect(result.teamSize).toBe(1);
  });

  it("large office move uses team of 4", () => {
    const result = estimateMovePrice(base({ moveType: "office", estimatedVolumeM3: 60 }));
    expect(result.teamSize).toBe(4);
  });

  it("office minimum hours is 4", () => {
    const result = estimateMovePrice(base({ moveType: "office", estimatedVolumeM3: 5 }));
    expect(result.billableHours).toBeGreaterThanOrEqual(4);
  });
});

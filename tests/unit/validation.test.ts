import { describe, it, expect } from "vitest";
import { getBidReadinessIssues } from "@/lib/qualification/validate";
import { makeTestBrief } from "../helpers/db";
import type { QualificationProfile } from "@/lib/types";

const fullProfile: QualificationProfile = {
  first_name: "Lars",
  email: "lars@example.com",
  phone: "+45 12 34 56 78",
  preferred_language: "da",
  preferred_contact_method: "email",
  ready_for_bids: true,
  allow_auto_bids: null,
  preferredBudget: null,
  hardMaxBudget: null,
};

const completeBrief = makeTestBrief();

describe("getBidReadinessIssues — complete data", () => {
  it("returns no issues for a complete brief + profile", () => {
    const issues = getBidReadinessIssues(completeBrief, fullProfile);
    expect(issues).toHaveLength(0);
  });
});

describe("getBidReadinessIssues — contact info", () => {
  it("flags missing contact name", () => {
    const issues = getBidReadinessIssues(completeBrief, { ...fullProfile, first_name: "" });
    expect(issues).toContain("contact_name");
  });

  it("flags missing email", () => {
    const issues = getBidReadinessIssues(completeBrief, { ...fullProfile, email: "" });
    expect(issues).toContain("contact_email");
  });

  it("flags missing phone", () => {
    const issues = getBidReadinessIssues(completeBrief, { ...fullProfile, phone: "" });
    expect(issues).toContain("contact_phone");
  });

  it("flags unknown contact method", () => {
    const issues = getBidReadinessIssues(completeBrief, { ...fullProfile, preferred_contact_method: "unknown" });
    expect(issues).toContain("contact_method");
  });

  it("flags null ready_for_bids", () => {
    // Both profile AND brief must be null: profile.ready_for_bids ?? brief.ready_for_bids
    const brief = makeTestBrief({ ready_for_bids: null });
    const issues = getBidReadinessIssues(brief, { ...fullProfile, ready_for_bids: null });
    expect(issues).toContain("ready_for_bids");
  });
});

describe("getBidReadinessIssues — location info", () => {
  it("flags missing pickup address", () => {
    const brief = makeTestBrief({ origin: { ...completeBrief.origin, address: null } });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("pickup_address");
  });

  it("flags missing dropoff address", () => {
    const brief = makeTestBrief({ destination: { ...completeBrief.destination, address: null } });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("dropoff_address");
  });

  it("flags unknown property type at origin", () => {
    const brief = makeTestBrief({ origin: { ...completeBrief.origin, property_type: "unknown" } });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("pickup_property");
  });

  it("flags unknown elevator at origin", () => {
    const brief = makeTestBrief({ origin: { ...completeBrief.origin, elevator: "unknown" } });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("pickup_elevator");
  });

  it("flags elevator_usable when elevator=yes but usability is null", () => {
    const brief = makeTestBrief({
      origin: { ...completeBrief.origin, elevator: "yes", elevator_usable_for_furniture: null },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("pickup_elevator_usable");
  });

  it("does NOT flag elevator_usable when elevator=no", () => {
    const brief = makeTestBrief({
      origin: { ...completeBrief.origin, elevator: "no", elevator_usable_for_furniture: null },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).not.toContain("pickup_elevator_usable");
  });

  it("flags unknown parking access", () => {
    const brief = makeTestBrief({ origin: { ...completeBrief.origin, parking_access: "unknown" } });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("pickup_parking_access");
  });
});

describe("getBidReadinessIssues — services", () => {
  it("flags undecided packing scope", () => {
    const brief = makeTestBrief({
      services_requested: { ...completeBrief.services_requested, packing: "undecided" },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("packing_scope");
  });

  it("flags missing packing materials answer when packing is full", () => {
    const brief = makeTestBrief({
      services_requested: {
        ...completeBrief.services_requested,
        packing: "full",
        packing_materials_needed: null,
      },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("packing_materials");
  });

  it("does NOT flag packing materials when packing is self", () => {
    const brief = makeTestBrief({
      services_requested: {
        ...completeBrief.services_requested,
        packing: "self",
        packing_materials_needed: null,
      },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).not.toContain("packing_materials");
  });

  it("flags null disassembly_reassembly", () => {
    const brief = makeTestBrief({
      services_requested: { ...completeBrief.services_requested, disassembly_reassembly: null },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("disassembly_reassembly");
  });

  it("flags null disposal_needed", () => {
    const brief = makeTestBrief({
      services_requested: { ...completeBrief.services_requested, disposal_needed: null },
    });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("disposal_needed");
  });
});

describe("getBidReadinessIssues — deadline", () => {
  it("flags key_handover_time when strict_deadline is true but no time set", () => {
    const brief = makeTestBrief({ strict_deadline: true, key_handover_time: null });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).toContain("key_handover_time");
  });

  it("does NOT flag key_handover_time when strict_deadline is false", () => {
    const brief = makeTestBrief({ strict_deadline: false, key_handover_time: null });
    const issues = getBidReadinessIssues(brief, fullProfile);
    expect(issues).not.toContain("key_handover_time");
  });
});

describe("getBidReadinessIssues — no profile", () => {
  it("flags all contact fields when no profile is provided", () => {
    const issues = getBidReadinessIssues(completeBrief);
    expect(issues).toContain("contact_name");
    expect(issues).toContain("contact_email");
    expect(issues).toContain("contact_phone");
  });
});

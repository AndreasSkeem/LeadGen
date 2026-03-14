// Test database helpers.
// The prisma singleton from @/lib/db uses DATABASE_URL=file:./test.db (set by vitest config).
// These helpers provide typed cleanup and test data creation for integration tests.

import { prisma } from "@/lib/db";
import type { Brief, Provider, CustomerContact } from "@/lib/types";
import { v4 as uuid } from "uuid";

// ─── Cleanup ─────────────────────────────────────────────────────────────────
// Delete in FK-safe order: Selection → EventLog → Bid → Brief → Provider

export async function cleanAll() {
  await prisma.selection.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.brief.deleteMany();
  await prisma.provider.deleteMany();
}

export async function cleanBriefs() {
  await prisma.selection.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.brief.deleteMany();
}

// ─── Test entity factories ────────────────────────────────────────────────────

export function makeTestBrief(overrides: Partial<Brief> = {}): Brief {
  const id = uuid();
  return {
    brief_id: id,
    created_at: new Date().toISOString(),
    language: "da",
    move_type: "private",
    urgency: "flexible_weeks",
    move_date_approx: "2026-06-01",
    date_flexibility: "few_days",
    preferred_time_window: null,
    origin: {
      address: "Østerbrogade 1, Kobenhavn",
      municipality: "Kobenhavn",
      region: "Hovedstaden",
      country: "DK",
      property_type: "apartment",
      floor: 2,
      elevator: "no",
      elevator_usable_for_furniture: null,
      parking_access: "restricted",
      parking_distance_meters: 30,
      access_notes: null,
      size_m2_approx: 65,
      rooms_approx: 3,
    },
    destination: {
      address: "Nørrebrogade 10, Kobenhavn",
      municipality: "Kobenhavn",
      region: "Hovedstaden",
      country: "DK",
      property_type: "apartment",
      floor: 1,
      elevator: "yes",
      elevator_usable_for_furniture: true,
      parking_access: "easy",
      parking_distance_meters: 10,
      access_notes: null,
    },
    volume: {
      description: "3-room move",
      estimated_cbm: 34,
    },
    special_items: [],
    services_requested: {
      transport_only: false,
      carrying_included: true,
      packing: "self",
      packing_materials_needed: null,
      unpacking: null,
      disassembly_reassembly: false,
      storage: { needed: false, duration: null, climate_controlled: null },
      disposal_needed: false,
      cleaning: false,
    },
    bid_preferences: {
      allowAutoBids: true,
      preferredBudget: null,
      hardMaxBudget: null,
      readyToReceiveBidsNow: true,
    },
    preferred_contact_method: "email",
    ready_for_bids: true,
    can_customer_help_carry: true,
    strict_deadline: false,
    key_handover_time: null,
    high_value_items: false,
    customer_notes: "",
    budget_indication: {
      provided: false,
      range_dkk: null,
      preferredBudget: null,
      hardMaxBudget: null,
    },
    qualification_confidence: "high",
    summary: "3-room move in Copenhagen.",
    ...overrides,
  };
}

export const TEST_CONTACT: CustomerContact = {
  firstName: "Lars",
  email: "lars@example.com",
  phone: "+45 12 34 56 78",
};

export function makeTestProvider(overrides: Partial<{
  id: string;
  companyName: string;
  country: string;
  region: string;
  municipality: string;
}> = {}) {
  return {
    id: overrides.id ?? `test-provider-${uuid()}`,
    companyName: overrides.companyName ?? "Test Movers ApS",
    country: overrides.country ?? "DK",
    region: overrides.region ?? "Hovedstaden",
    municipality: overrides.municipality ?? "Kobenhavn",
    services: JSON.stringify(["private"]),
    specialties: JSON.stringify([]),
    typicalJobSize: "medium",
    description: "Test provider for integration tests",
    yearsInBusiness: 5,
    employeesApprox: 10,
    rating: 4.5,
    responseTimeHours: 24,
    available: true,
    isSimulated: false,
  };
}

// Inserts a Provider row directly (bypasses the seed — for test isolation)
export async function seedTestProvider(overrides: Parameters<typeof makeTestProvider>[0] = {}) {
  const data = makeTestProvider(overrides);
  return prisma.provider.create({ data });
}

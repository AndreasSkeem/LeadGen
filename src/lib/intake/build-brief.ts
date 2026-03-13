import { v4 as uuidv4 } from "uuid";
import { callOpenRouter } from "@/lib/ai/client";
import type {
  BidPreferences,
  Brief,
  BriefLocation,
  Country,
  MoveType,
  PreferredLanguage,
  PropertyType,
  QualificationConfidence,
} from "@/lib/types";
import type { IntakeData, MoveSizeCategory } from "@/lib/intake/types";

type RegionRecord = {
  municipality: string;
  region: string;
  country: Country;
};

const LOCATION_INDEX: Array<{ keywords: string[]; value: RegionRecord }> = [
  { keywords: ["copenhagen", "kobenhavn", "frederiksberg"], value: { municipality: "Kobenhavn", region: "Hovedstaden", country: "DK" } },
  { keywords: ["aarhus", "arhus"], value: { municipality: "Aarhus", region: "Midtjylland", country: "DK" } },
  { keywords: ["odense"], value: { municipality: "Odense", region: "Syddanmark", country: "DK" } },
  { keywords: ["stockholm", "solna", "sundbyberg"], value: { municipality: "Stockholm", region: "Stockholm", country: "SE" } },
  { keywords: ["goteborg", "gothenburg"], value: { municipality: "Goteborg", region: "Vastra Gotaland", country: "SE" } },
  { keywords: ["oslo", "majorstuen", "majorstua"], value: { municipality: "Oslo", region: "Oslo", country: "NO" } },
  { keywords: ["bergen"], value: { municipality: "Bergen", region: "Vestland", country: "NO" } },
];

const SPECIAL_ITEM_KEYWORDS: Record<string, string[]> = {
  piano: ["piano", "flygel", "klaver"],
  "large fridge": ["fridge", "american fridge", "refrigerator"],
  "washing machine": ["washing machine", "washer"],
  dryer: ["dryer", "tumble dryer", "tørremaskine"],
  safe: ["safe"],
  "gym equipment": ["gym", "treadmill", "weights"],
  "fragile art": ["art", "painting", "mirror", "kunst"],
  "server rack": ["server", "rack"],
};

const SIZE_CATEGORY_COPY: Record<MoveSizeCategory, { description: string; cbm: number; rooms: number | null }> = {
  few_items: { description: "minimal", cbm: 8, rooms: 1 },
  studio: { description: "studio / 1-room", cbm: 15, rooms: 1 },
  two_room: { description: "2-room move", cbm: 24, rooms: 2 },
  three_room: { description: "3-room move", cbm: 34, rooms: 3 },
  full_home: { description: "full household", cbm: 48, rooms: 4 },
  office_small: { description: "small office move", cbm: 28, rooms: null },
  office_large: { description: "large office move", cbm: 65, rooms: null },
  custom: { description: "custom size", cbm: 0, rooms: null },
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferRegion(address: string, fallbackCountry: Country | null): RegionRecord {
  const text = normalize(address);
  const matched = LOCATION_INDEX.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  if (matched) return matched.value;

  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const municipality = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? "Unknown";
  const country =
    text.includes("sweden") || text.includes("sverige")
      ? "SE"
      : text.includes("norway") || text.includes("norge")
        ? "NO"
        : text.includes("denmark") || text.includes("danmark")
          ? "DK"
          : fallbackCountry ?? "DK";

  return {
    municipality: titleCase(normalize(municipality) || "Unknown"),
    region: country === "DK" ? "Hovedstaden" : country === "SE" ? "Stockholm" : "Oslo",
    country,
  };
}

function inferUrgency(moveDate: string, flexibility: IntakeData["dateFlexibility"]): Brief["urgency"] {
  if (!moveDate) return flexibility === "week_or_more" ? "flexible_months" : "flexible_weeks";

  const today = new Date();
  const target = new Date(moveDate);
  const diffDays = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diffDays <= 7) return "asap";
  if (flexibility === "week_or_more") return "flexible_months";
  if (flexibility === "few_days") return "flexible_weeks";
  return "fixed_date";
}

function inferMoveType(input: IntakeData): MoveType {
  if (input.storageNeeded && input.moveType === "storage") return "storage";
  return input.moveType;
}

function inferSpecialItems(input: IntakeData): string[] {
  const items = new Set(input.specialItems);
  const text = normalize([input.specialItemsNotes, input.describeMove, input.inventorySummary, input.extraNotes].join(" "));

  for (const [label, keywords] of Object.entries(SPECIAL_ITEM_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      items.add(label);
    }
  }

  return Array.from(items);
}

function inferVolume(input: IntakeData, specialItems: string[]): Brief["volume"] {
  const base = SIZE_CATEGORY_COPY[input.moveSizeCategory];
  const estimated = input.estimatedVolumeM3 ?? (base.cbm > 0 ? base.cbm : null);
  const heavyItemExtra = specialItems.length > 0 ? Math.min(8, specialItems.length * 2) : 0;

  return {
    description: input.inventorySummary.trim() || base.description,
    estimated_cbm: estimated === null ? null : estimated + heavyItemExtra,
  };
}

function inferRooms(input: IntakeData): number | null {
  if (input.roomCount !== null) return input.roomCount;
  return SIZE_CATEGORY_COPY[input.moveSizeCategory].rooms;
}

function buildLocation(
  location: IntakeData["origin"],
  fallbackCountry: Country | null,
  rooms: number | null = null
): BriefLocation {
  const region = inferRegion(location.address, fallbackCountry);

  return {
    address: location.address.trim(),
    municipality: region.municipality,
    region: region.region,
    country: region.country,
    property_type: location.propertyType,
    floor: location.propertyType === "house" ? 0 : location.floor,
    elevator: location.propertyType === "house" ? "not_applicable" : location.elevator,
    elevator_usable_for_furniture: location.propertyType === "house" ? null : location.elevatorUsable,
    parking_access: location.parkingAccess,
    parking_distance_meters: location.parkingDistanceMeters,
    access_notes: location.accessNotes.trim() || null,
    size_m2_approx: null,
    rooms_approx: rooms,
  };
}

function inferConfidence(input: IntakeData, specialItems: string[]): QualificationConfidence {
  if (
    input.origin.address &&
    input.destination.address &&
    input.moveDate &&
    input.preferredContactMethod !== "unknown" &&
    input.canHelpCarry !== null &&
    input.strictDeadline !== null &&
    input.highValueItems !== null &&
    (input.estimatedVolumeM3 !== null || input.roomCount !== null || input.inventorySummary.trim())
  ) {
    return specialItems.length > 3 || input.moveType === "international" ? "medium" : "high";
  }

  return "medium";
}

function buildSummaryFallback(input: IntakeData, brief: Brief, specialItems: string[]): string {
  const labels: Record<Brief["language"], { services: string; special: string; notes: string; around: string; with: string }> = {
    da: { services: "Services", special: "Særlig håndtering", notes: "Kundekontekst", around: "omkring", with: "med" },
    sv: { services: "Tjanster", special: "Sarskild hantering", notes: "Kundkontext", around: "kring", with: "med" },
    no: { services: "Tjenester", special: "Spesiell handtering", notes: "Kundekontekst", around: "rundt", with: "med" },
    en: { services: "Services", special: "Special handling", notes: "Customer context", around: "around", with: "with" },
  };
  const copy = labels[brief.language];
  const services: string[] = [];
  if (brief.services_requested.packing !== "self") services.push(`${brief.services_requested.packing} packing`);
  if (brief.services_requested.disassembly_reassembly) services.push("disassembly help");
  if (brief.services_requested.storage.needed) services.push("storage");
  if (brief.services_requested.disposal_needed) services.push("disposal");
  if (brief.services_requested.cleaning) services.push("cleaning");

  const serviceLine = services.length > 0 ? ` ${copy.services}: ${services.join(", ")}.` : "";
  const specialLine = specialItems.length > 0 ? ` ${copy.special}: ${specialItems.slice(0, 3).join(", ")}.` : "";
  const notesLine = input.describeMove.trim() ? ` ${copy.notes}: ${input.describeMove.trim()}.` : "";

  return `${titleCase(brief.move_type.replace("_", " "))} from ${brief.origin.municipality} to ${brief.destination.municipality} ${copy.around} ${brief.move_date_approx ?? "a flexible date"}. ${brief.volume.description} ${copy.with} ${brief.origin.property_type} pickup and ${brief.destination.property_type} drop-off.${serviceLine}${specialLine}${notesLine}`.trim();
}

async function refineSummaryWithAI(input: IntakeData, brief: Brief, fallback: string): Promise<string> {
  if (!process.env.API_KEY_OPENROUTER) return fallback;

  const structured = {
    moveType: brief.move_type,
    route: `${brief.origin.municipality} -> ${brief.destination.municipality}`,
    moveDate: brief.move_date_approx,
    size: brief.volume,
    specialItems: brief.special_items,
    services: brief.services_requested,
    notes: [input.describeMove, input.specialItemsNotes, input.extraNotes].filter(Boolean).join(" "),
  };

  try {
    const content = await callOpenRouter(
      [
        {
          role: "system",
          content:
            `You write concise provider-facing moving briefs in ${brief.language}. Return exactly one paragraph, 2-3 sentences, grounded only in the provided intake. No hype and no markdown.`,
        },
        {
          role: "user",
          content: JSON.stringify(structured),
        },
      ],
      process.env.AI_MODEL
    );

    return content.trim() || fallback;
  } catch {
    return fallback;
  }
}

function buildBidPreferences(input: IntakeData): BidPreferences {
  return {
    allowAutoBids: input.allowAutoBids,
    preferredBudget: input.preferredBudget,
    hardMaxBudget: input.hardMaxBudget,
    readyToReceiveBidsNow: input.readyToReceiveBidsNow,
  };
}

export async function buildBriefFromIntake(input: IntakeData): Promise<Brief> {
  const specialItems = inferSpecialItems(input);
  const volume = inferVolume(input, specialItems);
  const rooms = inferRooms(input);
  const bidPreferences = buildBidPreferences(input);

  const origin = buildLocation(input.origin, null, rooms);
  const destination = buildLocation(input.destination, origin.country);

  const brief: Brief = {
    brief_id: uuidv4(),
    created_at: new Date().toISOString(),
    language: input.preferredLanguage as PreferredLanguage,
    move_type: inferMoveType(input),
    urgency: inferUrgency(input.moveDate, input.dateFlexibility),
    move_date_approx: input.moveDate || null,
    date_flexibility: input.dateFlexibility,
    preferred_time_window: input.preferredTimeWindow.trim() || null,
    origin,
    destination: {
      address: destination.address,
      municipality: destination.municipality,
      region: destination.region,
      country: destination.country,
      property_type: destination.property_type,
      floor: destination.floor,
      elevator: destination.elevator,
      elevator_usable_for_furniture: destination.elevator_usable_for_furniture,
      parking_access: destination.parking_access,
      parking_distance_meters: destination.parking_distance_meters,
      access_notes: destination.access_notes,
    },
    volume,
    special_items: specialItems,
    services_requested: {
      transport_only: input.transportOnly,
      carrying_included: input.carryingIncluded,
      packing: input.packing,
      packing_materials_needed: input.packing === "self" ? false : input.packingMaterialsNeeded,
      unpacking: null,
      disassembly_reassembly: input.disassemblyReassembly,
      storage: {
        needed: input.storageNeeded,
        duration: input.storageNeeded ? input.storageDuration.trim() || null : null,
        climate_controlled: input.storageNeeded ? input.climateControlledStorage : null,
      },
      disposal_needed: input.disposalNeeded,
      cleaning: input.cleaningNeeded,
    },
    bid_preferences: bidPreferences,
    preferred_contact_method: input.preferredContactMethod,
    ready_for_bids: input.readyToReceiveBidsNow,
    can_customer_help_carry: input.canHelpCarry,
    strict_deadline: input.strictDeadline,
    key_handover_time: input.strictDeadline ? input.keyHandoverTime.trim() || null : null,
    high_value_items: input.highValueItems,
    customer_notes: [input.describeMove, input.inventorySummary, input.specialItemsNotes, input.disposalDetails, input.extraNotes]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" | "),
    budget_indication: {
      provided: input.preferredBudget !== null || input.hardMaxBudget !== null,
      range_dkk: null,
      preferredBudget: input.preferredBudget,
      hardMaxBudget: input.hardMaxBudget,
    },
    qualification_confidence: inferConfidence(input, specialItems),
    summary: "",
  };

  const fallbackSummary = buildSummaryFallback(input, brief, specialItems);
  brief.summary = await refineSummaryWithAI(input, brief, fallbackSummary);

  return brief;
}

export function defaultIntakeData(language: PreferredLanguage = "en"): IntakeData {
  return {
    moveType: "private",
    moveDate: "",
    dateFlexibility: "exact_date_only",
    preferredTimeWindow: "",
    origin: {
      address: "",
      propertyType: "apartment",
      floor: 2,
      elevator: "no",
      elevatorUsable: null,
      parkingAccess: "easy",
      parkingDistanceMeters: 10,
      accessNotes: "",
    },
    destination: {
      address: "",
      propertyType: "apartment",
      floor: 1,
      elevator: "no",
      elevatorUsable: null,
      parkingAccess: "easy",
      parkingDistanceMeters: 10,
      accessNotes: "",
    },
    moveSizeCategory: "two_room",
    roomCount: null,
    estimatedVolumeM3: null,
    inventorySummary: "",
    fullMove: true,
    specialItems: [],
    specialItemsNotes: "",
    transportOnly: false,
    carryingIncluded: true,
    packing: "self",
    packingMaterialsNeeded: false,
    disassemblyReassembly: false,
    storageNeeded: false,
    storageDuration: "",
    climateControlledStorage: null,
    disposalNeeded: false,
    disposalDetails: "",
    cleaningNeeded: false,
    canHelpCarry: false,
    strictDeadline: false,
    keyHandoverTime: "",
    highValueItems: false,
    extraNotes: "",
    describeMove: "",
    fullName: "",
    email: "",
    phone: "",
    preferredContactMethod: "either",
    preferredLanguage: language,
    allowAutoBids: true,
    preferredBudget: null,
    hardMaxBudget: null,
    readyToReceiveBidsNow: true,
  };
}

export function propertyNeedsFloor(propertyType: PropertyType): boolean {
  return propertyType === "apartment" || propertyType === "office" || propertyType === "other";
}

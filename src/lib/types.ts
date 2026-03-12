// ─── Move Types ───────────────────────────────────────────────────────────────

export type MoveType = "private" | "office" | "heavy_items" | "international" | "storage";

export type Country = "DK" | "SE" | "NO" | "other";

export type Urgency = "fixed_date" | "flexible_weeks" | "flexible_months" | "asap";

export type Elevator = "yes" | "no" | "unknown" | "not_applicable";

export type ParkingAccess = "easy" | "restricted" | "unknown";

export type PropertyType = "apartment" | "house" | "office" | "warehouse" | "other" | "unknown";

export type PackingService = "full" | "partial" | "self" | "undecided";

export type QualificationConfidence = "high" | "medium" | "low";

// ─── Brief ────────────────────────────────────────────────────────────────────

export interface BriefLocation {
  municipality: string;
  region: string | null;
  country: Country;
  property_type: PropertyType;
  floor: number | null;
  elevator: Elevator;
  parking_access: ParkingAccess;
  size_m2_approx?: number | null;
  rooms_approx?: number | null;
}

export interface BriefVolume {
  description: string;
  estimated_cbm: number | null;
}

export interface BriefStorage {
  needed: boolean;
  duration: string | null;
  climate_controlled: boolean | null;
}

export interface BriefServices {
  packing: PackingService;
  unpacking: boolean | null;
  disassembly_reassembly: boolean | null;
  storage: BriefStorage;
  cleaning: boolean | null;
}

export interface BriefBudget {
  provided: boolean;
  range_dkk: string | null;
}

export interface Brief {
  brief_id: string;
  created_at: string;
  language: "da" | "sv" | "no" | "en";
  move_type: MoveType;
  urgency: Urgency;
  move_date_approx: string | null;
  origin: BriefLocation;
  destination: Omit<BriefLocation, "size_m2_approx" | "rooms_approx">;
  volume: BriefVolume;
  special_items: string[];
  services_requested: BriefServices;
  customer_notes: string;
  budget_indication: BriefBudget;
  qualification_confidence: QualificationConfidence;
  summary: string;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export type JobSize = "small" | "medium" | "large" | "all";

export interface Provider {
  id: string;
  company_name: string;
  country: "DK" | "SE" | "NO";
  region: string;
  municipality: string;
  services: MoveType[];
  specialties: string[];
  typical_job_size: JobSize;
  description: string;
  years_in_business: number;
  employees_approx: number;
  rating: number;
  response_time_hours: number;
  available: boolean;
}

// ─── Bid ──────────────────────────────────────────────────────────────────────

export interface Bid {
  provider: Provider;
  price_range: { min: number; max: number };
  currency: "DKK" | "SEK" | "NOK";
  price_range_after_rut?: { min: number; max: number }; // SEK only — after 50% RUT deduction
  estimated_hours: string;
  available_date: string;
  bid_tier: "budget" | "standard" | "premium";
  timeline_days: number;
  message: string;
  score: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

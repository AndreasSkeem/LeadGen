// ─── Move Types ───────────────────────────────────────────────────────────────

export type MoveType = "private" | "office" | "heavy_items" | "international" | "storage";

export type Country = "DK" | "SE" | "NO" | "other";

export type Urgency = "fixed_date" | "flexible_weeks" | "flexible_months" | "asap";

export type Elevator = "yes" | "no" | "unknown" | "not_applicable";

export type ParkingAccess = "easy" | "restricted" | "unknown";

export type PropertyType = "apartment" | "house" | "office" | "warehouse" | "other" | "unknown";

export type PackingService = "full" | "partial" | "self" | "undecided";

export type QualificationConfidence = "high" | "medium" | "low";

export type DateFlexibility = "exact_date_only" | "few_days" | "week_or_more" | "unknown";

export type PreferredContactMethod = "phone" | "email" | "either" | "unknown";

export interface BidPreferences {
  allowAutoBids: boolean;
  preferredBudget: number | null;
  hardMaxBudget: number | null;
  readyToReceiveBidsNow: boolean;
}

// ─── Brief ────────────────────────────────────────────────────────────────────

export interface BriefLocation {
  address: string | null;
  municipality: string;
  region: string | null;
  country: Country;
  property_type: PropertyType;
  floor: number | null;
  elevator: Elevator;
  elevator_usable_for_furniture: boolean | null;
  parking_access: ParkingAccess;
  parking_distance_meters: number | null;
  access_notes: string | null;
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
  transport_only: boolean | null;
  carrying_included: boolean | null;
  packing: PackingService;
  packing_materials_needed: boolean | null;
  unpacking: boolean | null;
  disassembly_reassembly: boolean | null;
  storage: BriefStorage;
  disposal_needed: boolean | null;
  cleaning: boolean | null;
}

export interface BriefBudget {
  provided: boolean;
  range_dkk: string | null;
  preferredBudget: number | null;
  hardMaxBudget: number | null;
}

export interface Brief {
  brief_id: string;
  created_at: string;
  language: "da" | "sv" | "no" | "en";
  move_type: MoveType;
  urgency: Urgency;
  move_date_approx: string | null;
  date_flexibility: DateFlexibility;
  preferred_time_window: string | null;
  origin: BriefLocation;
  destination: Omit<BriefLocation, "size_m2_approx" | "rooms_approx">;
  volume: BriefVolume;
  special_items: string[];
  services_requested: BriefServices;
  bid_preferences: BidPreferences;
  preferred_contact_method: PreferredContactMethod;
  ready_for_bids: boolean;
  can_customer_help_carry: boolean | null;
  strict_deadline: boolean | null;
  key_handover_time: string | null;
  high_value_items: boolean | null;
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

// ─── Offer ────────────────────────────────────────────────────────────────────

export type OfferType = "instant_estimate" | "confirmed_quote" | "quote_on_request";

export type OfferPresentation = "budget" | "standard" | "premium";

export type OfferActionType = "connect_with_mover" | "request_confirmed_quote" | "not_interested" | "save_for_comparison";

export type OfferBudgetFit = "within_preference" | "above_preference" | "above_hard_max" | "unknown";

export interface OfferAction {
  type: OfferActionType;
  label: string;
  primary?: boolean;
}

export interface Offer {
  provider: Provider;
  offer_type: OfferType;
  price_range: { min: number; max: number };
  currency: "DKK" | "SEK" | "NOK";
  price_range_after_rut?: { min: number; max: number }; // SEK only — after 50% RUT deduction
  estimated_hours: string;
  available_date: string;
  offer_presentation: OfferPresentation;
  timeline_days: number;
  message: string;
  assumptions: string[];
  next_step: string;
  budget_fit: OfferBudgetFit;
  match_reasons: string[];
  customer_actions: OfferAction[];
  score: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type PreferredLanguage = "da" | "sv" | "no" | "en";

// ─── Provider Bid ─────────────────────────────────────────────────────────────
// A real bid submitted by a seeded provider via the provider dashboard.
// Distinct from Offer, which is a simulated estimate generated at read time.

export type BidType = "binding" | "bounded_estimate" | "survey_required";

export interface ProviderBid {
  id: string;
  briefId: string;
  providerId: string;
  providerName: string;
  providerCountry: "DK" | "SE" | "NO";
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
  createdAt: string;
}

export interface QualificationProfile {
  first_name: string;
  email: string;
  phone: string;
  preferred_language: PreferredLanguage;
  preferred_contact_method: PreferredContactMethod;
  ready_for_bids: boolean | null;
  allow_auto_bids?: boolean | null;
  preferredBudget: number | null;
  hardMaxBudget: number | null;
}

// ─── Customer Contact ──────────────────────────────────────────────────────────
// Stored separately from Brief.data. Only returned through the selection reveal flow.

export interface CustomerContact {
  firstName: string;
  email: string;
  phone: string;
}

// ─── Provider Contact ──────────────────────────────────────────────────────────
// Hardcoded for pilot; in production comes from Provider profile.

export interface ProviderContact {
  phone: string;
  email: string;
}

// ─── Selection / Reveal ────────────────────────────────────────────────────────
// Returned to the customer after they select a real bid.

export interface RevealedSelection {
  selectionId: string;
  bidId: string;
  briefId: string;
  selectedBid: ProviderBid;
  providerContact: ProviderContact | null;
  createdAt: string;
}

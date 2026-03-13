import type { Brief, Country, Offer, OfferBudgetFit, OfferPresentation, OfferType, Provider } from "@/lib/types";
import { providers } from "@/lib/data/providers";
import { estimateMovePrice, type DayType, type PriceEstimate, type PricingInput } from "@/lib/pricing/estimate";
import { scoreProvider } from "./score";

interface SimulatedBidPricing {
  currency: "DKK" | "SEK" | "NOK";
  estimate: PriceEstimate;
  input: PricingInput;
}

const PRESENTATION_SEQUENCE: OfferPresentation[] = ["budget", "standard", "premium"];

const METRO_GROUPS = [
  ["kobenhavn", "copenhagen", "frederiksberg", "norrebro", "osterbro", "vesterbro", "amager", "valby", "rodovre", "gladsaxe", "herlev", "taarnby"],
  ["stockholm", "solna", "sundbyberg", "sodermalm", "kista", "nacka"],
  ["oslo", "baerum", "asker"],
  ["goteborg", "gothenburg", "molndal"],
];

const MINIMAL_VOLUME_KEYWORDS = [
  "minimal",
  "few boxes",
  "single person",
  "one person",
  "student",
  "light move",
  "small load",
  "få ting",
  "få kasser",
  "enkeltperson",
  "lite møbler",
  "minimalt",
  "litet lass",
];

const FULL_VOLUME_KEYWORDS = [
  "full household",
  "full house",
  "entire house",
  "family move",
  "fuld husstand",
  "hele hjemmet",
  "fullt hushold",
  "helt bohag",
];

const WEEKEND_KEYWORDS = ["weekend", "lørdag", "lordag", "søndag", "sondag", "helg", "saturday", "sunday"];
const SUNDAY_KEYWORDS = ["søndag", "sondag", "sunday"];
const LONG_CARRY_KEYWORDS = ["long carry", "lang bæredistance", "lang baeredistance", "lang bäcksträcka", "lang baredistanse", "restricted parking"];
const HEAVY_ITEM_KEYWORDS = ["piano", "flygel", "safe", "aquarium", "fridge", "server rack", "marble"];
const DISMANTLE_KEYWORDS = ["bed", "wardrobe", "table", "sofa", "seng", "skab", "bord", "garderobe"];
const DISPOSAL_KEYWORDS = ["dispose", "disposal", "dump", "genbrug", "genbrugsplads", "bortkor", "avfall", "tippen", "recycling"];

function getCurrency(country: Country): "DKK" | "SEK" | "NOK" {
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return "DKK";
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function briefText(brief: Brief): string {
  return normalizeText(
    [
      brief.move_date_approx,
      brief.volume.description,
      brief.customer_notes,
      brief.summary,
      brief.special_items.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isInMetroGroup(origin: string, destination: string): boolean {
  const from = normalizeText(origin);
  const to = normalizeText(destination);

  return METRO_GROUPS.some((group) => group.includes(from) && group.includes(to));
}

function isSameLocalMove(brief: Brief): boolean {
  if (brief.origin.country !== brief.destination.country) return false;

  return (
    normalizeText(brief.origin.municipality) === normalizeText(brief.destination.municipality) ||
    isInMetroGroup(brief.origin.municipality, brief.destination.municipality)
  );
}

function inferVolumeProfile(brief: Brief): "minimal" | "partial" | "full" {
  const text = briefText(brief);
  const estimatedCbm = brief.volume.estimated_cbm ?? 0;
  const rooms = brief.origin.rooms_approx ?? 0;

  if (MINIMAL_VOLUME_KEYWORDS.some((keyword) => text.includes(keyword))) return "minimal";
  if (FULL_VOLUME_KEYWORDS.some((keyword) => text.includes(keyword))) return "full";
  if (estimatedCbm > 0 && estimatedCbm <= 15) return "minimal";
  if (estimatedCbm > 35 || rooms >= 4) return "full";

  return "partial";
}

function inferVolumeM3(brief: Brief): number {
  if (brief.volume.estimated_cbm) return brief.volume.estimated_cbm;

  const rooms = brief.origin.rooms_approx ?? 2;
  const volumeProfile = inferVolumeProfile(brief);

  if (brief.move_type === "heavy_items") {
    return Math.max(4, brief.special_items.length * 3);
  }

  if (brief.move_type === "office") {
    return Math.max(18, rooms * 10);
  }

  if (brief.move_type === "international") {
    return Math.max(16, rooms * 9);
  }

  const perRoom = volumeProfile === "minimal" ? 7 : volumeProfile === "full" ? 13 : 10;
  return Math.max(8, rooms * perRoom);
}

function inferDistance(brief: Brief): { distanceKm: number; driveMinutes: number } {
  if (isSameLocalMove(brief)) {
    if (normalizeText(brief.origin.municipality) === normalizeText(brief.destination.municipality)) {
      return { distanceKm: 5, driveMinutes: 18 };
    }

    return { distanceKm: 7, driveMinutes: 22 };
  }

  if (brief.origin.country === brief.destination.country) {
    if (normalizeText(brief.origin.region) === normalizeText(brief.destination.region)) {
      return { distanceKm: 35, driveMinutes: 45 };
    }

    return { distanceKm: 180, driveMinutes: 150 };
  }

  return { distanceKm: 450, driveMinutes: 360 };
}

function inferDayType(brief: Brief): DayType {
  const text = briefText(brief);
  if (SUNDAY_KEYWORDS.some((keyword) => text.includes(keyword))) return "sunday";
  if (WEEKEND_KEYWORDS.some((keyword) => text.includes(keyword))) return "saturday";
  return "weekday";
}

function inferHeavyItems(brief: Brief): number {
  if (brief.move_type === "heavy_items") {
    return Math.max(brief.special_items.length, 1);
  }

  return brief.special_items.filter((item) => {
    const normalized = normalizeText(item);
    return HEAVY_ITEM_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }).length;
}

function inferDismantlingItems(brief: Brief): number {
  const text = briefText(brief);
  const inferred = brief.special_items.filter((item) => {
    const normalized = normalizeText(item);
    return DISMANTLE_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }).length;

  if (inferred > 0) return inferred;
  if (text.includes("bed") || text.includes("seng")) return 1;
  return 0;
}

function inferStorageDays(brief: Brief): number {
  if (!brief.services_requested.storage.needed) return 0;

  const duration = normalizeText(brief.services_requested.storage.duration);
  if (duration.includes("week")) return 14;
  if (duration.includes("uge")) return 14;
  if (duration.includes("month")) return 30;
  if (duration.includes("måned") || duration.includes("manad")) return 30;
  return 30;
}

function inferDisposalLoad(brief: Brief): number {
  if (!brief.services_requested.disposal_needed) return 0;

  const text = briefText(brief);
  if (DISPOSAL_KEYWORDS.some((keyword) => text.includes(keyword))) {
    if (text.includes("few") || text.includes("small")) return 1;
    if (text.includes("many") || text.includes("large") || text.includes("full")) return 3;
  }

  return 2;
}

function inferLongCarry(brief: Brief): boolean {
  const text = briefText(brief);
  return LONG_CARRY_KEYWORDS.some((keyword) => text.includes(keyword)) || brief.origin.parking_access === "restricted";
}

function mapMoveType(brief: Brief): PricingInput["moveType"] {
  switch (brief.move_type) {
    case "office":
      return "office";
    case "heavy_items":
      return "single_item";
    case "international":
      return "international";
    case "storage":
      return "storage";
    default:
      return "home";
  }
}

function buildPricingInput(brief: Brief): PricingInput {
  const { distanceKm, driveMinutes } = inferDistance(brief);
  const longCarry = inferLongCarry(brief);

  return {
    moveType: mapMoveType(brief),
    rooms: brief.origin.rooms_approx ?? undefined,
    estimatedVolumeM3: inferVolumeM3(brief),
    distanceKm,
    driveMinutes,
    pickupFloor: brief.origin.floor ?? 0,
    dropoffFloor: brief.destination.floor ?? 0,
    pickupElevator: brief.origin.elevator === "yes",
    dropoffElevator: brief.destination.elevator === "yes",
    pickupElevatorUsable: brief.origin.elevator_usable_for_furniture ?? undefined,
    dropoffElevatorUsable: brief.destination.elevator_usable_for_furniture ?? undefined,
    longCarryPickup: longCarry,
    longCarryDropoff: brief.destination.parking_access === "restricted",
    pickupParkingDistanceMeters: brief.origin.parking_distance_meters ?? undefined,
    dropoffParkingDistanceMeters: brief.destination.parking_distance_meters ?? undefined,
    restrictedAccess:
      brief.origin.parking_access === "restricted" ||
      brief.destination.parking_access === "restricted" ||
      Boolean(brief.origin.access_notes) ||
      Boolean(brief.destination.access_notes),
    packingHelp: brief.services_requested.packing === "full" || brief.services_requested.packing === "partial",
    packingMaterialsNeeded: brief.services_requested.packing_materials_needed ?? undefined,
    dismantlingItems: inferDismantlingItems(brief),
    heavyItems: inferHeavyItems(brief),
    storageDays: inferStorageDays(brief),
    disposalLoad: inferDisposalLoad(brief),
    customerCanHelpCarry: brief.can_customer_help_carry ?? undefined,
    strictDeadline: brief.strict_deadline ?? undefined,
    dayType: inferDayType(brief),
    currency: getCurrency(brief.origin.country),
  };
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function rangeSpread(step: number, presentation: OfferPresentation): number {
  if (presentation === "budget") return step * 6;
  if (presentation === "standard") return step * 8;
  return step * 10;
}

function budgetHeadroom(step: number, presentation: OfferPresentation): number {
  if (presentation === "budget") return step * 7;
  if (presentation === "standard") return step * 5;
  return step * 3;
}

function providerVariance(providerId: string, step: number, presentation: OfferPresentation): number {
  const hash = providerId.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
  const spread = presentation === "budget" ? 2 : presentation === "standard" ? 3 : 4;
  return (hash % (spread + 1)) * step;
}

function lowEndBuffer(step: number, presentation: OfferPresentation, variance: number): number {
  const base = presentation === "budget" ? step * 11 : presentation === "standard" ? step * 8 : step * 6;
  return base + variance;
}

function buildOfferRange(
  brief: Brief,
  providerId: string,
  presentation: OfferPresentation,
  estimate: PriceEstimate,
  currency: "DKK" | "SEK" | "NOK"
): { min: number; max: number } {
  const step = currency === "NOK" ? 500 : 100;
  const minSpread = rangeSpread(step, presentation);
  const variance = providerVariance(providerId, step, presentation);
  const midpoint = roundToStep((estimate.lowEstimate + estimate.highEstimate) / 2, step);

  let range =
    presentation === "budget"
      ? {
      min: roundToStep(estimate.lowEstimate - variance, step),
      max: roundToStep(Math.min(midpoint, estimate.lowEstimate * 1.08) - variance, step),
        }
      : presentation === "standard"
        ? {
      min: roundToStep(midpoint * 0.96 - variance, step),
      max: roundToStep(midpoint * 1.04 - Math.max(step, variance - step), step),
          }
        : {
      min: roundToStep(Math.max(midpoint * 1.05, estimate.highEstimate * 0.96) - variance, step),
      max: roundToStep(estimate.highEstimate - Math.max(step, Math.floor(variance / 2)), step),
          };

  range = {
    min: Math.max(step, range.min),
    max: Math.max(step * 2, range.max),
  };

  const budgetCap = brief.bid_preferences.hardMaxBudget ?? brief.bid_preferences.preferredBudget;
  if (budgetCap !== null) {
    const safeMax = Math.max(step * 4, budgetCap - budgetHeadroom(step, presentation));
    const cappedMax = roundToStep(Math.min(range.max, safeMax), step);
    const cappedMinTarget = cappedMax - lowEndBuffer(step, presentation, variance);
    const cappedMin = roundToStep(Math.min(range.min, cappedMinTarget), step);
    range = {
      min: Math.max(step, Math.min(cappedMin, cappedMax - step)),
      max: Math.max(step * 2, cappedMax),
    };
  }

  if (range.max - range.min < step * 2) {
    range = {
      min: Math.max(step, range.max - minSpread),
      max: Math.max(step * 2, range.max),
    };
  }

  return range;
}

function buildPricing(brief: Brief): SimulatedBidPricing {
  const input = buildPricingInput(brief);
  const estimate = estimateMovePrice(input);

  return {
    currency: input.currency,
    estimate,
    input,
  };
}

export function getSimulatedBidPricing(brief: Brief): SimulatedBidPricing {
  return buildPricing(brief);
}

function formatEstimatedHours(brief: Brief, billableHours: number): string {
  const labels: Record<Brief["language"], string> = {
    da: "timer",
    sv: "timmar",
    no: "timer",
    en: "hours",
  };

  return `${billableHours.toFixed(1).replace(".0", "")} ${labels[brief.language]}`;
}

function estimateAvailableDate(brief: Brief): string {
  if (brief.move_date_approx) {
    const labels: Record<Brief["language"], string> = {
      da: "Fra",
      sv: "Från",
      no: "Fra",
      en: "From",
    };

    return `${labels[brief.language]} ${brief.move_date_approx}`;
  }

  const labels: Record<Brief["language"], Record<Brief["urgency"] | "default", string>> = {
    da: {
      asap: "Ledig i denne uge",
      fixed_date: "Efter aftale",
      flexible_weeks: "Inden for 2 uger",
      flexible_months: "Fleksibel - efter aftale",
      default: "Ledig efter aftale",
    },
    sv: {
      asap: "Ledig denna vecka",
      fixed_date: "Enligt överenskommelse",
      flexible_weeks: "Inom 2 veckor",
      flexible_months: "Flexibel - enligt överenskommelse",
      default: "Ledig enligt överenskommelse",
    },
    no: {
      asap: "Ledig denne uken",
      fixed_date: "Etter avtale",
      flexible_weeks: "Innen 2 uker",
      flexible_months: "Fleksibel - etter avtale",
      default: "Ledig etter avtale",
    },
    en: {
      asap: "Available this week",
      fixed_date: "On request",
      flexible_weeks: "Within 2 weeks",
      flexible_months: "Flexible - on request",
      default: "Available on request",
    },
  };

  return labels[brief.language][brief.urgency] ?? labels[brief.language].default;
}

function estimateTimeline(brief: Brief): number {
  if (brief.urgency === "asap") return 3;
  if (brief.urgency === "fixed_date") return 14;
  if (brief.urgency === "flexible_weeks") return 21;
  return 30;
}

function generateProviderMessage(brief: Brief, provider: Provider, presentation: OfferPresentation): string {
  const municipality = brief.origin.municipality;
  const specialItem = brief.special_items[0];
  const hasSpecialItems = brief.special_items.length > 0;

  const messages: Record<Brief["language"], Record<OfferPresentation, string>> = {
    da: {
      budget: `Effektiv flytning fra ${municipality} med fokus på en enkel og stram løsning.`,
      standard: `Vi kører ofte i ${municipality}-området og kan håndtere flytningen sikkert og effektivt.${hasSpecialItems ? ` ${specialItem} tager vi ekstra højde for.` : ""}`,
      premium: `Vi planlægger hele dagen tæt og inkluderer ekstra beskyttelse, koordinering og mere fleksibilitet.`,
    },
    sv: {
      budget: `Smidig flytt från ${municipality} med fokus på en enkel och prisvärd lösning.`,
      standard: `Vi kör ofta i ${municipality}-området och kan genomföra flytten tryggt och effektivt.${hasSpecialItems ? ` ${specialItem} hanterar vi med extra omsorg.` : ""}`,
      premium: `Vi planerar hela dagen mer noggrant och inkluderar extra skydd, koordinering och högre flexibilitet.`,
    },
    no: {
      budget: `Effektiv flytting fra ${municipality} med fokus på en enkel og kostnadseffektiv løsning.`,
      standard: `Vi kjører ofte i ${municipality}-området og kan gjennomføre flyttingen trygt og effektivt.${hasSpecialItems ? ` ${specialItem} håndterer vi med ekstra omtanke.` : ""}`,
      premium: `Vi planlegger dagen tettere og inkluderer ekstra beskyttelse, koordinering og mer fleksibilitet.`,
    },
    en: {
      budget: `Efficient move from ${municipality} with a lean setup and competitive pricing.`,
      standard: `We handle moves in the ${municipality} area regularly and can deliver a balanced, reliable setup.${hasSpecialItems ? ` We will plan carefully around ${specialItem}.` : ""}`,
      premium: `We plan the move more tightly and include added protection, coordination, and flexibility on move day.`,
    },
  };

  return messages[brief.language][presentation];
}

function buildAssumptions(brief: Brief): string[] {
  const assumptions: string[] = [];

  assumptions.push(
    brief.volume.estimated_cbm
      ? `${brief.volume.estimated_cbm} m3 estimated volume`
      : `${brief.volume.description} load size`
  );
  assumptions.push(
    brief.move_date_approx ? `Timing based on ${brief.move_date_approx}` : `Timing based on ${brief.urgency.replace("_", " ")} availability`
  );
  assumptions.push(
    brief.services_requested.packing === "self"
      ? "Assumes you handle packing"
      : brief.services_requested.packing === "partial"
        ? "Assumes partial packing help"
        : brief.services_requested.packing === "full"
          ? "Includes full packing help"
          : "Packing scope to be confirmed"
  );

  if (brief.origin.floor !== null || brief.destination.floor !== null) {
    assumptions.push(
      `Access based on floor ${brief.origin.floor ?? "?"} pickup and floor ${brief.destination.floor ?? "?"} drop-off`
    );
  }

  if (brief.special_items.length > 0) {
    assumptions.push(`Includes handling for ${brief.special_items[0]}`);
  }
  if (brief.origin.parking_distance_meters || brief.destination.parking_distance_meters) {
    assumptions.push("Includes parking distance / carry assumptions");
  }
  if (brief.services_requested.disposal_needed) {
    assumptions.push("Includes disposal or removal work");
  }

  return assumptions.slice(0, 4);
}

function determineOfferType(brief: Brief, provider: Provider, score: number, index: number): OfferType {
  if (!brief.bid_preferences.allowAutoBids) {
    return "quote_on_request";
  }

  const straightforwardMove = brief.move_type === "private" || brief.move_type === "office";
  if (straightforwardMove && score >= 70 && index === 0) {
    return "instant_estimate";
  }

  return straightforwardMove ? "instant_estimate" : "quote_on_request";
}

function buildNextStep(brief: Brief, offerType: OfferType, provider: Provider): string {
  const labels: Record<Brief["language"], Record<OfferType, string>> = {
    da: {
      instant_estimate: `Forbind for at bekræfte detaljer og få svar inden for ca. ${provider.response_time_hours} timer.`,
      confirmed_quote: "Klar til at gå videre og dele dine kontaktoplysninger med flyttefirmaet.",
      quote_on_request: `Bed om et bekræftet tilbud. Firmaet vender typisk tilbage inden for ${provider.response_time_hours} timer.`,
    },
    sv: {
      instant_estimate: `Gå vidare för att bekräfta detaljer och få svar inom cirka ${provider.response_time_hours} timmar.`,
      confirmed_quote: "Redo att gå vidare och dela dina kontaktuppgifter med flyttfirman.",
      quote_on_request: `Begär en bekräftad offert. Företaget återkommer vanligtvis inom ${provider.response_time_hours} timmar.`,
    },
    no: {
      instant_estimate: `Gå videre for å bekrefte detaljer og få svar innen cirka ${provider.response_time_hours} timer.`,
      confirmed_quote: "Klar til å gå videre og dele kontaktinformasjonen din med flyttefirmaet.",
      quote_on_request: `Be om et bekreftet tilbud. Firmaet svarer vanligvis innen ${provider.response_time_hours} timer.`,
    },
    en: {
      instant_estimate: `Connect to confirm details and hear back in about ${provider.response_time_hours} hours.`,
      confirmed_quote: "Ready to move forward and share your contact details with the mover.",
      quote_on_request: `Request a confirmed quote and expect a reply within about ${provider.response_time_hours} hours.`,
    },
  };

  return labels[brief.language][offerType];
}

function determineBudgetFit(
  brief: Brief,
  priceRange: { min: number; max: number }
): OfferBudgetFit {
  const preferredBudget = brief.bid_preferences.preferredBudget;
  const hardMaxBudget = brief.bid_preferences.hardMaxBudget;

  if (hardMaxBudget !== null && priceRange.min > hardMaxBudget) return "above_hard_max";
  if (preferredBudget !== null && priceRange.min > preferredBudget) return "above_preference";
  if (preferredBudget !== null || hardMaxBudget !== null) return "within_preference";
  return "unknown";
}

function buildMatchReasons(
  brief: Brief,
  provider: Provider,
  offerType: OfferType,
  budgetFit: OfferBudgetFit
): string[] {
  const labels: Record<Brief["language"], {
    servesRoute: (municipality: string) => string;
    withinBudget: string;
    apartmentRating: string;
    structuredPlanning: string;
    specialItems: string;
    storage: string;
    instant: string;
    confidence: string;
  }> = {
    da: {
      servesRoute: (municipality) => `Kører i ${municipality}-området`,
      withinBudget: "Inden for budget",
      apartmentRating: "Stærk rating for lejlighedsflytninger",
      structuredPlanning: "Erfaring med struktureret flytteplanlægning",
      specialItems: "Håndterer særlige genstande",
      storage: "Opbevaring muligt",
      instant: "Hurtigt estimat muligt",
      confidence: "Høj tillid til dette match",
    },
    sv: {
      servesRoute: (municipality) => `Kör i ${municipality}-området`,
      withinBudget: "Inom budget",
      apartmentRating: "Stark rating för lägenhetsflyttar",
      structuredPlanning: "Erfarenhet av strukturerad flyttplanering",
      specialItems: "Hanterar särskilda föremål",
      storage: "Förvaring tillgänglig",
      instant: "Snabbt estimat tillgängligt",
      confidence: "Hög tilltro till denna match",
    },
    no: {
      servesRoute: (municipality) => `Dekker ${municipality}-området`,
      withinBudget: "Innenfor budsjett",
      apartmentRating: "Sterk rating for leilighetsflytting",
      structuredPlanning: "Erfaring med strukturert flytteplanlegging",
      specialItems: "Håndterer spesielle gjenstander",
      storage: "Lagring tilgjengelig",
      instant: "Raskt estimat tilgjengelig",
      confidence: "Høy tillit til denne matchen",
    },
    en: {
      servesRoute: (municipality) => `Serves your ${municipality} route`,
      withinBudget: "Within your budget",
      apartmentRating: "Strong rating for apartment moves",
      structuredPlanning: "Experienced with structured move planning",
      specialItems: "Handles special items",
      storage: "Storage option available",
      instant: "Instant estimate available",
      confidence: "High-confidence fit for this brief",
    },
  };
  const copy = labels[brief.language];
  const reasons: string[] = [];

  if (brief.origin.country === provider.country) {
    reasons.push(copy.servesRoute(brief.origin.municipality));
  }

  if (budgetFit === "within_preference") {
    reasons.push(copy.withinBudget);
  }

  if (brief.origin.property_type === "apartment" && provider.rating >= 4.5) {
    reasons.push(copy.apartmentRating);
  }

  if (brief.move_type === "office" || provider.services.includes("office")) {
    reasons.push(copy.structuredPlanning);
  }

  if (brief.special_items.length > 0) {
    const normalizedSpecialties = provider.specialties.map((item) => normalizeText(item));
    if (brief.special_items.some((item) => normalizedSpecialties.some((specialty) => specialty.includes(normalizeText(item).split(" ")[0] ?? "")))) {
      reasons.push(copy.specialItems);
    }
  }

  if (brief.services_requested.storage.needed && provider.services.includes("storage")) {
    reasons.push(copy.storage);
  }

  if (offerType === "instant_estimate") {
    reasons.push(copy.instant);
  }

  if (offerType === "confirmed_quote") {
    reasons.push(copy.confidence);
  }

  return reasons.slice(0, 5);
}

function buildCustomerActions(brief: Brief): Offer["customer_actions"] {
  const labels: Record<Brief["language"], Record<Offer["customer_actions"][number]["type"], string>> = {
    da: {
      connect_with_mover: "Forbind med flyttefirma",
      request_confirmed_quote: "Bed om bekræftet tilbud",
      not_interested: "Ikke interesseret",
      save_for_comparison: "Gem til sammenligning",
    },
    sv: {
      connect_with_mover: "Gå vidare med flyttfirma",
      request_confirmed_quote: "Begär bekräftad offert",
      not_interested: "Inte intresserad",
      save_for_comparison: "Spara för jämförelse",
    },
    no: {
      connect_with_mover: "Gå videre med flyttefirma",
      request_confirmed_quote: "Be om bekreftet tilbud",
      not_interested: "Ikke interessert",
      save_for_comparison: "Lagre for sammenligning",
    },
    en: {
      connect_with_mover: "Connect with mover",
      request_confirmed_quote: "Request confirmed quote",
      not_interested: "Not interested",
      save_for_comparison: "Save to compare",
    },
  };

  const actions: Offer["customer_actions"] = [];
  actions.push({ type: "connect_with_mover", label: labels[brief.language].connect_with_mover, primary: true });
  actions.push({ type: "request_confirmed_quote", label: labels[brief.language].request_confirmed_quote });
  actions.push({ type: "save_for_comparison", label: labels[brief.language].save_for_comparison });
  actions.push({ type: "not_interested", label: labels[brief.language].not_interested });

  return actions;
}

export function matchProviders(brief: Brief, topN = 3): Offer[] {
  const scored = providers
    .filter((provider) => provider.available)
    .map((provider) => ({ provider, score: scoreProvider(brief, provider) }))
    .filter(({ score }) => score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  if (scored.length === 0) return [];

  const pricing = buildPricing(brief);
  const estimatedHours = formatEstimatedHours(brief, pricing.estimate.billableHours);
  const availableDate = estimateAvailableDate(brief);
  const timelineDays = estimateTimeline(brief);

  return scored.map(({ provider, score }, index) => {
    const offerPresentation = PRESENTATION_SEQUENCE[index] ?? "premium";
    const priceRange = buildOfferRange(brief, provider.id, offerPresentation, pricing.estimate, pricing.currency);
    const offerType = determineOfferType(brief, provider, score, index);
    const budgetFit = determineBudgetFit(brief, priceRange);

    return {
      provider,
      offer_type: offerType,
      price_range: priceRange,
      currency: pricing.currency,
      estimated_hours: estimatedHours,
      available_date: availableDate,
      offer_presentation: offerPresentation,
      timeline_days: timelineDays,
      message: generateProviderMessage(brief, provider, offerPresentation),
      assumptions: buildAssumptions(brief),
      next_step: buildNextStep(brief, offerType, provider),
      budget_fit: budgetFit,
      match_reasons: buildMatchReasons(brief, provider, offerType, budgetFit),
      customer_actions: buildCustomerActions(brief),
      score,
    };
  });
}

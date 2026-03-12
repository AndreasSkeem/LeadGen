import type { Brief, Bid, Provider, Country } from "@/lib/types";
import { providers } from "@/lib/data/providers";
import { scoreProvider } from "./score";

// ── Currency ───────────────────────────────────────────────────────────────────

function getCurrency(country: Country): "DKK" | "SEK" | "NOK" {
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return "DKK";
}

// ── Price estimation ───────────────────────────────────────────────────────────

interface PriceEstimate {
  base: { min: number; max: number };
  currency: "DKK" | "SEK" | "NOK";
  afterRut?: { min: number; max: number };
}

function estimatePriceRange(brief: Brief): PriceEstimate {
  const country = brief.origin.country;
  const currency = getCurrency(country);
  const rooms = brief.origin.rooms_approx ?? 2;
  const floor = brief.origin.floor ?? 0;
  const noElevator = brief.origin.elevator === "no";
  const isSameCity = brief.origin.municipality === brief.destination.municipality;
  const isCrossCountry = brief.origin.country !== brief.destination.country;

  let base: { min: number; max: number };
  let afterRut: { min: number; max: number } | undefined;

  if (brief.move_type === "international" || isCrossCountry) {
    // Within Scandinavia starts at 15k DKK, further destinations higher
    base = { min: 15000, max: 40000 };

  } else if (brief.move_type === "heavy_items") {
    if (country === "DK") base = { min: 1500, max: 8000 };
    else if (country === "SE") base = { min: 2000, max: 10000 };
    else base = { min: 3000, max: 10000 };

  } else if (brief.move_type === "office") {
    if (country === "DK") base = { min: 15000, max: 60000 };
    else if (country === "SE") base = { min: 18000, max: 70000 };
    else base = { min: 20000, max: 80000 };

  } else if (brief.move_type === "storage") {
    // Monthly storage cost
    if (country === "DK") base = { min: 1000, max: 4000 };
    else if (country === "SE") base = { min: 1200, max: 5000 };
    else base = { min: 1500, max: 6000 };

  } else {
    // Private home move — room-count based per 2026 market rates
    if (country === "DK") {
      if (!isSameCity) {
        // Cross-city, e.g. CPH to Aarhus (~300 km)
        base = rooms <= 2 ? { min: 8000, max: 18000 } : { min: 12000, max: 25000 };
      } else if (rooms <= 1) {
        // Studio/1 room
        base = noElevator && floor > 1
          ? { min: 2500, max: 5000 }  // walkup
          : { min: 1800, max: 3500 }; // elevator / ground floor
      } else if (rooms === 2) {
        base = noElevator ? { min: 4000, max: 8000 } : { min: 3000, max: 6000 };
      } else if (rooms <= 4) {
        base = { min: 6000, max: 12000 };
      } else {
        // Full house, 5+ rooms
        base = { min: 10000, max: 20000 };
      }

      // Floor surcharge for DK (per floor above ground, no elevator)
      if (noElevator && floor > 1 && isSameCity) {
        const surcharge = (floor - 1) * 400;
        base.min += surcharge;
        base.max += surcharge;
      }

    } else if (country === "SE") {
      // Sweden — fixed prices before and after RUT-avdrag (50% labour deduction)
      if (rooms <= 1) {
        base = { min: 3200, max: 4500 };
        afterRut = { min: 1600, max: 2250 };
      } else if (rooms === 2) {
        base = { min: 5000, max: 7000 };
        afterRut = { min: 2500, max: 3500 };
      } else if (rooms <= 3) {
        base = { min: 7000, max: 11000 };
        afterRut = { min: 3500, max: 5500 };
      } else {
        base = { min: 12000, max: 18000 };
        afterRut = { min: 6000, max: 9000 };
      }

    } else {
      // Norway — roughly 20-40% above Danish equivalents
      if (rooms <= 1) base = { min: 3000, max: 6000 };
      else if (rooms <= 3) base = { min: 6000, max: 14000 };
      else base = { min: 15000, max: 30000 };
    }
  }

  // Special items surcharge (piano, safe, etc.)
  if (brief.special_items.length > 0) {
    const perItem = country === "NO" ? 600 : country === "SE" ? 700 : 400;
    const surcharge = brief.special_items.length * perItem;
    base.min += surcharge;
    base.max += surcharge;
    if (afterRut) {
      afterRut.min += Math.round(surcharge * 0.5);
      afterRut.max += Math.round(surcharge * 0.5);
    }
  }

  // Packing service surcharge
  if (brief.services_requested.packing === "full") {
    base.min = Math.round(base.min * 1.5);
    base.max = Math.round(base.max * 1.5);
    if (afterRut) {
      afterRut.min = Math.round(afterRut.min * 1.5);
      afterRut.max = Math.round(afterRut.max * 1.5);
    }
  } else if (brief.services_requested.packing === "partial") {
    base.min = Math.round(base.min * 1.2);
    base.max = Math.round(base.max * 1.2);
    if (afterRut) {
      afterRut.min = Math.round(afterRut.min * 1.2);
      afterRut.max = Math.round(afterRut.max * 1.2);
    }
  }

  return { base, currency, afterRut };
}

// ── Hours estimate ─────────────────────────────────────────────────────────────

function estimateHours(brief: Brief): string {
  const rooms = brief.origin.rooms_approx ?? 2;
  const noElevator = brief.origin.elevator === "no";
  const floor = brief.origin.floor ?? 0;
  const hasPacking = brief.services_requested.packing !== "self";

  let min: number;
  let max: number;

  if (rooms <= 1) { min = 2; max = 3; }
  else if (rooms === 2) { min = 3; max = 5; }
  else if (rooms <= 4) { min = 5; max = 8; }
  else { min = 7; max = 12; }

  if (noElevator && floor > 1) { min += 1; max += 1; }
  if (hasPacking) { min += 1; max += 2; }

  return `${min}–${max} hours`;
}

// ── Available date ─────────────────────────────────────────────────────────────

function estimateAvailableDate(brief: Brief): string {
  if (brief.move_date_approx) {
    return `From ${brief.move_date_approx}`;
  }
  switch (brief.urgency) {
    case "asap": return "Available this week";
    case "fixed_date": return "On request";
    case "flexible_weeks": return "Within 2 weeks";
    case "flexible_months": return "Flexible — on request";
    default: return "Available on request";
  }
}

// ── Timeline ───────────────────────────────────────────────────────────────────

function estimateTimeline(brief: Brief): number {
  if (brief.urgency === "asap") return 3;
  if (brief.urgency === "fixed_date") return 14;
  if (brief.urgency === "flexible_weeks") return 21;
  return 30;
}

// ── Provider messages ──────────────────────────────────────────────────────────

function generateProviderMessage(
  brief: Brief,
  provider: Provider,
  tier: "budget" | "standard" | "premium"
): string {
  const lang = brief.language;
  const municipality = brief.origin.municipality;
  const moveType = brief.move_type;
  const hasSpecialItems = brief.special_items.length > 0;
  const specialItem = brief.special_items[0] ?? "";
  const messages: Record<typeof lang, Record<typeof tier, string>> = {
    da: {
      budget: `Effektiv og pålidelig flytning fra ${municipality}. Vi tilbyder en skarp pris uden at gå på kompromis med kvaliteten — hurtig bestilling og faste, erfarne folk.`,
      standard: `Vi har stor erfaring med ${moveType === "private" ? "privatflytninger" : moveType === "office" ? "erhvervsflytninger" : "specialflytninger"} i ${municipality}-området.${hasSpecialItems ? ` Vi håndterer ${specialItem} med den fornødne omhu.` : ""} Professionel service, faste priser.`,
      premium: `Fuld service fra start til slut — inkl. pakning, afmontering og udvidet forsikring. Vi kender ${municipality} godt og planlægger altid rute og parkeringstilladelser i god tid.`,
    },
    sv: {
      budget: `Prisvärd flytt från ${municipality}. Vi erbjuder ett konkurrenskraftigt pris med erfarna medarbetare och trygg hantering av era tillhörigheter.`,
      standard: `Vi har lång erfarenhet av ${moveType === "office" ? "kontorsflytt" : "privatflytt"} i ${municipality}.${hasSpecialItems ? ` Vi hanterar ${specialItem} med specialkompetens.` : ""} Noggrant utförande hela vägen.`,
      premium: `Helhetslösning med fullständig emballeringsservice, demontering och utökat försäkringsskydd. Vi hanterar hela flytten — ni behöver inte lyfta ett finger.`,
    },
    no: {
      budget: `Rimelig og effektiv flytt fra ${municipality}. Vi tilbyr god service til en konkurransedyktig pris — rask bestilling og erfarne fagfolk.`,
      standard: `Vi har lang erfaring med ${moveType === "heavy_items" ? "spesialtransport" : "privatflytting"} i ${municipality}-området.${hasSpecialItems ? ` ${specialItem} håndterer vi med spesialkompetanse.` : ""} Profesjonell og punktlig.`,
      premium: `Komplett service — vi tar oss av alt fra pakking til montering og forsikring. Kjente med ${municipality} og planlegger alltid parkering og adkomst på forhånd.`,
    },
    en: {
      budget: `Efficient and reliable move from ${municipality}. Competitive pricing without compromise — quick to book, experienced crew.`,
      standard: `We have extensive experience with ${moveType} moves in the ${municipality} area.${hasSpecialItems ? ` We handle ${specialItem} with specialist care.` : ""} Professional service, fixed transparent pricing.`,
      premium: `Full service from start to finish — including packing, disassembly, and enhanced insurance. We know ${municipality} well and coordinate parking and access well in advance.`,
    },
  };

  return messages[lang]?.[tier] ?? messages["en"][tier];
}

// ── Tier configuration ─────────────────────────────────────────────────────────

const TIERS: Array<{
  tier: "budget" | "standard" | "premium";
  minFactor: number;
  maxFactor: number;
}> = [
  { tier: "budget",   minFactor: 0,    maxFactor: 0.35 },
  { tier: "standard", minFactor: 0.30, maxFactor: 0.65 },
  { tier: "premium",  minFactor: 0.60, maxFactor: 1.0  },
];

function roundToStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

// ── Main matching function ────────────────────────────────────────────────────

export function matchProviders(brief: Brief, topN = 3): Bid[] {
  const scored = providers
    .filter((p) => p.available)
    .map((p) => ({ provider: p, score: scoreProvider(brief, p) }))
    .filter(({ score }) => score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  if (scored.length === 0) return [];

  const { base, currency, afterRut } = estimatePriceRange(brief);
  const range = base.max - base.min;
  const step = 500;
  const hoursStr = estimateHours(brief);
  const availableDate = estimateAvailableDate(brief);
  const timelineDays = estimateTimeline(brief);

  return scored.map(({ provider, score }, i) => {
    const { tier, minFactor, maxFactor } = TIERS[i] ?? TIERS[TIERS.length - 1];

    const priceMin = roundToStep(base.min + range * minFactor, step);
    const priceMax = roundToStep(base.min + range * maxFactor, step);

    let rutRange: { min: number; max: number } | undefined;
    if (afterRut) {
      const rr = afterRut.max - afterRut.min;
      rutRange = {
        min: roundToStep(afterRut.min + rr * minFactor, step),
        max: roundToStep(afterRut.min + rr * maxFactor, step),
      };
    }

    return {
      provider,
      price_range: { min: priceMin, max: Math.max(priceMax, priceMin + step) },
      currency,
      price_range_after_rut: rutRange,
      estimated_hours: hoursStr,
      available_date: availableDate,
      bid_tier: tier,
      timeline_days: timelineDays,
      message: generateProviderMessage(brief, provider, tier),
      score,
    };
  });
}

import type { Brief, Provider } from "@/lib/types";

// Adjacent regions by country — used for partial geography matches
const ADJACENT_REGIONS: Record<string, string[]> = {
  // Denmark
  Hovedstaden: ["Sjælland"],
  Sjælland: ["Hovedstaden", "Syddanmark"],
  Syddanmark: ["Sjælland", "Midtjylland"],
  Midtjylland: ["Syddanmark", "Nordjylland"],
  Nordjylland: ["Midtjylland"],
  // Sweden
  Stockholm: ["Uppsala", "Södermanland"],
  "Västra Götaland": ["Halland", "Östergötland", "Värmland"],
  // Norway
  Oslo: ["Viken", "Innlandet"],
  Viken: ["Oslo", "Vestfold og Telemark", "Innlandet"],
  Vestland: ["Rogaland", "Møre og Romsdal"],
};

function geographyScore(brief: Brief, provider: Provider): number {
  if (brief.origin.country !== provider.country) {
    // Cross-border: only if provider explicitly offers international
    return provider.services.includes("international") ? 5 : 0;
  }

  const originRegion = brief.origin.region;

  if (!originRegion) return 15; // same country but unknown region

  if (provider.region === originRegion) {
    // Same region — check municipality
    if (provider.municipality === brief.origin.municipality) return 100;
    return 85;
  }

  const adjacent = ADJACENT_REGIONS[originRegion] ?? [];
  if (adjacent.includes(provider.region)) return 40;

  return 15; // Same country, different region
}

function serviceFitScore(brief: Brief, provider: Provider): number {
  if (provider.services.includes(brief.move_type)) return 100;

  // Generalist check — providers with 3+ service types are generalists
  if (provider.services.length >= 3) return 50;

  return 0;
}

function jobSizeFitScore(brief: Brief, provider: Provider): number {
  if (provider.typical_job_size === "all") return 100;

  const cbm = brief.volume.estimated_cbm;

  if (cbm === null) return 70; // unknown size — give benefit of doubt

  if (cbm < 20) {
    // Small job
    return provider.typical_job_size === "small" ? 100 : provider.typical_job_size === "medium" ? 80 : 20;
  } else if (cbm < 60) {
    // Medium job
    return provider.typical_job_size === "medium" ? 100 : 60;
  } else {
    // Large job
    return provider.typical_job_size === "large" ? 100 : provider.typical_job_size === "medium" ? 60 : 20;
  }
}

function availabilityScore(provider: Provider): number {
  return provider.available ? 100 : 0;
}

function specialtyBonus(brief: Brief, provider: Provider): number {
  if (brief.special_items.length === 0) return 0;

  const briefItems = brief.special_items.map((i) => i.toLowerCase());
  const providerSpecialties = provider.specialties.map((s) => s.toLowerCase());

  const hasOverlap = briefItems.some((item) =>
    providerSpecialties.some(
      (spec) => spec.includes(item) || item.includes(spec.split(" ")[0])
    )
  );

  return hasOverlap ? 15 : 0;
}

export function scoreProvider(brief: Brief, provider: Provider): number {
  const geo = geographyScore(brief, provider) * 0.4;
  const service = serviceFitScore(brief, provider) * 0.3;
  const size = jobSizeFitScore(brief, provider) * 0.15;
  const availability = availabilityScore(provider) * 0.15;
  const bonus = specialtyBonus(brief, provider);

  return geo + service + size + availability + bonus;
}

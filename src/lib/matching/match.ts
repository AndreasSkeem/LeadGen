import type { Brief, Bid, Provider } from "@/lib/types";
import { providers } from "@/lib/data/providers";
import { scoreProvider } from "./score";

// ── Bid generation ────────────────────────────────────────────────────────────

function generateBid(brief: Brief, provider: Provider, score: number): Bid {
  const { min, max } = estimatePriceRange(brief);

  // Vary each provider's bid slightly so they don't all look identical
  const variation = 0.85 + Math.random() * 0.3; // 0.85 – 1.15
  const bidMin = Math.round((min * variation) / 500) * 500;
  const bidMax = Math.round((max * variation) / 500) * 500;

  // Estimate timeline
  const timelineDays = estimateTimeline(brief);

  const message = generateProviderMessage(brief, provider);

  return {
    provider,
    price_range_dkk: { min: bidMin, max: Math.max(bidMax, bidMin + 2000) },
    timeline_days: timelineDays,
    message,
    score,
  };
}

function estimatePriceRange(brief: Brief): { min: number; max: number } {
  const isSameCity =
    brief.origin.municipality === brief.destination.municipality;
  const isCrossCountry = brief.origin.country !== brief.destination.country;

  let base = { min: 5000, max: 12000 };

  switch (brief.move_type) {
    case "private": {
      const rooms = brief.origin.rooms_approx ?? 2;
      const cbm = brief.volume.estimated_cbm ?? rooms * 10;

      if (cbm < 20) {
        base = isSameCity ? { min: 2000, max: 5000 } : { min: 8000, max: 18000 };
      } else if (cbm < 50) {
        base = isSameCity ? { min: 5000, max: 12000 } : { min: 15000, max: 30000 };
      } else {
        base = isSameCity ? { min: 10000, max: 25000 } : { min: 20000, max: 45000 };
      }
      break;
    }
    case "office":
      base = { min: 15000, max: 60000 };
      break;
    case "heavy_items":
      base = { min: 1500, max: 8000 };
      break;
    case "international":
      base = isCrossCountry
        ? { min: 30000, max: 100000 }
        : { min: 20000, max: 60000 };
      break;
    case "storage":
      base = { min: 2000, max: 8000 };
      break;
  }

  // Floor surcharge — no elevator
  const floor = brief.origin.floor ?? 0;
  const noElevator = brief.origin.elevator === "no";
  if (noElevator && floor > 1) {
    const surcharge = (floor - 1) * 750;
    base.min += surcharge;
    base.max += surcharge;
  }

  return base;
}

function estimateTimeline(brief: Brief): number {
  // Days from contact to moving day — just an estimate
  if (brief.urgency === "asap") return 3;
  if (brief.urgency === "fixed_date") return 14;
  if (brief.urgency === "flexible_weeks") return 21;
  return 30;
}

function generateProviderMessage(brief: Brief, provider: Provider): string {
  const lang = brief.language;

  const templates: Record<string, string[]> = {
    da: [
      `Vi har stor erfaring med ${brief.move_type === "private" ? "privatflytninger" : brief.move_type === "office" ? "erhvervsflytninger" : "specialflytninger"} i ${brief.origin.municipality}-området og kan tilbyde en konkurrencedygtig løsning. Vores faste team sikrer en professionel og skånsom håndtering af alle jeres ejendele.`,
      `${provider.company_name} tilbyder fuld service fra start til slut. Vi lægger stor vægt på punktlighed og ordentlig kommunikation — I hører fra os samme dag.`,
      `Vi kender området godt og ved hvad der skal til. Kontakt os for en konkret og bindende pris baseret på jeres specifikke situation.`,
    ],
    sv: [
      `Vi har lång erfarenhet av ${brief.move_type === "office" ? "kontorsflytt" : "privatflytt"} i ${brief.origin.municipality} och kan erbjuda en konkurrenskraftig lösning anpassad för er situation.`,
      `${provider.company_name} garanterar ett professionellt utförande med erfarna medarbetare som känner till lokala förutsättningar väl.`,
    ],
    no: [
      `Vi har lang erfaring med ${brief.move_type === "heavy_items" ? "spesialtransport" : "flytteoppdrag"} i ${brief.origin.municipality}-området og kan tilby en skreddersydd løsning.`,
      `${provider.company_name} setter pris på å hjelpe deg — kontakt oss for et konkret tilbud basert på din situasjon.`,
    ],
    en: [
      `We have extensive experience with ${brief.move_type} moves in the ${brief.origin.municipality} area and can offer a competitive, tailored solution for your situation.`,
      `${provider.company_name} prides itself on professional, punctual service. Our experienced team will handle your belongings with care from start to finish.`,
    ],
  };

  const options = templates[lang] ?? templates["en"];
  return options[Math.floor(Math.random() * options.length)];
}

// ── Main matching function ────────────────────────────────────────────────────

export function matchProviders(brief: Brief, topN = 3): Bid[] {
  const scored = providers
    .filter((p) => p.available)
    .map((p) => ({ provider: p, score: scoreProvider(brief, p) }))
    .filter(({ score }) => score > 10) // discard irrelevant providers
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored.map(({ provider, score }) => generateBid(brief, provider, score));
}

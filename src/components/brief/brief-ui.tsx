"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  PiggyBank,
  Shield,
  Star,
} from "lucide-react";
import type { Brief, Offer, OfferActionType, OfferBudgetFit, OfferType } from "@/lib/types";
import { matchProviders } from "@/lib/matching/match";

export interface BriefApiResponse {
  brief: Brief;
  offers: Offer[];
  error?: string;
}

type MarketState = "reviewing" | "waiting_for_more" | "none_fit";

type CopyShape = {
  expired: string;
  startNew: string;
  yourBrief: string;
  fullDetails: string;
  matchedOffers: (count: number) => string;
  anonymous: string;
  noMatches: string;
  yourMove: string;
  editSomething: string;
  offerBoardTitle: string;
  instantEstimate: string;
  confirmedQuote: string;
  quoteOnRequest: string;
  estimateInclTax: string;
  afterRut: string;
  companyHighlights: string;
  nextStep: string;
  priceEstimate: string;
  availability: string;
  duration: string;
  saved: string;
  quoteRequested: string;
  noneFit: string;
  adjustDetails: string;
  waitForMore: string;
  waitingState: string;
  noneFitState: string;
  budgetPreference: string;
  hardMaxBudget: string;
  whyMatched: string;
  withinBudget: string;
  abovePreference: string;
  aboveHardMax: string;
  bestMatch: string;
  premium: string;
  standard: string;
  lean: string;
  requestSent: string;
  connectModalTitle: string;
  connectModalBody: string;
  connectConfirm: string;
  cancel: string;
  identityRevealed: string;
  connectionConfirmed: string;
  viewOffers: string;
  reviewDetails: string;
  origin: string;
  destination: string;
  location: string;
  property: string;
  floor: string;
  rooms: string;
  parking: string;
  moverDetails: string;
  phone: string;
  email: string;
};

export const COPY: Record<Brief["language"], CopyShape> = {
  da: {
    expired: "Denne brief er udløbet eller findes ikke. Briefs ligger kun i hukommelsen og ryddes, når serveren genstarter.",
    startNew: "Start en ny kvalificering",
    yourBrief: "Din brief",
    fullDetails: "Alle briefdetaljer",
    matchedOffers: (count) => `${count} matchende tilbud`,
    anonymous: "Tilbuddene vises anonymt, indtil du vælger at forbinde med et flyttefirma. Hurtige estimater er regelbaserede systemtilbud, ikke manuelle live-tilbud.",
    noMatches: "Ingen flyttefirmaer matcher din brief endnu. Juster detaljerne eller vent på flere tilbud.",
    yourMove: "Din flytning",
    editSomething: "Juster detaljer",
    offerBoardTitle: "Tilbud til din flytning",
    instantEstimate: "Hurtigt estimat",
    confirmedQuote: "Bekræftet tilbud",
    quoteOnRequest: "Tilbud på forespørgsel",
    estimateInclTax: "estimat, inkl. moms",
    afterRut: "efter RUT-fradrag",
    companyHighlights: "Om firmaet",
    nextStep: "Næste trin",
    priceEstimate: "Prisestimat",
    availability: "Tilgængelighed",
    duration: "Varighed",
    saved: "Gemt",
    quoteRequested: "Tilbud anmodet",
    noneFit: "Ingen passer",
    adjustDetails: "Juster detaljer",
    waitForMore: "Vent på flere tilbud",
    waitingState: "Du har valgt at vente på flere tilbud. Disse bliver stående som reference.",
    noneFitState: "Hvis ingen passer, kan du justere briefen eller vente på flere bekræftede tilbud.",
    budgetPreference: "Foretrukket budget",
    hardMaxBudget: "Maksbudget",
    whyMatched: "Hvorfor dette match",
    withinBudget: "Inden for budget",
    abovePreference: "Over ønsket budget",
    aboveHardMax: "Over maksbudget",
    bestMatch: "Bedste match",
    premium: "Premium",
    standard: "Anbefalet",
    lean: "Lean",
    requestSent: "Anmodning sendt",
    connectModalTitle: "Forbind med dette flyttefirma?",
    connectModalBody: "Dine kontaktoplysninger deles først efter bekræftelse. Derefter gennemgår flyttefirmaet briefen og kontakter dig direkte.",
    connectConfirm: "Bekræft forbindelse",
    cancel: "Annuller",
    identityRevealed: "Identitet vises efter bekræftelse",
    connectionConfirmed: "Forbindelse bekræftet",
    viewOffers: "Se tilbud",
    reviewDetails: "Gennemgå detaljer",
    origin: "Fra",
    destination: "Til",
    location: "Lokation",
    property: "Boligtype",
    floor: "Etage",
    rooms: "Værelser",
    parking: "Parkering",
    moverDetails: "Firmaoplysninger",
    phone: "Telefon",
    email: "Email",
  },
  sv: {
    expired: "Den här briefen har gått ut eller finns inte. Briefs lagras bara i minnet och rensas när servern startar om.",
    startNew: "Starta en ny kvalificering",
    yourBrief: "Din brief",
    fullDetails: "Alla briefdetaljer",
    matchedOffers: (count) => `${count} matchande erbjudanden`,
    anonymous: "Erbjudandena visas anonymt tills du väljer att gå vidare med ett flyttföretag. Snabba estimat är regelbaserade systemerbjudanden, inte manuella live-offerter.",
    noMatches: "Inga flyttfirmor matchar din brief än. Justera detaljerna eller vänta på fler erbjudanden.",
    yourMove: "Din flytt",
    editSomething: "Justera detaljer",
    offerBoardTitle: "Erbjudanden för din flytt",
    instantEstimate: "Snabbt estimat",
    confirmedQuote: "Bekräftad offert",
    quoteOnRequest: "Offert på begäran",
    estimateInclTax: "estimat, inkl. moms",
    afterRut: "efter RUT-avdrag",
    companyHighlights: "Om företaget",
    nextStep: "Nästa steg",
    priceEstimate: "Prisestimat",
    availability: "Tillgänglighet",
    duration: "Tidsåtgång",
    saved: "Sparad",
    quoteRequested: "Offert begärd",
    noneFit: "Ingen passar",
    adjustDetails: "Justera detaljer",
    waitForMore: "Vänta på fler offerter",
    waitingState: "Du har valt att vänta på fler erbjudanden. Dessa ligger kvar som referens.",
    noneFitState: "Om ingen passar kan du justera briefen eller vänta på fler bekräftade offerter.",
    budgetPreference: "Önskad budget",
    hardMaxBudget: "Maxbudget",
    whyMatched: "Varför detta matchar",
    withinBudget: "Inom budget",
    abovePreference: "Över önskad budget",
    aboveHardMax: "Över maxbudget",
    bestMatch: "Bästa match",
    premium: "Premium",
    standard: "Rekommenderad",
    lean: "Lean",
    requestSent: "Begäran skickad",
    connectModalTitle: "Gå vidare med det här flyttföretaget?",
    connectModalBody: "Dina kontaktuppgifter delas först efter bekräftelse. Därefter granskar flyttfirman briefen och kontaktar dig direkt.",
    connectConfirm: "Bekräfta kontakt",
    cancel: "Avbryt",
    identityRevealed: "Identiteten visas efter bekräftelse",
    connectionConfirmed: "Kontakten bekräftad",
    viewOffers: "Se erbjudanden",
    reviewDetails: "Granska detaljer",
    origin: "Från",
    destination: "Till",
    location: "Plats",
    property: "Bostadstyp",
    floor: "Våning",
    rooms: "Rum",
    parking: "Parkering",
    moverDetails: "Företagsuppgifter",
    phone: "Telefon",
    email: "E-post",
  },
  no: {
    expired: "Denne briefen har utløpt eller finnes ikke. Briefs lagres bare i minnet og ryddes når serveren starter på nytt.",
    startNew: "Start en ny kvalifisering",
    yourBrief: "Din brief",
    fullDetails: "Alle briefdetaljer",
    matchedOffers: (count) => `${count} matchende tilbud`,
    anonymous: "Tilbudene vises anonymt til du velger å gå videre med et flyttefirma. Raske estimater er regelbaserte systemtilbud, ikke manuelle live-tilbud.",
    noMatches: "Ingen flyttefirmaer matcher briefen din ennå. Juster detaljene eller vent på flere tilbud.",
    yourMove: "Flyttingen din",
    editSomething: "Juster detaljer",
    offerBoardTitle: "Tilbud for flyttingen din",
    instantEstimate: "Raskt estimat",
    confirmedQuote: "Bekreftet tilbud",
    quoteOnRequest: "Tilbud på forespørsel",
    estimateInclTax: "estimat, inkl. mva.",
    afterRut: "etter RUT-fradrag",
    companyHighlights: "Om firmaet",
    nextStep: "Neste steg",
    priceEstimate: "Prisestimat",
    availability: "Tilgjengelighet",
    duration: "Varighet",
    saved: "Lagret",
    quoteRequested: "Tilbud forespurt",
    noneFit: "Ingen passer",
    adjustDetails: "Juster detaljer",
    waitForMore: "Vent på flere tilbud",
    waitingState: "Du har valgt å vente på flere tilbud. Disse blir stående som referanse.",
    noneFitState: "Hvis ingen passer, kan du justere briefen eller vente på flere bekreftede tilbud.",
    budgetPreference: "Foretrukket budsjett",
    hardMaxBudget: "Maksbudsjett",
    whyMatched: "Hvorfor dette matcher",
    withinBudget: "Innenfor budsjett",
    abovePreference: "Over ønsket budsjett",
    aboveHardMax: "Over maksbudsjett",
    bestMatch: "Beste match",
    premium: "Premium",
    standard: "Anbefalt",
    lean: "Lean",
    requestSent: "Forespørsel sendt",
    connectModalTitle: "Gå videre med dette flyttefirmaet?",
    connectModalBody: "Kontaktinformasjonen din deles først etter bekreftelse. Deretter går flyttefirmaet gjennom briefen og kontakter deg direkte.",
    connectConfirm: "Bekreft forbindelse",
    cancel: "Avbryt",
    identityRevealed: "Identiteten vises etter bekreftelse",
    connectionConfirmed: "Forbindelse bekreftet",
    viewOffers: "Se tilbud",
    reviewDetails: "Se gjennom detaljer",
    origin: "Fra",
    destination: "Til",
    location: "Sted",
    property: "Boligtype",
    floor: "Etasje",
    rooms: "Rom",
    parking: "Parkering",
    moverDetails: "Firmadetaljer",
    phone: "Telefon",
    email: "E-post",
  },
  en: {
    expired: "This brief has expired or does not exist. Briefs are held in memory and cleared when the server restarts.",
    startNew: "Start a new qualification",
    yourBrief: "Your brief",
    fullDetails: "Full brief details",
    matchedOffers: (count) => `${count} matched offers`,
    anonymous: "Offers stay anonymous until you choose to connect. Instant estimates are rule-based system offers, not manual live quotes.",
    noMatches: "No movers matched your brief yet. Adjust the details or wait for more offers.",
    yourMove: "Your move",
    editSomething: "Adjust details",
    offerBoardTitle: "Offers for your move",
    instantEstimate: "Instant estimate",
    confirmedQuote: "Confirmed quote",
    quoteOnRequest: "Quote on request",
    estimateInclTax: "estimate, incl. tax",
    afterRut: "after RUT deduction",
    companyHighlights: "About the mover",
    nextStep: "Next step",
    priceEstimate: "Price estimate",
    availability: "Availability",
    duration: "Duration",
    saved: "Saved",
    quoteRequested: "Quote requested",
    noneFit: "None of these fit",
    adjustDetails: "Adjust details",
    waitForMore: "Wait for more quotes",
    waitingState: "You chose to wait for more quotes. These offers remain visible as a reference.",
    noneFitState: "If none of these feel right, adjust the brief or keep waiting for more confirmed quotes.",
    budgetPreference: "Preferred budget",
    hardMaxBudget: "Hard max budget",
    whyMatched: "Why this matched",
    withinBudget: "Within your budget",
    abovePreference: "Above preferred budget",
    aboveHardMax: "Above hard max",
    bestMatch: "Best match",
    premium: "Premium",
    standard: "Recommended",
    lean: "Lean",
    requestSent: "Request sent",
    connectModalTitle: "Connect with this mover?",
    connectModalBody: "Your contact details are only shared after confirmation. The mover then reviews your brief and reaches out directly.",
    connectConfirm: "Confirm connection",
    cancel: "Cancel",
    identityRevealed: "Identity revealed after confirmation",
    connectionConfirmed: "Connection confirmed",
    viewOffers: "View offers",
    reviewDetails: "Review details",
    origin: "Origin",
    destination: "Destination",
    location: "Location",
    property: "Property",
    floor: "Floor",
    rooms: "Rooms",
    parking: "Parking",
    moverDetails: "Mover details",
    phone: "Phone",
    email: "Email",
  },
};

const PROVIDER_CONTACTS: Record<string, { phone: string; email: string }> = {
  "flyttegaranti": { phone: "+45 33 22 11 00", email: "kontakt@flyttegaranti.dk" },
  "3mand-flytte": { phone: "+45 40 55 66 77", email: "info@3mandflytte.dk" },
  "stark-flytte": { phone: "+45 86 11 22 33", email: "info@starkflytte.dk" },
  "bahns-flytteforretning": { phone: "+45 66 12 34 56", email: "info@bahns.dk" },
  "nordisk-flyttecenter": { phone: "+45 35 36 37 38", email: "info@nordiskflyttecenter.dk" },
  "flytt-ab": { phone: "+46 8 123 456 78", email: "info@flyttab.se" },
  "goteborgs-flytt": { phone: "+46 31 456 789 0", email: "kontakt@goteborgsflytt.se" },
  "nordic-relocations": { phone: "+46 8 999 888 77", email: "info@nordicrelocations.se" },
  "majorstuaflytting": { phone: "+47 22 44 55 66", email: "post@majorstuaflytting.no" },
  "bergen-flyttebyra": { phone: "+47 55 30 40 50", email: "kontakt@bergenflyttebyraa.no" },
};

export async function loadBriefData(id: string): Promise<BriefApiResponse> {
  const response = await fetch(`/api/brief/${id}`);
  const data = (await response.json()) as BriefApiResponse;

  if (!response.ok || data.error) {
    const cachedBrief = window.sessionStorage.getItem(`brief:${id}`);
    if (cachedBrief) {
      const brief = JSON.parse(cachedBrief) as Brief;
      return { brief, offers: matchProviders(brief, 3) };
    }
    throw new Error(data.error ?? "Brief not found");
  }

  return data;
}

export function PageShell({ children, copy }: { children: React.ReactNode; copy: CopyShape }) {
  return (
    <div className="ui-readable min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            Findli
          </Link>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
            {copy.yourBrief}
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="rounded-[28px] border bg-white p-6 shadow-card-md animate-pulse" style={{ borderColor: "var(--border)" }}>
        <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: "var(--border-light)" }} />
        <div className="h-8 w-72 rounded mb-3" style={{ backgroundColor: "var(--border-light)" }} />
        <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: "var(--border-light)" }} />
        <div className="h-4 w-5/6 rounded" style={{ backgroundColor: "var(--border-light)" }} />
      </div>
    </div>
  );
}

export function MissingBriefState({ message, copy }: { message?: string; copy: CopyShape }) {
  return (
    <div className="max-w-xl mx-auto py-20 text-center px-6">
      <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
        {message === "Brief not found" ? copy.expired : message ?? copy.expired}
      </p>
      <Link href="/qualify" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
        {copy.startNew}
      </Link>
    </div>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Brief["qualification_confidence"] }) {
  const styles = {
    high: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    medium: { bg: "var(--accent-light)", text: "var(--accent)", border: "var(--accent)" },
    low: { bg: "#fff5f5", text: "#dc2626", border: "#fecaca" },
  };
  const tone = styles[confidence];
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full border font-medium"
      style={{ backgroundColor: tone.bg, color: tone.text, borderColor: tone.border }}
    >
      {confidence}
    </span>
  );
}

export function BriefSummaryCard({ brief, copy }: { brief: Brief; copy: CopyShape }) {
  return (
    <div className="rounded-[28px] bg-white shadow-card-md border p-6 md:p-7" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
            {copy.yourMove}
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill icon={<MapPin className="w-3.5 h-3.5" />}>
              {brief.origin.municipality} → {brief.destination.municipality}
            </Pill>
            <Pill icon={<CalendarDays className="w-3.5 h-3.5" />}>
              {brief.move_date_approx ?? cap(brief.urgency.replace("_", " "))}
            </Pill>
            <Pill icon={<Clock className="w-3.5 h-3.5" />}>{brief.volume.description}</Pill>
          </div>
        </div>
        <Link href="/qualify" className="text-sm font-medium hover:underline" style={{ color: "var(--text-muted)" }}>
          {copy.editSomething}
        </Link>
      </div>
    </div>
  );
}

export function BudgetPanel({ brief, copy }: { brief: Brief; copy: CopyShape }) {
  if (brief.bid_preferences.preferredBudget === null && brief.bid_preferences.hardMaxBudget === null) return null;

  return (
    <div className="rounded-[28px] border bg-white p-6 shadow-card-md" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <PiggyBank className="w-4 h-4" style={{ color: "var(--accent)" }} />
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
          {copy.budgetPreference}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BudgetStat label={copy.budgetPreference} value={formatBudget(brief.bid_preferences.preferredBudget)} />
        <BudgetStat label={copy.hardMaxBudget} value={formatBudget(brief.bid_preferences.hardMaxBudget)} />
      </div>
    </div>
  );
}

export function BriefDetailsSection({ brief, copy }: { brief: Brief; copy: CopyShape }) {
  return (
    <details className="group">
      <summary className="flex items-center gap-2 cursor-pointer select-none list-none w-fit" style={{ color: "var(--text-muted)" }}>
        <span className="text-xs font-semibold uppercase tracking-[0.1em]">{copy.fullDetails}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailCard title={copy.origin}>
          <DetailRow label={copy.location} value={formatLocation(brief.origin.address, brief.origin.municipality, brief.origin.country)} />
          <DetailRow label={copy.property} value={cap(brief.origin.property_type)} />
          <DetailRow label={copy.floor} value={formatFloor(brief.origin.floor, brief.origin.elevator, brief.language)} />
          <DetailRow label={copy.rooms} value={brief.origin.rooms_approx ? String(brief.origin.rooms_approx) : "—"} />
          <DetailRow label={copy.parking} value={formatParking(brief.origin.parking_access, brief.origin.parking_distance_meters)} />
        </DetailCard>
        <DetailCard title={copy.destination}>
          <DetailRow label={copy.location} value={formatLocation(brief.destination.address, brief.destination.municipality, brief.destination.country)} />
          <DetailRow label={copy.property} value={cap(brief.destination.property_type)} />
          <DetailRow label={copy.floor} value={formatFloor(brief.destination.floor, brief.destination.elevator, brief.language)} />
          <DetailRow label={copy.rooms} value="—" />
          <DetailRow label={copy.parking} value={formatParking(brief.destination.parking_access, brief.destination.parking_distance_meters)} />
        </DetailCard>
      </div>
    </details>
  );
}

export function OffersBoard({ offers, copy, language }: { offers: Offer[]; copy: CopyShape; language: Brief["language"] }) {
  const [connectedOfferId, setConnectedOfferId] = useState<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState<Offer | null>(null);
  const [confirmedOffer, setConfirmedOffer] = useState<Offer | null>(null);
  const [savedOffers, setSavedOffers] = useState<Record<string, boolean>>({});
  const [requestedQuotes, setRequestedQuotes] = useState<Record<string, boolean>>({});
  const [dismissedOffers, setDismissedOffers] = useState<Record<string, boolean>>({});
  const [marketState, setMarketState] = useState<MarketState>("reviewing");

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border bg-white p-6 shadow-card-md" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--accent)" }}>
              {copy.offerBoardTitle}
            </p>
            <h2 className="font-display text-2xl md:text-3xl mb-2" style={{ color: "var(--text-strong)" }}>
              {copy.matchedOffers(offers.length)}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {copy.anonymous}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionChip active={marketState === "none_fit"} onClick={() => setMarketState("none_fit")}>
              {copy.noneFit}
            </ActionChip>
            <Link
              href="/qualify"
              className="text-xs font-semibold rounded-full border px-3 py-2"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {copy.adjustDetails}
            </Link>
            <ActionChip active={marketState === "waiting_for_more"} onClick={() => setMarketState("waiting_for_more")}>
              {copy.waitForMore}
            </ActionChip>
          </div>
        </div>
        {marketState !== "reviewing" && (
          <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
            {marketState === "waiting_for_more" ? copy.waitingState : copy.noneFitState}
          </div>
        )}
      </div>

      {offers.length === 0 ? (
        <div className="rounded-[28px] border bg-white p-8 text-center shadow-card-md" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{copy.noMatches}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          {offers.map((offer, index) => {
            const offerId = offer.provider.id;

            return (
              <OfferCard
                key={offerId}
                offer={offer}
                language={language}
                rank={index + 1}
                dismissed={Boolean(dismissedOffers[offerId])}
                saved={Boolean(savedOffers[offerId])}
                requested={Boolean(requestedQuotes[offerId])}
                connected={connectedOfferId === offerId}
                dimmed={Boolean(connectedOfferId && connectedOfferId !== offerId)}
                copy={copy}
                onAction={(action) => {
                  if (action === "connect_with_mover") {
                    setPendingConnect(offer);
                    return;
                  }
                  if (action === "request_confirmed_quote") {
                    setRequestedQuotes((current) => ({ ...current, [offerId]: true }));
                    return;
                  }
                  if (action === "save_for_comparison") {
                    setSavedOffers((current) => ({ ...current, [offerId]: !current[offerId] }));
                    return;
                  }
                  setDismissedOffers((current) => ({ ...current, [offerId]: true }));
                }}
              />
            );
          })}
        </div>
      )}

      {pendingConnect && (
        <ConnectionModal
          offer={pendingConnect}
          copy={copy}
          onCancel={() => setPendingConnect(null)}
          onConfirm={() => {
            setConnectedOfferId(pendingConnect.provider.id);
            setConfirmedOffer(pendingConnect);
            setPendingConnect(null);
          }}
        />
      )}

      {confirmedOffer && <ConnectedOfferModal offer={confirmedOffer} copy={copy} onClose={() => setConfirmedOffer(null)} />}
    </section>
  );
}

function OfferCard({
  offer,
  language,
  rank,
  dismissed,
  saved,
  requested,
  connected,
  dimmed,
  copy,
  onAction,
}: {
  offer: Offer;
  language: Brief["language"];
  rank: number;
  dismissed: boolean;
  saved: boolean;
  requested: boolean;
  connected: boolean;
  dimmed: boolean;
  copy: CopyShape;
  onAction: (action: OfferActionType) => void;
}) {
  const topBadge = rank === 1 ? copy.bestMatch : offer.offer_presentation === "premium" ? copy.premium : offer.offer_presentation === "standard" ? copy.standard : copy.lean;

  return (
    <article
      className={`rounded-[28px] border bg-white p-5 shadow-card-md flex flex-col transition-all duration-200 option-lift ${dismissed ? "opacity-55" : ""} ${dimmed ? "opacity-50" : ""}`}
      style={{ borderColor: connected ? "#bbf7d0" : "var(--border)" }}
    >
      <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <OfferTypeBadge type={offer.offer_type} copy={copy} />
            <MiniBadge>{topBadge}</MiniBadge>
            {budgetFitLabel(offer.budget_fit, copy) && (
              <MiniBadge tone={offer.budget_fit === "above_hard_max" ? "danger" : "neutral"}>
                {budgetFitLabel(offer.budget_fit, copy)}
              </MiniBadge>
            )}
          </div>
          <p
            className="text-sm leading-relaxed overflow-hidden"
            style={{ color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
          >
            {offer.message}
          </p>
        </div>
        <div className="w-fit min-w-[8.75rem] max-w-full overflow-hidden md:justify-self-end md:text-right">
          <div className="text-xl md:text-2xl font-display leading-tight tabular-nums" style={{ color: "var(--text-strong)" }}>
            <PriceRangeDisplay min={offer.price_range.min} max={offer.price_range.max} currency={offer.currency} />
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{copy.estimateInclTax}</div>
          {offer.price_range_after_rut && (
            <div className="text-xs mt-1" style={{ color: "var(--success)" }}>
              <PriceRangeDisplay min={offer.price_range_after_rut.min} max={offer.price_range_after_rut.max} currency={offer.currency} inline /> {copy.afterRut}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <OfferStat icon={<CalendarDays className="w-4 h-4" />} label={copy.availability} value={offer.available_date} />
        <OfferStat icon={<Clock className="w-4 h-4" />} label={copy.duration} value={offer.estimated_hours} />
      </div>

      {offer.match_reasons.length > 0 && (
        <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--text-muted)" }}>{copy.whyMatched}</p>
          <div className="flex flex-wrap gap-2">
            {offer.match_reasons.map((reason) => (
              <MiniBadge key={reason}>{reason}</MiniBadge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--text-muted)" }}>{copy.companyHighlights}</p>
        <ul className="space-y-2">
          {buildCompanyHighlights(offer, language).map((item) => (
            <li key={item} className="text-sm flex gap-2" style={{ color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-muted)" }}>{copy.nextStep}</p>
        <p
          className="text-sm overflow-hidden"
          style={{ color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {requested ? copy.requestSent : offer.next_step}
        </p>
      </div>

      <div className="space-y-2">
        {offer.customer_actions.map((action) => {
          const disabled = connected || (action.type === "request_confirmed_quote" && requested);
          const label = action.type === "save_for_comparison" && saved ? copy.saved : action.type === "request_confirmed_quote" && requested ? copy.quoteRequested : action.label;

          return (
            <button
              key={action.type}
              onClick={() => onAction(action.type)}
              disabled={disabled}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all btn-press option-lift ${action.primary ? "text-white hover:opacity-90" : "border hover:border-gray-400"} disabled:opacity-50`}
              style={action.primary ? { backgroundColor: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--text-strong)" }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function ConnectionConfirmation({ offer, copy }: { offer: Offer; copy: CopyShape }) {
  const contact = PROVIDER_CONTACTS[offer.provider.id] ?? { phone: "+45 00 00 00 00", email: `info@${offer.provider.id}.com` };

  return (
    <section className="rounded-[32px] border bg-white p-6 md:p-10 shadow-card-lg scale-in text-center" style={{ borderColor: "#bbf7d0" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 check-draw" style={{ backgroundColor: "#dcfce7" }}>
        <Check className="w-8 h-8" style={{ color: "var(--success)" }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--success)" }}>{copy.connectionConfirmed}</p>
      <h2 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "var(--text-strong)" }}>{offer.provider.company_name}</h2>
      <p className="text-base max-w-2xl mx-auto mb-8" style={{ color: "var(--text)" }}>
        {offerTypeLabel(offer.offer_type, copy)}. {offer.next_step}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>{copy.moverDetails}</p>
          <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-strong)" }}>{offer.provider.company_name}</p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {offer.provider.municipality}, {offer.provider.country} | {offer.provider.years_in_business}y | rating {offer.provider.rating}
          </p>
          <div className="space-y-2">
            <ContactRow icon={<Phone className="w-4 h-4" />} label={copy.phone} value={contact.phone} />
            <ContactRow icon={<Mail className="w-4 h-4" />} label={copy.email} value={contact.email} />
          </div>
        </div>
        <div className="rounded-2xl border p-5" style={{ borderColor: "#bbf7d0", backgroundColor: "var(--success-soft)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--success)" }}>{offerTypeLabel(offer.offer_type, copy)}</p>
          <ConnectedStat label={copy.priceEstimate} value={formatPriceRange(offer.price_range.min, offer.price_range.max, offer.currency)} />
          <ConnectedStat label={copy.duration} value={offer.estimated_hours} />
          <ConnectedStat label={copy.availability} value={offer.available_date} />
        </div>
      </div>
    </section>
  );
}

function ConnectionModal({ offer, copy, onConfirm, onCancel }: { offer: Offer; copy: CopyShape; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ backgroundColor: "rgba(15,22,41,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-modal scale-in overflow-hidden">
        <div className="px-6 pt-7 pb-5 border-b" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-strong)" }}>{offerTypeLabel(offer.offer_type, copy)}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{copy.identityRevealed}</p>
            </div>
          </div>
          <h2 className="font-display text-xl" style={{ color: "var(--text-strong)" }}>{copy.connectModalTitle}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{copy.connectModalBody}</p>
        </div>
        <div className="px-6 py-5">
          <div className="rounded-2xl p-4 space-y-2.5 border" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
            <ContactRow icon={<Star className="w-4 h-4" />} label={copy.priceEstimate} value={formatPriceRange(offer.price_range.min, offer.price_range.max, offer.currency)} />
            <ContactRow icon={<Clock className="w-4 h-4" />} label={copy.duration} value={offer.estimated_hours} />
            <ContactRow icon={<CalendarDays className="w-4 h-4" />} label={copy.availability} value={offer.available_date} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onConfirm} className="flex-1 font-semibold text-sm py-3.5 rounded-2xl text-white transition-all btn-press hover:opacity-90" style={{ backgroundColor: "var(--primary)" }}>
            {copy.connectConfirm}
          </button>
          <button onClick={onCancel} className="px-5 py-3.5 text-sm font-medium rounded-2xl border transition-all hover:border-gray-400" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            {copy.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectedOfferModal({ offer, copy, onClose }: { offer: Offer; copy: CopyShape; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ backgroundColor: "rgba(15,22,41,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-3xl">
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-2xl border bg-white" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            {copy.cancel}
          </button>
        </div>
        <ConnectionConfirmation offer={offer} copy={copy} />
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 min-w-0">
      <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="min-w-0 break-words text-sm font-medium text-right" style={{ color: "var(--text-strong)" }}>{value}</span>
    </div>
  );
}

function OfferTypeBadge({ type, copy }: { type: OfferType; copy: CopyShape }) {
  const styles: Record<OfferType, { bg: string; text: string; border: string; label: string }> = {
    instant_estimate: { bg: "var(--accent-light)", text: "var(--accent)", border: "var(--accent)", label: copy.instantEstimate },
    confirmed_quote: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", label: copy.confirmedQuote },
    quote_on_request: { bg: "#fff7ed", text: "#c2410c", border: "#fdba74", label: copy.quoteOnRequest },
  };
  const tone = styles[type];

  return (
    <span className="text-xs px-2.5 py-1 rounded-full border font-medium" style={{ backgroundColor: tone.bg, color: tone.text, borderColor: tone.border }}>
      {tone.label}
    </span>
  );
}

function MiniBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "danger" }) {
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full border font-medium"
      style={tone === "danger" ? { backgroundColor: "#fff5f5", color: "#dc2626", borderColor: "#fecaca" } : { backgroundColor: "var(--bg)", color: "var(--text-muted)", borderColor: "var(--border)" }}
    >
      {children}
    </span>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg)" }}>
      {icon}
      {children}
    </span>
  );
}

function OfferStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3 min-w-0" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-1" style={{ color: "var(--text-muted)" }}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold break-words" style={{ color: "var(--text-strong)" }}>{value}</p>
    </div>
  );
}

function BudgetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-base font-semibold" style={{ color: "var(--text-strong)" }}>{value}</p>
    </div>
  );
}

function ActionChip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold rounded-full border px-3 py-2 transition-all duration-200 option-lift"
      style={active ? { borderColor: "var(--accent)", color: "var(--accent)", backgroundColor: "var(--accent-light)" } : { borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      {children}
    </button>
  );
}

function ConnectedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 min-w-0">
      <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-sm font-semibold break-words" style={{ color: "var(--text-strong)" }}>{value}</p>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 min-w-0">
      <div className="flex items-center gap-2 shrink-0" style={{ color: "var(--text-muted)" }}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="min-w-0 max-w-[14rem] break-words text-sm font-medium text-right" style={{ color: "var(--text-strong)" }}>{value}</span>
    </div>
  );
}

function PriceRangeDisplay({
  min,
  max,
  currency,
  inline = false,
}: {
  min: number;
  max: number;
  currency?: string;
  inline?: boolean;
}) {
  const minLabel = min.toLocaleString("da-DK");
  const maxLabel = max.toLocaleString("da-DK");

  if (inline) {
    return <span>{`${minLabel} - ${maxLabel}${currency ? ` ${currency}` : ""}`}</span>;
  }

  return (
    <span className="inline-flex w-full max-w-full flex-col items-end overflow-hidden text-right leading-tight">
      <span className="block w-full whitespace-nowrap">{`${minLabel} -`}</span>
      <span className="block w-full whitespace-nowrap">{maxLabel}</span>
      {currency ? <span className="block w-full whitespace-nowrap text-base">{currency}</span> : null}
    </span>
  );
}

function formatPriceRange(min: number, max: number, currency?: string): string {
  const formatted = min === max ? min.toLocaleString("da-DK") : `${min.toLocaleString("da-DK")} - ${max.toLocaleString("da-DK")}`;
  return currency ? `${formatted} ${currency}` : formatted;
}

function offerTypeLabel(type: OfferType, copy: CopyShape): string {
  if (type === "confirmed_quote") return copy.confirmedQuote;
  if (type === "quote_on_request") return copy.quoteOnRequest;
  return copy.instantEstimate;
}

function budgetFitLabel(fit: OfferBudgetFit, copy: CopyShape): string | null {
  if (fit === "within_preference") return copy.withinBudget;
  if (fit === "above_preference") return copy.abovePreference;
  if (fit === "above_hard_max") return copy.aboveHardMax;
  return null;
}

function buildCompanyHighlights(offer: Offer, language: Brief["language"]): string[] {
  const yearsLabel =
    language === "sv"
      ? "års erfarenhet"
      : language === "da" || language === "no"
        ? "års erfaring"
        : "years of experience";
  return [
    `${offer.provider.years_in_business}+ ${yearsLabel}`,
    `Rating ${offer.provider.rating.toFixed(1)}`,
    ...offer.provider.specialties.slice(0, 2).map((item) => localizeSpecialty(item, language)),
  ].slice(0, 4);
}

function localizeSpecialty(item: string, language: Brief["language"]): string {
  const normalized = item.toLowerCase();
  const labels: Record<string, Record<Brief["language"], string>> = {
    "piano moving": { da: "Klaverflytning", sv: "Pianoflytt", no: "Pianoflytting", en: "Piano moving" },
    "grand piano": { da: "Flygel", sv: "Flygel", no: "Flygel", en: "Grand piano" },
    "heavy items": { da: "Tunge genstande", sv: "Tunga föremål", no: "Tunge gjenstander", en: "Heavy items" },
    "oslo apartments": { da: "Lejligheder i Oslo", sv: "Lägenheter i Oslo", no: "Leiligheter i Oslo", en: "Oslo apartments" },
    "crane hire": { da: "Kranservice", sv: "Krantjänster", no: "Krantjenester", en: "Crane hire" },
    "safe handling": { da: "Pengeskabe", sv: "Kassaskåp", no: "Safe", en: "Safe handling" },
    "fridge moving": { da: "Køleskabe", sv: "Kylskåp", no: "Kjøleskap", en: "Fridge moving" },
    "art handling": { da: "Stor kunst", sv: "Konsthantering", no: "Kunsthåndtering", en: "Art handling" },
    "storage coordination": { da: "Opbevaringskoordinering", sv: "Förvaringskoordinering", no: "Lagringskoordinering", en: "Storage coordination" },
  };

  return labels[normalized]?.[language] ?? cap(item);
}

function formatBudget(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("da-DK");
}

function formatFloor(floor: number | null, elevator: Brief["origin"]["elevator"], language: Brief["language"]): string {
  if (floor === null) return "—";
  if (elevator === "yes") return `${floor} | ${language === "da" ? "elevator" : language === "sv" ? "hiss" : language === "no" ? "heis" : "lift"}`;
  if (elevator === "no") return `${floor} | ${language === "da" ? "ingen elevator" : language === "sv" ? "ingen hiss" : language === "no" ? "ingen heis" : "no lift"}`;
  return String(floor);
}

function formatLocation(address: string | null, municipality: string, country: Brief["origin"]["country"]): string {
  return address ? `${address}, ${municipality}, ${country}` : `${municipality}, ${country}`;
}

function formatParking(access: Brief["origin"]["parking_access"], distance: number | null): string {
  const accessLabel = cap(access.replace("_", " "));
  if (distance === null) return accessLabel;
  return `${accessLabel} | ${distance} m`;
}

export function moveTypeLabel(type: Brief["move_type"], lang: Brief["language"]): string {
  const labels: Record<Brief["language"], Record<Brief["move_type"], string>> = {
    da: {
      private: "Privatflytning",
      office: "Kontor- / erhvervsflytning",
      heavy_items: "Transport af tunge genstande",
      international: "International flytning",
      storage: "Opbevaring",
    },
    sv: {
      private: "Privatflytt",
      office: "Kontors- / företagsflytt",
      heavy_items: "Transport av tunga föremål",
      international: "Internationell flytt",
      storage: "Förvaring",
    },
    no: {
      private: "Privatflytting",
      office: "Kontor- / bedriftsflytting",
      heavy_items: "Transport av tunge gjenstander",
      international: "Internasjonal flytting",
      storage: "Lagring",
    },
    en: {
      private: "Private home move",
      office: "Office / business move",
      heavy_items: "Heavy item transport",
      international: "International move",
      storage: "Storage",
    },
  };

  return labels[lang][type] ?? type;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

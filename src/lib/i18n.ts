import type { PreferredLanguage } from "@/lib/types";

export const DEFAULT_LANGUAGE: PreferredLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "findli.language";

export const LANGUAGE_OPTIONS: Array<{ value: PreferredLanguage; label: Record<PreferredLanguage, string> }> = [
  { value: "da", label: { da: "Dansk", sv: "Dansk", no: "Dansk", en: "Dansk" } },
  { value: "sv", label: { da: "Svenska", sv: "Svenska", no: "Svenska", en: "Svenska" } },
  { value: "no", label: { da: "Norsk", sv: "Norsk", no: "Norsk", en: "Norsk" } },
  { value: "en", label: { da: "English", sv: "English", no: "English", en: "English" } },
];

export function detectBrowserLanguage(): PreferredLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const locale = window.navigator.language.toLowerCase();
  if (locale.startsWith("da")) return "da";
  if (locale.startsWith("sv")) return "sv";
  if (locale.startsWith("nb") || locale.startsWith("nn") || locale.startsWith("no")) return "no";
  return "en";
}

export function languageLabel(language: PreferredLanguage, uiLanguage: PreferredLanguage): string {
  return LANGUAGE_OPTIONS.find((option) => option.value === language)?.label[uiLanguage] ?? language;
}

export const UI_COPY = {
  en: {
    common: { yes: "Yes", no: "No", optional: "Optional" },
    demo: { label: "Demo mode", body: "Simulated data. No real providers or payments.", dismiss: "Dismiss" },
    landing: {
      providerLink: "For moving companies",
      languageEyebrow: "Choose language first",
      heroTitle: "Plan your move with a guided intake that stays clear from start to quote.",
      heroBody:
        "Choose your language, answer a short structured intake, and compare matched movers through anonymous offers and quote requests.",
      primaryCta: "Start guide",
      helperCta: "Takes about 3 minutes. No account needed.",
      trustItems: ["Anonymous offers", "No spam calls", "Free for homeowners"],
      sampleRequest: "Sample request",
      sampleRoute: "Copenhagen to Aarhus",
      sampleTag: "Family move",
      sampleFacts: [
        ["Home", "3-room apartment"],
        ["Access", "2nd floor, no lift"],
        ["Date", "Flexible next month"],
        ["Extras", "Packing and storage"],
      ],
      whatHappensNext: "What happens next",
      workflowCards: [
        { title: "Guide", body: "You answer only the details movers actually need for pricing, access, and feasibility." },
        { title: "Structured brief", body: "Your move is turned into a clear anonymous brief before providers see it." },
        { title: "Offer review", body: "You compare instant estimates, confirmed quotes, and quote requests before deciding who to contact." },
      ],
      howItWorks: "How it works",
      steps: [
        { title: "Describe the move", body: "Share route, timing, access, size, and any special handling needs through a short structured flow." },
        { title: "Receive matched offers", body: "Matched movers review the brief and respond with instant estimates, confirmed quotes, or quote-on-request status." },
        { title: "Choose who to contact", body: "Review the offers, compare tradeoffs, and connect only when you are ready." },
      ],
      moveTypesEyebrow: "All move types",
      moveTypes: ["Private homes", "Office moves", "Heavy items", "International", "Storage"],
      regionalTitle: "Local expertise, Scandinavian scale.",
      regionalBody:
        "Providers who know narrow Copenhagen streets, Oslo hills, and Stockholm staircases. The guided flow stays available in Danish, Swedish, Norwegian, and English.",
      countries: ["Denmark", "Sweden", "Norway"],
      finalTitle: "Ready when you are.",
      finalBody: "Takes about 3 minutes. No account. No spam.",
      footer: "Mock POC · 2026",
    },
    intake: {
      badge: "Guide",
      asideEyebrow: "Structured, calm, bid-ready",
      asideTitle: "Plan your move in five guided steps.",
      asideBody: "Every answer maps to pricing, matching, or feasibility without turning the experience into a long form.",
      changeLanguage: "Language",
      back: "Back",
      continue: "Continue",
      prepareOffers: "Prepare offers",
      footerHelper: "One clear step at a time.",
      steps: [
        { eyebrow: "Step 1", title: "Language, route, and timing", helper: "Start by setting the site language, then add the route and timing details." },
        { eyebrow: "Step 2", title: "Property and access", helper: "Only the access details that change pricing and feasibility." },
        { eyebrow: "Step 3", title: "Move size", helper: "Choose a quick size bucket first, then add detail where it helps." },
        { eyebrow: "Step 4", title: "Special items and add-ons", helper: "Group the exceptions, handling needs, and extra services in one clean overview." },
        { eyebrow: "Step 5", title: "Contact and offer preferences", helper: "Finish with contact details and how the marketplace should handle offers." },
      ],
      errors: {
        completeStep: "Complete this step first so the brief stays bid-ready.",
        completeContact: "Complete the missing contact or offer details first.",
        submitFailed: "Unable to prepare your move brief",
      },
      matching: {
        eyebrow: "Matching offers",
        title: "We are preparing your brief and ranking the best-fit movers.",
        body: "This mock flow uses route coverage, access difficulty, instant pricing rules, and budget fit to simulate a real marketplace.",
        stages: ["Reviewing move details", "Checking service areas", "Applying pricing rules", "Comparing fit and availability", "Preparing your matches"],
      },
    },
  },
  da: {
    common: { yes: "Ja", no: "Nej", optional: "Valgfrit" },
    demo: { label: "Demo-tilstand", body: "Simulerede data. Ingen rigtige flyttefirmaer eller betalinger.", dismiss: "Luk" },
    landing: {
      providerLink: "For flyttefirmaer",
      languageEyebrow: "Vælg sprog først",
      heroTitle: "Planlæg din flytning med et guidet forløb, der er klart fra start til tilbud.",
      heroBody:
        "Vælg dit sprog, svar på en kort struktureret intake, og sammenlign matchede flyttefirmaer via anonyme tilbud og tilbudsforespørgsler.",
      primaryCta: "Start guide",
      helperCta: "Tager cirka 3 minutter. Ingen konto nødvendig.",
      trustItems: ["Anonyme tilbud", "Ingen spamopkald", "Gratis for private"],
      sampleRequest: "Eksempel på forespørgsel",
      sampleRoute: "København til Aarhus",
      sampleTag: "Familieflytning",
      sampleFacts: [
        ["Bolig", "3-værelses lejlighed"],
        ["Adgang", "2. sal uden elevator"],
        ["Dato", "Fleksibel næste måned"],
        ["Ekstra", "Nedpakning og opbevaring"],
      ],
      whatHappensNext: "Det sker der næste",
      workflowCards: [
        { title: "Guide", body: "Du svarer kun på de oplysninger flyttefirmaer faktisk bruger til pris, adgang og gennemførlighed." },
        { title: "Struktureret brief", body: "Din flytning bliver gjort til en klar anonym brief, før firmaerne ser den." },
        { title: "Tilbudsoverblik", body: "Du sammenligner hurtige estimater, bekræftede tilbud og tilbud på forespørgsel, før du vælger kontakt." },
      ],
      howItWorks: "Sådan virker det",
      steps: [
        { title: "Beskriv flytningen", body: "Del rute, timing, adgang, størrelse og særlige behov i et kort struktureret forløb." },
        { title: "Modtag matchede tilbud", body: "Matchede flyttefirmaer vurderer briefen og svarer med hurtige estimater, bekræftede tilbud eller tilbud på forespørgsel." },
        { title: "Vælg hvem du vil kontakte", body: "Gennemgå tilbuddene, sammenlign forskelle, og forbind kun når du er klar." },
      ],
      moveTypesEyebrow: "Alle flyttetyper",
      moveTypes: ["Privatflytning", "Kontorflytning", "Tunge genstande", "International", "Opbevaring"],
      regionalTitle: "Lokal indsigt, skandinavisk rækkevidde.",
      regionalBody:
        "Flyttefirmaer der kender smalle Københavnergader, Oslos bakker og Stockholms trapper. Det guidede forløb fungerer på dansk, svensk, norsk og engelsk.",
      countries: ["Danmark", "Sverige", "Norge"],
      finalTitle: "Klar når du er.",
      finalBody: "Tager cirka 3 minutter. Ingen konto. Ingen spam.",
      footer: "Mock POC · 2026",
    },
    intake: {
      badge: "Guide",
      asideEyebrow: "Struktureret, roligt, tilbudsklart",
      asideTitle: "Planlæg din flytning i fem guidede trin.",
      asideBody: "Hvert svar bruges til pris, match eller gennemførlighed uden at oplevelsen bliver til en lang formular.",
      changeLanguage: "Sprog",
      back: "Tilbage",
      continue: "Fortsæt",
      prepareOffers: "Forbered tilbud",
      footerHelper: "Et tydeligt trin ad gangen.",
      steps: [
        { eyebrow: "Trin 1", title: "Sprog, rute og tidspunkt", helper: "Start med at sætte sproget for siden, og tilføj derefter rute og tidspunkt." },
        { eyebrow: "Trin 2", title: "Bolig og adgang", helper: "Kun de adgangsoplysninger der ændrer pris og gennemførlighed." },
        { eyebrow: "Trin 3", title: "Flyttens størrelse", helper: "Vælg først en hurtig størrelseskategori, og tilføj detaljer hvor det hjælper." },
        { eyebrow: "Trin 4", title: "Særlige genstande og tilvalg", helper: "Saml undtagelser, håndteringsbehov og ekstra services i et rent overblik." },
        { eyebrow: "Trin 5", title: "Kontakt og tilbudsønsker", helper: "Afslut med kontaktoplysninger og hvordan markedspladsen skal håndtere tilbud." },
      ],
      errors: {
        completeStep: "Fuldfør dette trin først, så briefen forbliver tilbudsklar.",
        completeContact: "Udfyld de manglende kontakt- eller tilbudsdetaljer først.",
        submitFailed: "Kunne ikke forberede din flyttebrief",
      },
      matching: {
        eyebrow: "Matcher tilbud",
        title: "Vi forbereder din brief og rangerer de bedst egnede flyttefirmaer.",
        body: "Dette mock-forløb bruger rutedækning, adgangssværhedsgrad, prisregler og budgetmatch til at simulere en reel markedsplads.",
        stages: ["Gennemgår flyttedetaljer", "Tjekker serviceområder", "Anvender prisregler", "Sammenligner match og kapacitet", "Klargør dine matches"],
      },
    },
  },
  sv: {
    common: { yes: "Ja", no: "Nej", optional: "Valfritt" },
    demo: { label: "Demoläge", body: "Simulerad data. Inga riktiga flyttfirmor eller betalningar.", dismiss: "Stäng" },
    landing: {
      providerLink: "För flyttföretag",
      languageEyebrow: "Välj språk först",
      heroTitle: "Planera din flytt med ett guidat flöde som håller ihop från start till offert.",
      heroBody:
        "Välj språk, svara på en kort strukturerad intake och jämför matchade flyttfirmor via anonyma erbjudanden och offertförfrågningar.",
      primaryCta: "Starta guidat flöde",
      helperCta: "Tar cirka 3 minuter. Inget konto behövs.",
      trustItems: ["Anonyma erbjudanden", "Inga spam-samtal", "Gratis för privatpersoner"],
      sampleRequest: "Exempel på förfrågan",
      sampleRoute: "Köpenhamn till Aarhus",
      sampleTag: "Familjeflytt",
      sampleFacts: [["Bostad", "3-rumslägenhet"], ["Åtkomst", "2 tr utan hiss"], ["Datum", "Flexibel nästa månad"], ["Extra", "Packning och förvaring"]],
      whatHappensNext: "Detta händer sen",
      workflowCards: [
        { title: "Guide", body: "Du svarar bara på det flyttfirmor faktiskt behöver för pris, åtkomst och genomförbarhet." },
        { title: "Strukturerad brief", body: "Din flytt blir en tydlig anonym brief innan företag ser den." },
        { title: "Erbjudandeöversikt", body: "Du jämför snabba estimat, bekräftade offerter och offert på begäran innan du väljer kontakt." },
      ],
      howItWorks: "Så fungerar det",
      steps: [
        { title: "Beskriv flytten", body: "Dela rutt, timing, åtkomst, storlek och särskilda behov i ett kort strukturerat flöde." },
        { title: "Få matchade erbjudanden", body: "Matchade flyttfirmor bedömer briefen och svarar med snabba estimat, bekräftade offerter eller offert på begäran." },
        { title: "Välj vem du vill kontakta", body: "Granska erbjudandena, jämför skillnader och gå vidare först när du är redo." },
      ],
      moveTypesEyebrow: "Alla flytttyper",
      moveTypes: ["Privatflytt", "Kontorsflytt", "Tunga föremål", "Internationell", "Förvaring"],
      regionalTitle: "Lokal expertis, skandinavisk skala.",
      regionalBody:
        "Flyttfirmor som kan trånga gator i Köpenhamn, Oslos backar och Stockholms trapphus. Det guidade flödet fungerar på danska, svenska, norska och engelska.",
      countries: ["Danmark", "Sverige", "Norge"],
      finalTitle: "Redo när du är.",
      finalBody: "Tar cirka 3 minuter. Inget konto. Ingen spam.",
      footer: "Mock POC · 2026",
    },
    intake: {
      badge: "Guide",
      asideEyebrow: "Strukturerad, lugn, offertklar",
      asideTitle: "Planera din flytt i fem guidade steg.",
      asideBody: "Varje svar används för pris, matchning eller genomförbarhet utan att upplevelsen blir ett långt formulär.",
      changeLanguage: "Språk",
      back: "Tillbaka",
      continue: "Fortsätt",
      prepareOffers: "Förbered erbjudanden",
      footerHelper: "Ett tydligt steg i taget.",
      steps: [
        { eyebrow: "Steg 1", title: "Språk, rutt och tid", helper: "Börja med att sätta språk för sidan och lägg sedan till rutt och tid." },
        { eyebrow: "Steg 2", title: "Bostad och åtkomst", helper: "Bara de åtkomstuppgifter som ändrar pris och genomförbarhet." },
        { eyebrow: "Steg 3", title: "Flyttens storlek", helper: "Välj en snabb storleksnivå först och lägg sedan till detaljer där det hjälper." },
        { eyebrow: "Steg 4", title: "Särskilda föremål och tillägg", helper: "Samla undantag, hanteringsbehov och extra tjänster i en lugn översikt." },
        { eyebrow: "Steg 5", title: "Kontakt och erbjudandepreferenser", helper: "Avsluta med kontaktuppgifter och hur marknadsplatsen ska hantera erbjudanden." },
      ],
      errors: {
        completeStep: "Fyll i detta steg först så att briefen förblir offertklar.",
        completeContact: "Fyll i saknade kontakt- eller offertuppgifter först.",
        submitFailed: "Det gick inte att förbereda din flyttbrief",
      },
      matching: {
        eyebrow: "Matchar erbjudanden",
        title: "Vi förbereder din brief och rangordnar de mest relevanta flyttfirmorna.",
        body: "Detta mock-flöde använder rutttäckning, åtkomstsvårighet, prisregler och budgetpassning för att simulera en riktig marknadsplats.",
        stages: ["Granskar flyttdetaljer", "Kontrollerar serviceområden", "Tillämpar prisregler", "Jämför passform och tillgänglighet", "Förbereder dina matcher"],
      },
    },
  },
  no: {
    common: { yes: "Ja", no: "Nei", optional: "Valgfritt" },
    demo: { label: "Demomodus", body: "Simulerte data. Ingen ekte flyttefirmaer eller betalinger.", dismiss: "Lukk" },
    landing: {
      providerLink: "For flyttefirmaer",
      languageEyebrow: "Velg språk først",
      heroTitle: "Planlegg flyttingen med et guidet løp som holder seg tydelig fra start til tilbud.",
      heroBody:
        "Velg språk, svar på en kort strukturert intake, og sammenlign matchede flyttefirmaer gjennom anonyme tilbud og tilbudsforespørsler.",
      primaryCta: "Start guide",
      helperCta: "Tar omtrent 3 minutter. Ingen konto kreves.",
      trustItems: ["Anonyme tilbud", "Ingen spam-anrop", "Gratis for privatpersoner"],
      sampleRequest: "Eksempelforespørsel",
      sampleRoute: "København til Aarhus",
      sampleTag: "Familieflytting",
      sampleFacts: [["Bolig", "3-roms leilighet"], ["Tilgang", "2. etasje uten heis"], ["Dato", "Fleksibel neste måned"], ["Ekstra", "Pakking og lagring"]],
      whatHappensNext: "Dette skjer videre",
      workflowCards: [
        { title: "Guide", body: "Du svarer bare på detaljene flyttefirmaer faktisk trenger for pris, tilgang og gjennomførbarhet." },
        { title: "Strukturert brief", body: "Flyttingen blir gjort om til en tydelig anonym brief før firmaene ser den." },
        { title: "Tilbudsoversikt", body: "Du sammenligner raske estimater, bekreftede tilbud og tilbud på forespørsel før du velger kontakt." },
      ],
      howItWorks: "Slik fungerer det",
      steps: [
        { title: "Beskriv flyttingen", body: "Del rute, tidspunkt, tilgang, størrelse og spesielle behov i et kort strukturert løp." },
        { title: "Få matchede tilbud", body: "Matchede flyttefirmaer vurderer briefen og svarer med raske estimater, bekreftede tilbud eller tilbud på forespørsel." },
        { title: "Velg hvem du vil kontakte", body: "Gå gjennom tilbudene, sammenlign forskjeller, og gå videre når du er klar." },
      ],
      moveTypesEyebrow: "Alle flytttyper",
      moveTypes: ["Privatflytting", "Kontorflytting", "Tunge gjenstander", "Internasjonal", "Lagring"],
      regionalTitle: "Lokal ekspertise, skandinavisk rekkevidde.",
      regionalBody:
        "Flyttefirmaer som kjenner trange gater i København, Oslos bakker og Stockholms trapper. Det guidede løpet fungerer på dansk, svensk, norsk og engelsk.",
      countries: ["Danmark", "Sverige", "Norge"],
      finalTitle: "Klar når du er.",
      finalBody: "Tar omtrent 3 minutter. Ingen konto. Ingen spam.",
      footer: "Mock POC · 2026",
    },
    intake: {
      badge: "Guide",
      asideEyebrow: "Strukturert, rolig, tilbudsklar",
      asideTitle: "Planlegg flyttingen i fem guidede steg.",
      asideBody: "Hvert svar brukes til pris, matching eller gjennomførbarhet uten at opplevelsen blir et langt skjema.",
      changeLanguage: "Språk",
      back: "Tilbake",
      continue: "Fortsett",
      prepareOffers: "Forbered tilbud",
      footerHelper: "Ett tydelig steg om gangen.",
      steps: [
        { eyebrow: "Steg 1", title: "Språk, rute og tidspunkt", helper: "Start med å velge språk for siden, og legg deretter inn rute og tidspunkt." },
        { eyebrow: "Steg 2", title: "Bolig og tilgang", helper: "Bare tilgangsdetaljene som endrer pris og gjennomførbarhet." },
        { eyebrow: "Steg 3", title: "Flyttestørrelse", helper: "Velg først en rask størrelseskategori, og legg til detaljer der det hjelper." },
        { eyebrow: "Steg 4", title: "Spesielle gjenstander og tillegg", helper: "Samle unntak, håndteringsbehov og ekstra tjenester i en ryddig oversikt." },
        { eyebrow: "Steg 5", title: "Kontakt og tilbudspreferanser", helper: "Avslutt med kontaktinformasjon og hvordan markedsplassen skal håndtere tilbud." },
      ],
      errors: {
        completeStep: "Fullfør dette steget først så briefen holder seg tilbudsklar.",
        completeContact: "Fullfør manglende kontakt- eller tilbudsdetaljer først.",
        submitFailed: "Kunne ikke forberede flyttebriefen din",
      },
      matching: {
        eyebrow: "Matcher tilbud",
        title: "Vi forbereder briefen din og rangerer de mest relevante flyttefirmaene.",
        body: "Dette mock-løpet bruker rutedekning, tilgangsvansker, prisregler og budsjettmatch for å simulere en ekte markedsplass.",
        stages: ["Gjennomgår flyttedetaljer", "Sjekker serviceområder", "Bruker prisregler", "Sammenligner match og kapasitet", "Klargjør matchene dine"],
      },
    },
  },
} as const;

export function getUiCopy(language: PreferredLanguage) {
  return UI_COPY[language];
}

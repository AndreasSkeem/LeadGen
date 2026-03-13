import type { Brief, PreferredLanguage, QualificationProfile } from "@/lib/types";

export type MissingInfoKey =
  | "contact_name"
  | "contact_email"
  | "contact_phone"
  | "contact_method"
  | "ready_for_bids"
  | "move_date"
  | "date_flexibility"
  | "pickup_address"
  | "dropoff_address"
  | "pickup_property"
  | "dropoff_property"
  | "pickup_floor"
  | "dropoff_floor"
  | "pickup_elevator"
  | "dropoff_elevator"
  | "pickup_elevator_usable"
  | "dropoff_elevator_usable"
  | "pickup_parking_access"
  | "dropoff_parking_access"
  | "pickup_parking_distance"
  | "dropoff_parking_distance"
  | "move_size"
  | "transport_only"
  | "carrying_included"
  | "packing_scope"
  | "packing_materials"
  | "disassembly_reassembly"
  | "disposal_needed"
  | "cleaning"
  | "customer_help_carry"
  | "strict_deadline"
  | "key_handover_time"
  | "high_value_items";

const COPY: Record<PreferredLanguage, { intro: string; labels: Record<MissingInfoKey, string>; outro: string }> = {
  da: {
    intro: "Jeg mangler stadig et par vigtige oplysninger, før jeg kan gøre flytningen tilbudsklar:",
    labels: {
      contact_name: "dit navn",
      contact_email: "din email",
      contact_phone: "dit telefonnummer",
      contact_method: "hvordan du helst vil kontaktes",
      ready_for_bids: "om du er klar til at modtage tilbud nu",
      move_date: "flyttedato eller dato-interval",
      date_flexibility: "hvor fleksibel flyttedatoen er",
      pickup_address: "pickup-adressen",
      dropoff_address: "leveringsadressen",
      pickup_property: "boligtype ved pickup",
      dropoff_property: "boligtype ved levering",
      pickup_floor: "etage ved pickup",
      dropoff_floor: "etage ved levering",
      pickup_elevator: "om der er elevator ved pickup",
      dropoff_elevator: "om der er elevator ved levering",
      pickup_elevator_usable: "om elevatoren ved pickup kan bruges til møbler",
      dropoff_elevator_usable: "om elevatoren ved levering kan bruges til møbler",
      pickup_parking_access: "parkerings-/læsseforhold ved pickup",
      dropoff_parking_access: "parkerings-/læsseforhold ved levering",
      pickup_parking_distance: "afstand fra parkering til indgang ved pickup",
      dropoff_parking_distance: "afstand fra parkering til indgang ved levering",
      move_size: "flyttens størrelse eller volumen",
      transport_only: "om det kun er transport",
      carrying_included: "om bæring/loading skal med",
      packing_scope: "om du ønsker pakning",
      packing_materials: "om du har brug for pakkematerialer",
      disassembly_reassembly: "om møbler skal skilles ad/samles",
      disposal_needed: "om noget skal bortskaffes",
      cleaning: "om rengøring er relevant",
      customer_help_carry: "om du selv kan hjælpe med at bære",
      strict_deadline: "om der er en skarp deadline eller nøgleoverdragelse",
      key_handover_time: "tidspunkt for nøgleoverdragelse/adgangsdeadline",
      high_value_items: "om der er særligt værdifulde ting",
    },
    outro: "Svar gerne kort, så samler jeg resten og sender dig videre til gennemgang.",
  },
  sv: {
    intro: "Jag saknar fortfarande några viktiga uppgifter innan flytten är redo för offerter:",
    labels: {
      contact_name: "ditt namn",
      contact_email: "din e-post",
      contact_phone: "ditt telefonnummer",
      contact_method: "hur du helst vill bli kontaktad",
      ready_for_bids: "om du är redo att ta emot offerter nu",
      move_date: "flyttdatum eller datumintervall",
      date_flexibility: "hur flexibel flyttdagen är",
      pickup_address: "upphämtningsadressen",
      dropoff_address: "destinationens adress",
      pickup_property: "bostadstyp vid upphämtning",
      dropoff_property: "bostadstyp vid destinationen",
      pickup_floor: "våning vid upphämtning",
      dropoff_floor: "våning vid destinationen",
      pickup_elevator: "om det finns hiss vid upphämtning",
      dropoff_elevator: "om det finns hiss vid destinationen",
      pickup_elevator_usable: "om hissen vid upphämtning fungerar för möbler",
      dropoff_elevator_usable: "om hissen vid destinationen fungerar för möbler",
      pickup_parking_access: "parkerings-/lastningsförhållanden vid upphämtning",
      dropoff_parking_access: "parkerings-/lastningsförhållanden vid destinationen",
      pickup_parking_distance: "avstånd från parkering till entré vid upphämtning",
      dropoff_parking_distance: "avstånd från parkering till entré vid destinationen",
      move_size: "flyttens storlek eller volym",
      transport_only: "om det bara gäller transport",
      carrying_included: "om bärhjälp/loading ska ingå",
      packing_scope: "om du vill ha packhjälp",
      packing_materials: "om du behöver packmaterial",
      disassembly_reassembly: "om möbler ska monteras ned/upp",
      disposal_needed: "om något ska forslas bort",
      cleaning: "om städning är relevant",
      customer_help_carry: "om du själv kan hjälpa till att bära",
      strict_deadline: "om det finns en skarp deadline eller nyckelöverlämning",
      key_handover_time: "tid för nyckelöverlämning/tidsgräns för tillträde",
      high_value_items: "om det finns särskilt värdefulla saker",
    },
    outro: "Svara gärna kort så samlar jag resten och skickar dig vidare till granskning.",
  },
  no: {
    intro: "Jeg mangler fortsatt noen viktige opplysninger før flyttingen er klar for tilbud:",
    labels: {
      contact_name: "navnet ditt",
      contact_email: "e-posten din",
      contact_phone: "telefonnummeret ditt",
      contact_method: "hvordan du helst vil kontaktes",
      ready_for_bids: "om du er klar til å motta tilbud nå",
      move_date: "flyttedato eller dato-intervall",
      date_flexibility: "hvor fleksibel flyttedatoen er",
      pickup_address: "henteadressen",
      dropoff_address: "leveringsadressen",
      pickup_property: "boligtype ved henting",
      dropoff_property: "boligtype ved levering",
      pickup_floor: "etasje ved henting",
      dropoff_floor: "etasje ved levering",
      pickup_elevator: "om det er heis ved henting",
      dropoff_elevator: "om det er heis ved levering",
      pickup_elevator_usable: "om heisen ved henting kan brukes til møbler",
      dropoff_elevator_usable: "om heisen ved levering kan brukes til møbler",
      pickup_parking_access: "parkerings-/lasteforhold ved henting",
      dropoff_parking_access: "parkerings-/lasteforhold ved levering",
      pickup_parking_distance: "avstand fra parkering til inngang ved henting",
      dropoff_parking_distance: "avstand fra parkering til inngang ved levering",
      move_size: "flyttingens størrelse eller volum",
      transport_only: "om dette bare gjelder transport",
      carrying_included: "om bæring/lasting skal være med",
      packing_scope: "om du ønsker pakkehjelp",
      packing_materials: "om du trenger pakkemateriell",
      disassembly_reassembly: "om møbler må demonteres/monteres",
      disposal_needed: "om noe skal kastes eller kjøres bort",
      cleaning: "om rengjøring er relevant",
      customer_help_carry: "om du selv kan hjelpe til å bære",
      strict_deadline: "om det er en streng deadline eller nøkkeloverlevering",
      key_handover_time: "tidspunkt for nøkkeloverlevering/adgangsfrist",
      high_value_items: "om det finnes spesielt verdifulle ting",
    },
    outro: "Svar gjerne kort, så samler jeg resten og sender deg videre til gjennomgang.",
  },
  en: {
    intro: "I still need a few important details before this move is ready for offers:",
    labels: {
      contact_name: "your name",
      contact_email: "your email",
      contact_phone: "your phone number",
      contact_method: "how you prefer to be contacted",
      ready_for_bids: "whether you're ready to receive offers now",
      move_date: "the move date or date range",
      date_flexibility: "how flexible the move date is",
      pickup_address: "the pickup address",
      dropoff_address: "the drop-off address",
      pickup_property: "the pickup property type",
      dropoff_property: "the drop-off property type",
      pickup_floor: "the pickup floor",
      dropoff_floor: "the drop-off floor",
      pickup_elevator: "whether there is an elevator at pickup",
      dropoff_elevator: "whether there is an elevator at drop-off",
      pickup_elevator_usable: "whether the pickup elevator fits furniture",
      dropoff_elevator_usable: "whether the drop-off elevator fits furniture",
      pickup_parking_access: "pickup parking/loading access",
      dropoff_parking_access: "drop-off parking/loading access",
      pickup_parking_distance: "the parking distance at pickup",
      dropoff_parking_distance: "the parking distance at drop-off",
      move_size: "the move size or volume",
      transport_only: "whether this is transport only",
      carrying_included: "whether carrying/loading is included",
      packing_scope: "whether you want packing help",
      packing_materials: "whether you need packing materials",
      disassembly_reassembly: "whether disassembly/reassembly is needed",
      disposal_needed: "whether disposal is needed",
      cleaning: "whether cleaning is relevant",
      customer_help_carry: "whether you can help carry",
      strict_deadline: "whether there is a strict handover or access deadline",
      key_handover_time: "the handover/deadline time",
      high_value_items: "whether there are high-value items",
    },
    outro: "A short reply is enough and then I’ll take you to the review step.",
  },
};

function hasAddress(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function getBidReadinessIssues(brief: Brief, profile?: QualificationProfile | null): MissingInfoKey[] {
  const issues: MissingInfoKey[] = [];

  if (!hasText(profile?.first_name)) issues.push("contact_name");
  if (!hasText(profile?.email)) issues.push("contact_email");
  if (!hasText(profile?.phone)) issues.push("contact_phone");
  if ((profile?.preferred_contact_method ?? brief.preferred_contact_method) === "unknown") issues.push("contact_method");
  if ((profile?.ready_for_bids ?? brief.ready_for_bids) === null) issues.push("ready_for_bids");

  if (!hasText(brief.move_date_approx)) issues.push("move_date");
  if (brief.date_flexibility === "unknown") issues.push("date_flexibility");

  if (!hasAddress(brief.origin.address)) issues.push("pickup_address");
  if (!hasAddress(brief.destination.address)) issues.push("dropoff_address");
  if (brief.origin.property_type === "unknown") issues.push("pickup_property");
  if (brief.destination.property_type === "unknown") issues.push("dropoff_property");
  if (brief.origin.floor === null) issues.push("pickup_floor");
  if (brief.destination.floor === null) issues.push("dropoff_floor");
  if (brief.origin.elevator === "unknown") issues.push("pickup_elevator");
  if (brief.destination.elevator === "unknown") issues.push("dropoff_elevator");
  if (brief.origin.elevator === "yes" && brief.origin.elevator_usable_for_furniture === null) issues.push("pickup_elevator_usable");
  if (brief.destination.elevator === "yes" && brief.destination.elevator_usable_for_furniture === null) issues.push("dropoff_elevator_usable");
  if (brief.origin.parking_access === "unknown") issues.push("pickup_parking_access");
  if (brief.destination.parking_access === "unknown") issues.push("dropoff_parking_access");
  if (brief.origin.parking_distance_meters === null) issues.push("pickup_parking_distance");
  if (brief.destination.parking_distance_meters === null) issues.push("dropoff_parking_distance");

  if (!hasText(brief.volume.description) && brief.volume.estimated_cbm === null && brief.origin.rooms_approx === null) {
    issues.push("move_size");
  }

  if (brief.services_requested.transport_only === null) issues.push("transport_only");
  if (brief.services_requested.carrying_included === null) issues.push("carrying_included");
  if (brief.services_requested.packing === "undecided") issues.push("packing_scope");
  if (
    (brief.services_requested.packing === "full" || brief.services_requested.packing === "partial") &&
    brief.services_requested.packing_materials_needed === null
  ) {
    issues.push("packing_materials");
  }
  if (brief.services_requested.disassembly_reassembly === null) issues.push("disassembly_reassembly");
  if (brief.services_requested.disposal_needed === null) issues.push("disposal_needed");
  if (brief.services_requested.cleaning === null) issues.push("cleaning");

  if (brief.can_customer_help_carry === null) issues.push("customer_help_carry");
  if (brief.strict_deadline === null) issues.push("strict_deadline");
  if (brief.strict_deadline === true && !hasText(brief.key_handover_time)) issues.push("key_handover_time");
  if (brief.high_value_items === null) issues.push("high_value_items");

  return issues;
}

export function buildMissingInfoReply(language: PreferredLanguage, issues: MissingInfoKey[]): string {
  const copy = COPY[language];
  const labels = issues.slice(0, 6).map((issue) => `- ${copy.labels[issue]}`);
  const remaining = issues.length - labels.length;
  const extraLine = remaining > 0 ? `\n- +${remaining} more` : "";

  return `${copy.intro}\n${labels.join("\n")}${extraLine}\n\n${copy.outro}`;
}

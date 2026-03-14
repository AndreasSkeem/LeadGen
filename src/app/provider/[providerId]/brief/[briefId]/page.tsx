// Provider brief detail — shows an anonymized brief and the bid form.
// Customer contact details are NOT shown here (reveal happens after selection).
// INTERNAL USE ONLY.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProviderFromDb } from "@/lib/db/providers";
import { getBrief, getCustomerContact, logEvent } from "@/lib/db/briefs";
import { getExistingBid } from "@/lib/db/bids";
import { getSelectionForProviderBid } from "@/lib/db/selections";
import { InternalBanner, ProviderNav, BidTypeBadge } from "@/app/provider/components";
import BidForm from "./BidForm";
import type { Provider } from "@/lib/types";

function currencyForCountry(country: Provider["country"]): "DKK" | "SEK" | "NOK" {
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return "DKK";
}

const SERVICE_LABELS: Record<string, string> = {
  full: "Fuld pakning",
  partial: "Delvis pakning",
  self: "Kunden pakker selv",
  undecided: "Ikke besluttet",
};

export default async function ProviderBriefPage({
  params,
}: {
  params: Promise<{ providerId: string; briefId: string }>;
}) {
  const { providerId, briefId } = await params;

  const [provider, brief, existingBid, selectionInfo] = await Promise.all([
    getProviderFromDb(providerId),
    getBrief(briefId),
    getExistingBid(briefId, providerId),
    getSelectionForProviderBid(briefId, providerId),
  ]);

  // If this provider's bid is the selected one, reveal customer contact
  const customerContact = selectionInfo ? await getCustomerContact(briefId) : null;

  if (!provider || !brief) notFound();

  // Log selection_viewed when provider sees the revealed contact
  if (selectionInfo) {
    void logEvent(
      "selection_viewed",
      briefId,
      brief.language,
      { selectionId: selectionInfo.selectionId, bidId: selectionInfo.bidId },
      "provider",
      providerId
    );
  }

  const currency = currencyForCountry(provider.country);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <InternalBanner />
      <ProviderNav provider={provider} currentPage="brief" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Back + header */}
        <div>
          <Link
            href={`/provider/${providerId}/inbox`}
            className="inline-flex items-center gap-1 text-sm hover:underline mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Indbakke
          </Link>
          <h1 className="font-display text-2xl" style={{ color: "var(--text-strong)" }}>
            Opgave · {brief.origin.municipality} → {brief.destination.municipality}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Modtaget {new Date(brief.created_at).toLocaleDateString("da-DK")} ·{" "}
            Anonymiseret — kontaktoplysninger frigives ved kundeaccept
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* Brief details — left column */}
          <div className="md:col-span-3 space-y-4">

            {/* Summary card */}
            <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>
                Opgavebeskrivelse
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {brief.summary}
              </p>

              {/* Route */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Fra</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
                    {brief.origin.municipality}
                  </p>
                  {brief.origin.region && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{brief.origin.region}</p>
                  )}
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {brief.origin.property_type} ·{" "}
                    {brief.origin.floor !== null ? `Etage ${brief.origin.floor}` : ""}
                    {brief.origin.elevator === "yes" ? " · Elevator" : ""}
                  </p>
                </div>
                <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Til</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
                    {brief.destination.municipality}
                  </p>
                  {brief.destination.country !== brief.origin.country && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{brief.destination.country}</p>
                  )}
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {brief.destination.property_type}
                    {brief.destination.elevator === "yes" ? " · Elevator" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Volume + services */}
            <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent)" }}>
                Volumen & ydelser
              </p>
              <div className="space-y-2 text-sm">
                <Row label="Volumen" value={brief.volume.description} />
                {brief.volume.estimated_cbm && (
                  <Row label="Estimeret CBM" value={`~${brief.volume.estimated_cbm} m³`} />
                )}
                {brief.special_items.length > 0 && (
                  <Row label="Særlige genstande" value={brief.special_items.join(", ")} />
                )}
                <Row label="Pakning" value={SERVICE_LABELS[brief.services_requested.packing] ?? brief.services_requested.packing} />
                {brief.services_requested.storage.needed && (
                  <Row label="Opbevaring" value={brief.services_requested.storage.duration ?? "Ja"} />
                )}
                {brief.services_requested.disposal_needed && (
                  <Row label="Bortskaffelse" value="Ja" />
                )}
                {brief.services_requested.cleaning && (
                  <Row label="Rengøring" value="Ja" />
                )}
                {brief.services_requested.disassembly_reassembly && (
                  <Row label="Montering/demontering" value="Ja" />
                )}
              </div>
            </div>

            {/* Timing */}
            <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent)" }}>
                Timing
              </p>
              <div className="space-y-2 text-sm">
                {brief.move_date_approx && (
                  <Row label="Ønsket dato" value={brief.move_date_approx} />
                )}
                <Row label="Fleksibilitet" value={brief.date_flexibility} />
                <Row label="Hastighed" value={brief.urgency} />
                {brief.strict_deadline && (
                  <Row label="Hård deadline" value="Ja" />
                )}
              </div>
            </div>

            {/* Budget */}
            {brief.budget_indication.provided && (
              <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--accent)" }}>
                  Budget
                </p>
                <div className="space-y-2 text-sm">
                  {brief.budget_indication.range_dkk && (
                    <Row label="Indikation" value={brief.budget_indication.range_dkk} />
                  )}
                  {brief.budget_indication.hardMaxBudget && (
                    <Row label="Hårdt maks." value={`${brief.budget_indication.hardMaxBudget.toLocaleString("da-DK")} DKK`} />
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Bid form — right column */}
          <div className="md:col-span-2 space-y-4">

            {/* ── Customer contact reveal — shown only when this provider's bid is selected ── */}
            {selectionInfo && customerContact && (
              <div
                className="rounded-[20px] border p-5 space-y-3"
                style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#16a34a" }}>
                    ✓ Kunde har valgt dit tilbud
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Kontaktoplysninger frigivet {new Date(selectionInfo.createdAt).toLocaleDateString("da-DK")}
                  </p>
                </div>
                <div className="rounded-xl border p-3 bg-white" style={{ borderColor: "#bbf7d0" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Kundens kontaktoplysninger</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>{customerContact.firstName}</p>
                  <p className="text-sm" style={{ color: "var(--text)" }}>{customerContact.phone}</p>
                  <p className="text-sm" style={{ color: "var(--text)" }}>{customerContact.email}</p>
                </div>
              </div>
            )}

            {/* Existing bid status */}
            {existingBid && (
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: selectionInfo ? "#bbf7d0" : "var(--border)", backgroundColor: selectionInfo ? "#f0fdf4" : "white" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "#16a34a" }}>
                  {selectionInfo ? "✓ Valgt tilbud" : "✓ Tilbud afgivet"}
                </p>
                <BidTypeBadge type={existingBid.bidType} />
                {existingBid.priceMin !== null && (
                  <p className="text-sm font-semibold mt-2" style={{ color: "var(--text-strong)" }}>
                    {existingBid.priceMin.toLocaleString("da-DK")}
                    {existingBid.priceMax && existingBid.priceMax !== existingBid.priceMin
                      ? `–${existingBid.priceMax.toLocaleString("da-DK")}`
                      : ""}{" "}
                    {existingBid.currency}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Afgivet {new Date(existingBid.createdAt).toLocaleDateString("da-DK")}
                  {!selectionInfo && " · Du kan opdatere nedenfor"}
                </p>
              </div>
            )}

            {/* Bid form — locked once customer has selected this bid */}
            {!selectionInfo ? (
              <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--accent)" }}>
                  {existingBid ? "Opdater tilbud" : "Afgiv tilbud"}
                </p>
                <BidForm
                  providerId={providerId}
                  briefId={briefId}
                  currency={currency}
                  existingBid={existingBid}
                />
              </div>
            ) : (
              <div
                className="rounded-[24px] border p-5 text-sm"
                style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}
              >
                Tilbudsredigering er låst — kunden har afgivet sit valg.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-36 shrink-0 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}

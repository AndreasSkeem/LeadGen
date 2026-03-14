// Provider inbox — shows matched customer briefs from the DB.
// Briefs are anonymized: no customer name, email, or phone shown.
// INTERNAL USE ONLY.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProviderFromDb, getMatchedBriefsForProvider } from "@/lib/db/providers";
import { getBidsByProvider } from "@/lib/db/bids";
import { InternalBanner, ProviderNav, ScoreBadge } from "@/app/provider/components";

const MOVE_TYPE_LABELS: Record<string, string> = {
  private: "Privat flytning",
  office: "Kontorflytning",
  heavy_items: "Tunge genstande",
  international: "International flytning",
  storage: "Opbevaring",
};

const URGENCY_LABELS: Record<string, string> = {
  fixed_date: "Fast dato",
  flexible_weeks: "Fleksibel (uger)",
  flexible_months: "Fleksibel (måneder)",
  asap: "Hurtigst muligt",
};

export default async function ProviderInbox({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;

  const [provider, matchedBriefs, existingBids] = await Promise.all([
    getProviderFromDb(providerId),
    getMatchedBriefsForProvider(providerId, 30),
    getBidsByProvider(providerId),
  ]);

  if (!provider) notFound();

  const bidsByBriefId = new Set(existingBids.map((b) => b.briefId));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <InternalBanner />
      <ProviderNav provider={provider} currentPage="inbox" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        <div>
          <h1 className="font-display text-2xl mb-1" style={{ color: "var(--text-strong)" }}>
            Indbakke
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Opgaver der matcher {provider.company_name}. Kundeoplysninger er anonymiserede indtil accept.
          </p>
        </div>

        {matchedBriefs.length === 0 ? (
          <div
            className="rounded-[24px] border bg-white p-10 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-base font-semibold mb-2" style={{ color: "var(--text-strong)" }}>
              Ingen opgaver endnu
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nye kundeopdrag vil vises her, når de matcher din profil.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedBriefs.map(({ brief, score, briefId }) => {
              const hasBid = bidsByBriefId.has(briefId);
              return (
                <div
                  key={briefId}
                  className="rounded-[24px] border bg-white p-5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">

                      {/* Type + score + bid status */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                        >
                          {MOVE_TYPE_LABELS[brief.move_type] ?? brief.move_type}
                        </span>
                        <ScoreBadge score={score} />
                        {hasBid && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                          >
                            ✓ Tilbud afgivet
                          </span>
                        )}
                      </div>

                      {/* Route */}
                      <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
                        {brief.origin.municipality}
                        {brief.origin.region ? `, ${brief.origin.region}` : ""}{" "}
                        →{" "}
                        {brief.destination.municipality}
                        {brief.destination.country !== brief.origin.country
                          ? ` (${brief.destination.country})`
                          : ""}
                      </p>

                      {/* Summary */}
                      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--text)" }}>
                        {brief.summary}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {brief.volume.estimated_cbm && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            ~{brief.volume.estimated_cbm} m³
                          </span>
                        )}
                        {brief.move_date_approx && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {brief.move_date_approx}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {URGENCY_LABELS[brief.urgency] ?? brief.urgency}
                        </span>
                        {brief.special_items.length > 0 && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Særlige genstande: {brief.special_items.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0">
                      <Link
                        href={`/provider/${providerId}/brief/${briefId}`}
                        className="inline-block px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: hasBid ? "var(--bg)" : "var(--accent)",
                          color: hasBid ? "var(--accent)" : "white",
                          border: hasBid ? "1px solid var(--accent)" : "none",
                        }}
                      >
                        {hasBid ? "Se / opdater tilbud" : "Afgiv tilbud"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

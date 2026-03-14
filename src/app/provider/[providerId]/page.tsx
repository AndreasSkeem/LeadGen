// Provider dashboard — shows provider profile, matched brief count, bid history.
// No auth: direct URL access for internal demo/pilot workflow.
// INTERNAL USE ONLY — not customer-facing.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProviderFromDb } from "@/lib/db/providers";
import { getBidsByProvider } from "@/lib/db/bids";
import { getMatchedBriefsForProvider } from "@/lib/db/providers";
import { logEvent } from "@/lib/db/briefs";
import { InternalBanner, ProviderNav, ScoreBadge, BidTypeBadge } from "@/app/provider/components";

export default async function ProviderDashboard({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;

  const [provider, bids, matchedBriefs] = await Promise.all([
    getProviderFromDb(providerId),
    getBidsByProvider(providerId),
    getMatchedBriefsForProvider(providerId, 5),
  ]);

  if (!provider) notFound();

  await logEvent(
    "provider_dashboard_viewed",
    null,
    null,
    { providerId },
    "provider",
    providerId
  );

  const bidCountByStatus = {
    total: bids.length,
    withPrice: bids.filter((b) => b.priceMin !== null).length,
    surveyRequired: bids.filter((b) => b.bidType === "survey_required").length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <InternalBanner />
      <ProviderNav provider={provider} currentPage="dashboard" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="rounded-[24px] border bg-white p-6 shadow-card-md" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--accent)" }}>
                Leverandør · Intern demo
              </p>
              <h1 className="font-display text-2xl md:text-3xl mb-1" style={{ color: "var(--text-strong)" }}>
                {provider.company_name}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {provider.region} · {provider.country} · {provider.years_in_business} år erfaring
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                ★ {provider.rating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Svar typisk inden {provider.response_time_hours}t
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {provider.services.map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                {s}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {provider.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tilbudsgivninger", value: bidCountByStatus.total },
            { label: "Med pris", value: bidCountByStatus.withPrice },
            { label: "Besigtigelse krævet", value: bidCountByStatus.surveyRequired },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[20px] border bg-white p-4 text-center shadow-card-sm" style={{ borderColor: "var(--border)" }}>
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-strong)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Relevant briefs preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "var(--text-strong)" }}>
              Relevante opgaver
            </h2>
            <Link
              href={`/provider/${providerId}/inbox`}
              className="text-xs font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Se indbakke →
            </Link>
          </div>

          {matchedBriefs.length === 0 ? (
            <div className="rounded-[20px] border bg-white p-6 text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Ingen matchende opgaver endnu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedBriefs.map(({ brief, score, briefId }) => (
                <Link
                  key={briefId}
                  href={`/provider/${providerId}/brief/${briefId}`}
                  className="block rounded-[20px] border bg-white p-4 hover:shadow-card-md transition-shadow"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                          {brief.move_type}
                        </span>
                        <ScoreBadge score={score} />
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-strong)" }}>
                        {brief.origin.municipality} → {brief.destination.municipality}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                        {brief.summary}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                      {brief.move_date_approx ?? "Dato ukendt"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent bids */}
        {bids.length > 0 && (
          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text-strong)" }}>
              Dine tilbud
            </h2>
            <div className="space-y-3">
              {bids.slice(0, 10).map((bid) => (
                <div
                  key={bid.id}
                  className="rounded-[20px] border bg-white p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <BidTypeBadge type={bid.bidType} />
                      <p className="text-sm mt-1" style={{ color: "var(--text)" }}>
                        Opgave: <code className="text-xs">{bid.briefId.slice(0, 8)}…</code>
                      </p>
                    </div>
                    <div className="text-right">
                      {bid.priceMin !== null ? (
                        <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                          {bid.priceMin.toLocaleString("da-DK")}
                          {bid.priceMax && bid.priceMax !== bid.priceMin
                            ? `–${bid.priceMax.toLocaleString("da-DK")}`
                            : ""}{" "}
                          {bid.currency}
                        </p>
                      ) : (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Pris efter besigtigelse</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(bid.createdAt).toLocaleDateString("da-DK")}
                      </p>
                    </div>
                  </div>
                  {bid.message && (
                    <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {bid.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

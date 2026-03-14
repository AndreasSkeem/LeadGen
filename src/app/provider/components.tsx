// Shared UI components for provider-facing pages.
// These pages are INTERNAL / DEMO — not customer-facing.

import Link from "next/link";
import type { Provider, BidType } from "@/lib/types";

// ─── Internal banner ──────────────────────────────────────────────────────────
// Displayed on all provider pages to make clear this is not a customer-facing UI.

export function InternalBanner() {
  return (
    <div
      className="w-full py-2 px-4 text-center text-xs font-semibold"
      style={{ backgroundColor: "#fef3c7", color: "#92400e", borderBottom: "1px solid #fde68a" }}
    >
      INTERN DEMO — Leverandørworkflow · Ikke til kunder · Ingen rigtig autentificering
    </div>
  );
}

// ─── Provider navigation ─────────────────────────────────────────────────────

export function ProviderNav({
  provider,
  currentPage,
}: {
  provider: Provider;
  currentPage: "dashboard" | "inbox" | "brief";
}) {
  return (
    <nav
      className="border-b bg-white"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-6">
        <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          {provider.company_name}
        </span>
        <div className="flex gap-4 ml-4">
          <Link
            href={`/provider/${provider.id}`}
            className="text-sm py-1 font-medium"
            style={{ color: currentPage === "dashboard" ? "var(--accent)" : "var(--text-muted)" }}
          >
            Oversigt
          </Link>
          <Link
            href={`/provider/${provider.id}/inbox`}
            className="text-sm py-1 font-medium"
            style={{ color: currentPage === "inbox" || currentPage === "brief" ? "var(--accent)" : "var(--text-muted)" }}
          >
            Indbakke
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

export function ScoreBadge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score));
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "var(--accent)" : "var(--text-muted)";
  return (
    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#f1f5f9", color }}>
      Match {pct}%
    </span>
  );
}

// ─── Bid type badge ───────────────────────────────────────────────────────────

export function BidTypeBadge({ type }: { type: BidType }) {
  const labels: Record<BidType, string> = {
    binding: "Fast pris",
    bounded_estimate: "Prisestimat",
    survey_required: "Besigtigelse",
  };
  const colors: Record<BidType, string> = {
    binding: "#16a34a",
    bounded_estimate: "var(--accent)",
    survey_required: "#9333ea",
  };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#f8fafc", color: colors[type], border: `1px solid currentColor` }}
    >
      {labels[type]}
    </span>
  );
}

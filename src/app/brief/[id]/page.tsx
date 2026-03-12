"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Brief, Bid } from "@/lib/types";

interface BriefApiResponse {
  brief: Brief;
  bids: Bid[];
  error?: string;
}

export default function BriefPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [data, setData] = useState<BriefApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null); // provider id

  useEffect(() => {
    Promise.resolve(params).then((p) => setResolvedId(p.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;
    fetch(`/api/brief/${resolvedId}`)
      .then((r) => r.json())
      .then((d: BriefApiResponse) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [resolvedId]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex gap-1.5">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <p className="text-gray-500 mb-4">
            {error === "Brief not found"
              ? "This brief has expired or doesn't exist. Briefs are held in memory and are cleared when the server restarts."
              : error}
          </p>
          <Link href="/qualify" className="text-brand-500 hover:underline text-sm">
            Start a new qualification →
          </Link>
        </div>
      </PageShell>
    );
  }

  const { brief, bids } = data;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">
              Brief #{brief.brief_id.slice(0, 8).toUpperCase()}
            </span>
            <ConfidenceBadge confidence={brief.qualification_confidence} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {moveTypeLabel(brief.move_type)}
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-2xl">{brief.summary}</p>
        </div>

        {/* Brief details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard title="Origin">
            <DetailRow label="Location" value={`${brief.origin.municipality}, ${brief.origin.region ?? ""} ${brief.origin.country}`} />
            <DetailRow label="Property" value={capitalize(brief.origin.property_type)} />
            {brief.origin.floor !== null && (
              <DetailRow
                label="Floor"
                value={`${brief.origin.floor}${brief.origin.elevator === "no" ? " (no elevator)" : brief.origin.elevator === "yes" ? " (elevator)" : ""}`}
              />
            )}
            {brief.origin.size_m2_approx && (
              <DetailRow label="Size" value={`~${brief.origin.size_m2_approx} m²`} />
            )}
            {brief.origin.rooms_approx && (
              <DetailRow label="Rooms" value={`${brief.origin.rooms_approx}`} />
            )}
            <DetailRow
              label="Parking"
              value={capitalize(brief.origin.parking_access.replace("_", " "))}
            />
          </DetailCard>

          <DetailCard title="Destination">
            <DetailRow
              label="Location"
              value={`${brief.destination.municipality}, ${brief.destination.region ?? ""} ${brief.destination.country}`}
            />
            <DetailRow label="Property" value={capitalize(brief.destination.property_type)} />
            {brief.destination.floor !== null && (
              <DetailRow
                label="Floor"
                value={`${brief.destination.floor}${brief.destination.elevator === "no" ? " (no elevator)" : brief.destination.elevator === "yes" ? " (elevator)" : ""}`}
              />
            )}
            <DetailRow
              label="Parking"
              value={capitalize(brief.destination.parking_access.replace("_", " "))}
            />
          </DetailCard>

          <DetailCard title="Move details">
            <DetailRow label="Type" value={moveTypeLabel(brief.move_type)} />
            <DetailRow
              label="Timeline"
              value={brief.move_date_approx ?? capitalize(brief.urgency.replace("_", " "))}
            />
            <DetailRow label="Volume" value={brief.volume.description} />
            {brief.volume.estimated_cbm && (
              <DetailRow label="Est. volume" value={`~${brief.volume.estimated_cbm} m³`} />
            )}
          </DetailCard>

          <DetailCard title="Services">
            <DetailRow label="Packing" value={capitalize(brief.services_requested.packing)} />
            {brief.services_requested.unpacking !== null && (
              <DetailRow
                label="Unpacking"
                value={brief.services_requested.unpacking ? "Yes" : "No"}
              />
            )}
            {brief.services_requested.disassembly_reassembly !== null && (
              <DetailRow
                label="Assembly/disassembly"
                value={brief.services_requested.disassembly_reassembly ? "Yes" : "No"}
              />
            )}
            {brief.services_requested.storage.needed && (
              <DetailRow
                label="Storage"
                value={brief.services_requested.storage.duration ?? "Needed"}
              />
            )}
            {brief.services_requested.cleaning !== null && (
              <DetailRow
                label="Cleaning"
                value={brief.services_requested.cleaning ? "Yes" : "No"}
              />
            )}
          </DetailCard>
        </div>

        {/* Special items */}
        {brief.special_items.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Special items
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.special_items.map((item) => (
                <span
                  key={item}
                  className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Customer notes */}
        {brief.customer_notes && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Additional notes
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
              {brief.customer_notes}
            </p>
          </div>
        )}

        {/* Budget */}
        {brief.budget_indication.provided && brief.budget_indication.range_dkk && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Budget indication
            </h3>
            <p className="text-gray-700 text-sm">{brief.budget_indication.range_dkk}</p>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Bids */}
        <div>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {bids.length} matched providers
            </h2>
            <span className="text-xs text-gray-400">
              Bids are anonymous until you connect
            </span>
          </div>

          {bids.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">
                No providers matched your brief yet. Try adjusting the location or move type.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid, i) => (
                <BidCard
                  key={bid.provider.id}
                  bid={bid}
                  rank={i + 1}
                  connected={connected === bid.provider.id}
                  onConnect={() => setConnected(bid.provider.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center pb-8">
          <Link href="/qualify" className="text-sm text-gray-400 hover:text-gray-600">
            ← Start a new brief
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900 tracking-tight text-sm">
            LeadFlow
          </Link>
          <span className="text-xs text-gray-400">Your brief</span>
        </div>
      </header>
      {children}
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value}</span>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: Brief["qualification_confidence"] }) {
  const styles = {
    high: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[confidence]}`}>
      {confidence} confidence
    </span>
  );
}

function BidCard({
  bid,
  rank,
  connected,
  onConnect,
}: {
  bid: Bid;
  rank: number;
  connected: boolean;
  onConnect: () => void;
}) {
  const { provider, price_range_dkk, timeline_days, message } = bid;

  return (
    <div
      className={`border rounded-xl p-6 transition-colors ${
        connected
          ? "border-brand-500 bg-brand-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {connected ? (
        // Connected state — reveal provider
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-gray-400">#{rank}</span>
            <div>
              <div className="font-semibold text-gray-900">{provider.company_name}</div>
              <div className="text-xs text-gray-500">
                {provider.municipality}, {provider.country} · Est. {provider.years_in_business} yrs · {provider.employees_approx} employees
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{provider.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <Stat
              label="Estimated price"
              value={`${price_range_dkk.min.toLocaleString("da-DK")}–${price_range_dkk.max.toLocaleString("da-DK")} DKK`}
            />
            <Stat
              label="Response time"
              value={`~${provider.response_time_hours}h`}
            />
            <Stat
              label="Timeline"
              value={`${timeline_days} days`}
            />
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">{message}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {provider.specialties.slice(0, 3).map((s) => (
              <span key={s} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-brand-200 p-4">
            <p className="text-sm font-medium text-brand-700 mb-1">You&apos;re connected!</p>
            <p className="text-sm text-brand-600">
              {provider.company_name} can now see your contact details and will reach out
              within {provider.response_time_hours} hour{provider.response_time_hours === 1 ? "" : "s"}.
              This is a demo — no real contact has been made.
            </p>
          </div>
        </div>
      ) : (
        // Anonymous state
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{rank}</span>
                <span className="text-sm font-semibold text-gray-700">
                  Moving company · {provider.municipality}, {provider.country}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{provider.years_in_business} yrs in business</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {provider.rating}
                </span>
                <span>·</span>
                <span>Responds in ~{provider.response_time_hours}h</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-semibold text-gray-900">
                {price_range_dkk.min.toLocaleString("da-DK")}–{price_range_dkk.max.toLocaleString("da-DK")}
              </div>
              <div className="text-xs text-gray-400">DKK estimate</div>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">{message}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {provider.specialties.slice(0, 3).map((s) => (
              <span key={s} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>

          <button
            onClick={onConnect}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-3 rounded-lg transition-colors"
          >
            Connect with this provider
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Reveals their identity and yours
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function moveTypeLabel(type: Brief["move_type"]): string {
  const labels: Record<Brief["move_type"], string> = {
    private: "Private home move",
    office: "Office / business move",
    heavy_items: "Heavy item transport",
    international: "International move",
    storage: "Storage",
  };
  return labels[type] ?? type;
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

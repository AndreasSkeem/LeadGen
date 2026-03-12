"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  Clock,
  CalendarDays,
  MapPin,
  Layers,
  Package,
  ChevronDown,
  Check,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import type { Brief, Bid } from "@/lib/types";

interface BriefApiResponse {
  brief: Brief;
  bids: Bid[];
  error?: string;
}

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

function getContact(id: string) {
  return PROVIDER_CONTACTS[id] ?? { phone: "+45 00 00 00 00", email: `info@${id}.com` };
}

export default function BriefPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [data, setData] = useState<BriefApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState<{ bid: Bid; rank: number } | null>(null);
  const bidsRef = useRef<HTMLDivElement>(null);

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
        <div className="flex items-center justify-center py-28">
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
        <div className="max-w-xl mx-auto py-20 text-center px-6">
          <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
            {error === "Brief not found"
              ? "This brief has expired or doesn't exist. Briefs are held in memory and cleared when the server restarts."
              : error}
          </p>
          <Link href="/qualify" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Start a new qualification
          </Link>
        </div>
      </PageShell>
    );
  }

  const { brief, bids } = data;
  const connectedBid = connected ? bids.find((bid) => bid.provider.id === connected) ?? null : null;
  const connectedRank = connectedBid ? bids.findIndex((bid) => bid.provider.id === connectedBid.provider.id) + 1 : null;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12 fade-in">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {brief.brief_id.slice(0, 8).toUpperCase()}
            </span>
            <ConfidenceBadge confidence={brief.qualification_confidence} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "var(--text-strong)" }}>
            {moveTypeLabel(brief.move_type)}
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--text)" }}>
            {brief.summary}
          </p>
        </div>

        <BriefSummaryCard
          brief={brief}
          connected={Boolean(connectedBid)}
          onViewBids={() => bidsRef.current?.scrollIntoView({ behavior: "smooth" })}
        />

        {connectedBid && connectedRank !== null && (
          <ConnectionConfirmation bid={connectedBid} rank={connectedRank} />
        )}

        <details className="group">
          <summary
            className="flex items-center gap-2 cursor-pointer select-none list-none w-fit"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">Full brief details</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard title="Origin">
              <DetailRow label="Location" value={`${brief.origin.municipality}, ${brief.origin.country}`} />
              <DetailRow label="Property" value={cap(brief.origin.property_type)} />
              {brief.origin.floor !== null && (
                <DetailRow
                  label="Floor"
                  value={`${brief.origin.floor}${brief.origin.elevator === "no" ? " | no elevator" : brief.origin.elevator === "yes" ? " | elevator" : ""}`}
                />
              )}
              {brief.origin.rooms_approx && <DetailRow label="Rooms" value={String(brief.origin.rooms_approx)} />}
              <DetailRow label="Parking" value={cap(brief.origin.parking_access.replace("_", " "))} />
            </DetailCard>
            <DetailCard title="Destination">
              <DetailRow label="Location" value={`${brief.destination.municipality}, ${brief.destination.country}`} />
              <DetailRow label="Property" value={cap(brief.destination.property_type)} />
              {brief.destination.floor !== null && (
                <DetailRow
                  label="Floor"
                  value={`${brief.destination.floor}${brief.destination.elevator === "no" ? " | no elevator" : brief.destination.elevator === "yes" ? " | elevator" : ""}`}
                />
              )}
              <DetailRow label="Parking" value={cap(brief.destination.parking_access.replace("_", " "))} />
            </DetailCard>
            <DetailCard title="Move details">
              <DetailRow label="Type" value={moveTypeLabel(brief.move_type)} />
              <DetailRow label="Timeline" value={brief.move_date_approx ?? cap(brief.urgency.replace("_", " "))} />
              <DetailRow label="Volume" value={brief.volume.description} />
            </DetailCard>
            <DetailCard title="Services">
              <DetailRow label="Packing" value={cap(brief.services_requested.packing)} />
              {brief.services_requested.unpacking !== null && (
                <DetailRow label="Unpacking" value={brief.services_requested.unpacking ? "Yes" : "No"} />
              )}
              {brief.services_requested.storage.needed && (
                <DetailRow label="Storage" value={brief.services_requested.storage.duration ?? "Needed"} />
              )}
              {brief.services_requested.cleaning !== null && (
                <DetailRow label="Cleaning" value={brief.services_requested.cleaning ? "Yes" : "No"} />
              )}
            </DetailCard>
          </div>
          {brief.special_items.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {brief.special_items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium"
                  style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </details>

        <div ref={bidsRef}>
          <div className="mb-2">
            <h2 className="font-display text-2xl md:text-3xl" style={{ color: "var(--text-strong)" }}>
              {bids.length} matched provider{bids.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            Provider identities are anonymous until you connect. Names and contact details are revealed after you choose.
          </p>

          {bids.length === 0 ? (
            <div className="rounded-2xl p-10 text-center bg-white border" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No providers matched your brief. Try adjusting the location or move type.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {bids.map((bid, i) => (
                <div
                  key={bid.provider.id}
                  className={`fade-in stagger-${i + 1} ${connected && connected !== bid.provider.id ? "opacity-40 pointer-events-none" : ""} ${connected === bid.provider.id ? "hidden" : ""}`}
                >
                  <BidCard bid={bid} rank={i + 1} onConnect={() => setPendingConnect({ bid, rank: i + 1 })} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pb-8">
          <Link href="/qualify" className="text-sm hover:underline transition-colors" style={{ color: "var(--text-muted)" }}>
            Back to a new brief
          </Link>
        </div>
      </div>

      {pendingConnect && (
        <ConnectionModal
          bid={pendingConnect.bid}
          rank={pendingConnect.rank}
          onConfirm={() => {
            setConnected(pendingConnect.bid.provider.id);
            setPendingConnect(null);
          }}
          onCancel={() => setPendingConnect(null)}
        />
      )}
    </PageShell>
  );
}

function BriefSummaryCard({
  brief,
  connected,
  onViewBids,
}: {
  brief: Brief;
  connected: boolean;
  onViewBids: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white shadow-card-md border p-6 md:p-8" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3 md:gap-5 mb-7">
        <LocationPill label={brief.origin.municipality} />
        <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: "var(--border)" }} />
        <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
        <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: "var(--border)" }} />
        <LocationPill label={brief.destination.municipality} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
        <SummaryGroup
          icon={<MapPin className="w-4 h-4" />}
          label="Your move"
          value={`${brief.origin.municipality} to ${brief.destination.municipality}`}
          detail={`${cap(brief.origin.property_type)}${brief.origin.rooms_approx ? ` | ${brief.origin.rooms_approx} rooms` : ""}`}
        />
        <SummaryGroup
          icon={<Layers className="w-4 h-4" />}
          label="Details"
          value={
            brief.origin.floor !== null
              ? `Floor ${brief.origin.floor}${brief.origin.elevator === "yes" ? " | lift" : brief.origin.elevator === "no" ? " | no lift" : ""}`
              : "Access not specified"
          }
          detail={brief.volume.description}
        />
        <SummaryGroup
          icon={<Package className="w-4 h-4" />}
          label="Services"
          value={cap(brief.services_requested.packing)}
          detail={
            brief.services_requested.storage.needed
              ? `Storage needed${brief.services_requested.storage.duration ? ` | ${brief.services_requested.storage.duration}` : ""}`
              : "No storage requested"
          }
        />
        <SummaryGroup
          icon={<CalendarDays className="w-4 h-4" />}
          label="Timeline"
          value={brief.move_date_approx ?? cap(brief.urgency.replace("_", " "))}
          detail={brief.special_items.length > 0 ? brief.special_items.join(", ") : "No special items noted"}
        />
      </div>

      {brief.special_items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-7">
          {brief.special_items.map((item) => (
            <span
              key={item}
              className="text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ color: "var(--accent)", borderColor: "var(--accent)", backgroundColor: "var(--accent-light)" }}
            >
              {item}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {!connected && (
          <button
            onClick={onViewBids}
            className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl text-white transition-all btn-press hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            This looks right - view bids
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <Link
          href="/qualify"
          className="inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-xl border transition-all hover:border-gray-400"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Edit something
        </Link>
      </div>
    </div>
  );
}

function LocationPill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white shrink-0" style={{ borderColor: "var(--border)" }}>
      <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--accent)" }} />
      <span className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
        {label}
      </span>
    </div>
  );
}

function SummaryGroup({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="flex items-center gap-1.5 mb-2" style={{ color: "var(--text-muted)" }}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
        {value}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {detail}
      </p>
    </div>
  );
}

const RANK_LABELS = ["A", "B", "C"];

const TIER_CONFIG = {
  budget: { label: "Budget", bg: "var(--bg)", text: "var(--text-muted)", border: "var(--border)" },
  standard: { label: "Best match", bg: "var(--accent-light)", text: "var(--accent)", border: "var(--accent)" },
  premium: { label: "Premium", bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
};

const AVATAR_COLORS = [
  { bg: "#eef1f6", text: "#1e2b3c" },
  { bg: "var(--accent-light)", text: "var(--accent)" },
  { bg: "#f0fdf4", text: "#16a34a" },
];

function BidCard({
  bid,
  rank,
  onConnect,
}: {
  bid: Bid;
  rank: number;
  onConnect: () => void;
}) {
  const { provider, price_range, currency, price_range_after_rut, estimated_hours, available_date, bid_tier, message } = bid;
  const tier = TIER_CONFIG[bid_tier];
  const rankLabel = RANK_LABELS[rank - 1] ?? String(rank);
  const avatarColor = AVATAR_COLORS[rank - 1] ?? AVATAR_COLORS[0];
  const isRecommended = bid_tier === "standard";

  return (
    <div
      className={`relative flex flex-col rounded-3xl bg-white border shadow-card transition-all duration-200 overflow-hidden h-full card-lift ${isRecommended ? "shadow-card-lg md:-translate-y-1" : ""}`}
      style={{ borderColor: isRecommended ? "var(--accent)" : "var(--border)" }}
    >
      {isRecommended && <div className="h-1 w-full" style={{ backgroundColor: "var(--accent)" }} />}

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
            >
              {rankLabel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                  Provider {rankLabel}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: tier.bg, color: tier.text, borderColor: tier.border }}
                >
                  {tier.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {provider.rating}
                </span>
                <span>|</span>
                <span>{provider.years_in_business} yrs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-strong)" }}>
            {price_range.min.toLocaleString("da-DK")} - {price_range.max.toLocaleString("da-DK")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {currency} estimate, incl. tax
          </p>
          {price_range_after_rut && (
            <p className="text-xs font-medium mt-1" style={{ color: "#16a34a" }}>
              {price_range_after_rut.min.toLocaleString("da-DK")} - {price_range_after_rut.max.toLocaleString("da-DK")} after RUT deduction
            </p>
          )}
        </div>

        <div className="flex gap-4 mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {estimated_hours}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {available_date}
          </span>
        </div>

        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "var(--text)" }}>
          {message}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {provider.specialties.slice(0, 2).map((specialty) => (
            <span
              key={specialty}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg)" }}
            >
              {specialty}
            </span>
          ))}
        </div>

        <button
          onClick={onConnect}
          className="w-full font-semibold text-sm py-3.5 rounded-2xl text-white transition-all btn-press hover:opacity-90 mt-auto"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Connect with Provider {rankLabel}
        </button>
        <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
          Identity revealed after you confirm
        </p>
      </div>
    </div>
  );
}

function ConnectedStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: accent ? "var(--success)" : "var(--text-strong)" }}>
        {value}
      </p>
    </div>
  );
}

function ConnectionConfirmation({ bid, rank }: { bid: Bid; rank: number }) {
  const { provider, price_range, price_range_after_rut, currency, estimated_hours, available_date } = bid;
  const contact = getContact(provider.id);
  const rankLabel = RANK_LABELS[rank - 1] ?? String(rank);

  const fmtPrice = (min: number, max: number) =>
    `${min.toLocaleString("da-DK")} - ${max.toLocaleString("da-DK")} ${currency}`;

  return (
    <section
      className="rounded-[32px] border bg-white p-6 md:p-10 shadow-card-lg scale-in text-center"
      style={{ borderColor: "#bbf7d0" }}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 check-draw" style={{ backgroundColor: "#dcfce7" }}>
        <Check className="w-8 h-8" style={{ color: "var(--success)" }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--success)" }}>
        Connection confirmed
      </p>
      <h2 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "var(--text-strong)" }}>
        Provider {rankLabel} is now revealed.
      </h2>
      <p className="text-base max-w-2xl mx-auto mb-8" style={{ color: "var(--text)" }}>
        {provider.company_name} has received your contact details. They should reach out within {provider.response_time_hours} hour
        {provider.response_time_hours === 1 ? "" : "s"} to confirm the move.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
            Provider details
          </p>
          <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
            {provider.company_name}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {provider.municipality}, {provider.country} | {provider.years_in_business} years in business | rating {provider.rating}
          </p>
          <div className="space-y-2">
            <ContactRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contact.phone} />
            <ContactRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: "#bbf7d0", backgroundColor: "var(--success-soft)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--success)" }}>
            Accepted estimate
          </p>
          <div className="space-y-3">
            <ConnectedStat label="Price estimate" value={fmtPrice(price_range.min, price_range.max)} />
            {price_range_after_rut && <ConnectedStat label="After RUT" value={fmtPrice(price_range_after_rut.min, price_range_after_rut.max)} accent />}
            <ConnectedStat label="Duration" value={estimated_hours} />
            <ConnectedStat label="Availability" value={available_date} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-5 text-left" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
          Next steps
        </p>
        <ol className="space-y-2">
          {[
            "The provider reviews your brief and preferred date.",
            "They contact you directly to confirm access, timing, and any edge cases.",
            "You agree the final booking details with them directly.",
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm" style={{ color: "var(--text)" }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)" }}
              >
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ConnectionModal({
  bid,
  rank,
  onConfirm,
  onCancel,
}: {
  bid: Bid;
  rank: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { provider, price_range, currency, estimated_hours, available_date } = bid;
  const contact = getContact(provider.id);
  const rankLabel = RANK_LABELS[rank - 1] ?? String(rank);
  const avatarColor = AVATAR_COLORS[rank - 1] ?? AVATAR_COLORS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,22,41,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-modal scale-in overflow-hidden">
        <div className="px-6 pt-7 pb-5 border-b" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
              {rankLabel}
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-strong)" }}>
                {provider.company_name}
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {provider.municipality} | {provider.years_in_business} yrs | rating {provider.rating}
              </p>
            </div>
          </div>
          <h2 className="font-display text-xl" style={{ color: "var(--text-strong)" }}>
            Connect with Provider {rankLabel}?
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Your contact details will be shared. The provider&apos;s details are revealed below.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-2xl p-4 space-y-2.5 border" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
            <ContactRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contact.phone} />
            <ContactRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
            <div className="border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
              <ContactRow
                icon={<Star className="w-4 h-4" />}
                label="Price estimate"
                value={`${price_range.min.toLocaleString("da-DK")} - ${price_range.max.toLocaleString("da-DK")} ${currency}`}
              />
              <ContactRow icon={<Clock className="w-4 h-4" />} label="Duration" value={estimated_hours} />
              <ContactRow icon={<CalendarDays className="w-4 h-4" />} label="Available" value={available_date} />
            </div>
          </div>

          <div className="rounded-2xl p-4 text-center border border-dashed" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Payment
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              This is where a connection fee or subscription billing would appear.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
              What happens next
            </p>
            <ol className="space-y-2">
              {[
                `${provider.company_name} receives your contact details`,
                `They will call or email within ${provider.response_time_hours} hour${provider.response_time_hours === 1 ? "" : "s"}`,
                "They confirm details and schedule your move",
                "You agree on final price and sign the booking",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text)" }}>
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                    style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 font-semibold text-sm py-3.5 rounded-2xl text-white transition-all btn-press hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Confirm connection
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-3.5 text-sm font-medium rounded-2xl border transition-all hover:border-gray-400"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-2 shrink-0" style={{ color: "var(--text-muted)" }}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-right" style={{ color: "var(--text-strong)" }}>
        {value}
      </span>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            LeadGen
          </Link>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
            Your brief
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm font-medium text-right" style={{ color: "var(--text-strong)" }}>
        {value}
      </span>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: Brief["qualification_confidence"] }) {
  const styles = {
    high: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    medium: { bg: "var(--accent-light)", text: "var(--accent)", border: "var(--accent)" },
    low: { bg: "#fff5f5", text: "#dc2626", border: "#fecaca" },
  };
  const s = styles[confidence];

  return (
    <span className="text-xs px-2.5 py-1 rounded-full border font-medium" style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}>
      {confidence} confidence
    </span>
  );
}

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

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

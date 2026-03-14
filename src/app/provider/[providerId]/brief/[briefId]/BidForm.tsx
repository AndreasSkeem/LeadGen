"use client";

import { useState } from "react";
import type { ProviderBid, BidType } from "@/lib/types";

interface BidFormProps {
  providerId: string;
  briefId: string;
  currency: "DKK" | "SEK" | "NOK";
  existingBid: ProviderBid | null;
}

const BID_TYPE_OPTIONS: { value: BidType; label: string; hint: string }[] = [
  {
    value: "binding",
    label: "Fast pris",
    hint: "Endelig pris. Ingen overraskelser — dit tilbud bindes til denne pris.",
  },
  {
    value: "bounded_estimate",
    label: "Prisestimat (interval)",
    hint: "Et prisinterval. Slutprisen afhænger af faktiske arbejdstimer inden for intervallet.",
  },
  {
    value: "survey_required",
    label: "Besigtigelse påkrævet",
    hint: "Du kan ikke prise opgaven uden besigtigelse. Forklar kunden hvorfor.",
  },
];

export default function BidForm({ providerId, briefId, currency, existingBid }: BidFormProps) {
  const [bidType, setBidType] = useState<BidType>(existingBid?.bidType ?? "bounded_estimate");
  const [priceMin, setPriceMin] = useState(existingBid?.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(existingBid?.priceMax?.toString() ?? "");
  const [estimatedHours, setEstimatedHours] = useState(existingBid?.estimatedHours?.toString() ?? "");
  const [estimatedCrew, setEstimatedCrew] = useState(existingBid?.estimatedCrew?.toString() ?? "");
  const [estimatedVehicleCount, setEstimatedVehicleCount] = useState(
    existingBid?.estimatedVehicleCount?.toString() ?? ""
  );
  const [availableDate, setAvailableDate] = useState(existingBid?.availableDate ?? "");
  const [validityDays, setValidityDays] = useState(existingBid?.validityDays?.toString() ?? "7");
  const [message, setMessage] = useState(existingBid?.message ?? "");
  const [notes, setNotes] = useState(existingBid?.notes ?? "");
  const [assumptions, setAssumptions] = useState<string[]>(
    existingBid?.assumptions.length ? existingBid.assumptions : [""]
  );
  const [includedServices, setIncludedServices] = useState<string[]>(
    existingBid?.includedServices.length ? existingBid.includedServices : [""]
  );

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function addLine(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => [...prev, ""]);
  }

  function updateLine(
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeLine(index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const body = {
      briefId,
      bidType,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: bidType === "binding" ? (priceMin ? Number(priceMin) : null) : (priceMax ? Number(priceMax) : null),
      currency,
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      estimatedCrew: estimatedCrew ? Number(estimatedCrew) : null,
      estimatedVehicleCount: estimatedVehicleCount ? Number(estimatedVehicleCount) : null,
      availableDate: availableDate || null,
      validityDays: Number(validityDays) || 7,
      message: message || null,
      notes: notes || null,
      assumptions: assumptions.filter((a) => a.trim()),
      includedServices: includedServices.filter((s) => s.trim()),
    };

    try {
      const res = await fetch(`/api/provider/${providerId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { bidId?: string; error?: string };

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? "Fejl ved afsendelse" });
      } else {
        setResult({
          ok: true,
          message: existingBid ? "Tilbud opdateret." : "Tilbud afgivet og gemt.",
        });
      }
    } catch {
      setResult({ ok: false, message: "Netværksfejl — prøv igen" });
    } finally {
      setSubmitting(false);
    }
  }

  const showPricing = bidType !== "survey_required";
  const showPriceMax = bidType === "bounded_estimate";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Bid type */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3" style={{ color: "var(--text-strong)" }}>
          Tilbudstype *
        </legend>
        <div className="space-y-2">
          {BID_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
              style={{
                borderColor: bidType === opt.value ? "var(--accent)" : "var(--border)",
                backgroundColor: bidType === opt.value ? "var(--accent-light)" : "white",
              }}
            >
              <input
                type="radio"
                name="bidType"
                value={opt.value}
                checked={bidType === opt.value}
                onChange={() => setBidType(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {opt.hint}
                </p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Pricing */}
      {showPricing && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
              {bidType === "binding" ? "Pris" : "Min. pris"} ({currency}) *
            </label>
            <input
              type="number"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              required={showPricing}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
              placeholder="F.eks. 4500"
            />
          </div>
          {showPriceMax && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                Maks. pris ({currency}) *
              </label>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                required={showPriceMax}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
                placeholder="F.eks. 5500"
              />
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          Besked til kunden{bidType === "survey_required" ? " *" : ""}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required={bidType === "survey_required"}
          rows={3}
          className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
          style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
          placeholder={
            bidType === "survey_required"
              ? "Forklar kunden, hvad der skal besigtes og hvornår du kan …"
              : "Kort præsentation af jeres tilbud og hvad der gør jer til et godt valg …"
          }
        />
      </div>

      {/* Included services */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
          Inkluderede ydelser
        </label>
        <div className="space-y-2">
          {includedServices.map((val, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={val}
                onChange={(e) => updateLine(i, e.target.value, setIncludedServices)}
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
                placeholder="F.eks. Transport, aflæsning og bæring inkl."
              />
              {includedServices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(i, setIncludedServices)}
                  className="text-xs px-2 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addLine(setIncludedServices)}
            className="text-xs font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            + Tilføj ydelse
          </button>
        </div>
      </div>

      {/* Assumptions */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
          Forudsætninger for tilbuddet
        </label>
        <div className="space-y-2">
          {assumptions.map((val, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={val}
                onChange={(e) => updateLine(i, e.target.value, setAssumptions)}
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
                placeholder="F.eks. Normal adgangsforhold ved begge adresser"
              />
              {assumptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(i, setAssumptions)}
                  className="text-xs px-2 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addLine(setAssumptions)}
            className="text-xs font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            + Tilføj forudsætning
          </button>
        </div>
      </div>

      {/* Operational details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
            Est. timer
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
            placeholder="6"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
            Mand
          </label>
          <input
            type="number"
            min={1}
            value={estimatedCrew}
            onChange={(e) => setEstimatedCrew(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
            placeholder="2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
            Biler
          </label>
          <input
            type="number"
            min={1}
            value={estimatedVehicleCount}
            onChange={(e) => setEstimatedVehicleCount(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
            Gyldigt (dage)
          </label>
          <input
            type="number"
            min={1}
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
            placeholder="7"
          />
        </div>
      </div>

      {/* Available date */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          Tidligst ledigt
        </label>
        <input
          type="date"
          value={availableDate}
          onChange={(e) => setAvailableDate(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
        />
      </div>

      {/* Internal notes */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          Interne noter (vises ikke til kunden)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
          style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
          placeholder="Interne bemærkninger til opgaven …"
        />
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: result.ok ? "#dcfce7" : "#fee2e2",
            color: result.ok ? "#16a34a" : "#dc2626",
          }}
        >
          {result.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity"
        style={{
          backgroundColor: "var(--accent)",
          color: "white",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting
          ? "Sender …"
          : existingBid
          ? "Opdater tilbud"
          : "Afgiv tilbud"}
      </button>
    </form>
  );
}

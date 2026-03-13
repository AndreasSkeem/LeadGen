"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { defaultIntakeData, propertyNeedsFloor } from "@/lib/intake/build-brief";
import type { IntakeData } from "@/lib/intake/types";
import { LANGUAGE_OPTIONS, languageLabel } from "@/lib/i18n";
import { QUALIFY_COPY } from "@/lib/qualify-copy";
import type { PreferredLanguage, PreferredContactMethod, PropertyType } from "@/lib/types";

const MOVE_TYPES: Array<{ value: IntakeData["moveType"] }> = [
  { value: "private" },
  { value: "office" },
  { value: "heavy_items" },
  { value: "international" },
  { value: "storage" },
];

const FLEXIBILITY_OPTIONS: Array<{ value: IntakeData["dateFlexibility"] }> = [
  { value: "exact_date_only" },
  { value: "few_days" },
  { value: "week_or_more" },
];

const PROPERTY_OPTIONS: Array<{ value: PropertyType }> = [
  { value: "apartment" },
  { value: "house" },
  { value: "office" },
  { value: "warehouse" },
  { value: "other" },
];

const SIZE_OPTIONS: Array<{ value: IntakeData["moveSizeCategory"] }> = [
  { value: "few_items" },
  { value: "studio" },
  { value: "two_room" },
  { value: "three_room" },
  { value: "full_home" },
  { value: "office_small" },
  { value: "office_large" },
  { value: "custom" },
];

const SPECIAL_ITEM_OPTIONS = [
  "piano",
  "large fridge",
  "washing machine",
  "dryer",
  "safe",
  "gym equipment",
  "fragile art",
  "large wardrobes",
];

const PARKING_DISTANCE_OPTIONS = [10, 25, 50, 100, 150] as const;

const SIZE_STEP_CONTEXT: Record<PreferredLanguage, { title: string; body: string; optional: string; roomHint: string }> = {
  da: {
    title: "Tag udgangspunkt i det sted, du flytter fra.",
    body: "Vælg først den størrelse der bedst matcher din nuværende bolig eller arbejdsplads. Antal værelser er kun et valgfrit felt, hvis du vælger Andet.",
    optional: "Valgfrit",
    roomHint: "Aktiveres kun, hvis du vælger Andet.",
  },
  sv: {
    title: "Utgå från platsen du flyttar från.",
    body: "Välj först den storlek som bäst motsvarar din nuvarande bostad eller arbetsplats. Antal rum är bara valfritt om du väljer Annat.",
    optional: "Valfritt",
    roomHint: "Aktiveras bara om du väljer Annat.",
  },
  no: {
    title: "Ta utgangspunkt i stedet du flytter fra.",
    body: "Velg først størrelsen som best matcher boligen eller arbeidsplassen du flytter fra. Antall rom er bare valgfritt hvis du velger Annet.",
    optional: "Valgfritt",
    roomHint: "Aktiveres bare hvis du velger Annet.",
  },
  en: {
    title: "Base this on the place you are moving from.",
    body: "Start with the size that best matches your current home or workplace. Room count is only an optional override if you choose Other.",
    optional: "Optional",
    roomHint: "Only enabled if you choose Other.",
  },
};

const MATCHING_SUCCESS: Record<PreferredLanguage, { title: string; body: string; cta: string }> = {
  da: {
    title: "AI har fundet nogle gode matches til din flytning.",
    body: "Dine estimater og matchende flyttefirmaer er klar. Klik nedenfor for at se dem.",
    cta: "Se dine matches",
  },
  sv: {
    title: "AI har hittat några starka matchningar för din flytt.",
    body: "Dina estimat och matchande flyttfirmor är klara. Klicka nedan för att se dem.",
    cta: "Se dina matchningar",
  },
  no: {
    title: "AI har funnet noen gode matcher for flyttingen din.",
    body: "Estimatene og de matchende flyttefirmaene er klare. Klikk nedenfor for å se dem.",
    cta: "Se matchene dine",
  },
  en: {
    title: "AI has found a few strong matches for your move.",
    body: "Your estimates and matched movers are ready. Click below to view them.",
    cta: "See your matches",
  },
};

function parkingDistanceLabel(language: PreferredLanguage, value: number): string {
  const labels: Record<PreferredLanguage, Record<number, string>> = {
    da: {
      10: "10 meter eller mindre",
      25: "Omkring 25 meter",
      50: "Omkring 50 meter",
      100: "Omkring 100 meter",
      150: "Mere end 100 meter",
    },
    sv: {
      10: "10 meter eller mindre",
      25: "Cirka 25 meter",
      50: "Cirka 50 meter",
      100: "Cirka 100 meter",
      150: "Mer än 100 meter",
    },
    no: {
      10: "10 meter eller mindre",
      25: "Rundt 25 meter",
      50: "Rundt 50 meter",
      100: "Rundt 100 meter",
      150: "Mer enn 100 meter",
    },
    en: {
      10: "10 meters or less",
      25: "About 25 meters",
      50: "About 50 meters",
      100: "About 100 meters",
      150: "More than 100 meters",
    },
  };

  return labels[language][value];
}

function parseBudgetInput(value: string): number | null {
  const normalized = value.trim().replace(/[^\d.,]/g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function stepIsValid(step: number, form: IntakeData): boolean {
  if (step === 0) {
    return Boolean(form.moveDate && form.origin.address.trim() && form.destination.address.trim());
  }

  if (step === 1) {
    const locations = [form.origin, form.destination];
    return locations.every((location) => {
      const floorReady = propertyNeedsFloor(location.propertyType) ? location.floor !== null : true;
      const elevatorReady =
        location.propertyType === "house" ? true : location.elevator === "yes" ? location.elevatorUsable !== null : true;
      return Boolean(location.propertyType && floorReady && elevatorReady && location.parkingDistanceMeters !== null);
    });
  }

  if (step === 2) {
    if (!form.moveSizeCategory) return false;
    return form.moveSizeCategory === "custom" ? Boolean(form.inventorySummary.trim() || form.roomCount !== null) : true;
  }

  if (step === 3) {
    const packingReady = form.packing === "full" || form.packing === "partial" ? form.packingMaterialsNeeded !== null : true;
    const storageReady = form.storageNeeded ? Boolean(form.storageDuration.trim()) : true;
    return packingReady && storageReady;
  }

  return Boolean(
    form.fullName.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.preferredContactMethod &&
      form.canHelpCarry !== null &&
      form.strictDeadline !== null &&
      form.highValueItems !== null &&
      (form.strictDeadline ? form.keyHandoverTime.trim() : true)
  );
}

export default function QualifyPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const copy = QUALIFY_COPY[language];
  const [form, setForm] = useState<IntakeData>(() => defaultIntakeData(language));
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [matchingBriefId, setMatchingBriefId] = useState<string | null>(null);
  const [matchingStep, setMatchingStep] = useState(0);

  useEffect(() => {
    setForm((current) => ({ ...current, preferredLanguage: language }));
  }, [language]);

  useEffect(() => {
    if (!matchingBriefId) return;

    const tick = window.setInterval(() => {
      setMatchingStep((current) => Math.min(current + 1, copy.matching.messages.length - 1));
    }, 720);

    return () => {
      window.clearInterval(tick);
    };
  }, [copy.matching.messages.length, matchingBriefId]);

  const progressValue = useMemo(() => ((step + 1) / copy.stepOrder.length) * 100, [copy.stepOrder.length, step]);
  const currentStep = copy.stepOrder[step];
  const matchingReady = matchingStep >= copy.matching.messages.length - 1;
  const matchingSuccessCopy = MATCHING_SUCCESS[language];

  function openMatchedOffers() {
    if (!matchingBriefId) return;
    router.push(`/brief/${matchingBriefId}/offers`);
  }

  async function handleSubmit() {
    if (!stepIsValid(4, form) || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { briefId?: string; brief?: unknown; error?: string };

      if (!response.ok || !data.briefId || !data.brief) {
        throw new Error(data.error ?? copy.errors.submit);
      }

      window.sessionStorage.setItem(`brief:${data.briefId}`, JSON.stringify(data.brief));
      setMatchingStep(0);
      setMatchingBriefId(data.briefId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.errors.submit);
      setSubmitting(false);
    }
  }

  if (matchingBriefId) {
    return (
      <div className="ui-readable min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="w-full max-w-2xl rounded-[32px] border bg-white p-8 md:p-10 shadow-card-lg fade-in" style={{ borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--accent)" }}>
            {copy.matching.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl mb-3 font-semibold tracking-[-0.03em]" style={{ color: "var(--text-strong)" }}>
            {copy.matching.title}
          </h1>
          <p className="text-sm md:text-base max-w-xl mb-8" style={{ color: "var(--text)" }}>
            {copy.matching.body}
          </p>

          <div className="space-y-3">
            {copy.matching.messages.map((message, index) => {
              const active = index <= matchingStep;
              return (
                <div
                  key={message}
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    backgroundColor: active ? "var(--accent-light)" : "white",
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: active ? "white" : "var(--bg)", color: active ? "var(--accent)" : "var(--text-muted)" }}
                  >
                    {index < matchingStep ? <Check className="w-4 h-4" /> : <LoaderCircle className={`w-4 h-4 ${index === matchingStep ? "animate-spin" : ""}`} />}
                  </div>
                  <span className="text-sm font-medium" style={{ color: active ? "var(--text-strong)" : "var(--text-muted)" }}>
                    {message}
                  </span>
                </div>
              );
            })}
          </div>

          {matchingReady && matchingBriefId ? (
            <div className="mt-6 rounded-[24px] border bg-white p-5 fade-in" style={{ borderColor: "var(--border)", boxShadow: "0 12px 28px -20px rgba(30,43,60,0.18)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
                {matchingSuccessCopy.title}
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                {matchingSuccessCopy.body}
              </p>
              <button
                type="button"
                onClick={openMatchedOffers}
                className="inline-flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-semibold text-white btn-press option-lift hover:opacity-90"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {matchingSuccessCopy.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="ui-readable min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            Findli
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-light)" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressValue}%`, backgroundColor: "var(--accent)" }} />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
              {copy.shell.badge}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 md:gap-8">
          <aside className="space-y-4">
            <div className="rounded-[28px] border bg-white p-5 shadow-card-md" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--accent)" }}>
                {copy.shell.asideEyebrow}
              </p>
              <h1 className="text-3xl mb-3 font-semibold tracking-[-0.03em]" style={{ color: "var(--text-strong)" }}>
                {copy.shell.asideTitle}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {copy.shell.asideBody}
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-4 shadow-card-md" style={{ borderColor: "var(--border)" }}>
              <div className="space-y-2">
                {copy.stepOrder.map((item, index) => {
                  const active = index === step;
                  const done = index < step;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStep(index)}
                      className="w-full text-left rounded-2xl px-4 py-3 border transition-all option-lift"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border-light)",
                        backgroundColor: active ? "var(--accent-light)" : done ? "var(--bg)" : "white",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}>
                            {item.eyebrow}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                            {item.title}
                          </p>
                        </div>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: done || active ? "var(--primary)" : "var(--bg)",
                            color: done || active ? "white" : "var(--text-muted)",
                          }}
                        >
                          {done ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border bg-white p-6 md:p-8 shadow-card-lg fade-in" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--accent)" }}>
                {currentStep.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl mb-3 font-semibold tracking-[-0.03em]" style={{ color: "var(--text-strong)" }}>
                {currentStep.title}
              </h2>
              <p className="text-sm md:text-base max-w-2xl" style={{ color: "var(--text)" }}>
                {currentStep.helper}
              </p>

              <div className="mt-8 space-y-8">
                {step === 0 && <StepRoute form={form} setForm={setForm} language={language} setLanguage={setLanguage} />}
                {step === 1 && <StepAccess form={form} setForm={setForm} language={language} />}
                {step === 2 && <StepSize form={form} setForm={setForm} language={language} />}
                {step === 3 && <StepExtras form={form} setForm={setForm} language={language} />}
                {step === 4 && <StepContact form={form} setForm={setForm} language={language} />}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border px-4 py-3 text-sm" style={{ backgroundColor: "#fff5f5", borderColor: "#fecaca", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((current) => Math.max(0, current - 1));
                }}
                disabled={step === 0 || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold btn-press option-lift disabled:opacity-40"
                style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                {copy.shell.back}
              </button>

              <div className="flex items-center gap-3">
                <p className="hidden md:block text-sm" style={{ color: "var(--text-muted)" }}>
                  {copy.shell.helper}
                </p>
                {step < copy.stepOrder.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!stepIsValid(step, form)) {
                        setError(copy.errors.step);
                        return;
                      }
                      setError(null);
                      setStep((current) => Math.min(copy.stepOrder.length - 1, current + 1));
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white btn-press hover:opacity-90"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {copy.shell.continue}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!stepIsValid(step, form)) {
                        setError(copy.errors.contact);
                        return;
                      }
                      void handleSubmit();
                    }}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white btn-press hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {copy.shell.prepare}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StepRoute({
  form,
  setForm,
  language,
  setLanguage,
}: {
  form: IntakeData;
  setForm: React.Dispatch<React.SetStateAction<IntakeData>>;
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
}) {
  const copy = QUALIFY_COPY[language];

  return (
    <>
      <FieldGroup label={copy.labels.language}>
        <div className="inline-flex rounded-full border p-1" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
          {LANGUAGE_OPTIONS.map((option) => {
            const active = option.value === language;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className="rounded-full px-3 py-2 text-xs font-semibold transition-all option-lift"
                style={active ? { backgroundColor: "var(--primary)", color: "white" } : { color: "var(--text-muted)" }}
              >
                {languageLabel(option.value, language)}
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup label={copy.labels.moveType}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOVE_TYPES.map((option, index) => (
            <ChoiceCard
              key={option.value}
              active={form.moveType === option.value}
              title={copy.moveTypes[index].label}
              helper={copy.moveTypes[index].helper}
              onClick={() => setForm((current) => ({ ...current, moveType: option.value }))}
            />
          ))}
        </div>
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldGroup label={copy.labels.moveDate}>
          <Input type="date" value={form.moveDate} onChange={(value) => setForm((current) => ({ ...current, moveDate: value }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.dateFlexibility}>
          <div className="grid grid-cols-1 gap-3">
            {FLEXIBILITY_OPTIONS.map((option, index) => (
              <ChoiceRow key={option.value} active={form.dateFlexibility === option.value} label={copy.flexibility[index]} onClick={() => setForm((current) => ({ ...current, dateFlexibility: option.value }))} />
            ))}
          </div>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldGroup label={copy.labels.pickupAddress}>
          <Input value={form.origin.address} placeholder={copy.placeholders.address} onChange={(value) => setForm((current) => ({ ...current, origin: { ...current.origin, address: value } }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.dropoffAddress}>
          <Input value={form.destination.address} placeholder={copy.placeholders.address} onChange={(value) => setForm((current) => ({ ...current, destination: { ...current.destination, address: value } }))} />
        </FieldGroup>
      </div>

      <FieldGroup label={copy.labels.describeMove}>
        <TextArea rows={3} value={form.describeMove} placeholder={copy.placeholders.routeNotes} onChange={(value) => setForm((current) => ({ ...current, describeMove: value }))} />
      </FieldGroup>
    </>
  );
}

function StepAccess({
  form,
  setForm,
  language,
}: {
  form: IntakeData;
  setForm: React.Dispatch<React.SetStateAction<IntakeData>>;
  language: PreferredLanguage;
}) {
  const copy = QUALIFY_COPY[language];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {(["origin", "destination"] as const).map((side) => {
        const location = form[side];
        const label = side === "origin" ? copy.labels.pickup : copy.labels.dropoff;

        return (
          <div key={side} className="rounded-[28px] border p-5" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.72)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: "var(--accent)" }}>
              {label}
            </p>
            <div className="space-y-4">
              <FieldGroup label={copy.labels.propertyType}>
                <div className="grid grid-cols-2 gap-3">
                  {PROPERTY_OPTIONS.map((option, index) => (
                    <ChoiceRow
                      key={option.value}
                      active={location.propertyType === option.value}
                      label={copy.properties[index]}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          [side]: {
                            ...current[side],
                            propertyType: option.value,
                            floor: propertyNeedsFloor(option.value) ? current[side].floor : 0,
                            elevator: option.value === "house" ? "not_applicable" : current[side].elevator,
                            elevatorUsable: option.value === "house" ? null : current[side].elevatorUsable,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </FieldGroup>

              {propertyNeedsFloor(location.propertyType) && (
                <FieldGroup label={copy.labels.floor}>
                  <Input
                    type="number"
                    value={location.floor === null ? "" : String(location.floor)}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        [side]: { ...current[side], floor: value === "" ? null : Number(value) },
                      }))
                    }
                  />
                </FieldGroup>
              )}

              {location.propertyType !== "house" && (
                <>
                  <FieldGroup label={copy.labels.elevator}>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "yes", label: copy.options.yes },
                        { value: "no", label: copy.options.no },
                      ].map((option) => (
                        <ChoiceRow
                          key={option.value}
                          active={location.elevator === option.value}
                          label={option.label}
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              [side]: {
                                ...current[side],
                                elevator: option.value as "yes" | "no",
                                elevatorUsable: option.value === "yes" ? current[side].elevatorUsable : null,
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                  </FieldGroup>

                  {location.elevator === "yes" && (
                    <FieldGroup label={copy.labels.elevatorUsable}>
                      <div className="grid grid-cols-2 gap-3">
                        <ChoiceRow active={location.elevatorUsable === true} label={copy.options.usable} onClick={() => setForm((current) => ({ ...current, [side]: { ...current[side], elevatorUsable: true } }))} />
                        <ChoiceRow active={location.elevatorUsable === false} label={copy.options.tooSmall} onClick={() => setForm((current) => ({ ...current, [side]: { ...current[side], elevatorUsable: false } }))} />
                      </div>
                    </FieldGroup>
                  )}
                </>
              )}

              <FieldGroup label={copy.labels.parkingAccess}>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceRow active={location.parkingAccess === "easy"} label={copy.options.easyAccess} onClick={() => setForm((current) => ({ ...current, [side]: { ...current[side], parkingAccess: "easy" } }))} />
                  <ChoiceRow active={location.parkingAccess === "restricted"} label={copy.options.restricted} onClick={() => setForm((current) => ({ ...current, [side]: { ...current[side], parkingAccess: "restricted" } }))} />
                </div>
              </FieldGroup>

              <FieldGroup label={copy.labels.parkingDistance}>
                <Select
                  value={String(location.parkingDistanceMeters ?? 10)}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      [side]: { ...current[side], parkingDistanceMeters: Number(value) },
                    }))
                  }
                  options={PARKING_DISTANCE_OPTIONS.map((distance) => ({
                    value: String(distance),
                    label: parkingDistanceLabel(language, distance),
                  }))}
                />
              </FieldGroup>

              {location.parkingAccess === "restricted" && (
                <FieldGroup label={copy.labels.accessNotes}>
                  <TextArea rows={3} value={location.accessNotes} placeholder={copy.placeholders.accessNotes} onChange={(value) => setForm((current) => ({ ...current, [side]: { ...current[side], accessNotes: value } }))} />
                </FieldGroup>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepSize({
  form,
  setForm,
  language,
}: {
  form: IntakeData;
  setForm: React.Dispatch<React.SetStateAction<IntakeData>>;
  language: PreferredLanguage;
}) {
  const copy = QUALIFY_COPY[language];
  const sizeContext = SIZE_STEP_CONTEXT[language];
  const customSelected = form.moveSizeCategory === "custom";

  return (
    <>
      <div className="rounded-[24px] border px-4 py-4" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.72)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
          {sizeContext.title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          {sizeContext.body}
        </p>
      </div>

      <FieldGroup label={copy.labels.moveSize}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SIZE_OPTIONS.map((option, index) => (
            <ChoiceCard
              key={option.value}
              active={form.moveSizeCategory === option.value}
              title={copy.sizeOptions[index].label}
              helper={copy.sizeOptions[index].helper}
              emphasized={option.value === "custom"}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  moveSizeCategory: option.value,
                  roomCount: option.value === "custom" ? current.roomCount : null,
                }))
              }
            />
          ))}
        </div>
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <FieldGroup label={`${copy.labels.roomCount} · ${sizeContext.optional}`} hint={sizeContext.roomHint}>
          <Input
            type="number"
            disabled={!customSelected}
            value={form.roomCount === null ? "" : String(form.roomCount)}
            placeholder=""
            onChange={(value) => setForm((current) => ({ ...current, roomCount: value === "" ? null : Number(value) }))}
          />
        </FieldGroup>
        <FieldGroup label={copy.labels.fullMove}>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceRow active={form.fullMove} label={copy.options.fullMove} onClick={() => setForm((current) => ({ ...current, fullMove: true }))} />
            <ChoiceRow active={!form.fullMove} label={copy.options.partialMove} onClick={() => setForm((current) => ({ ...current, fullMove: false }))} />
          </div>
        </FieldGroup>
      </div>

      <FieldGroup label={copy.labels.inventory}>
        <TextArea rows={4} value={form.inventorySummary} placeholder={copy.placeholders.inventory} onChange={(value) => setForm((current) => ({ ...current, inventorySummary: value }))} />
      </FieldGroup>
    </>
  );
}

function StepExtras({
  form,
  setForm,
  language,
}: {
  form: IntakeData;
  setForm: React.Dispatch<React.SetStateAction<IntakeData>>;
  language: PreferredLanguage;
}) {
  const copy = QUALIFY_COPY[language];

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border p-5" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.72)" }}>
        <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          {copy.sections.specialItems}
        </p>
        <FieldGroup label={copy.labels.specialItems}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SPECIAL_ITEM_OPTIONS.map((item, index) => {
              const active = form.specialItems.includes(item);
              return (
                <ChoiceRow
                  key={item}
                  active={active}
                  label={copy.specialItems[index]}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      specialItems: active ? current.specialItems.filter((entry) => entry !== item) : [...current.specialItems, item],
                    }))
                  }
                />
              );
            })}
          </div>
        </FieldGroup>
        {(form.specialItems.length > 0 || form.moveType === "heavy_items") && (
          <FieldGroup label={copy.labels.specialNotes}>
            <TextArea rows={3} value={form.specialItemsNotes} placeholder={copy.placeholders.specialNotes} onChange={(value) => setForm((current) => ({ ...current, specialItemsNotes: value }))} />
          </FieldGroup>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[28px] border p-5" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.72)" }}>
          <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
            {copy.sections.handling}
          </p>
          <div className="space-y-4">
            <ToggleField label={copy.labels.transportOnly} value={form.transportOnly} onChange={(value) => setForm((current) => ({ ...current, transportOnly: value, carryingIncluded: value ? false : current.carryingIncluded }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
            <ToggleField label={copy.labels.carryingIncluded} value={form.carryingIncluded} onChange={(value) => setForm((current) => ({ ...current, carryingIncluded: value, transportOnly: value ? false : current.transportOnly }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
            <FieldGroup label={copy.labels.packing}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "self", label: copy.options.noPacking },
                  { value: "partial", label: copy.options.partialPacking },
                  { value: "full", label: copy.options.fullPacking },
                  { value: "undecided", label: copy.options.undecided },
                ].map((option) => (
                  <ChoiceRow key={option.value} active={form.packing === option.value} label={option.label} onClick={() => setForm((current) => ({ ...current, packing: option.value as IntakeData["packing"], packingMaterialsNeeded: option.value === "self" ? false : current.packingMaterialsNeeded }))} />
                ))}
              </div>
            </FieldGroup>
            {(form.packing === "partial" || form.packing === "full") && (
              <FieldGroup label={copy.labels.materials}>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceRow active={form.packingMaterialsNeeded === true} label={copy.options.yes} onClick={() => setForm((current) => ({ ...current, packingMaterialsNeeded: true }))} />
                  <ChoiceRow active={form.packingMaterialsNeeded === false} label={copy.options.no} onClick={() => setForm((current) => ({ ...current, packingMaterialsNeeded: false }))} />
                </div>
              </FieldGroup>
            )}
            <ToggleField label={copy.labels.disassembly} value={form.disassemblyReassembly} onChange={(value) => setForm((current) => ({ ...current, disassemblyReassembly: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
          </div>
        </div>

        <div className="rounded-[28px] border p-5" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.72)" }}>
          <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
            {copy.sections.services}
          </p>
          <div className="space-y-4">
            <ToggleField label={copy.labels.storageNeeded} value={form.storageNeeded} onChange={(value) => setForm((current) => ({ ...current, storageNeeded: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
            {form.storageNeeded && (
              <>
                <FieldGroup label={copy.labels.storageDuration}>
                  <Input value={form.storageDuration} placeholder={copy.placeholders.storageDuration} onChange={(value) => setForm((current) => ({ ...current, storageDuration: value }))} />
                </FieldGroup>
                <FieldGroup label={copy.labels.climate}>
                  <div className="grid grid-cols-2 gap-3">
                    <ChoiceRow active={form.climateControlledStorage === true} label={copy.options.yes} onClick={() => setForm((current) => ({ ...current, climateControlledStorage: true }))} />
                    <ChoiceRow active={form.climateControlledStorage === false} label={copy.options.no} onClick={() => setForm((current) => ({ ...current, climateControlledStorage: false }))} />
                  </div>
                </FieldGroup>
              </>
            )}
            <ToggleField label={copy.labels.disposalNeeded} value={form.disposalNeeded} onChange={(value) => setForm((current) => ({ ...current, disposalNeeded: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
            {form.disposalNeeded && (
              <FieldGroup label={copy.labels.disposalDetails}>
                <TextArea rows={3} value={form.disposalDetails} placeholder={copy.placeholders.disposalDetails} onChange={(value) => setForm((current) => ({ ...current, disposalDetails: value }))} />
              </FieldGroup>
            )}
            <ToggleField label={copy.labels.cleaningNeeded} value={form.cleaningNeeded} onChange={(value) => setForm((current) => ({ ...current, cleaningNeeded: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContact({
  form,
  setForm,
  language,
}: {
  form: IntakeData;
  setForm: React.Dispatch<React.SetStateAction<IntakeData>>;
  language: PreferredLanguage;
}) {
  const copy = QUALIFY_COPY[language];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <FieldGroup label={copy.labels.fullName}>
          <Input value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.email}>
          <Input value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.phone}>
          <Input value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.contactMethod}>
          <Select
            value={form.preferredContactMethod}
            onChange={(value) => setForm((current) => ({ ...current, preferredContactMethod: value as PreferredContactMethod }))}
            options={[
              { value: "either", label: copy.options.phoneOrEmail },
              { value: "phone", label: copy.options.phoneFirst },
              { value: "email", label: copy.options.emailFirst },
            ]}
          />
        </FieldGroup>
        <ToggleField label={copy.labels.ready} value={form.readyToReceiveBidsNow} onChange={(value) => setForm((current) => ({ ...current, readyToReceiveBidsNow: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
        <ToggleField label={copy.labels.autoBids} value={form.allowAutoBids} onChange={(value) => setForm((current) => ({ ...current, allowAutoBids: value }))} yesLabel={copy.options.yes} noLabel={copy.options.no} />
        <FieldGroup label={copy.labels.preferredBudget}>
          <Input value={form.preferredBudget === null ? "" : String(form.preferredBudget)} placeholder={copy.placeholders.budget} onChange={(value) => setForm((current) => ({ ...current, preferredBudget: parseBudgetInput(value) }))} />
        </FieldGroup>
        <FieldGroup label={copy.labels.hardMaxBudget}>
          <Input value={form.hardMaxBudget === null ? "" : String(form.hardMaxBudget)} placeholder={copy.placeholders.budget} onChange={(value) => setForm((current) => ({ ...current, hardMaxBudget: parseBudgetInput(value) }))} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <FieldGroup label={copy.labels.canHelp} className="h-full" labelClassName="flex min-h-[2.75rem] items-end">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceRow active={form.canHelpCarry === true} label={copy.options.yes} onClick={() => setForm((current) => ({ ...current, canHelpCarry: true }))} />
            <ChoiceRow active={form.canHelpCarry === false} label={copy.options.no} onClick={() => setForm((current) => ({ ...current, canHelpCarry: false }))} />
          </div>
        </FieldGroup>
        <FieldGroup label={copy.labels.strictDeadline} className="h-full" labelClassName="flex min-h-[2.75rem] items-end">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceRow active={form.strictDeadline === true} label={copy.options.yes} onClick={() => setForm((current) => ({ ...current, strictDeadline: true }))} />
            <ChoiceRow active={form.strictDeadline === false} label={copy.options.no} onClick={() => setForm((current) => ({ ...current, strictDeadline: false, keyHandoverTime: "" }))} />
          </div>
        </FieldGroup>
        <FieldGroup label={copy.labels.highValue} className="h-full" labelClassName="flex min-h-[2.75rem] items-end">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceRow active={form.highValueItems === true} label={copy.options.yes} onClick={() => setForm((current) => ({ ...current, highValueItems: true }))} />
            <ChoiceRow active={form.highValueItems === false} label={copy.options.no} onClick={() => setForm((current) => ({ ...current, highValueItems: false }))} />
          </div>
        </FieldGroup>
      </div>

      {form.strictDeadline && (
        <FieldGroup label={copy.labels.handoverTime}>
          <Input value={form.keyHandoverTime} placeholder={copy.placeholders.handoverTime} onChange={(value) => setForm((current) => ({ ...current, keyHandoverTime: value }))} />
        </FieldGroup>
      )}

      <FieldGroup label={copy.labels.extraNotes}>
        <TextArea rows={4} value={form.extraNotes} placeholder={copy.placeholders.extraNotes} onChange={(value) => setForm((current) => ({ ...current, extraNotes: value }))} />
      </FieldGroup>
    </>
  );
}

function FieldGroup({
  label,
  children,
  className = "",
  labelClassName = "",
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  hint?: string;
}) {
  return (
    <label className={`block space-y-2 self-start ${className}`.trim()}>
      <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${labelClassName}`.trim()} style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      {hint ? (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      ) : null}
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all surface-transition disabled:cursor-not-allowed disabled:text-slate-400"
      style={{ borderColor: "var(--border)", color: disabled ? "var(--text-muted)" : "var(--text-strong)", backgroundColor: disabled ? "var(--bg)" : "white" }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all resize-none surface-transition"
      style={{ borderColor: "var(--border)", color: "var(--text-strong)", backgroundColor: "white" }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all bg-white surface-transition"
      style={{ borderColor: "var(--border)", color: "var(--text-strong)" }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ChoiceCard({
  active,
  title,
  helper,
  emphasized = false,
  onClick,
}: {
  active: boolean;
  title: string;
  helper: string;
  emphasized?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-[24px] border p-4 transition-all surface-transition option-lift"
      style={
        active
          ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-light)", boxShadow: "0 10px 24px -18px rgba(196,137,92,0.55)" }
          : emphasized
            ? { borderColor: "rgba(30,43,60,0.18)", backgroundColor: "rgba(30,43,60,0.04)" }
            : { borderColor: "var(--border)", backgroundColor: "white" }
      }
    >
      <p className="text-sm font-semibold mb-1" style={{ color: emphasized && !active ? "var(--primary)" : "var(--text-strong)" }}>
        {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: active ? "var(--text)" : "var(--text-muted)" }}>
        {helper}
      </p>
    </button>
  );
}

function ChoiceRow({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border px-4 py-3 text-sm font-medium transition-all surface-transition option-lift"
      style={active ? { borderColor: "var(--accent)", color: "var(--accent)", backgroundColor: "var(--accent-light)", boxShadow: "0 10px 24px -18px rgba(196,137,92,0.55)" } : { borderColor: "var(--border)", color: "var(--text-strong)", backgroundColor: "white" }}
    >
      {label}
    </button>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <FieldGroup label={label}>
      <div className="grid grid-cols-2 gap-3">
        <ChoiceRow active={value} label={yesLabel} onClick={() => onChange(true)} />
        <ChoiceRow active={!value} label={noLabel} onClick={() => onChange(false)} />
      </div>
    </FieldGroup>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Building2, FileText, Globe, Home, Package, PhoneOff, Shield, Tag, Users, Weight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getUiCopy, LANGUAGE_OPTIONS, languageLabel } from "@/lib/i18n";
import type { PreferredLanguage } from "@/lib/types";

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const copy = getUiCopy(language).landing;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg)" }}>
        <div className="mx-auto flex min-h-[72px] max-w-5xl items-center justify-between gap-4 px-6">
          <span className="text-lg font-semibold tracking-[-0.02em]" style={{ color: "var(--primary)" }}>
            Findli
          </span>
          <div className="flex items-center gap-4">
            <a href="#" className="hidden text-sm font-medium transition-colors md:block" style={{ color: "var(--text-muted)" }}>
              {copy.providerLink}
            </a>
            <LanguageSelector language={language} onChange={setLanguage} />
          </div>
        </div>
      </header>

      <section
        className="mx-auto max-w-5xl px-6 pb-24 pt-14 md:pb-28 md:pt-20"
        style={{ background: "radial-gradient(ellipse 68% 58% at 92% 14%, rgba(196,137,92,0.09) 0%, transparent 64%)" }}
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:gap-16">
          <div className="max-w-[40rem]">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--border)", color: "var(--accent)", backgroundColor: "rgba(253,245,239,0.85)" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              {copy.languageEyebrow}
            </div>

            <h1 className="mt-6 max-w-[13ch] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] md:text-6xl lg:text-[4.5rem]" style={{ color: "var(--text-strong)" }}>
              {copy.heroTitle}
            </h1>

            <p className="mt-6 max-w-[36rem] text-lg leading-8 md:text-[1.1875rem]" style={{ color: "var(--text)" }}>
              {copy.heroBody}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/qualify" className="btn-press inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 font-semibold text-white shadow-card-md transition-all duration-200 hover:opacity-90" style={{ backgroundColor: "var(--primary)" }}>
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {copy.helperCta}
              </p>
            </div>

            <div className="mt-10 grid gap-3 border-t pt-8 sm:grid-cols-3" style={{ borderColor: "var(--border-light)" }}>
              {[
                { icon: Shield, label: copy.trustItems[0] },
                { icon: PhoneOff, label: copy.trustItems[1] },
                { icon: Tag, label: copy.trustItems[2] },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", backgroundColor: "rgba(255,255,255,0.55)" }}>
                  <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                  <span style={{ color: "var(--text)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 top-6 h-24 rounded-[28px] blur-3xl" style={{ backgroundColor: "rgba(196,137,92,0.12)" }} />
            <div className="relative overflow-hidden rounded-[28px] border p-6 shadow-card-lg" style={{ borderColor: "var(--border)", backgroundColor: "rgba(255,255,255,0.84)" }}>
              <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(247,245,242,0.9)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--accent)" }}>
                      {copy.sampleRequest}
                    </p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-strong)" }}>
                      {copy.sampleRoute}
                    </p>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                    {copy.sampleTag}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {copy.sampleFacts.map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white px-3 py-3">
                      <p style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="mt-1 font-medium" style={{ color: "var(--text-strong)" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                  {copy.whatHappensNext}
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { icon: FileText, item: copy.workflowCards[0] },
                    { icon: Users, item: copy.workflowCards[1] },
                    { icon: ArrowRight, item: copy.workflowCards[2] },
                  ].map(({ icon: Icon, item }) => (
                    <div key={item.title} className="flex gap-3 rounded-2xl border px-4 py-4" style={{ borderColor: "var(--border-light)", backgroundColor: "rgba(255,255,255,0.72)" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6" style={{ color: "var(--text)" }}>
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="mb-14 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--accent)" }}>
            {copy.howItWorks}
          </p>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <Step number="01" icon={<FileText className="h-5 w-5" />} title={copy.steps[0].title} body={copy.steps[0].body} />
            <Step number="02" icon={<Users className="h-5 w-5" />} title={copy.steps[1].title} body={copy.steps[1].body} />
            <Step number="03" icon={<ArrowRight className="h-5 w-5" />} title={copy.steps[2].title} body={copy.steps[2].body} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-10 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
          {copy.moveTypesEyebrow}
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: copy.moveTypes[0], icon: Home },
            { label: copy.moveTypes[1], icon: Building2 },
            { label: copy.moveTypes[2], icon: Weight },
            { label: copy.moveTypes[3], icon: Globe },
            { label: copy.moveTypes[4], icon: Package },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="card-lift group flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center transition-all duration-200" style={{ borderColor: "var(--border)" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-16 md:flex-row">
          <div className="flex-1">
            <p className="mb-2 font-display text-xl italic" style={{ color: "var(--primary)" }}>
              {copy.regionalTitle}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {copy.regionalBody}
            </p>
          </div>
          <div className="flex shrink-0 gap-10">
            {[
              { flag: "DK", name: copy.countries[0] },
              { flag: "SE", name: copy.countries[1] },
              { flag: "NO", name: copy.countries[2] },
            ].map(({ flag, name }) => (
              <div key={name} className="text-center">
                <div className="mb-1.5 text-sm font-semibold tracking-[0.18em]" style={{ color: "var(--primary)" }}>
                  {flag}
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <h2 className="mb-5 font-display text-4xl md:text-5xl" style={{ color: "var(--text-strong)" }}>
          {copy.finalTitle}
        </h2>
        <p className="mb-10 text-lg" style={{ color: "var(--text-muted)" }}>
          {copy.finalBody}
        </p>
        <Link href="/qualify" className="btn-press inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 font-semibold text-white shadow-card-md transition-all duration-200 hover:opacity-90" style={{ backgroundColor: "var(--primary)" }}>
          {copy.primaryCta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t" style={{ borderColor: "var(--border-light)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
          <span className="font-display text-sm font-semibold" style={{ color: "var(--primary)" }}>
            Findli
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {copy.footer}
          </span>
        </div>
      </footer>
    </main>
  );
}

function LanguageSelector({
  language,
  onChange,
}: {
  language: PreferredLanguage;
  onChange: (language: PreferredLanguage) => void;
}) {
  return (
    <div className="inline-flex rounded-full border p-1" style={{ borderColor: "var(--border)", backgroundColor: "rgba(255,255,255,0.82)" }}>
      {LANGUAGE_OPTIONS.map((option) => {
        const active = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 option-lift"
            style={active ? { backgroundColor: "var(--primary)", color: "white" } : { color: "var(--text-muted)" }}
          >
            {languageLabel(option.value, language)}
          </button>
        );
      })}
    </div>
  );
}

function Step({ number, icon, title, body }: { number: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
        {icon}
      </div>
      <p className="mb-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
        {number}
      </p>
      <h3 className="mb-2 text-base font-semibold" style={{ color: "var(--text-strong)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
        {body}
      </p>
    </div>
  );
}

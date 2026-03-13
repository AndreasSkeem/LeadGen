"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  BriefDetailsSection,
  BriefSummaryCard,
  BudgetPanel,
  ConfidenceBadge,
  COPY,
  loadBriefData,
  LoadingState,
  MissingBriefState,
  moveTypeLabel,
  PageShell,
  type BriefApiResponse,
} from "@/components/brief/brief-ui";

export default function BriefPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { language } = useLanguage();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [data, setData] = useState<BriefApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(params).then((value) => setResolvedId(value.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;

    loadBriefData(resolvedId)
      .then((response) => setData(response))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedId]);

  if (loading) return <PageShell copy={COPY[language]}><LoadingState /></PageShell>;
  if (error || !data) return <PageShell copy={COPY[language]}><MissingBriefState message={error ?? undefined} copy={COPY[language]} /></PageShell>;

  const { brief } = data;
  const copy = COPY[brief.language];

  return (
    <PageShell copy={copy}>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 fade-in">
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {brief.brief_id.slice(0, 8).toUpperCase()}
            </span>
            <ConfidenceBadge confidence={brief.qualification_confidence} />
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "var(--text-strong)" }}>
                {moveTypeLabel(brief.move_type, brief.language)}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
                {brief.summary}
              </p>
            </div>
            <Link
              href={`/brief/${brief.brief_id}/offers`}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white btn-press hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {copy.viewOffers}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <BriefSummaryCard brief={brief} copy={copy} />
        <BudgetPanel brief={brief} copy={copy} />
        <BriefDetailsSection brief={brief} copy={copy} />
      </div>
    </PageShell>
  );
}

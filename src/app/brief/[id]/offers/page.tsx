"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  COPY,
  loadBriefData,
  LoadingState,
  MissingBriefState,
  moveTypeLabel,
  OffersBoard,
  PageShell,
  type BriefApiResponse,
} from "@/components/brief/brief-ui";

export default function OffersPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
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

  const { brief, offers } = data;
  const copy = COPY[brief.language];

  return (
    <PageShell copy={copy}>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 fade-in">
        <header className="space-y-4">
          <Link
            href={`/brief/${brief.brief_id}`}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            {copy.reviewDetails}
          </Link>
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl mb-3" style={{ color: "var(--text-strong)" }}>
              {moveTypeLabel(brief.move_type, brief.language)}
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
              {brief.summary}
            </p>
          </div>
        </header>

        <OffersBoard offers={offers} copy={copy} language={brief.language} />
      </div>
    </PageShell>
  );
}

"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { getUiCopy } from "@/lib/i18n";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();
  const copy = getUiCopy(language).demo;

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm">
      <span className="inline-flex items-center gap-1.5 text-amber-800">
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{copy.label}</span>
        <span className="text-amber-700">{copy.body}</span>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 shrink-0 text-amber-600 transition-colors hover:text-amber-900"
        aria-label={copy.dismiss}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// In-memory brief store — fine for mock POC
// Upgrade to database for investor POC

import type { Brief } from "@/lib/types";

// Module-level map persists across requests in the same process
const briefStore = new Map<string, Brief>();

export function storeBrief(brief: Brief): void {
  briefStore.set(brief.brief_id, brief);
}

export function getBrief(id: string): Brief | undefined {
  return briefStore.get(id);
}

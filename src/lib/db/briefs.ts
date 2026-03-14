// Database operations for Brief persistence.
// Replaces the ephemeral in-memory store (src/lib/store.ts).

import type { Brief, CustomerContact } from "@/lib/types";
import { prisma } from "@/lib/db";

// ─── Store ────────────────────────────────────────────────────────────────────

export async function storeBrief(brief: Brief, customerContact?: CustomerContact): Promise<void> {
  await prisma.brief.create({
    data: {
      id: brief.brief_id,
      data: JSON.stringify(brief),
      locale: brief.language,
      customerContact: customerContact ? JSON.stringify(customerContact) : null,
    },
  });
}

// ─── Customer Contact ──────────────────────────────────────────────────────────
// Only used in the selection reveal flow — never returned in public brief APIs.

export async function getCustomerContact(briefId: string): Promise<CustomerContact | null> {
  const row = await prisma.brief.findUnique({ where: { id: briefId }, select: { customerContact: true } });
  if (!row?.customerContact) return null;
  return JSON.parse(row.customerContact) as CustomerContact;
}

// ─── Retrieve ─────────────────────────────────────────────────────────────────

export async function getBrief(id: string): Promise<Brief | undefined> {
  const row = await prisma.brief.findUnique({ where: { id } });
  if (!row) return undefined;
  return JSON.parse(row.data) as Brief;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function logEvent(
  eventType: string,
  briefId: string | null,
  locale: string | null,
  metadata: Record<string, unknown> = {},
  actorType: "customer" | "provider" | "operator" | "system" = "system",
  providerId?: string
): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        eventType,
        briefId: briefId ?? undefined,
        providerId: providerId ?? undefined,
        actorType,
        locale: locale ?? undefined,
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (err) {
    // Event logging must not break the main flow
    console.error("[eventLog] failed to write event:", eventType, err);
  }
}

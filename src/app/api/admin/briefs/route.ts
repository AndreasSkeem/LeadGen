// Internal debug endpoint — lists recent briefs, events, providers, and bid counts.
// Blocked in production. No auth — local dev only.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBidCountsByBrief } from "@/lib/db/bids";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const [briefs, events, providerCount, bidCountsByBrief] = await Promise.all([
    prisma.brief.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, locale: true, createdAt: true },
    }),
    prisma.eventLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, eventType: true, briefId: true, providerId: true, locale: true, metadata: true, actorType: true, createdAt: true },
    }),
    prisma.provider.count(),
    getBidCountsByBrief(),
  ]);

  return NextResponse.json({
    summary: {
      briefs_total: briefs.length,
      providers_total: providerCount,
      events_total: events.length,
      briefs_with_real_bids: Object.keys(bidCountsByBrief).length,
    },
    recent_briefs: briefs.map((b) => ({
      ...b,
      real_bid_count: bidCountsByBrief[b.id] ?? 0,
    })),
    recent_events: events.map((e) => ({
      ...e,
      metadata: (() => { try { return JSON.parse(e.metadata); } catch { return e.metadata; } })(),
    })),
  });
}

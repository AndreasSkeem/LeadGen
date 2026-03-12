import { NextRequest, NextResponse } from "next/server";
import { getBrief } from "@/lib/store";
import { matchProviders } from "@/lib/matching/match";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brief = getBrief(id);

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  const bids = matchProviders(brief, 3);

  return NextResponse.json({ brief, bids });
}

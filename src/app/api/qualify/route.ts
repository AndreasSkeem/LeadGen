import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai/client";
import { QUALIFICATION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { storeBrief } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, Brief } from "@/lib/types";

interface QualifyRequest {
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QualifyRequest;
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Build the message array for OpenRouter
    const openRouterMessages = [
      { role: "system" as const, content: QUALIFICATION_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const assistantReply = await callOpenRouter(openRouterMessages);

    // Check if the reply contains a JSON brief
    const brief = extractBrief(assistantReply);
    let briefId: string | null = null;

    if (brief) {
      // Assign real ID and timestamp, then store
      const now = new Date().toISOString();
      const id = uuidv4();
      brief.brief_id = id;
      brief.created_at = now;
      storeBrief(brief);
      briefId = id;
    }

    return NextResponse.json({
      reply: assistantReply,
      briefId,
    });
  } catch (err) {
    console.error("[qualify]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function extractBrief(text: string): Brief | null {
  // Look for a ```json ... ``` block
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]) as Brief;
    // Minimal validation — must have move_type and origin
    if (!parsed.move_type || !parsed.origin) return null;
    return parsed;
  } catch {
    return null;
  }
}

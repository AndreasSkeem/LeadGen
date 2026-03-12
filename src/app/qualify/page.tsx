"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUp, Sparkles, User } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

interface ApiResponse {
  reply: string;
  briefId: string | null;
  error?: string;
}

function stripJsonBlock(text: string): string {
  return text.replace(/```json[\s\S]*?```/g, "").trim();
}

function containsJsonBrief(text: string): boolean {
  return /```json[\s\S]*?```/.test(text);
}

export default function QualifyPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefComplete, setBriefComplete] = useState(false);
  const [briefId, setBriefId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || loading) return;

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userText.trim() },
      ];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/qualify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = (await res.json()) as ApiResponse;
        if (!res.ok || data.error) throw new Error(data.error ?? "Something went wrong");

        setMessages([...newMessages, { role: "assistant", content: data.reply }]);

        if (data.briefId) {
          setBriefId(data.briefId);
          setBriefComplete(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const progressValue = briefComplete ? 100 : messages.length === 0 ? 18 : Math.min(84, 18 + messages.length * 14);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b shrink-0 bg-white" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            LeadGen
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                Progress
              </span>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-light)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressValue}%`, backgroundColor: "var(--accent)" }}
                />
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
              Moving qualification
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-5">
          {messages.length === 0 && (
            <div className="space-y-6 fade-in">
              <div className="rounded-[28px] border bg-white p-5 shadow-card-md" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--accent)" }}>
                      Anonymous brief
                    </p>
                    <h1 className="font-display text-3xl leading-tight mb-2" style={{ color: "var(--text-strong)" }}>
                      Plan your move in a few messages.
                    </h1>
                    <p className="text-sm leading-relaxed max-w-lg" style={{ color: "var(--text)" }}>
                      Describe where you&apos;re moving from and to, plus roughly when. I&apos;ll ask only what matters for an accurate moving brief.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-medium">About 3 minutes</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {["No account needed", "No spam calls", "Anonymous bidding"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border px-3 py-1.5 text-xs font-medium"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg)" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 message-in">
                <AiAvatar />
                <div className="flex-1 max-w-sm">
                  <div className="rounded-3xl rounded-tl-lg px-5 py-4 shadow-card" style={{ backgroundColor: "var(--accent-light)" }}>
                    <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-strong)" }}>
                      Hi, I&apos;m here to help you plan your move. Tell me a bit about it, where you&apos;re moving from and to, and roughly when.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex gap-3 message-in">
              <AiAvatar />
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-3xl rounded-tl-lg px-5 h-12 bg-white shadow-card">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-sm border"
              style={{ backgroundColor: "#fff5f5", borderColor: "#fecaca", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          {briefComplete && briefId && (
            <div className="message-in">
              <div className="rounded-3xl border p-6 bg-white shadow-card-md" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                      Your moving brief is ready
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Matched with moving companies in your area
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/brief/${briefId}`)}
                  className="w-full font-semibold text-sm py-3 rounded-xl text-white transition-all btn-press hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  View bids
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {!briefComplete && (
        <div className="border-t shrink-0 bg-white" style={{ borderColor: "var(--border-light)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your move..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none outline-none px-4 py-3 text-[15px] transition-all rounded-2xl border bg-white disabled:opacity-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-strong)",
                  lineHeight: "1.5",
                  minHeight: "48px",
                  maxHeight: "200px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(30,43,60,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 200)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all btn-press disabled:opacity-30"
                style={{ backgroundColor: "var(--primary)", color: "white" }}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-center mt-2.5" style={{ color: "var(--text-muted)" }}>
              Enter to send | Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AiAvatar() {
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-card"
      style={{ backgroundColor: "var(--primary)", color: "white" }}
    >
      <Sparkles className="w-3.5 h-3.5" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
      style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}
    >
      <User className="w-3.5 h-3.5" />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const hasBrief = !isUser && containsJsonBrief(message.content);
  const displayText = !isUser ? stripJsonBlock(message.content) : message.content;

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse message-in">
        <UserAvatar />
        <div className="flex justify-end flex-1">
          <div
            className="rounded-3xl rounded-tr-lg px-5 py-3.5 max-w-sm text-[15px] leading-relaxed whitespace-pre-wrap text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {displayText}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 message-in">
      <AiAvatar />
      <div className="flex-1 max-w-sm">
        <div
          className="rounded-3xl rounded-tl-lg px-5 py-4 shadow-card text-[15px] leading-relaxed whitespace-pre-wrap"
          style={{ backgroundColor: "var(--accent-light)", color: "var(--text-strong)" }}
        >
          {displayText}
        </div>
        {hasBrief && (
          <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <svg className="w-3.5 h-3.5" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Moving brief generated
          </div>
        )}
      </div>
    </div>
  );
}

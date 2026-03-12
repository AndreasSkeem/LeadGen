"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChatMessage } from "@/lib/types";

interface ApiResponse {
  reply: string;
  briefId: string | null;
  error?: string;
}

// Strip the ```json ... ``` block from display — we show it differently
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

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
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

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "Something went wrong");
        }

        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900 tracking-tight text-sm">
            LeadGen
          </Link>
          <span className="text-xs text-gray-400">Moving qualification</span>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Intro message when no messages yet */}
          {messages.length === 0 && (
            <div className="flex gap-4">
              <Avatar role="assistant" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-5 py-4 max-w-lg">
                  <p className="text-[15px] text-gray-800 leading-relaxed">
                    Hi, I&apos;m here to help you plan your move. Tell me a bit about it — where
                    are you moving from and to, and roughly when?
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message history */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-4">
              <Avatar role="assistant" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-5 py-4 inline-flex items-center gap-1.5 h-12">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Brief complete — CTA */}
          {briefComplete && briefId && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-6">
              <p className="text-sm font-medium text-brand-700 mb-1">
                Your moving brief is ready
              </p>
              <p className="text-sm text-brand-600 mb-4">
                We&apos;ve matched you with moving companies. See their bids now.
              </p>
              <button
                onClick={() => router.push(`/brief/${briefId}`)}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                View bids →
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      {!briefComplete && (
        <div className="border-t border-gray-100 bg-white shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your move…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 transition-colors min-h-[48px] max-h-[200px] overflow-auto disabled:opacity-50"
                style={{
                  height: "auto",
                  lineHeight: "1.5",
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 200) + "px";
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="shrink-0 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl w-12 h-12 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <div className="shrink-0 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const hasBrief = !isUser && containsJsonBrief(message.content);
  const displayText = !isUser ? stripJsonBlock(message.content) : message.content;

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={message.role} />
      <div className={`flex-1 ${isUser ? "flex justify-end" : ""}`}>
        <div
          className={`
            rounded-2xl px-5 py-4 max-w-lg text-[15px] leading-relaxed whitespace-pre-wrap
            ${
              isUser
                ? "bg-brand-500 text-white rounded-tr-sm"
                : "bg-gray-50 text-gray-800 rounded-tl-sm"
            }
          `}
        >
          {displayText}
        </div>
        {hasBrief && (
          <div className="mt-2 ml-0 text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Moving brief generated
          </div>
        )}
      </div>
    </div>
  );
}

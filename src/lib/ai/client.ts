// OpenRouter API client — server-side only

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

// Model options (swap by uncommenting one):
// "google/gemini-2.5-flash-lite"     — $0.10/$0.40 per M tokens, fast, good multilingual (DEFAULT)
// "google/gemini-2.5-flash"          — $0.30/$2.50 per M tokens, stronger reasoning
// "google/gemini-3-flash-preview"    — $0.50/$3.00 per M tokens, latest, best quality
// "deepseek/deepseek-chat"           — ~$0.14/$0.28 per M tokens, strong but China-hosted
// "anthropic/claude-3.5-haiku"       — $1.00/$5.00 per M tokens, reliable but pricier
const CHAT_MODEL = "google/gemini-2.5-flash-lite";

export const QUALIFICATION_MODEL = process.env.AI_MODEL ?? CHAT_MODEL;

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string = QUALIFICATION_MODEL
): Promise<string> {
  const apiKey = process.env.API_KEY_OPENROUTER;
  if (!apiKey) {
    throw new Error("API_KEY_OPENROUTER environment variable is not set");
  }

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/AndreasSkeem/Findli",
      "X-Title": "Findli",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter response");
  }
  return content;
}

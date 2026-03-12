# LeadFlow — AI-Powered Lead Generation for Moving Services (Scandinavia)

## Project overview

LeadFlow is a two-sided marketplace that connects people who need to move (home or office) with moving companies (flyttefirmaer) in Scandinavia. An AI qualification engine has a conversation with the customer to understand their move, produces a structured anonymous brief, and routes it to matched providers who can bid on the job.

This project is being built in two phases:
1. **Mock POC** — demonstrates the full flow with hardcoded providers and simulated bids. Purpose: co-founder alignment.
2. **Investor POC** — same architecture, but with a real provider database, polished UI, multi-scenario handling, and a provider dashboard. Purpose: demonstrate viability to investors.

Both phases share the same codebase. The mock POC is a subset of the investor POC, not a throwaway prototype.

## Architecture

```
leadflow/
├── CLAUDE.md                    # You are here
├── .claudeignore                # Prevents Claude Code from reading secrets
├── .env.local                   # API keys (never committed, never read by Claude Code)
├── package.json
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Landing / entry point
│   │   ├── qualify/page.tsx     # Customer qualification chat
│   │   ├── brief/[id]/page.tsx  # Anonymous brief view (customer sees bids)
│   │   └── provider/page.tsx    # Provider dashboard (sees briefs, submits bids)
│   ├── components/
│   │   ├── chat/                # Chat UI components
│   │   ├── brief/               # Brief display components
│   │   ├── provider/            # Provider-facing components
│   │   └── ui/                  # Shared UI primitives
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts        # OpenRouter API client
│   │   │   └── prompts.ts       # System prompts for qualification
│   │   ├── matching/
│   │   │   ├── match.ts         # Matching algorithm (provider <-> brief)
│   │   │   └── score.ts         # Scoring logic
│   │   ├── types.ts             # Shared TypeScript types
│   │   └── data/
│   │       ├── providers.ts     # Provider database (hardcoded for mock, DB for investor)
│   │       └── scenarios.ts     # Test scenarios for demo purposes
│   └── styles/
│       └── globals.css
├── prompts/
│   └── qualification.md         # The full system prompt for the AI qualifier
└── docs/
    ├── brief-schema.md          # Schema documentation for the structured brief
    ├── matching-logic.md        # How matching works
    ├── providers-seed.md        # Seed provider data
    └── demo-scenarios.md        # Test scenarios for demos
```

## Tech stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **AI**: OpenRouter API (model-agnostic — start with cheap models like google/gemma-2-9b-it or anthropic/claude-3.5-haiku, swap freely)
- **State**: React state + context (no external state management for now)
- **Database**: None for mock POC. For investor POC, add Supabase or similar.

## OpenRouter integration

All AI calls go through OpenRouter. The client should be a thin wrapper:

```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.API_KEY_OPENROUTER}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "anthropic/claude-3.5-haiku", // easily swappable
    messages: [...],
  }),
});
```

The model name should be configurable — ideally a constant at the top of `client.ts` or an env variable so we can swap models without code changes. Start with cheap models. Frontier models are not needed for the qualification conversation.

## Key design decisions

### The qualification conversation
The AI doesn't use a fixed form. It has a natural conversation guided by a structured prompt that ensures it extracts all required fields for the brief. The prompt is in `prompts/qualification.md`. The conversation should feel like talking to a knowledgeable moving consultant.

### The anonymous brief
After qualification, the AI produces a structured JSON brief. This is the core data object. It contains everything a moving company needs to estimate the job, but NOT the customer's identity or exact address. See `docs/brief-schema.md`.

### Provider matching
For the mock POC, matching is deterministic based on geography and service type. See `docs/matching-logic.md`.

### The bidding model
Providers see the anonymous brief and submit a bid (price range, timeline, brief message). The customer sees bids without provider identity. When they select a provider to "connect" with, both sides are revealed. The connection is the monetisation trigger.

## Coding standards

- All components are functional React with hooks
- TypeScript strict mode — no `any` types
- Keep components small and focused
- All AI-related code in `src/lib/ai/`
- All matching logic in `src/lib/matching/`
- Data layer abstracted behind interfaces (swap hardcoded for DB without rewriting logic)
- Use server actions or API routes for AI calls — never expose API keys client-side
- English UI for now, structured for easy i18n later. The AI qualification conversation adapts to the customer's language (DA/SV/NO/EN).

## Phase 1: Mock POC scope

Build the following and nothing more:

1. **Landing page** — simple, explains what LeadFlow does. One CTA: "Plan your move"
2. **Qualification chat** — conversational UI where the AI asks about the move. Must handle:
   - Private home move (privatflytning)
   - Office/business move (erhvervsflytning)
   - Single item / heavy item move (storflytning — piano, safe, etc.)
   - International move within/out of Scandinavia
   - Storage needs (opmagasinering)
3. **Brief output** — after qualification, show the structured anonymous brief
4. **Provider match view** — show 3 matched providers (from hardcoded list) with simulated bids
5. **Connection flow** — customer selects a provider, "connect" confirmation (simulated)

Hardcoded providers: 8-10 real Scandinavian moving companies. See `docs/providers-seed.md`.

## Phase 2: Investor POC additions (do NOT build yet)

- Provider dashboard with login
- Real bid submission flow
- Multiple simultaneous briefs
- Provider profiles with ratings
- Analytics dashboard
- Supabase backend
- Mobile-responsive polish
- Web search fallback for unmatched areas (if no provider in DB, search for local movers)

## Things to get right

- The AI must feel knowledgeable about moving in Scandinavia: typical apartment sizes, elevator access issues, storage options, cross-border customs/rules for international moves, typical pricing ranges
- The anonymous brief must be detailed enough that a real moving company could estimate the job
- UI: clean, professional, Scandinavian design sensibility — restrained, functional, confident
- Matching should feel logical and explainable

## Environment variables

```
API_KEY_OPENROUTER=your-key-here
```

These are stored in `.env.local` which is listed in `.claudeignore` and `.gitignore`.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Lint check
```
# Findli — AI-Powered Lead Generation for Moving Services (Scandinavia)

## Project overview

Findli is a two-sided marketplace that connects people who need to move (home or office) with moving companies (flyttefirmaer) in Scandinavia.

The customer completes a guided intake that feels conversational but is structured underneath. The platform turns the intake into a structured anonymous brief, applies matching and pricing logic, and routes the brief to relevant providers. Where available, providers can participate in instant rule-based offers via auto-offer settings; otherwise the lead can be sent for manual quoting.

This project is being built in phases:
1. **Mock POC (Phase 1a)** — basic flow: chat → brief → simulated bids → connection. Purpose: co-founder alignment. **DONE.**
2. **Enhanced Mock POC (Phase 1b)** — realistic pricing, polished bid cards, summary card, connection flow, demo mode. Purpose: demo-ready for co-founder. See PROMPT_PHASE_1B.md.
3. **Investor POC (Phase 2)** — real provider database, provider dashboard, multi-scenario polish, analytics. Purpose: demonstrate viability to investors.

All phases share the same codebase. Each phase extends the previous one.

## Architecture

```
leadflow/
├── CLAUDE.md                    # You are here
├── .claudeignore                # Prevents Claude Code from reading secrets
├── .env.local                   # API keys (never committed, never read by Claude Code)
├── package.json
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing / entry point
│   │   ├── qualify/page.tsx     # Customer guided intake
│   │   ├── brief/[id]/page.tsx  # Anonymous brief + matched offers view
│   │   └── provider/page.tsx    # Provider dashboard
│   ├── components/
│   │   ├── intake/              # Guided intake UI components
│   │   ├── brief/               # Brief and offers display components
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

### The qualification flow
The customer experience should not be a long freeform chatbot conversation.

Instead, use a guided intake flow that feels conversational in tone and presentation, but is structured underneath. The system should collect only the information needed for pricing, feasibility, and supplier matching.

Use AI only where it adds real value, such as:
- interpreting free-text input
- estimating structured fields from rough descriptions
- deciding whether a conditional follow-up is needed
- generating the structured anonymous brief

The goal is to reach a bid-ready lead with as little friction as possible.

### The anonymous brief
After qualification, the AI produces a structured JSON brief. This is the core data object. It contains everything a moving company needs to estimate the job, but NOT the customer's identity or exact address. See `docs/brief-schema.md`.

### Provider matching
For the mock POC, matching is deterministic based on geography and service type. See `docs/matching-logic.md`.

### The offer and bidding model
Providers respond to structured briefs / leads.

On the customer side, the platform may show:
- instant estimates (rule-based offers generated from provider settings)
- confirmed quotes
- quote-on-request states

The UI must not imply that all offers are live manual bids if some are rule-generated.

When a customer chooses to connect with a provider, both sides are revealed. The connection is the monetisation trigger.

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

1. **Landing page** — simple, explains what Findli does. One CTA: "Plan your move"
2. **Guided intake** — structured step-based qualification flow with conversational UX. Must handle:
   - Private home move (privatflytning)
   - Office/business move (erhvervsflytning)
   - Single item / heavy item move (storflytning — piano, safe, etc.)
   - International move within/out of Scandinavia
   - Storage needs (opmagasinering)
3. **Brief output** — after qualification, show the structured anonymous brief
4. **Matching interstitial** — a short credible loading/progress screen before results
5. **Provider match view** — show 3 matched providers / offers (from hardcoded list), including instant estimates where relevant
6. **Connection flow** — customer selects a provider, requests a confirmed quote, or declines / adjusts

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
- The qualification UX should feel fast and guided, not like a long chatbot interview
- Matching should be visible and explainable, with concrete reasons why providers were selected
- Instant estimates must be clearly distinguished from confirmed manual quotes

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

# Findli Repo Guide — Phase 1 Marketplace Build

## What this repo is now

Findli is currently a polished mock demand-side experience for moving services.

The implemented app today is still mostly a simulation:
- multilingual landing page
- structured intake flow at `/qualify`
- deterministic brief generation with optional AI summary refinement
- brief review page
- simulated matched offers page using hardcoded providers and local pricing logic

It is **not yet** a real live marketplace.

Missing today:
- database persistence
- provider accounts / auth
- live bid submission
- payments
- admin tooling
- trust / dispute / outcome tracking
- real provider network and routing rules

## Product truth

Do not describe the product as something it is not.

Be precise:
- The current main user flow is structured and rule-based.
- AI is optional and secondary in the current repo.
- Simulated offers are **not** live provider quotes.
- Hardcoded providers are **not** a real marketplace network.

When updating product copy or docs, never imply live bidding, real providers, or AI-first matching unless that functionality is actually implemented.

## What we are building next

The goal is **not** to jump to a full marketplace.
The goal is to turn the current mock into a **measurable V1 transaction and learning core**.

Primary goal:
- prove that selected matches can be higher quality than ordinary lead-gen

That means the next phase should optimize for:
- structured demand
- structured supply
- contact reveal after customer selection
- outcome tracking
- quote reliability tracking
- change-order visibility
- dispute logging

## What matters strategically

Findli should not optimize for the cheapest offer.
It should optimize for the offer **most likely to survive contact, survive execution, and still feel fair afterward**.

The long-term moat is not “AI”.
It is:
- local liquidity in a narrow wedge
- better closed-loop outcome data
- better trust metrics
- better supplier economics
- workflow usefulness for suppliers

## Current architecture facts

Important routes and files:
- `src/app/page.tsx` — landing page
- `src/app/qualify/page.tsx` — 5-step intake flow
- `src/app/api/intake/route.ts` — intake endpoint
- `src/lib/intake/build-brief.ts` — normalized brief generation
- `src/app/brief/[id]/page.tsx` — brief review
- `src/app/brief/[id]/offers/page.tsx` — simulated offer page
- `src/app/api/brief/[id]/route.ts` — fetch brief + offers
- `src/lib/matching/*` — deterministic provider scoring
- `src/lib/pricing/estimate.ts` — local estimate logic
- `src/lib/store.ts` — in-memory `Map`, ephemeral

## Build priorities in order

### 1. Persistence and event model
Replace ephemeral in-memory storage with a real database-backed domain model.

Canonical marketplace flow:
`request -> brief -> provider candidates -> bid -> customer selection -> contact reveal -> change orders -> completion / cancellation -> final price -> dispute / review`

Core entities to introduce incrementally:
- CustomerRequest / Brief
- Provider
- ProviderProfile
- Bid
- Selection
- Reveal
- ChangeOrder
- JobOutcome
- Dispute
- Review / Rating
- EventLog

Do not implement every edge case at once.
Start with the minimum schema that supports measurement.

### 2. Operator-assisted live workflow
Before building a full provider dashboard, support an operator-assisted workflow.

Examples:
- internal admin can seed / approve providers
- internal admin can mark bids as live vs simulated
- internal admin can trigger reveal
- internal admin can record outcomes

This is better than overbuilding auth and self-serve features too early.

### 3. Minimal provider workflow
After persistence exists, add the smallest possible live provider input path.

Prefer:
- structured provider bid submission
- bid type: `binding`, `bounded_estimate`, `survey_required`
- explicit assumptions field
- simple provider access links or lightweight auth

Avoid building a full CRM before the core loop works.

### 4. Trust and reliability layer
The product advantage should come from reliability metrics, not generic review stars.

Eventually track:
- response speed
- selection rate
- completion rate
- quote-held rate
- change-order rate
- cancellation rate
- dispute rate
- customer would choose again

## What not to build yet

Do **not** prioritize these before the transaction loop works:
- deep ERP integrations
- advanced ML ranking
- generalized expansion beyond moving
- broad marketplace growth features
- complex payment flows
- premium visual redesigns
- broad SEO content expansion

Use heuristics first. Learn from real transactions. Add ML later.

## Coding rules for this repo

1. Preserve the current multilingual flow.
2. Keep changes incremental and PR-sized.
3. Do not rewrite working UI without reason.
4. Prefer extending existing types and modules over parallel abstractions.
5. Keep domain logic server-side where practical.
6. Add small helper utilities instead of giant utility files.
7. Keep deterministic fallbacks when AI is optional.
8. If adding “live” behavior, clearly separate it from simulated/mock behavior.
9. Make it easy to inspect outcomes in code and in the UI.
10. Instrument every major transition in the marketplace flow.

## Data and schema guidance

Design for measurement from day one.

Every request / bid / reveal / outcome should be traceable.

At minimum capture:
- timestamps
- actor type
- locale
- route / destination metadata
- scope metadata
- pricing metadata
- bid type
- reveal state
- completion state
- final price if known
- reason codes for cancellations / repricing / disputes

## Delivery expectations for Claude

When asked to implement something:
1. inspect the existing code paths first
2. explain the minimal viable approach
3. implement incrementally
4. keep simulated and live behaviors clearly separated
5. run relevant validation (`npm run lint`, `npm run build`, targeted tests if present)
6. summarize exactly what changed and what remains mocked

## Preferred decision rule

If there are multiple ways to build something, choose the option that:
- preserves shipping speed
- creates better measurement
- creates less hidden complexity
- keeps future provider workflow possible

The repo should evolve from **mock marketplace** -> **measurable live pilot system** -> **supplier workflow product**.

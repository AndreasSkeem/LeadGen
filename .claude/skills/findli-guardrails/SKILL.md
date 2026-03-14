# Findli Guardrails Skill

Use this skill when editing product copy, architecture notes, routes, or UX flows.

## Main purpose

Prevent the repo from drifting into false claims, overbuilt architecture, or accidental breakage of the current mock flow.

## Truthfulness guardrails

Never claim the product has any of the following unless it is truly implemented:
- live provider marketplace
- real provider bids
- real provider network
- production payments
- real authentication
- AI-native qualification as the main live path
- database-backed persistence

Be precise about what is:
- simulated
- rule-based
- optional AI
- in-memory only

## Scope guardrails

When making changes, avoid jumping to:
- deep ERP integrations
- full provider dashboards
- broad category expansion
- generalized marketplace infra
- heavy ML ranking systems

Prefer the smallest change that improves:
- measurability
- reliability
- pilot readiness

## UX guardrails

- Preserve multilingual support (`da`, `sv`, `no`, `en`).
- Keep existing routes stable unless a route change is necessary.
- Keep intake bid-ready and structured.
- Do not add clever interactions that reduce clarity.
- Do not let pricing visuals imply a guaranteed live quote unless it is one.

## Engineering guardrails

- Avoid giant rewrites.
- Keep domain state explicit.
- Add types for new states and enums.
- Prefer composable helpers to monolithic services.
- Keep fallback behavior when external AI fails.

## Documentation guardrails

Whenever behavior changes, update the nearest relevant docs.
If the system is partly mocked and partly real, say so plainly.

## Release guardrails

Before calling a task complete:
- run lint
- run build if the task touches app behavior
- note what remains mocked
- note any migration / env / seeding steps

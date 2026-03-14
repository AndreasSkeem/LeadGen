# Findli V1 Marketplace Skill

Use this skill when the task involves moving Findli from a simulated intake product toward a real, measurable marketplace pilot.

## Goal

Build the **transaction and learning core** first.
Do not jump straight to a large self-serve marketplace.

## Default mindset

Ask:
- Does this change help us measure real marketplace quality?
- Does this reduce fake complexity?
- Does this preserve the current demand-side flow while making the back-end more real?

## Preferred build order

1. Persistence
2. Canonical domain model
3. Operator-assisted live workflow
4. Minimal provider bid input
5. Outcome / dispute / quote-hold tracking
6. Supplier analytics and workflow improvements

## Core domain model

Model the marketplace as:
`request -> brief -> bid -> selection -> reveal -> change order -> outcome`

Minimum entities:
- `CustomerRequest`
- `Brief`
- `Provider`
- `Bid`
- `Selection`
- `Reveal`
- `JobOutcome`
- `EventLog`

Only add `Dispute`, `Review`, or `ChangeOrder` tables once the simpler flow exists, unless the task explicitly asks for them.

## Product rules

- Keep the current `/qualify` flow working.
- Do not present simulated offers as live offers.
- If a feature is still mocked, label it clearly in code and docs.
- Prefer server-side domain logic and validation.
- Make every state transition observable.

## Implementation style

- Reuse existing types where sensible.
- Prefer additive refactors over rewrites.
- Keep routes stable if possible.
- Use explicit enums / literals for marketplace states.
- Add clear fixtures or seed data for local testing.

## If adding provider bidding

Require structured bids:
- bid type: `binding` | `bounded_estimate` | `survey_required`
- price or price range
- assumptions
- validity window
- service inclusions / exclusions

## If adding ranking

Start with heuristics, not ML.
Good first-order ranking inputs:
- geography fit
- move type fit
- capacity fit
- verification state
- reliability score
- quote-hold score
- response speed

## Definition of done

A task is only “done” if:
- the code path is clear
- validation is present where needed
- mocked vs live behavior is explicit
- lint/build still pass
- the final summary explains what is still not real

# Moving Lead Generator — Required Information for Guided Intake and Bidding

This document defines the minimum information the platform should collect in order to generate useful moving offers and supplier bids.

The intake experience may look conversational to the customer, but it should behave like a structured guided intake underneath.

The goal is simple:
- ask only questions that affect price, feasibility, or routing
- avoid random questions that do not change the bid
- separate required fields from conditional follow-up questions
- reach a bid-ready structured lead with as little friction as possible

---

## 1. Core principle

The intake flow should only collect information that is needed for one of these purposes:

1. Can the move be priced?
2. Can the mover actually perform it?
3. Can the job be routed to the right suppliers?
4. Are there special risks, constraints, or add-ons?

If a question does not materially affect one of those four things, it should usually not be asked before creating offers or bids.

The customer-facing experience can be conversational, but the underlying system should optimize for structured intake rather than long freeform chat.

---

## 2. Minimum information required to create a bid

These are the fields that should almost always be collected before a supplier can make a meaningful bid.

### A. Contact and lead basics
- Full name
- Phone number
- Email address
- Preferred contact method
- Whether the customer is ready to receive bids now

### B. Move timing
- Move date
- Time flexibility:
  - exact date only
  - flexible within a few days
  - flexible within a week or more
- Preferred time of day, if relevant

### C. Origin and destination
- Pickup address
- Drop-off address
- Distance or route can be derived from the addresses
- Whether either location is inside a restricted access area, city center, island, or otherwise difficult-to-reach location

### D. Property/access details at both ends
For **pickup** and **drop-off**, collect:
- Property type:
  - apartment
  - house
  - office
  - storage unit
  - other
- Floor number
- Elevator available? (yes/no)
- If elevator exists: is it usable for furniture / large items?
- How far is parking/loading area from entrance?
- Are there access issues?
  - narrow stairs
  - no legal parking nearby
  - gated access
  - long carry distance
  - time-restricted loading

### E. Job size / moving volume
At least one of the following must be collected:
- Number of rooms being moved
- Estimated volume in m³
- A structured inventory list
- A size category:
  - small move
  - studio / 1-room
  - 2-room
  - 3-room
  - full house

**Important:** if you do not collect a detailed inventory, then the chatbot must at least estimate volume using a simplified size framework.

### F. Large or special items
Ask whether the move includes any items requiring special handling, for example:
- piano
- American fridge / large refrigerator
- washing machine / dryer
- sofa that may not fit staircases easily
- large wardrobes
- safes
- heavy gym equipment
- fragile artwork / mirrors
- unusually valuable items

### G. Service scope
- Transport only?
- Carrying/loading included?
- Packing included?
- Packing materials needed?
- Disassembly/reassembly needed?
- Temporary storage needed?
- Disposal of unwanted items needed?
- Cleaning needed? (if this may be offered by suppliers)

### H. Feasibility and constraints
- Can the customer help carry? (optional for some suppliers, but relevant)
- Any items that must be moved separately or at a specific time?
- Any deadline constraints for key handover / building access?
- Any insurance-sensitive or high-value contents?

---

## 3. Conditional questions only when relevant

These questions should **not** be asked by default. They should only appear when triggered by a previous answer.

### If apartment or multi-floor building
Ask:
- floor number
- elevator availability
- elevator size/usability
- stairs difficulty

### If long carry distance or poor parking
Ask:
- approximate distance from truck parking to entrance
- whether parking permit or reserved space is needed

### If special items are present
Ask item-specific follow-ups such as:
- approximate weight
- dimensions
- does it require 2+ movers?
- does it require protection, lifting tools, or specialist handling?

### If packing is requested
Ask:
- full packing or partial packing?
- who provides materials?
- how many fragile items / boxes approximately?

### If storage is requested
Ask:
- estimated storage volume
- storage duration
- any climate-sensitive items

### If disposal is requested
Ask:
- what should be disposed of?
- approximate volume / item count
- does it require special disposal?

### If the move date is flexible
Ask:
- acceptable date range
- weekday-only or weekend okay?

---

## 4. Questions that are usually unnecessary before bidding

These questions often create friction unless they directly affect price or feasibility:
- Why are you moving?
- How long have you lived there?
- Detailed family situation
- Whether items have emotional value
- Exact box count before the customer knows it
- Extremely detailed furniture dimensions for every standard item
- Decoration style / interior style
- Employer or income details

These may be relevant later for service quality, but they should usually not block bid generation.

---

## 5. Recommended guided intake flow

The qualification experience should move in this order:

### Step 1 — Route and timing
Collect:
- move date or date range
- pickup address
- drop-off address
- property type at both ends

### Step 2 — Price-critical access information
Collect:
- floor number
- elevator availability
- parking/loading difficulty
- carry distance

### Step 3 — Job size
Collect:
- move size category, room count, or inventory estimate
- confirm whether this is a partial move or full move

### Step 4 — Special items and add-ons
Collect:
- heavy/special items
- packing
- assembly/disassembly
- storage
- disposal

### Step 5 — Contact and bid preferences
Collect:
- name
- phone
- email
- preferred contact method
- ready to receive bids now?
- allow auto-bids where available?
- preferred budget
- any budget cap or “do not exceed” price, if your marketplace supports it

---

## 6. Minimal bid-ready schema

Below is a practical schema for what a lead should contain before being sent to movers.

```yaml
lead_id:
customer:
  name:
  phone:
  email:
  preferred_contact_method:

move:
  move_date:
  date_flexibility:
  preferred_time_window:

  pickup:
    address:
    property_type:
    floor:
    elevator_available:
    elevator_usable_for_furniture:
    parking_distance_meters:
    access_notes:

  dropoff:
    address:
    property_type:
    floor:
    elevator_available:
    elevator_usable_for_furniture:
    parking_distance_meters:
    access_notes:

size:
  size_category:
  room_count:
  estimated_volume_m3:
  inventory_summary:

special_items:
  piano: false
  large_fridge: false
  washing_machine: false
  dryer: false
  safe: false
  gym_equipment: false
  fragile_art: false
  other:

services:
  transport_only: false
  carrying_included: true
  packing_needed: false
  packing_materials_needed: false
  disassembly_needed: false
  reassembly_needed: false
  storage_needed: false
  disposal_needed: false
  cleaning_needed: false

constraints:
  strict_deadline: false
  key_handover_time:
  restricted_access: false
  high_value_items: false
  extra_notes:

bidding:
  ready_for_bids: true
  max_budget:
  allow_auto_bids: true
```

---

## 7. Auto-bidding logic: what suppliers usually need

If suppliers should be able to create automatic bids, the lead must expose the fields that map directly to pricing rules.

Typical pricing inputs:
- distance between pickup and drop-off
- move size / estimated volume
- number of movers needed
- truck size needed
- floor count at pickup and drop-off
- elevator/no elevator
- long carry distance
- special items surcharge
- packing / assembly / storage add-ons
- weekend / peak day surcharge
- restricted access or difficult parking surcharge

So for auto-bidding, the chatbot should prioritize collecting exactly those variables.

---

## 8. Recommended field classification

To avoid random questioning, classify fields like this:

### Tier 1 — Mandatory before any bid
- move date or date range
- pickup address
- drop-off address
- property type at both ends
- floor/elevator/access basics
- move size estimate
- customer contact info

### Tier 2 — Mandatory only if triggered
- special item details
- parking/loading restriction details
- storage details
- packing details
- disposal details

### Tier 3 — Nice to have, not required for initial bid
- photos
- detailed inventory
- exact preferred arrival time
- reason for moving
- extra service preferences not tied to pricing

---

## 9. Recommended guardrails for the intake flow

The intake flow should follow these rules:

1. Do not ask more than one follow-up unless the previous answer triggered it.
2. Do not ask for information already inferable from previous answers.
3. Do not ask detailed inventory questions unless the move size is unclear.
4. Stop asking questions once the lead is bid-ready.
5. Mark unknown fields as unknown instead of endlessly probing.
6. Only ask questions that change price, feasibility, or matching.
7. Prefer guided inputs over open text when the answer maps directly to pricing logic.
8. Use free text only when it meaningfully reduces friction or resolves ambiguity.
---

## 10. Example of a good compact question flow

A strong chatbot flow could be:

1. When are you planning to move?
2. What is the pickup address?
3. What is the destination address?
4. Is each location an apartment, house, office, or storage unit?
5. What floor is each location on, and is there an elevator?
6. Roughly how big is the move: a few items, 1-room, 2-room, 3-room, or full house?
7. Are there any heavy or special items like a piano, washing machine, or very large furniture?
8. Do you need extra services like packing, disassembly, storage, or disposal?
9. What is your name, phone number, and email so movers can send bids?
10. Would you like instant auto-bids where available?

That is often enough to generate an initial bid request.

---

## 11. Example of a bad question flow

This is the kind of flow to avoid:
- asking about box counts before understanding move size
- asking about furniture dimensions for every item
- asking emotional or personal context
- asking multiple niche follow-ups before the core route/date/size/access information is known
- continuing to probe after the lead is already usable

---

## 12. Suggested implementation rule for your AI prompt

You can use a rule like this inside your chatbot prompt:

> Only ask questions required to determine pricing, feasibility, and supplier matching. First collect route, date, access, size, special items, and service add-ons. Ask conditional follow-ups only when triggered by the user's previous answer. Stop when the lead is bid-ready.

---

## 13. Practical definition of “bid-ready”

A lead is **bid-ready** when the platform knows:
- where the move starts and ends
- when it happens
- how difficult access is at both ends
- roughly how large the move is
- whether special items or add-on services are involved
- how to contact the customer

Once those are known, suppliers should be able to:
- submit a fixed bid
- submit a conditional bid
- counter-offer
- or let pricing rules generate an auto-bid

---

## 14. Final recommendation

For a moving lead marketplace, your AI should optimize for:
- **fewest questions possible**
- **highest bid accuracy possible**
- **clear separation between mandatory and conditional questions**
- **structured outputs rather than long chat transcripts**

The best chatbot is not the one that asks the most questions.
It is the one that gets to a **bid-ready structured lead** with the least friction.

---

## 15. Matching transparency for the customer

After intake is complete, the platform may show a short matching/progress state before presenting results.

This should communicate credible platform work, such as:
- analyzing move requirements
- checking provider service areas
- applying auto-offer pricing rules
- comparing supplier fit, price range, and availability
- preparing ranked matches

When presenting results, each offer should show why it matched, for example:
- within budget
- serves this route
- good rating for this move type
- special-item capable
- instant estimate available

The matching screen should feel trustworthy and concrete, not exaggerated or “fake AI”.
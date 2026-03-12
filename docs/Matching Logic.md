# Matching Logic

## How matching works

When a brief is created, the matching engine scores every provider against the brief and returns the top 3-5 matches.

## Scoring dimensions

### Geography (weight: 40%)
Match is based on the ORIGIN location (where the move starts — that's where the truck needs to be).
- Same municipality: 100%
- Same region: 70%
- Adjacent region: 40%
- Same country but distant: 15%
- Different country: 5% (unless provider explicitly handles cross-border)

### Service fit (weight: 30%)
- Provider offers the exact move type (private, office, international, etc.): 100%
- Provider is a generalist: 50%
- Provider doesn't list this service type: 0%

Special item handling matters: if the brief includes a piano and the provider lists piano moving as a specialty, boost the score.

### Job size fit (weight: 15%)
- Job within provider's typical range: 100%
- Mismatch: 20%

### Availability (weight: 15%)
- Available around requested date: 100%
- Busy but accepting quotes: 50%
- Inactive: 0%

## Mock POC implementation

Simplified:
1. Filter by country
2. Filter by region
3. Score by service type overlap
4. Return top 3

## Simulated bid generation — pricing reference

These ranges are based on actual 2026 market prices. Use them to generate
realistic simulated bids. Each bid should vary within the range to show
competition (e.g., one cheaper, one mid, one premium).

### Denmark (DKK, all prices incl. moms)

**Hourly rates (the building block):**
- 1 mover + van: 600-800 DKK/hour
- 2 movers + truck: 900-1,100 DKK/hour
- 3 movers + truck: 1,200-1,500 DKK/hour
- Minimum booking: 2 hours

**Fixed price estimates by job type:**
- Studio / 1 room, same city, ground floor or elevator: 1,800-3,500 DKK
- Studio / 1 room, same city, walkup 3rd+: 2,500-5,000 DKK
- 2 rooms, same city, elevator: 3,000-6,000 DKK
- 2 rooms, same city, walkup: 4,000-8,000 DKK
- 3-4 rooms, same city: 6,000-12,000 DKK
- Full house, same city: 10,000-20,000 DKK
- Cross-city (e.g., CPH to Aarhus, ~300 km): 12,000-25,000 DKK
- Cross-city (e.g., CPH to Aalborg, ~400 km): 15,000-30,000 DKK

**Surcharges:**
- Floor without elevator: 300-500 DKK per floor (each end)
- Heavy item (>80 kg): 300-500 DKK per item
- Weekend/evening: +25-50% on hourly rate
- Parking permit (central CPH): 200-400 DKK

**Add-on services:**
- Full packing service: add 40-60% to base price
- Storage: 100-250 DKK per cubic metre per month
- Cleaning (slutrengoring): 1,500-3,500 DKK depending on size

### Sweden (SEK, all prices incl. moms, BEFORE RUT)

Note: Sweden has RUT-avdrag (50% tax deduction on labour cost).
Show prices both before and after RUT where relevant.

**Hourly rates (before RUT):**
- 2 movers + truck: 990-1,300 SEK/hour (495-650 after RUT)
- 3 movers + truck: 1,300-1,700 SEK/hour

**Fixed price estimates (before RUT / after RUT):**
- 1 room (35 sqm): 3,200-4,500 / 1,600-2,250 SEK
- 2 rooms (55 sqm): 5,000-7,000 / 2,500-3,500 SEK
- 3 rooms (75 sqm): 7,000-11,000 / 3,500-5,500 SEK
- Villa (130 sqm): 12,000-18,000 / 6,000-9,000 SEK
- Long distance (Stockholm to Gothenburg): from 12,900 SEK before RUT
- Long distance (Stockholm to Malmo): from 14,900 SEK before RUT

### Norway (NOK)

Norwegian prices tend to be 20-40% higher than Danish equivalents.
- 1 room apartment, same city: 3,000-6,000 NOK
- 2-3 rooms, same city: 6,000-14,000 NOK
- Full house, same city: 15,000-30,000 NOK
- Heavy item (piano): 3,000-10,000 NOK depending on floor/access

### International moves
- Within Scandinavia (e.g., CPH to Stockholm): 15,000-40,000 DKK
- To EU (e.g., CPH to Berlin): 20,000-50,000 DKK
- To non-EU (e.g., CPH to London, post-Brexit): 25,000-60,000 DKK
  - Note: customs paperwork adds 2,000-5,000 DKK in admin fees
- Intercontinental: 40,000-150,000+ DKK (sea freight vs air)

## How to generate a simulated bid

Given a brief:
1. Determine the base price range from the tables above using: country, move type, number of rooms/size, and distance
2. Adjust for: floor level (if no elevator), special items, packing services
3. Generate 3 bids within the adjusted range:
   - Budget bid: lower 25th percentile, minimal extras
   - Standard bid: middle of range, includes basic protection
   - Premium bid: upper range, includes extras like packing materials and insurance upgrade
4. Add realistic timeline: "Available [date], estimated [X] hours"
5. Add a short provider message that feels human, e.g. "Vi har god erfaring med lejligheder paa Norrebro og kender adgangsforholdene godt."

## Investor POC additions

- Historical win rate per provider
- Response time ranking
- Customer ratings
- Seasonal pricing (summer peak: June-August, +10-20%)
- Verified insurance and DMF/Bohag 2010 membership
- RUT-avdrag calculation built into Swedish quotes
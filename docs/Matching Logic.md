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

Special item handling matters here: if the brief includes a piano and the provider lists piano moving as a specialty, boost the score.

### Job size fit (weight: 15%)
- Job is within provider's typical range (solo person with a studio → small provider is fine; 200-person office → need a big operator): 100%
- Mismatch: 20%

### Availability (weight: 15%)
- Available around the requested date: 100%
- Busy but accepting quotes: 50%
- Inactive: 0%

## Mock POC implementation

Simplified for mock:
1. Filter by country
2. Filter by region
3. Score by service type overlap
4. Return top 3

Simulated bid generation (rough ranges in DKK):
- Studio/1-room apartment, same city: 2,000-5,000
- 2-3 room apartment, same city: 5,000-12,000
- Full house, same city: 10,000-25,000
- Cross-city (e.g., CPH → Aarhus): 15,000-35,000
- International within Scandinavia: 20,000-60,000
- International outside Scandinavia: 30,000-100,000+
- Office move (small): 15,000-40,000
- Office move (large): 50,000-200,000+
- Single heavy item: 1,500-8,000

Floor surcharge: ~500-1,500 DKK per floor without elevator.

## Investor POC additions

- Historical win rate per provider
- Response time ranking
- Customer ratings
- Seasonal availability (summer is peak moving season in Scandinavia)
- Verified insurance coverage
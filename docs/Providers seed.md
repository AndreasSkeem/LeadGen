# Provider Data — Seed File

Hardcoded providers for the mock POC. Real Scandinavian moving companies.
When building `providers.ts`, research each briefly to make descriptions
accurate. If uncertain, keep descriptions plausible.

## Provider schema

```typescript
interface Provider {
  id: string;
  company_name: string;
  country: "DK" | "SE" | "NO";
  region: string;
  municipality: string;
  services: MoveType[];           // private, office, heavy_items, international, storage
  specialties: string[];          // e.g. "piano moving", "art transport", "senior moves"
  typical_job_size: "small" | "medium" | "large" | "all";
  description: string;
  years_in_business: number;
  employees_approx: number;
  rating: number;                 // Simulated, 4.0-4.9
  response_time_hours: number;    // Simulated, 1-24
  available: boolean;
}
```

## Seed providers

### Denmark

1. **Flyttegaranti** — København/Hovedstaden
   - Full-service private and office moves
   - Known for fixed-price guarantees
   - All sizes

2. **3-Mand Flytte- & Transportfirma** — København/Hovedstaden
   - Budget-friendly private moves in greater Copenhagen
   - Small to medium jobs
   - Fast booking

3. **Stark Flytte & Transport** — Midtjylland, Aarhus area
   - Private and office moves across Jylland
   - Storage facilities available
   - Medium to large

4. **Bahns Flytteforretning** — Syddanmark, Odense area
   - Established, traditional mover
   - Full packing service, international moves within EU
   - All sizes

5. **Nordisk Flyttecenter** — Hovedstaden / nationwide DK
   - International moves specialist (Scandinavia, EU, worldwide)
   - Also handles domestic long-distance
   - Storage facilities
   - Medium to large

### Sweden

6. **Flyttfirma Stockholm - Flytt AB** — Stockholm region
   - Urban apartment moves, strong on elevator-less buildings
   - Private moves, small to medium

7. **Göteborgs Flytt & Städ AB** — Västra Götaland, Gothenburg
   - Combined moving and cleaning service
   - Private and small office moves
   - Packing services

8. **Nordic Relocations AB** — Stockholm / nationwide SE
   - Corporate relocations and international moves
   - Premium service, large jobs
   - IT equipment specialist

### Norway

9. **Majorstuaflytting AS** — Oslo/Viken
   - Urban specialist, Oslo apartment moves
   - Private moves, piano transport
   - Small to medium

10. **Bergen Flyttebyrå AS** — Vestland, Bergen
    - Private and office moves in western Norway
    - Experienced with difficult access (steep terrain, narrow Bergen streets)
    - All sizes

## Notes

- Company names approximate real businesses for demo realism. For the
  investor POC, verify with actual company data or anonymise.
- Ratings: use 4.1-4.8 range. Response times: 1-12 hours.
- At least 2-3 providers should match any given Danish urban scenario to
  demonstrate the bidding competition.
# Demo Scenarios

Test and demo scenarios for the qualification flow.

## Scenario 1: Apartment move within Copenhagen

**Customer profile**: Young professional moving from Nørrebro to Frederiksberg
**Opening message**: "Hej, jeg skal flytte fra en 2-værelses på Nørrebro til Frederiksberg i slutningen af juni."

Expected qualification path:
- AI identifies: private move, same city, has date
- Should ask: floor level + elevator at both ends, how much stuff, special items, packing preference
- Should flag: parking in central Nørrebro can be tricky — mention that permits may be needed
- Brief: private, apartment, 2 rooms, København/Hovedstaden/DK → same, June 2026
- Matched providers: Flyttegaranti, 3-Mand Flytte

## Scenario 2: Family house move, Copenhagen to Aarhus

**Customer profile**: Family with kids relocating for work
**Opening message**: "We're moving our family from a house in Rudersdal to Aarhus this summer. It's a full household — 4 bedrooms, garage full of stuff."

Expected qualification path:
- AI identifies: private, long-distance, large move, summer
- Should ask: special items, packing service wanted?, storage gap?, destination details
- Should flag: summer is peak season — book early for better rates
- Brief: private, house, ~150m², Rudersdal/Hovedstaden/DK → Aarhus/Midtjylland/DK, large volume
- Matched providers: Flyttegaranti (national), Nordisk Flyttecenter (long-distance), Stark Flytte (Aarhus-based)

## Scenario 3: Office move in Stockholm

**Customer profile**: Startup moving to a larger office
**Opening message**: "Vi ska flytta vårt kontor, ca 25 anställda, från Södermalm till Kista. Behöver flytta under en helg."

Expected qualification path:
- AI identifies: office move, Sweden, weekend requirement, ~25 workstations
- Should ask: IT equipment handling, furniture situation, any special equipment, elevator/loading dock
- Brief: office, 25 employees, Stockholm/Stockholm/SE, weekend move required
- Matched providers: Nordic Relocations AB (corporate specialist), Flytt AB

## Scenario 4: Piano transport in Oslo

**Customer profile**: Musician moving a grand piano
**Opening message**: "Jeg trenger å flytte et flygel fra en leilighet i 3. etasje uten heis til et hus i Bærum."

Expected qualification path:
- AI identifies: heavy/special item, no elevator, 3rd floor
- Should ask: piano type/size, doorway/staircase width, destination access, insurance requirements
- Should flag: grand piano from 3rd floor walkup is a specialist job — crane may be needed
- Brief: heavy_items, grand piano, 3rd floor no elevator, Oslo/Oslo/NO → Bærum/Viken/NO
- Matched providers: Majorstuaflytting AS (piano transport specialist)

## Scenario 5: International move, Denmark to UK

**Customer profile**: Expat leaving Denmark
**Opening message**: "Jeg skal flytte fra København til London. Fuld husstand, 3-værelses lejlighed. Har brug for opmagasinering i et par uger i DK inden det sendes."

Expected qualification path:
- AI identifies: international, non-Scandinavian destination, storage needed
- Should ask: volume, special items, customs awareness (post-Brexit UK needs paperwork), storage duration, packing
- Should flag: UK is non-EU now, customs declarations required, potentially VAT on goods
- Brief: international, apartment 3 rooms, København/DK → London/UK, storage 2-3 weeks
- Matched providers: Nordisk Flyttecenter (international specialist), Bahns Flytteforretning (EU/international)
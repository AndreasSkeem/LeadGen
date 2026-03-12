# Brief Schema Documentation

## What is a Brief?

A brief is the anonymised, structured output of the AI qualification conversation. It contains everything a moving company needs to estimate the job — origin, destination, volume, floor level, special items, services, timeline — but NOT the customer's name, exact address, phone number, or email.

## Why anonymous?

1. Providers cannot contact customers outside the platform
2. Customers receive bids on merit rather than being cold-called
3. The platform stays embedded in the transaction

## When anonymity breaks

When a customer chooses to "connect" with a provider. Both sides get contact details. This is the monetisation trigger.

## Brief quality levels

- **High confidence**: All key fields filled. Provider can give a firm quote or a tight range.
- **Medium confidence**: Most fields filled but some gaps (e.g., unknown floor level at destination). Provider can give a range.
- **Low confidence**: Significant gaps. Provider would need a phone call or home visit to quote accurately.

## Required fields (every brief must have)

- move_type
- origin.municipality + origin.country
- destination.municipality + destination.country (or "destination TBD")
- urgency or move_date_approx

## Important fields (should have for quality matching)

- origin.floor + origin.elevator (biggest cost driver for apartment moves)
- volume.description or volume.estimated_cbm
- special_items (if any)
- services_requested.packing

## Nice-to-have fields

- destination.floor + destination.elevator
- parking_access at both ends
- budget_indication
- services_requested.storage
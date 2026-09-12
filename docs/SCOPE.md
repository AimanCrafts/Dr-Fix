# Scope — Deliberately Excluded Features

Features intentionally left out of the Checkpoint 3 deliverable. Each requires its own schema, endpoints, and frontend pass that are outside this checkpoint's scope.

## Client Dashboard — Mock Sections Removed

The following dashboard sections previously rendered hardcoded mock data. They have been removed rather than implemented:

- **Rate Your Last Service** — needs a `reviews` table, review endpoint, and rating aggregation for technicians.
- **Membership Progress** — needs a `membership_tiers` concept and per-customer completed-booking counts.
- **Warranty Tracker** — needs a `warranties` table linked to bookings with expiry dates.
- **Referral Program** — needs a `referral_codes` table and credit-tracking logic.

The client dashboard's remaining sections (Recent Services, Saved Addresses) are fully API-driven.

Context: issue #53.
# Scope — Deliberately Excluded Features

This document tracks features that were intentionally left out of the Checkpoint 3 deliverable. Each was considered and deferred to keep the project focused on the core booking and provider-approval flows.

## Client Dashboard — Mock Data Removed

The following dashboard sections previously rendered hardcoded mock data. They have been removed rather than implemented because each requires its own schema, endpoints, and frontend pass that are out of scope for this checkpoint:

- **Rate Your Last Service** — needs a `reviews` table, a review endpoint, and a rating aggregation for technicians.
- **Membership Progress** — needs a `membership_tiers` concept and a count of completed bookings per customer.
- **Warranty Tracker** — needs a `warranties` table linked to bookings, with expiry dates.
- **Referral Program** — needs a `referral_codes` table and credit-tracking logic.

The client dashboard's remaining sections (Recent Services, Saved Addresses) are fully API-driven.

See issue #53 for context.
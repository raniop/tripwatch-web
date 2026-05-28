-- TripWatch — denormalize the latest price-check's match_score onto bookings
--
-- The BookingCard on the dashboard (and any other surface that doesn't fetch
-- price_checks) needs to know if last_price is a confident match or just
-- Booking's "cheapest fallback" — otherwise it shows a misleading green
-- "savings" pill on rates that aren't comparable to what the user paid.
--
-- Run AFTER 0009_original_price.sql.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS last_match_score NUMERIC NULL;

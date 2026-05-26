-- TripWatch — capture Booking's strikethrough price alongside the current one
--
-- Booking often shows two prices per rate: a struck-through "original" and
-- the discounted "current" price (Genius, mobile-only deal, promo, etc.).
-- The current scraper only stored `price`, so we couldn't show "from ₪X"
-- context — and worse, we couldn't tell how much of a "savings" the user
-- already gets vs the headline rate.
--
-- Adds:
--   - price_checks.original_price  — NULL when no strikethrough shown
--   - bookings.last_original_price — denormalized mirror for dashboard speed
--
-- Run AFTER 0008_children_ages.sql.

ALTER TABLE public.price_checks
  ADD COLUMN IF NOT EXISTS original_price NUMERIC NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS last_original_price NUMERIC NULL;

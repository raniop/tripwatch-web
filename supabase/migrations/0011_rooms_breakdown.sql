-- TripWatch — multi-room booking breakdown for accurate price tracking
--
-- A single Isrotel/Fattal/Dan/luxury confirmation often books N distinct
-- rooms (e.g. "Oren Room ×2 + Carmel Deluxe Room ×1") and charges a sum.
-- Before this, we stored only `room_type` as one string and the matcher
-- picked one rate × 1, hugely under-counting and showing fake "60% off."
--
-- Shape:
--   rooms_breakdown: [{"name": "Oren Room", "count": 2, ...}, ...]
-- Populated by text-extract when the confirmation lists distinct rooms;
-- left NULL on regular single-room bookings (existing flow unchanged).
--
-- Run AFTER 0010_last_match_score.sql.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rooms_breakdown JSONB NULL;

-- Soft sanity check: when set, must be a non-empty array of {name, count}.
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_rooms_breakdown_shape_chk
  CHECK (
    rooms_breakdown IS NULL
    OR (
      jsonb_typeof(rooms_breakdown) = 'array'
      AND jsonb_array_length(rooms_breakdown) > 0
    )
  );

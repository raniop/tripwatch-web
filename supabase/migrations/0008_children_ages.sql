-- TripWatch — children ages for accurate Booking.com price checks
--
-- Why: Booking.com ignores `group_children=N` in URLs unless every child has
-- an `age=X` query param. Without ages we silently get back the 2-adult price
-- on family bookings — making price drops look bigger than they are.
--
-- Shape: `guests` was {adults, children, rooms}. We now also keep
-- `children_ages: int[]` inside the same JSONB blob (length === children).
--
-- Run AFTER 0007_profile_locale.sql.

-- 1. New default includes an empty ages array for fresh bookings with no kids
ALTER TABLE public.bookings
  ALTER COLUMN guests
  SET DEFAULT '{"adults":2,"children":0,"rooms":1,"children_ages":[]}'::jsonb;

-- 2. Backfill: every existing booking gets a children_ages array of the right
-- length. We default to age 10 (mid-range of Booking's 7–12 child band) when
-- we don't know — the dashboard now lets users correct it per booking.
UPDATE public.bookings
SET guests = guests || jsonb_build_object(
  'children_ages',
  CASE
    WHEN COALESCE((guests->>'children')::int, 0) = 0 THEN '[]'::jsonb
    ELSE (
      SELECT to_jsonb(array_fill(10, ARRAY[(guests->>'children')::int]))
    )
  END
)
WHERE NOT (guests ? 'children_ages')
   OR jsonb_array_length(guests->'children_ages') <> COALESCE((guests->>'children')::int, 0);

-- 3. Guardrail: keep ages in sync with the children count from now on.
-- (Soft check — only fires when the field is present; tolerates older code paths.)
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_children_ages_length_chk
  CHECK (
    NOT (guests ? 'children_ages')
    OR jsonb_array_length(guests->'children_ages') = COALESCE((guests->>'children')::int, 0)
  );

-- TripWatch — initial schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- After this, enable Google OAuth in Authentication → Providers, and create a
-- Storage bucket named "booking-images" (private, RLS enabled).

----------------------------------------------------------------------------
-- profiles: per-user settings & telegram link
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  avatar_url          TEXT,
  locale              TEXT DEFAULT 'he',
  telegram_chat_id    BIGINT UNIQUE,
  telegram_link_token TEXT UNIQUE,
  telegram_link_expires_at TIMESTAMPTZ,
  notification_prefs  JSONB DEFAULT '{"email":true,"in_app":true,"telegram":false}'::jsonb,
  alert_pct_default   NUMERIC DEFAULT 5,
  alert_amount_ils_default NUMERIC DEFAULT 100,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Auto-create a profiles row when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

----------------------------------------------------------------------------
-- bookings
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source              TEXT NOT NULL DEFAULT 'booking.com',
  url                 TEXT NOT NULL,
  hotel_name          TEXT,
  hotel_image_url     TEXT,
  hotel_city          TEXT,
  hotel_country       TEXT,
  hotel_lat           NUMERIC,
  hotel_lng           NUMERIC,
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL,
  guests              JSONB DEFAULT '{"adults":2,"children":0,"rooms":1}'::jsonb,
  room_type           TEXT,
  meal_plan           TEXT,
  cancellation        TEXT,
  currency            TEXT NOT NULL,
  paid_price          NUMERIC NOT NULL,
  paid_price_ils      NUMERIC,
  last_price          NUMERIC,
  last_currency       TEXT,
  last_checked_at     TIMESTAMPTZ,
  last_alert_sent_at  TIMESTAMPTZ,
  alert_pct           NUMERIC DEFAULT 5,
  alert_amount_ils    NUMERIC DEFAULT 100,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','completed')),
  source_image_path   TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON public.bookings(user_id, status, check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_active_due ON public.bookings(status, check_in) WHERE status = 'active';

-- bookings.updated_at auto-bump
CREATE OR REPLACE FUNCTION public.bump_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS bookings_bump_updated_at ON public.bookings;
CREATE TRIGGER bookings_bump_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bump_updated_at();

----------------------------------------------------------------------------
-- price_checks: append-only history
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_checks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  checked_at   TIMESTAMPTZ DEFAULT now(),
  price        NUMERIC,
  currency     TEXT,
  match_score  NUMERIC,
  matched_room TEXT,
  matched_meal TEXT,
  error        TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_checks_booking_time ON public.price_checks(booking_id, checked_at DESC);

----------------------------------------------------------------------------
-- notifications: in-app feed + delivery log
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id   UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('price_drop','check_failed','system','welcome')),
  title        TEXT NOT NULL,
  body         TEXT,
  payload      JSONB,                                -- arbitrary extra data
  read_at      TIMESTAMPTZ,
  email_sent_at    TIMESTAMPTZ,
  telegram_sent_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read_at IS NULL;

----------------------------------------------------------------------------
-- beta_invites: gate signup
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beta_invites (
  code         TEXT PRIMARY KEY,
  note         TEXT,
  used_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

----------------------------------------------------------------------------
-- Row Level Security
----------------------------------------------------------------------------
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_checks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_invites  ENABLE ROW LEVEL SECURITY;

-- profiles: a user can only see/update their own row
CREATE POLICY profiles_self_read   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- bookings: full CRUD on own rows
CREATE POLICY bookings_self_all    ON public.bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- price_checks: read-only for owner of parent booking; only service role writes
CREATE POLICY price_checks_self_read ON public.price_checks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));

-- notifications: read + mark-read on own rows; only service role inserts
CREATE POLICY notifications_self_read ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_self_update ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- beta_invites: no public access; service role only

----------------------------------------------------------------------------
-- Helper aggregates (for landing-page social-proof counter)
----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_stats AS
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM public.bookings) AS total_users,
  (SELECT COUNT(*) FROM public.bookings) AS total_bookings,
  COALESCE(
    (SELECT SUM(GREATEST(paid_price_ils - (
       SELECT (price * (CASE WHEN currency = 'ILS' THEN 1 ELSE 0 END))
       FROM public.price_checks pc
       WHERE pc.booking_id = b.id
       ORDER BY checked_at DESC LIMIT 1
    ), 0))
     FROM public.bookings b WHERE paid_price_ils IS NOT NULL),
  0)::NUMERIC AS total_potential_savings_ils;

GRANT SELECT ON public.public_stats TO anon, authenticated;

----------------------------------------------------------------------------
-- Realtime: publish notifications so the UI can subscribe
----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

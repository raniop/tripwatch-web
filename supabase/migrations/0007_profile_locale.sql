-- TripWatch — per-user locale preference
-- Used by cron-driven email senders that don't have a request cookie.
-- Run in Supabase SQL Editor AFTER 0006_user_verified_emails.sql.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'he'
    CHECK (locale IN ('he', 'en'));

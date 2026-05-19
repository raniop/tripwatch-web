-- TripWatch — cancellation deadline tracking + reminder kind
-- Run in Supabase SQL Editor AFTER 0004_find_user_by_email.sql.

----------------------------------------------------------------------------
-- 1. Bookings: structured deadline + idempotency flag for reminders
----------------------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancellation_deadline           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reminder_sent_at   TIMESTAMPTZ;

-- Used by the daily cron to find bookings whose deadline is approaching.
CREATE INDEX IF NOT EXISTS idx_bookings_cancellation_deadline_due
  ON public.bookings(cancellation_deadline)
  WHERE status = 'active'
    AND cancellation_deadline IS NOT NULL
    AND cancellation_reminder_sent_at IS NULL;

----------------------------------------------------------------------------
-- 2. Notifications: allow the new kind
----------------------------------------------------------------------------
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_kind_check
  CHECK (kind IN ('price_drop','check_failed','system','welcome','cancellation_deadline'));

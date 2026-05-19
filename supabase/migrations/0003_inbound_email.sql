-- TripWatch — inbound email forwarding
-- Run in Supabase SQL Editor AFTER 0002_storage_and_policies.sql.
--
-- Adds a per-user forwarding address (book.{token}@inbound.tripwatch.net) and
-- a log table for every inbound email received via the Resend Inbound webhook.

----------------------------------------------------------------------------
-- 1. Add inbound_token to profiles
----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS inbound_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS inbound_token_created_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_inbound_token ON public.profiles(inbound_token)
  WHERE inbound_token IS NOT NULL;

----------------------------------------------------------------------------
-- 2. inbound_emails: log of every email we receive
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inbound_emails (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id        TEXT NOT NULL UNIQUE,           -- RFC 5322 Message-ID, used for idempotency
  from_address      TEXT NOT NULL,
  to_address        TEXT NOT NULL,
  subject           TEXT,
  detected_source   TEXT,                            -- booking.com / agoda / expedia / hotels.com / unknown
  status            TEXT NOT NULL DEFAULT 'received'
                    CHECK (status IN ('received','parsed','created','skipped','error')),
  booking_id        UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  error             TEXT,
  raw_storage_path  TEXT,                            -- path in inbound-emails bucket
  received_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_emails_user_time
  ON public.inbound_emails(user_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_emails_status
  ON public.inbound_emails(status, received_at DESC)
  WHERE status IN ('received','error');

----------------------------------------------------------------------------
-- 3. RLS — users can read their own log; only service role writes
----------------------------------------------------------------------------
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY inbound_emails_self_read ON public.inbound_emails
  FOR SELECT USING (auth.uid() = user_id);

----------------------------------------------------------------------------
-- 4. Private bucket for raw email payloads (text + html + headers JSON)
----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inbound-emails',
  'inbound-emails',
  false,
  5242880,                                           -- 5 MB max per file
  NULL                                               -- accept any mime (we store JSON)
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- Owners can read their own raw emails (folder = user uuid).
DROP POLICY IF EXISTS "inbound users read own" ON storage.objects;
CREATE POLICY "inbound users read own" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'inbound-emails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- No INSERT/UPDATE/DELETE policy → only service role (which bypasses RLS) can write/delete.

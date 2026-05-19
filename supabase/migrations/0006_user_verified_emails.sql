-- TripWatch — additional verified "from" emails for inbound forwarding
-- Run in Supabase SQL Editor AFTER 0005_cancellation_deadline.sql.
--
-- Lets a user register extra email addresses they want to forward booking
-- confirmations from (beyond their primary auth.users.email + linked OAuth
-- identity emails). Each address requires a click-the-link verification.

----------------------------------------------------------------------------
-- 1. The table
----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_verified_emails (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL CHECK (email = lower(email)),
  verified_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, email)
);

CREATE INDEX IF NOT EXISTS idx_user_verified_emails_email
  ON public.user_verified_emails(email);

----------------------------------------------------------------------------
-- 2. RLS — owner can read & delete their own rows; service role writes
----------------------------------------------------------------------------
ALTER TABLE public.user_verified_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY uve_self_read ON public.user_verified_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY uve_self_delete ON public.user_verified_emails
  FOR DELETE USING (auth.uid() = user_id);

----------------------------------------------------------------------------
-- 3. Extend find_user_by_email to also check verified extras
----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_user_by_email(email_in TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_uid UUID;
  clean_email TEXT;
BEGIN
  IF email_in IS NULL THEN
    RETURN NULL;
  END IF;
  clean_email := lower(trim(email_in));
  IF clean_email = '' THEN
    RETURN NULL;
  END IF;

  -- 1. Primary email on auth.users
  SELECT id INTO found_uid
  FROM auth.users
  WHERE lower(email) = clean_email
  LIMIT 1;
  IF found_uid IS NOT NULL THEN
    RETURN found_uid;
  END IF;

  -- 2. Linked OAuth identity emails (Google, Apple, GitHub, etc.)
  SELECT user_id INTO found_uid
  FROM auth.identities
  WHERE lower(identity_data->>'email') = clean_email
  LIMIT 1;
  IF found_uid IS NOT NULL THEN
    RETURN found_uid;
  END IF;

  -- 3. User-added verified extras
  SELECT user_id INTO found_uid
  FROM public.user_verified_emails
  WHERE email = clean_email
  LIMIT 1;

  RETURN found_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.find_user_by_email(TEXT) FROM PUBLIC, anon, authenticated;

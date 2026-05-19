-- TripWatch — find_user_by_email RPC
-- Used by the inbound email webhook to resolve a sender's "from:" address to
-- a user, checking both the primary auth.users.email and any linked identity
-- emails (Google, Apple, etc).
--
-- Run in Supabase SQL Editor AFTER 0003_inbound_email.sql.

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

  -- 2. Linked identity emails (Google, Apple, GitHub, etc.)
  SELECT user_id INTO found_uid
  FROM auth.identities
  WHERE lower(identity_data->>'email') = clean_email
  LIMIT 1;

  RETURN found_uid;
END;
$$;

-- Only the service role (which bypasses GRANTs anyway) should call this.
REVOKE ALL ON FUNCTION public.find_user_by_email(TEXT) FROM PUBLIC, anon, authenticated;

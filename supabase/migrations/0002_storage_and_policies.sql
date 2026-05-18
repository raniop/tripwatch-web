-- TripWatch — storage bucket + policies, all in SQL (no clicking through UI)
-- Run this in Supabase SQL Editor AFTER 0001_init.sql.

----------------------------------------------------------------------------
-- 1. Create the private bucket for user-uploaded booking screenshots
----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'booking-images',
  'booking-images',
  false,
  10485760,                                  -- 10 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

----------------------------------------------------------------------------
-- 2. Storage policies — each user can only touch files under their own UUID
----------------------------------------------------------------------------
DROP POLICY IF EXISTS "users upload own" ON storage.objects;
CREATE POLICY "users upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'booking-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "users read own" ON storage.objects;
CREATE POLICY "users read own" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'booking-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "users delete own" ON storage.objects;
CREATE POLICY "users delete own" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'booking-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role (used by the NAS for signed-URL access) automatically bypasses RLS.

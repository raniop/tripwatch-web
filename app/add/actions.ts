'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { nas, type ExtractedBooking } from '@/lib/nas-client';

const SaveSchema = z.object({
  source: z.string().default('booking.com'),
  url: z.string().url(),
  hotel_name: z.string().min(1),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.object({
    adults: z.number().int().min(1).default(2),
    children: z.number().int().min(0).default(0),
    rooms: z.number().int().min(1).default(1),
  }),
  room_type: z.string().nullable().optional(),
  meal_plan: z.string().nullable().optional(),
  cancellation: z.string().nullable().optional(),
  currency: z.string().min(3).max(3),
  paid_price: z.number().positive(),
  source_image_path: z.string().nullable().optional(),
});

/**
 * Upload image to Supabase Storage and run vision extraction.
 * Returns the extracted booking + the resolved Booking.com URL + the storage path.
 */
export async function extractFromImage(formData: FormData): Promise<
  | { ok: true; extracted: ExtractedBooking; url: string; image_path: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const file = formData.get('image') as File | null;
  if (!file) return { ok: false, error: 'no image' };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: 'image too large (max 8MB)' };

  const ext = (file.type.split('/')[1] || 'jpg').replace(/[^a-z]/g, '');
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage.from('booking-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return { ok: false, error: `upload: ${upErr.message}` };

  const { data: signed, error: signErr } = await supabase.storage
    .from('booking-images')
    .createSignedUrl(path, 600);
  if (signErr || !signed) return { ok: false, error: `sign: ${signErr?.message}` };

  try {
    const extracted = await nas.visionExtract(signed.signedUrl);
    const { url } = await nas.search({
      hotel_name: extracted.hotel_name,
      check_in: extracted.check_in,
      check_out: extracted.check_out,
      adults: extracted.guests?.adults,
      children: extracted.guests?.children,
      rooms: extracted.guests?.rooms,
    });
    return { ok: true, extracted, url, image_path: path };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Save a confirmed booking and redirect to its detail page.
 */
export async function saveBooking(input: unknown) {
  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues.map((i) => i.message).join(', ') };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  // Note: hotel image is fetched by the NAS scraper on first /check
  // (Booking blocks direct HTTP fetches with bot challenges).

  // Best-effort FX to ILS for the savings counter
  let paid_price_ils: number | null = null;
  if (parsed.data.currency !== 'ILS') {
    try {
      const r = await fetch(`https://open.er-api.com/v6/latest/${parsed.data.currency}`, {
        signal: AbortSignal.timeout(8000),
      });
      const j = await r.json();
      if (j?.result === 'success' && j?.rates?.ILS) {
        paid_price_ils = parsed.data.paid_price * Number(j.rates.ILS);
      }
    } catch {
      // skip — non-fatal
    }
  } else {
    paid_price_ils = parsed.data.paid_price;
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      ...parsed.data,
      paid_price_ils,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) return { ok: false as const, error: error.message };

  revalidatePath('/dashboard');
  redirect(`/booking/${data.id}`);
}


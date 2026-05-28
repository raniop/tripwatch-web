/**
 * Shared price-check pipeline. Runs the NAS scrape, inserts a price_checks
 * row, updates the booking's last_price / last_currency / last_checked_at,
 * and backfills hotel_image_url if missing.
 *
 * Used by both:
 *   - the "Check now" server action on the booking detail page (RLS client)
 *   - the inbound email webhook, right after a booking is created from a
 *     forwarded confirmation (admin client, fires via `after()`).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { nas } from '@/lib/nas-client';
import { fetchOgImage } from '@/lib/og';

interface BookingRow {
  id: string;
  url: string;
  room_type: string | null;
  meal_plan: string | null;
  hotel_image_url: string | null;
  /** Required for accurate matching — without this we'll pick a 2-adult rate
   * for a family booking and report a fake "price drop." */
  guests?: { adults: number; children: number } | null;
}

export async function runPriceCheck(
  supabase: SupabaseClient,
  booking: BookingRow,
): Promise<{ ok: true; amount: number; currency: string } | { ok: false; error: string }> {
  try {
    const r = await nas.scrape({
      url: booking.url,
      room_type: booking.room_type,
      meal_plan: booking.meal_plan,
      guests: booking.guests
        ? { adults: booking.guests.adults, children: booking.guests.children }
        : null,
    });

    const { error: checkErr } = await supabase.from('price_checks').insert({
      booking_id: booking.id,
      price: r.amount,
      original_price: r.original_amount ?? null,
      currency: r.currency,
      match_score: r.match_score,
      matched_room: r.matched_room,
      matched_meal: r.matched_meal,
      candidates: r.candidates ?? null,
    });
    if (checkErr) {
      console.error('[runPriceCheck] price_checks insert failed:', checkErr.message);
    }

    const updates: Record<string, unknown> = {
      last_price: r.amount,
      last_original_price: r.original_amount ?? null,
      last_match_score: r.match_score ?? null,
      last_currency: r.currency,
      last_checked_at: new Date().toISOString(),
    };
    if (!booking.hotel_image_url) {
      const img = r.hotel_meta?.imageUrl ?? (await fetchOgImage(booking.url));
      if (img) updates.hotel_image_url = img;
    }
    await supabase.from('bookings').update(updates).eq('id', booking.id);

    return { ok: true, amount: r.amount, currency: r.currency };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from('price_checks').insert({ booking_id: booking.id, error: msg });
    return { ok: false, error: msg };
  }
}

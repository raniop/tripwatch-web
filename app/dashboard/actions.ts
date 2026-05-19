'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { nas } from '@/lib/nas-client';
import { fetchOgImage } from '@/lib/og';

export interface CheckAllResult {
  ok: boolean;
  checked?: number;
  errors?: number;
  drops?: number;
  total?: number;
  error?: string;
}

/**
 * Re-check every active booking for the current user. Sequential to avoid
 * hammering the NAS — each scrape takes 10-25 seconds.
 */
export async function checkAllBookings(): Promise<CheckAllResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const { data: bookings, error: listErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (listErr) return { ok: false, error: listErr.message };
  if (!bookings || !bookings.length) {
    return { ok: true, checked: 0, errors: 0, drops: 0, total: 0 };
  }

  let checked = 0;
  let errors = 0;
  let drops = 0;

  for (const b of bookings) {
    try {
      const r = await nas.scrape({
        url: b.url,
        room_type: b.room_type,
        meal_plan: b.meal_plan,
      });

      const updates: Record<string, unknown> = {
        last_price: r.amount,
        last_currency: r.currency,
        last_checked_at: new Date().toISOString(),
      };
      if (!b.hotel_image_url) {
        const img = r.hotel_meta?.imageUrl ?? (await fetchOgImage(b.url));
        if (img) updates.hotel_image_url = img;
      }
      await supabase.from('bookings').update(updates).eq('id', b.id);
      await supabase.from('price_checks').insert({
        booking_id: b.id,
        price: r.amount,
        currency: r.currency,
        match_score: r.match_score,
        matched_room: r.matched_room,
        matched_meal: r.matched_meal,
        candidates: r.candidates ?? null,
      });
      checked++;
      if (r.currency === b.currency && r.amount < Number(b.paid_price)) {
        const pct = ((Number(b.paid_price) - r.amount) / Number(b.paid_price)) * 100;
        if (pct >= 1) drops++;
      }
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      await supabase.from('price_checks').insert({ booking_id: b.id, error: msg });
    }
  }

  revalidatePath('/dashboard');
  return { ok: true, checked, errors, drops, total: bookings.length };
}

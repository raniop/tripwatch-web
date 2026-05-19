'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { nas } from '@/lib/nas-client';
import { fetchOgImage } from '@/lib/og';

export async function checkNow(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const { data: b, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();
  if (error || !b) return { ok: false as const, error: 'booking not found' };

  try {
    const r = await nas.scrape({
      url: b.url,
      room_type: b.room_type,
      meal_plan: b.meal_plan,
    });
    const { error: checkErr } = await supabase.from('price_checks').insert({
      booking_id: b.id,
      price: r.amount,
      currency: r.currency,
      match_score: r.match_score,
      matched_room: r.matched_room,
      matched_meal: r.matched_meal,
      candidates: r.candidates ?? null,
    });
    if (checkErr) {
      console.error('price_checks insert failed:', checkErr.message);
    }
    const updates: Record<string, unknown> = {
      last_price: r.amount,
      last_currency: r.currency,
      last_checked_at: new Date().toISOString(),
    };
    // Backfill hotel image if missing — prefer scraper's og:image, else fetch directly
    if (!b.hotel_image_url) {
      const img = r.hotel_meta?.imageUrl ?? (await fetchOgImage(b.url));
      if (img) updates.hotel_image_url = img;
    }
    await supabase.from('bookings').update(updates).eq('id', b.id);

    revalidatePath(`/booking/${bookingId}`);
    revalidatePath('/dashboard');
    return { ok: true as const, result: r };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from('price_checks').insert({ booking_id: b.id, error: msg });
    return { ok: false as const, error: msg };
  }
}

export async function removeBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateThreshold(bookingId: string, alert_pct: number, alert_amount_ils: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('bookings')
    .update({ alert_pct, alert_amount_ils })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  revalidatePath(`/booking/${bookingId}`);
}

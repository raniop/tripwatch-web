'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { runPriceCheck } from '@/lib/booking/run-check';

export async function checkNow(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const { data: b, error } = await supabase
    .from('bookings')
    .select('id, url, room_type, meal_plan, hotel_image_url')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();
  if (error || !b) return { ok: false as const, error: 'booking not found' };

  const r = await runPriceCheck(supabase, b);
  revalidatePath(`/booking/${bookingId}`);
  revalidatePath('/dashboard');
  if (!r.ok) return { ok: false as const, error: r.error };
  return { ok: true as const, result: { amount: r.amount, currency: r.currency } };
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

export async function setCancellationDeadline(bookingId: string, iso: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  let value: string | null = null;
  if (iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return { ok: false as const, error: 'תאריך לא תקין' };
    value = new Date(t).toISOString();
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      cancellation_deadline: value,
      // Clear the reminder flag so the cron can re-evaluate the new deadline.
      cancellation_reminder_sent_at: null,
    })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/booking/${bookingId}`);
  revalidatePath('/dashboard');
  return { ok: true as const };
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

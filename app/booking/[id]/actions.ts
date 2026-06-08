'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { runPriceCheck } from '@/lib/booking/run-check';
import { normalizeChildrenAges } from '@/lib/guests';

export async function checkNow(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const { data: b, error } = await supabase
    .from('bookings')
    .select('id, url, room_type, rooms_breakdown, meal_plan, hotel_image_url, guests')
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

/**
 * Update guest composition (adults / children / per-child ages / rooms) and
 * rebuild the booking URL with proper `age=X` params — Booking ignores
 * `group_children` without one age per child.
 *
 * Triggers a fresh price check after saving so the dashboard reflects the
 * corrected party composition immediately.
 */
export async function updateGuests(
  bookingId: string,
  input: { adults: number; children: number; children_ages: number[]; rooms: number },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const adults = Math.max(1, Math.floor(input.adults));
  const children = Math.max(0, Math.floor(input.children));
  const rooms = Math.max(1, Math.floor(input.rooms));
  const children_ages = normalizeChildrenAges({ children, children_ages: input.children_ages });

  const { data: b, error: loadErr } = await supabase
    .from('bookings')
    .select('id, url, room_type, rooms_breakdown, meal_plan, hotel_image_url, guests')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();
  if (loadErr || !b) return { ok: false as const, error: 'booking not found' };

  let url: string;
  try {
    const u = new URL(b.url);
    u.searchParams.set('group_adults', String(adults));
    u.searchParams.set('group_children', String(children));
    u.searchParams.set('no_rooms', String(rooms));
    // Delete all existing `age` params, then re-append in order.
    u.searchParams.delete('age');
    for (const a of children_ages) u.searchParams.append('age', String(a));
    url = u.toString();
  } catch {
    return { ok: false as const, error: 'invalid stored URL' };
  }

  const { error: updErr } = await supabase
    .from('bookings')
    .update({ guests: { adults, children, rooms, children_ages }, url })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  if (updErr) return { ok: false as const, error: updErr.message };

  // Re-check price with the corrected URL so the dashboard updates right away.
  const r = await runPriceCheck(supabase, { ...b, url });

  revalidatePath(`/booking/${bookingId}`);
  revalidatePath('/dashboard');
  if (!r.ok) return { ok: true as const, recheckError: r.error };
  return { ok: true as const, result: { amount: r.amount, currency: r.currency } };
}

/**
 * Update room name + meal plan and immediately re-run a price check so the
 * matcher can lock onto the right rate. Use this on LHW / non-Booking
 * bookings where the email didn't include a clean room name, or to correct
 * a bad match.
 *
 * Both values are trimmed; empty strings are stored as NULL so the matcher
 * falls back to "cheapest" rather than scoring against "".
 */
export async function updateRoomType(
  bookingId: string,
  input: { room_type: string; meal_plan: string },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const room_type = input.room_type.trim() || null;
  const meal_plan = input.meal_plan.trim() || null;

  const { data: b, error: loadErr } = await supabase
    .from('bookings')
    .select('id, url, room_type, rooms_breakdown, meal_plan, hotel_image_url, guests')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();
  if (loadErr || !b) return { ok: false as const, error: 'booking not found' };

  const { error: updErr } = await supabase
    .from('bookings')
    .update({ room_type, meal_plan })
    .eq('id', bookingId)
    .eq('user_id', user.id);
  if (updErr) return { ok: false as const, error: updErr.message };

  // Re-check with the new room/meal so the dashboard reflects the proper
  // match immediately. Skip if there's still no room_type (no point — the
  // matcher would just return the cheapest).
  let recheck: { ok: true; amount: number; currency: string } | { ok: false; error: string } | null = null;
  if (room_type) {
    recheck = await runPriceCheck(supabase, { ...b, room_type, meal_plan });
  }

  revalidatePath(`/booking/${bookingId}`);
  revalidatePath('/dashboard');

  if (recheck && recheck.ok) {
    return { ok: true as const, result: { amount: recheck.amount, currency: recheck.currency } };
  }
  if (recheck && !recheck.ok) {
    return { ok: true as const, recheckError: recheck.error };
  }
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

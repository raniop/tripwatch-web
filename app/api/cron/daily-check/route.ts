import { NextResponse } from 'next/server';
import { nas } from '@/lib/nas-client';
import { createAdminClient } from '@/lib/supabase/server';
import { fmtDateRange, nightsBetween } from '@/lib/format';

/**
 * Vercel Cron handler. Configured in vercel.json to fire daily at 07:00 UTC
 * (10:00 Asia/Jerusalem). Does two things:
 *   1. Kick the NAS background price-check runner.
 *   2. Scan for bookings whose free-cancellation deadline is within 24h and
 *      insert one notifications row per booking (dispatch webhook handles
 *      the email/telegram fan-out).
 *
 * Auth: Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const got = request.headers.get('authorization') || '';
  if (expected && got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let nasResult: unknown = null;
  let nasError: string | null = null;
  try {
    nasResult = await nas.triggerDailyCheck();
  } catch (err) {
    nasError = err instanceof Error ? err.message : String(err);
    console.error('[cron] NAS triggerDailyCheck failed:', nasError);
  }

  const remindersResult = await enqueueCancellationReminders();

  return NextResponse.json({
    nas: nasError ? { error: nasError } : nasResult,
    reminders: remindersResult,
  });
}

/**
 * Find bookings with a free-cancellation deadline in the next 24h that we
 * haven't reminded about yet. Insert one `cancellation_deadline` notification
 * per booking — the Supabase webhook → /api/notifications/dispatch handles
 * email/telegram delivery.
 */
async function enqueueCancellationReminders(): Promise<{ enqueued: number; errors: string[] }> {
  const sb = createAdminClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: due, error } = await sb
    .from('bookings')
    .select('id, user_id, hotel_name, check_in, check_out, cancellation_deadline, url')
    .eq('status', 'active')
    .not('cancellation_deadline', 'is', null)
    .is('cancellation_reminder_sent_at', null)
    .gte('cancellation_deadline', now.toISOString())
    .lte('cancellation_deadline', cutoff);

  if (error) {
    return { enqueued: 0, errors: [error.message] };
  }
  if (!due || due.length === 0) {
    return { enqueued: 0, errors: [] };
  }

  const errors: string[] = [];
  let enqueued = 0;
  for (const b of due) {
    const hours = Math.max(0, Math.round((new Date(b.cancellation_deadline!).getTime() - now.getTime()) / 3_600_000));
    const title = `⏰ הביטול החינמי על ${b.hotel_name || 'ההזמנה שלך'} פוקע בעוד ${hours} שעות`;
    const body = `${fmtDateRange(b.check_in, b.check_out)} · ${nightsBetween(b.check_in, b.check_out)} לילות`;

    const { error: notifErr } = await sb.from('notifications').insert({
      user_id: b.user_id,
      booking_id: b.id,
      kind: 'cancellation_deadline',
      title,
      body,
      payload: {
        deadline: b.cancellation_deadline,
        hours_remaining: hours,
        booking_url: b.url,
      },
    });
    if (notifErr) {
      errors.push(`${b.id}: ${notifErr.message}`);
      continue;
    }
    await sb
      .from('bookings')
      .update({ cancellation_reminder_sent_at: now.toISOString() })
      .eq('id', b.id);
    enqueued++;
  }
  return { enqueued, errors };
}

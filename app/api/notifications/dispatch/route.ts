/**
 * Notification dispatch endpoint. Called by a Supabase database webhook on
 * INSERT INTO notifications. We look up the user's prefs, then fan out to
 * email (Resend) and Telegram as configured.
 *
 * Setup in Supabase: Database → Webhooks → Create
 *   - Name: dispatch-notifications
 *   - Table: notifications
 *   - Events: Insert
 *   - Type: HTTP Request
 *   - URL: https://tripwatch.vercel.app/api/notifications/dispatch
 *   - Headers: Authorization: Bearer <CRON_SECRET>
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendPriceDropEmail, sendCancellationReminderEmail } from '@/lib/notify/email';
import { telegramSend } from '@/lib/notify/telegram';
import { fmtPrice } from '@/lib/format';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.vercel.app';

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const row = body?.record as
    | {
        id: string;
        user_id: string;
        booking_id: string | null;
        kind: string;
        title: string;
        body: string | null;
        payload: Record<string, unknown> | null;
      }
    | null;
  if (!row) return NextResponse.json({ error: 'no record' }, { status: 400 });

  if (row.kind !== 'price_drop' && row.kind !== 'cancellation_deadline') {
    return NextResponse.json({ ok: true, skipped: 'kind' });
  }

  const sb = createAdminClient();

  const [{ data: profile }, { data: authUser }, { data: booking }] = await Promise.all([
    sb.from('profiles').select('notification_prefs, telegram_chat_id').eq('id', row.user_id).maybeSingle(),
    sb.auth.admin.getUserById(row.user_id),
    row.booking_id
      ? sb.from('bookings').select('hotel_name, check_in, check_out, currency, paid_price, url').eq('id', row.booking_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!profile || !authUser?.user || !booking) {
    return NextResponse.json({ ok: false, error: 'missing related rows' });
  }

  const prefs = profile.notification_prefs as { email: boolean; in_app: boolean; telegram: boolean };
  const payload = (row.payload || {}) as {
    paid_price?: number;
    current_price?: number;
    diff?: number;
    drop_pct?: number;
    drop_ils?: number;
    currency?: string;
    deadline?: string;
    hours_remaining?: number;
    booking_url?: string;
  };

  const updates: Record<string, string> = {};

  if (row.kind === 'price_drop') {
    if (prefs.email && authUser.user.email) {
      try {
        await sendPriceDropEmail({
          to: authUser.user.email,
          hotelName: booking.hotel_name || 'המלון שלך',
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          paidFormatted: fmtPrice(payload.paid_price ?? booking.paid_price, payload.currency ?? booking.currency),
          currentFormatted: fmtPrice(payload.current_price ?? null, payload.currency ?? booking.currency),
          savingsFormatted: fmtPrice(payload.diff ?? null, payload.currency ?? booking.currency),
          savingsPct: Number(payload.drop_pct ?? 0),
          bookingUrl: booking.url,
          appUrl: APP_URL,
        });
        updates.email_sent_at = new Date().toISOString();
      } catch (err) {
        console.error('email send failed:', err);
      }
    }

    if (prefs.telegram && profile.telegram_chat_id) {
      try {
        const text =
          `💸 <b>ירידת מחיר!</b>\n\n` +
          `🏨 ${escapeHtml(booking.hotel_name || '')}\n` +
          `📅 ${booking.check_in} → ${booking.check_out}\n\n` +
          `שילמת: ${fmtPrice(payload.paid_price ?? booking.paid_price, booking.currency)}\n` +
          `עכשיו: ${fmtPrice(payload.current_price ?? null, booking.currency)}\n` +
          `חיסכון: ${fmtPrice(payload.diff ?? null, booking.currency)} (${Number(payload.drop_pct ?? 0).toFixed(1)}%)\n\n` +
          `<a href="${booking.url}">פתח ב-Booking</a>`;
        await telegramSend({ chatId: Number(profile.telegram_chat_id), text });
        updates.telegram_sent_at = new Date().toISOString();
      } catch (err) {
        console.error('telegram send failed:', err);
      }
    }
  }

  if (row.kind === 'cancellation_deadline') {
    const hours = Number(payload.hours_remaining ?? 24);
    if (prefs.email && authUser.user.email && payload.deadline) {
      try {
        await sendCancellationReminderEmail({
          to: authUser.user.email,
          hotelName: booking.hotel_name || 'המלון שלך',
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          hoursRemaining: hours,
          deadlineISO: payload.deadline,
          bookingUrl: payload.booking_url ?? booking.url,
          appUrl: APP_URL,
        });
        updates.email_sent_at = new Date().toISOString();
      } catch (err) {
        console.error('cancellation email send failed:', err);
      }
    }

    if (prefs.telegram && profile.telegram_chat_id && payload.deadline) {
      try {
        const deadlineLocal = new Date(payload.deadline).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' });
        const text =
          `⏰ <b>ביטול חינמי פוקע בקרוב</b>\n\n` +
          `🏨 ${escapeHtml(booking.hotel_name || '')}\n` +
          `📅 ${booking.check_in} → ${booking.check_out}\n\n` +
          `עוד <b>${hours} שעות</b> לפוג הביטול החינמי.\n` +
          `מועד אחרון: ${escapeHtml(deadlineLocal)}\n\n` +
          `<a href="${payload.booking_url ?? booking.url}">פתח ב-Booking</a>`;
        await telegramSend({ chatId: Number(profile.telegram_chat_id), text });
        updates.telegram_sent_at = new Date().toISOString();
      } catch (err) {
        console.error('cancellation telegram send failed:', err);
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    await sb.from('notifications').update(updates).eq('id', row.id);
  }

  return NextResponse.json({ ok: true, dispatched: Object.keys(updates) });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

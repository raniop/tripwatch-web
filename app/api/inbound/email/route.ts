/**
 * Resend Inbound webhook — receives forwarded booking confirmation emails
 * and turns them into bookings.
 *
 * Two resolution modes:
 *   A. Global address (trip@tripwatch.net) — recipient matches the global
 *      address, look up user by the `from:` header against auth.users.email
 *      + linked identity emails (via find_user_by_email RPC). Bounce if the
 *      sender isn't known.
 *   B. Per-user token (book.{token}@inbound.tripwatch.net) — fallback for
 *      users forwarding from a mailbox not linked to their account.
 *
 * Always returns 200 except on signature failure / 5xx (so Resend doesn't
 * retry after we've successfully logged the event).
 */

import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nas, type ExtractedBooking } from '@/lib/nas-client';
import { runPriceCheck } from '@/lib/booking/run-check';
import {
  extractTokenFromAddresses,
  matchesGlobalAddress,
  extractPureEmail,
} from '@/lib/inbound/address';
import { detectSource } from '@/lib/inbound/source-detect';
import { verifySvixSignature } from '@/lib/inbound/signature';
import { sendInboundConfirmation, sendInboundBounce } from '@/lib/notify/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.net';
const DAILY_QUOTA = 50;

export async function POST(req: Request) {
  const secret = process.env.RESEND_INBOUND_SIGNING_SECRET;
  if (!secret) {
    console.error('[inbound] RESEND_INBOUND_SIGNING_SECRET not set');
    return new NextResponse('not configured', { status: 500 });
  }

  const rawBody = await req.text();
  const sig = verifySvixSignature({ rawBody, headers: req.headers, secret });
  if (!sig.ok) {
    console.warn('[inbound] signature rejected:', sig.reason);
    return new NextResponse('invalid signature', { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }

  const email = extractEmailFields(payload);
  if (!email) {
    console.warn('[inbound] could not parse payload shape');
    return NextResponse.json({ ok: true, skipped: 'shape' });
  }

  const recipients = [...email.to, ...email.cc];
  const admin = createAdminClient();

  // ---------------------------------------------------------------------------
  // Resolve user — global address (by from:) OR per-user token (by to:)
  // ---------------------------------------------------------------------------
  let userId: string | null = null;
  const fromEmail = extractPureEmail(email.from);

  if (matchesGlobalAddress(recipients)) {
    // Mode A: global address → look up sender across primary email + linked identities
    if (fromEmail) {
      const { data: foundUid, error: rpcErr } = await admin.rpc('find_user_by_email', {
        email_in: fromEmail,
      });
      if (rpcErr) {
        console.error('[inbound] find_user_by_email failed', rpcErr.message);
        return new NextResponse('lookup failed', { status: 500 });
      }
      if (foundUid) userId = foundUid as string;
    }
    if (!userId) {
      console.warn('[inbound] global address but unknown sender', email.from);
      // Friendly bounce — tell the user to register this email or use their token
      if (fromEmail) {
        await sendInboundBounce({
          to: fromEmail,
          reason: 'המייל שממנו שלחת לא רשום בחשבון TripWatch. הוסף אותו ב-Linked Accounts בהגדרות, או שלח מהמייל שאיתו נרשמת.',
          settingsUrl: `${APP_URL}/settings`,
        }).catch((e) => console.warn('[inbound] bounce email failed', e));
      }
      return NextResponse.json({ ok: true, skipped: 'unknown-sender' });
    }
  } else {
    // Mode B: per-user token fallback
    const token = extractTokenFromAddresses(recipients);
    if (!token) {
      console.warn('[inbound] no recipient match (neither global nor token)', recipients);
      return NextResponse.json({ ok: true, skipped: 'no-recipient-match' });
    }
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id')
      .eq('inbound_token', token)
      .maybeSingle();
    if (profileErr) {
      console.error('[inbound] profile lookup failed', profileErr.message);
      return new NextResponse('lookup failed', { status: 500 });
    }
    if (!profile) {
      console.warn('[inbound] unknown token', token);
      return NextResponse.json({ ok: true, skipped: 'unknown-token' });
    }
    userId = profile.id as string;
  }

  // Quota check (rolling 24h)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from('inbound_emails')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('received_at', since);
  if ((recentCount ?? 0) >= DAILY_QUOTA) {
    console.warn('[inbound] quota exceeded for user', userId);
    return NextResponse.json({ ok: true, skipped: 'quota' });
  }

  // Resolve user email for confirmation/bounce
  const { data: userResp } = await admin.auth.admin.getUserById(userId);
  const userEmail = userResp.user?.email || null;

  // Idempotency: insert inbound_emails first (UNIQUE on message_id). Treat
  // duplicate-key as "already processed".
  const messageId = email.messageId || `synthetic-${email.eventId}`;
  const detected = detectSource({ from: email.from, subject: email.subject });

  const { data: inboundRow, error: insErr } = await admin
    .from('inbound_emails')
    .insert({
      user_id: userId,
      message_id: messageId,
      from_address: email.from || '',
      to_address: recipients[0] || '',
      subject: email.subject,
      detected_source: detected,
      status: 'received',
    })
    .select('id')
    .single();
  if (insErr) {
    // Likely UNIQUE violation → already processed. Postgres returns code 23505.
    const code = (insErr as { code?: string }).code;
    if (code === '23505') {
      return NextResponse.json({ ok: true, dedup: true });
    }
    console.error('[inbound] insert inbound_emails failed', insErr.message);
    return new NextResponse('db error', { status: 500 });
  }
  const inboundId = inboundRow.id as string;

  // Save raw payload to storage (best-effort)
  let rawPath: string | null = null;
  try {
    rawPath = `${userId}/${inboundId}.json`;
    await admin.storage.from('inbound-emails').upload(
      rawPath,
      new Blob([rawBody], { type: 'application/json' }),
      { contentType: 'application/json', upsert: false },
    );
    await admin.from('inbound_emails').update({ raw_storage_path: rawPath }).eq('id', inboundId);
  } catch (err) {
    console.warn('[inbound] raw storage upload failed', err);
  }

  // Resend Inbound webhooks don't include the body — fetch it via the API
  // when text/html are missing.
  let bodyText = email.text;
  let bodyHtml = email.html;
  let fetchError: string | undefined;
  if (!bodyText && !bodyHtml && email.emailId) {
    const fetched = await fetchEmailBody(email.emailId);
    bodyText = fetched.text;
    bodyHtml = fetched.html;
    fetchError = fetched.fetchError;
  }
  if (!bodyText && !bodyHtml) {
    const reason = fetchError
      ? `Resend body fetch failed (${fetchError})`
      : !email.emailId
      ? 'webhook payload missing email_id'
      : 'no body returned by Resend';
    console.warn('[inbound] no body —', reason);
    await admin.from('inbound_emails').update({
      status: 'error',
      error: reason.slice(0, 500),
    }).eq('id', inboundId);
    return NextResponse.json({ ok: true, error: 'no body' });
  }

  // Extract booking fields via LLM
  let extracted: ExtractedBooking | null = null;
  try {
    const result = await nas.textExtract({
      text: bodyText,
      html: bodyHtml,
      subject: email.subject,
      from: email.from,
      source_hint: detected,
    });
    if ('not_a_booking' in result && result.not_a_booking) {
      await admin.from('inbound_emails').update({
        status: 'skipped',
        error: 'not a booking confirmation',
      }).eq('id', inboundId);
      if (userEmail) {
        await sendInboundBounce({
          to: userEmail,
          reason: 'המייל לא נראה כמו אישור הזמנה',
          settingsUrl: `${APP_URL}/settings#inbound`,
        }).catch((e) => console.warn('[inbound] bounce email failed', e));
      }
      return NextResponse.json({ ok: true, skipped: 'not-a-booking' });
    }
    extracted = result as ExtractedBooking;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[inbound] text extract failed', msg);
    await admin.from('inbound_emails').update({
      status: 'error',
      error: `extract: ${msg.slice(0, 500)}`,
    }).eq('id', inboundId);
    if (userEmail) {
      await sendInboundBounce({
        to: userEmail,
        reason: 'נכשל חילוץ פרטי ההזמנה — נסה להעביר את המייל המקורי במלואו',
        settingsUrl: `${APP_URL}/settings#inbound`,
      }).catch((e) => console.warn('[inbound] bounce email failed', e));
    }
    return NextResponse.json({ ok: true, error: 'extract failed' });
  }

  if (!extracted.hotel_name || !extracted.check_in || !extracted.check_out || !extracted.total_price) {
    await admin.from('inbound_emails').update({
      status: 'skipped',
      error: 'extracted fields incomplete',
    }).eq('id', inboundId);
    if (userEmail) {
      await sendInboundBounce({
        to: userEmail,
        reason: 'חסרים פרטים בסיסיים (מלון / תאריכים / מחיר)',
        settingsUrl: `${APP_URL}/settings#inbound`,
      }).catch((e) => console.warn('[inbound] bounce email failed', e));
    }
    return NextResponse.json({ ok: true, skipped: 'incomplete' });
  }

  await admin.from('inbound_emails').update({ status: 'parsed' }).eq('id', inboundId);

  // Resolve Booking.com URL (best-effort — failure is non-fatal, we fall back to the homepage)
  let url = 'https://www.booking.com';
  try {
    const search = await nas.search({
      hotel_name: extracted.hotel_name,
      check_in: extracted.check_in,
      check_out: extracted.check_out,
      adults: extracted.guests?.adults,
      children: extracted.guests?.children,
      rooms: extracted.guests?.rooms,
    });
    url = search.url;
  } catch (err) {
    console.warn('[inbound] search failed (non-fatal)', err);
  }

  // FX → ILS for the savings counter (mirror add/actions.ts)
  const currency = (extracted.currency || 'ILS').toUpperCase();
  let paid_price_ils: number | null = null;
  if (currency !== 'ILS') {
    try {
      const r = await fetch(`https://open.er-api.com/v6/latest/${currency}`, {
        signal: AbortSignal.timeout(8000),
      });
      const j = await r.json();
      if (j?.result === 'success' && j?.rates?.ILS) {
        paid_price_ils = extracted.total_price * Number(j.rates.ILS);
      }
    } catch {
      // skip — non-fatal
    }
  } else {
    paid_price_ils = extracted.total_price;
  }

  const { data: booking, error: bookErr } = await admin
    .from('bookings')
    .insert({
      user_id: userId,
      source: extracted.source || detected || 'booking.com',
      url,
      hotel_name: extracted.hotel_name,
      check_in: extracted.check_in,
      check_out: extracted.check_out,
      guests: extracted.guests || { adults: 2, children: 0, rooms: 1 },
      room_type: extracted.room_type,
      meal_plan: extracted.meal_plan,
      cancellation: extracted.cancellation,
      currency,
      paid_price: extracted.total_price,
      paid_price_ils,
      status: 'active',
    })
    .select('id')
    .single();
  if (bookErr) {
    console.error('[inbound] booking insert failed', bookErr.message);
    await admin.from('inbound_emails').update({
      status: 'error',
      error: `db: ${bookErr.message.slice(0, 500)}`,
    }).eq('id', inboundId);
    return new NextResponse('db error', { status: 500 });
  }

  await admin.from('inbound_emails').update({
    status: 'created',
    booking_id: booking.id,
  }).eq('id', inboundId);

  // Kick off the first price check in the background (populates hotel image,
  // baseline price). after() returns 200 immediately; the scrape can take
  // up to ~30s and runs after the webhook responds.
  const bookingId = booking.id as string;
  after(async () => {
    const newAdmin = createAdminClient();
    await runPriceCheck(newAdmin, {
      id: bookingId,
      url,
      room_type: extracted.room_type,
      meal_plan: extracted.meal_plan,
      hotel_image_url: null,
    });
  });

  // Confirmation email (non-fatal if it fails)
  if (userEmail) {
    const paidFormatted = new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(extracted.total_price);
    await sendInboundConfirmation({
      to: userEmail,
      hotelName: extracted.hotel_name,
      checkIn: extracted.check_in,
      checkOut: extracted.check_out,
      paidFormatted,
      bookingUrl: `${APP_URL}/booking/${booking.id}`,
    }).catch((e) => console.warn('[inbound] confirmation email failed', e));
  }

  return NextResponse.json({ ok: true, booking_id: booking.id });
}

// -----------------------------------------------------------------------------
// Payload parsing
// -----------------------------------------------------------------------------

interface EmailFields {
  eventId: string;
  emailId: string | null;     // Resend internal id, used to fetch body
  messageId: string | null;   // RFC 5322 Message-ID, used for idempotency
  from: string | null;
  to: string[];
  cc: string[];
  subject: string | null;
  text: string | null;
  html: string | null;
}

function extractEmailFields(payload: unknown): EmailFields | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;

  // Resend wraps the payload in { type, data } via Svix.
  const data = (p.data && typeof p.data === 'object' ? (p.data as Record<string, unknown>) : p);

  const eventId = String(p.id || data.id || Date.now());
  const emailId = pickString(data.email_id) || pickString(data.id);
  const from = pickString(data.from) || pickAddress(data.from);
  const to = asAddressList(data.to);
  const cc = asAddressList(data.cc);
  const subject = pickString(data.subject);
  const text = pickString(data.text);
  const html = pickString(data.html);
  // Resend Inbound exposes Message-ID directly on data; legacy providers nest it under data.headers.
  const messageId = pickString(data.message_id) || extractMessageId(data.headers);

  return { eventId, emailId, messageId, from, to, cc, subject, text, html };
}

/**
 * Resend Inbound webhooks include only metadata — the email body (text + html)
 * has to be fetched separately via GET /emails/receiving/{id}. The Resend SDK
 * doesn't expose this endpoint yet (their .emails.get() hits /emails/{id},
 * which is outbound-only), so we call the REST API directly.
 *
 * On failure returns { text: null, html: null, fetchError: "..." } so the
 * caller can surface the reason in the inbound_emails log.
 */
async function fetchEmailBody(emailId: string): Promise<{ text: string | null; html: string | null; fetchError?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { text: null, html: null, fetchError: 'RESEND_API_KEY not set' };
  }
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const msg = `${res.status}: ${body.slice(0, 200)}`;
      console.warn('[inbound] resend receiving fetch failed', msg);
      return { text: null, html: null, fetchError: msg };
    }
    const data = await res.json() as { text?: string | null; html?: string | null };
    return { text: data.text ?? null, html: data.html ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[inbound] resend receiving fetch threw', msg);
    return { text: null, html: null, fetchError: msg };
  }
}

function pickString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

// Some providers give { email, name } objects for from
function pickAddress(v: unknown): string | null {
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    if (typeof obj.email === 'string') return obj.email;
    if (typeof obj.address === 'string') return obj.address;
  }
  return null;
}

function asAddressList(v: unknown): string[] {
  if (!v) return [];
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) {
    return v
      .map((item) => (typeof item === 'string' ? item : pickAddress(item)))
      .filter((s): s is string => !!s);
  }
  const single = pickAddress(v);
  return single ? [single] : [];
}

function extractMessageId(headers: unknown): string | null {
  if (!headers) return null;
  // Array of { name, value }
  if (Array.isArray(headers)) {
    for (const h of headers) {
      if (h && typeof h === 'object') {
        const name = (h as { name?: unknown }).name;
        const value = (h as { value?: unknown }).value;
        if (typeof name === 'string' && name.toLowerCase() === 'message-id' && typeof value === 'string') {
          return value.trim();
        }
      }
    }
    return null;
  }
  // Map shape
  if (typeof headers === 'object') {
    const obj = headers as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === 'message-id' && typeof obj[k] === 'string') {
        return (obj[k] as string).trim();
      }
    }
  }
  return null;
}

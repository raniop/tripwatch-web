import { Resend } from 'resend';
import type { Messages, Locale } from '@/lib/i18n/types';
import { he } from '@/lib/i18n/messages/he';
import { en } from '@/lib/i18n/messages/en';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'TripWatch <noreply@tripwatch.vercel.app>';
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Resolve a per-locale email-strings dictionary. Used by every send-* helper
 * below so the caller only needs to pass `locale`.
 */
function emailsFor(locale: Locale | undefined): Messages['emails'] {
  return (locale === 'en' ? en : he).emails;
}

const dirAttr = (l?: Locale) => (l === 'en' ? 'ltr' : 'rtl');

// ---------- Price drop ----------
interface PriceDropEmailArgs {
  to: string;
  locale?: Locale;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  paidFormatted: string;
  currentFormatted: string;
  savingsFormatted: string;
  savingsPct: number;
  bookingUrl: string;
  appUrl: string;
}

export async function sendPriceDropEmail(args: PriceDropEmailArgs) {
  if (!resend) return { skipped: true };
  const m = emailsFor(args.locale);
  const subject = m.priceDropSubject
    .replace('{hotel}', args.hotelName)
    .replace('{savings}', args.savingsFormatted);
  const html = renderPriceDropHtml(args, m);
  const { data, error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function renderPriceDropHtml(a: PriceDropEmailArgs, m: Messages['emails']): string {
  const d = dirAttr(a.locale);
  const align = a.locale === 'en' ? 'left' : 'right';
  return `<!doctype html>
<html lang="${a.locale === 'en' ? 'en' : 'he'}" dir="${d}">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>${escape(a.hotelName)}</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${d};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">${m.priceDropTitle}</h1>
    </td></tr>
    <tr><td style="padding:16px 28px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b;">${escape(a.hotelName)}</h2>
      <div style="font-size:14px;color:#71717a;">${escape(a.checkIn)} → ${escape(a.checkOut)}</div>
    </td></tr>
    <tr><td style="padding:8px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;padding:16px;">
        <tr><td style="font-size:14px;color:#52525b;">${m.priceDropPaidLabel}</td><td align="${align === 'right' ? 'left' : 'right'}" style="font-size:15px;color:#18181b;font-variant-numeric:tabular-nums;">${escape(a.paidFormatted)}</td></tr>
        <tr><td style="font-size:14px;color:#52525b;padding-top:6px;">${m.priceDropCurrentLabel}</td><td align="${align === 'right' ? 'left' : 'right'}" style="font-size:15px;color:#18181b;padding-top:6px;font-variant-numeric:tabular-nums;">${escape(a.currentFormatted)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #e4e4e7;padding-top:10px;margin-top:6px;"></td></tr>
        <tr><td style="font-size:14px;color:#16a34a;font-weight:600;">${m.priceDropSavingsLabel}</td><td align="${align === 'right' ? 'left' : 'right'}" style="font-size:18px;color:#16a34a;font-weight:700;font-variant-numeric:tabular-nums;">${escape(a.savingsFormatted)} (${a.savingsPct.toFixed(1)}%)</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 28px 4px;">
      <a href="${a.bookingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${m.priceDropCta}</a>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:8px 0 0;">${m.priceDropFooterHint}</p>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      <a href="${a.appUrl}" style="color:#a1a1aa;text-decoration:underline;">${m.priceDropOpenInApp}</a> · <a href="${a.appUrl}/settings" style="color:#a1a1aa;text-decoration:underline;">${m.priceDropPreferences}</a>
    </td></tr>
  </table>
</body></html>`;
}

// ---------- Cancellation reminder ----------
interface CancellationReminderEmailArgs {
  to: string;
  locale?: Locale;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  hoursRemaining: number;
  deadlineISO: string;
  bookingUrl: string;
  appUrl: string;
}

export async function sendCancellationReminderEmail(args: CancellationReminderEmailArgs) {
  if (!resend) return { skipped: true };
  const m = emailsFor(args.locale);
  const subject = m.cancellationSubjectPrefix
    .replace('{hours}', String(args.hoursRemaining))
    .replace('{hotel}', args.hotelName);
  const deadlineLocal = new Date(args.deadlineISO).toLocaleString(args.locale === 'en' ? 'en-US' : 'he-IL', {
    dateStyle: 'medium', timeStyle: 'short',
  });
  const d = dirAttr(args.locale);
  const align = args.locale === 'en' ? 'left' : 'right';
  const html = `<!doctype html>
<html lang="${args.locale === 'en' ? 'en' : 'he'}" dir="${d}"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${d};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">${m.cancellationTitle}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b;">${escape(args.hotelName)}</h2>
      <div style="font-size:14px;color:#71717a;">${escape(args.checkIn)} → ${escape(args.checkOut)}</div>
      <div style="margin-top:12px;font-size:14px;color:#dc2626;font-weight:600;">
        ${m.cancellationRemainingPrefix.replace('{hours}', String(args.hoursRemaining))}
      </div>
      <div style="font-size:13px;color:#71717a;margin-top:4px;">
        ${m.cancellationDeadlineLabel.replace('{date}', escape(deadlineLocal))}
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 8px;">
      <p style="font-size:14px;color:#52525b;line-height:1.6;margin:8px 0;">${m.cancellationBody}</p>
    </td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <a href="${args.bookingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${m.cancellationCta}</a>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      <a href="${args.appUrl}" style="color:#a1a1aa;text-decoration:underline;">${m.cancellationFooter}</a>
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

// ---------- Inbound verify ----------
interface VerifyInboundEmailArgs {
  to: string;
  locale?: Locale;
  link: string;
  appUrl: string;
}

export async function sendVerifyInboundEmail(args: VerifyInboundEmailArgs) {
  if (!resend) return { skipped: true };
  const m = emailsFor(args.locale);
  const d = dirAttr(args.locale);
  const align = args.locale === 'en' ? 'left' : 'right';
  const html = `<!doctype html>
<html lang="${args.locale === 'en' ? 'en' : 'he'}" dir="${d}"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${d};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:20px;color:#18181b;">${m.verifyInboundTitle}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <p style="font-size:14px;color:#52525b;line-height:1.6;margin:8px 0;">${m.verifyInboundBody1}</p>
      <p style="font-size:14px;color:#52525b;line-height:1.6;margin:8px 0;">${m.verifyInboundBody2}</p>
    </td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <a href="${args.link}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${m.verifyInboundCta}</a>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      ${m.verifyInboundFooter}
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject: m.verifyInboundSubject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

// ---------- Inbound confirmation ----------
interface InboundConfirmationArgs {
  to: string;
  locale?: Locale;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  paidFormatted: string;
  bookingUrl: string;
}

export async function sendInboundConfirmation(args: InboundConfirmationArgs) {
  if (!resend) return { skipped: true };
  const m = emailsFor(args.locale);
  const subject = m.inboundConfirmSubject.replace('{hotel}', args.hotelName);
  const d = dirAttr(args.locale);
  const align = args.locale === 'en' ? 'left' : 'right';
  const html = `<!doctype html>
<html lang="${args.locale === 'en' ? 'en' : 'he'}" dir="${d}"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${d};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">${m.inboundConfirmTitle}</h1>
    </td></tr>
    <tr><td style="padding:16px 28px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b;">${escape(args.hotelName)}</h2>
      <div style="font-size:14px;color:#71717a;">${escape(args.checkIn)} → ${escape(args.checkOut)}</div>
      <div style="font-size:14px;color:#52525b;margin-top:8px;">${m.inboundConfirmPaidLabel} <strong>${escape(args.paidFormatted)}</strong></div>
    </td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <a href="${args.bookingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${m.inboundConfirmCta}</a>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      ${m.inboundConfirmFooter}
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

// ---------- Inbound bounce ----------
interface InboundBounceArgs {
  to: string;
  locale?: Locale;
  reason: string;
  settingsUrl: string;
}

export async function sendInboundBounce(args: InboundBounceArgs) {
  if (!resend) return { skipped: true };
  const m = emailsFor(args.locale);
  const d = dirAttr(args.locale);
  const align = args.locale === 'en' ? 'left' : 'right';
  const html = `<!doctype html>
<html lang="${args.locale === 'en' ? 'en' : 'he'}" dir="${d}"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${d};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:20px;color:#18181b;">${m.inboundBounceTitle}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:8px 0;">
        ${m.inboundBounceReasonPrefix.replace('{reason}', escape(args.reason))}
      </p>
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:12px 0 0;">${m.inboundBounceBody}</p>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <a href="${args.settingsUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${m.inboundBounceCta}</a>
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject: m.inboundBounceSubject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

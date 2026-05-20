import { Resend } from 'resend';
import type { Locale, Messages } from '@/lib/i18n/types';
import { he } from '@/lib/i18n/messages/he';
import { en } from '@/lib/i18n/messages/en';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'TripWatch <onboarding@resend.dev>';
const resend = apiKey ? new Resend(apiKey) : null;

function emailsFor(locale: Locale | undefined): Messages['emails'] {
  return (locale === 'en' ? en : he).emails;
}

interface Args {
  to: string;
  locale?: Locale;
  keepEmail: string;
  mergeEmail: string;
  link: string;
}

export async function sendMergeEmail({ to, locale, keepEmail, mergeEmail, link }: Args) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping merge email');
    return { skipped: true };
  }
  const m = emailsFor(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const align = locale === 'en' ? 'left' : 'right';

  const html = `<!doctype html>
<html lang="${locale === 'en' ? 'en' : 'he'}" dir="${dir}">
<head><meta charset="utf-8" /><title>${m.mergeTitle}</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:${dir};text-align:${align};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">${m.mergeTitle}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 12px;">
        ${m.mergeBody1.replace('{mergeEmail}', escape(mergeEmail)).replace('{keepEmail}', escape(keepEmail))}
      </p>
      <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 12px;">${m.mergeBody2}</p>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <a href="${link}" style="display:inline-block;background:#FF7A00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        ${m.mergeCta}
      </a>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      ${m.mergeFooter}
    </td></tr>
  </table>
</body></html>`;

  const { data, error } = await resend.emails.send({ from, to, subject: m.mergeSubject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'TripWatch <onboarding@resend.dev>';
const resend = apiKey ? new Resend(apiKey) : null;

interface Args {
  to: string;
  keepEmail: string;
  link: string;
}

export async function sendMergeEmail({ to, keepEmail, link }: Args) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping merge email');
    return { skipped: true };
  }

  const html = renderHtml({ keepEmail, link });
  const subject = `🔗 בקשה לאיחוד חשבון TripWatch`;
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function renderHtml({ keepEmail, link }: { keepEmail: string; link: string }): string {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8" /><title>איחוד חשבון</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">🔗 בקשה לאיחוד חשבון</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 12px;">
        קיבלת מייל זה כי מישהו מהחשבון <b>${escape(keepEmail)}</b> ביקש למזג את חשבון ה-TripWatch שלך לחשבון שלו.
      </p>
      <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 12px;">
        <b>אם זה אתה</b> ואתה רוצה לאחד את שני החשבונות לאחד — כל ההזמנות וההגדרות שלך יועברו לחשבון <b>${escape(keepEmail)}</b>, והחשבון הזה יימחק.
      </p>
      <p style="font-size:15px;color:#dc2626;line-height:1.6;margin:0 0 16px;font-weight:600;">
        ⚠️ פעולה זו בלתי הפיכה. אם אתה לא יזמת אותה — התעלם מהמייל הזה.
      </p>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <a href="${link}" style="display:inline-block;background:#FF7A00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
        אישור איחוד החשבונות ←
      </a>
      <p style="font-size:12px;color:#a1a1aa;margin:14px 0 0;">הקישור תקף ל-60 דקות.</p>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      TripWatch · אם יש לך שאלות, ענה למייל הזה.
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

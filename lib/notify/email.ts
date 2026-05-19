import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'TripWatch <noreply@tripwatch.vercel.app>';
const resend = apiKey ? new Resend(apiKey) : null;

interface PriceDropEmailArgs {
  to: string;
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
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { skipped: true };
  }

  const subject = `💸 ירידת מחיר ב-${args.hotelName} — חיסכון של ${args.savingsFormatted}`;
  const html = renderPriceDropHtml(args);

  const { data, error } = await resend.emails.send({
    from,
    to: args.to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

interface InboundConfirmationArgs {
  to: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  paidFormatted: string;
  bookingUrl: string;
}

export async function sendInboundConfirmation(args: InboundConfirmationArgs) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping inbound confirmation');
    return { skipped: true };
  }
  const subject = `✅ קלטנו את ההזמנה — ${args.hotelName}`;
  const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">✅ ההזמנה נקלטה ועומדת במעקב</h1>
    </td></tr>
    <tr><td style="padding:16px 28px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b;">${escape(args.hotelName)}</h2>
      <div style="font-size:14px;color:#71717a;">${escape(args.checkIn)} → ${escape(args.checkOut)}</div>
      <div style="font-size:14px;color:#52525b;margin-top:8px;">שילמת: <strong>${escape(args.paidFormatted)}</strong></div>
    </td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <a href="${args.bookingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">פתח את ההזמנה</a>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      נתחיל לעקוב אחרי המחיר ונשלח התראה אם הוא ירד.
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

interface InboundBounceArgs {
  to: string;
  reason: string;
  settingsUrl: string;
}

export async function sendInboundBounce(args: InboundBounceArgs) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping inbound bounce');
    return { skipped: true };
  }
  const subject = `לא הצלחנו לקלוט את המייל ששלחת`;
  const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"/></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:20px;color:#18181b;">לא זיהינו הזמנה במייל</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 16px;">
      <p style="font-size:14px;color:#52525b;line-height:1.6;margin:8px 0;">
        ניסינו לחלץ פרטי הזמנה מהמייל ששלחת, אבל לא הצלחנו.
      </p>
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:8px 0;">
        סיבה: ${escape(args.reason)}
      </p>
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:12px 0 0;">
        נסה לפורוורד את אישור ההזמנה המקורי מ-Booking/Agoda/Expedia/Hotels.com, או הוסף את ההזמנה ידנית באתר.
      </p>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <a href="${args.settingsUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">פתח הגדרות</a>
    </td></tr>
  </table>
</body></html>`;
  const { data, error } = await resend.emails.send({ from, to: args.to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id };
}

function renderPriceDropHtml(a: PriceDropEmailArgs): string {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${escape(a.hotelName)}</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f4f4f5;padding:24px 16px;direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr><td style="padding:24px 28px 8px;">
      <div style="font-size:14px;color:#71717a;">TripWatch</div>
      <h1 style="margin:8px 0 0;font-size:22px;color:#18181b;">💸 ירידת מחיר!</h1>
    </td></tr>
    <tr><td style="padding:16px 28px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#18181b;">${escape(a.hotelName)}</h2>
      <div style="font-size:14px;color:#71717a;">${escape(a.checkIn)} → ${escape(a.checkOut)}</div>
    </td></tr>
    <tr><td style="padding:8px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;padding:16px;">
        <tr><td style="font-size:14px;color:#52525b;">שילמת:</td><td align="left" style="font-size:15px;color:#18181b;font-variant-numeric:tabular-nums;">${escape(a.paidFormatted)}</td></tr>
        <tr><td style="font-size:14px;color:#52525b;padding-top:6px;">עכשיו:</td><td align="left" style="font-size:15px;color:#18181b;padding-top:6px;font-variant-numeric:tabular-nums;">${escape(a.currentFormatted)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #e4e4e7;padding-top:10px;margin-top:6px;"></td></tr>
        <tr><td style="font-size:14px;color:#16a34a;font-weight:600;">חיסכון פוטנציאלי:</td><td align="left" style="font-size:18px;color:#16a34a;font-weight:700;font-variant-numeric:tabular-nums;">${escape(a.savingsFormatted)} (${a.savingsPct.toFixed(1)}%)</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 28px 4px;">
      <a href="${a.bookingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">פתח את ההזמנה ב-Booking</a>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <p style="font-size:13px;color:#71717a;line-height:1.6;margin:8px 0 0;">
        💡 אם יש Free cancellation בהזמנה הנוכחית שלך, אפשר לבטל ולהזמין מחדש במחיר החדש.<br/>
        מחירים משתנים מהר — בדוק את הזמינות לפני שאתה מבטל.
      </p>
    </td></tr>
    <tr><td style="background:#fafafa;padding:14px 28px;font-size:12px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;">
      <a href="${a.appUrl}" style="color:#a1a1aa;text-decoration:underline;">פתח ב-TripWatch</a> · <a href="${a.appUrl}/settings" style="color:#a1a1aa;text-decoration:underline;">העדפות התראות</a>
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

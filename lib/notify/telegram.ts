/**
 * Direct Telegram Bot API client. We don't need Telegraf in the Vercel app —
 * we just POST a sendMessage call.
 */
const token = process.env.TELEGRAM_BOT_TOKEN;

interface SendOpts {
  chatId: number;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  disableLinkPreview?: boolean;
}

export async function telegramSend({ chatId, text, parseMode = 'HTML', disableLinkPreview = true }: SendOpts) {
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set — skipping telegram send');
    return { skipped: true };
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      link_preview_options: { is_disabled: disableLinkPreview },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`telegram ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Telegram account linking — two endpoints:
 *  POST  /api/telegram/link  → user clicks "link telegram" in web app, we mint
 *                              a one-time token, return it. User sends the
 *                              token to the bot as `/link <token>`.
 *  PATCH /api/telegram/link  → called by the bot (with NAS_API_KEY bearer)
 *                              when the user sends `/link <token>` — we look
 *                              up the token, set telegram_chat_id on profile.
 */
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // hex → uppercase: alphabet [0-9A-F] only. base64url would include "-" and "_"
  // which trip the bot's /^[A-Z0-9]{4,16}$/ regex (and look ugly to users).
  const token = randomBytes(4).toString('hex').toUpperCase();
  const expires = new Date(Date.now() + 30 * 60_000).toISOString();

  // Upsert in case the profile row wasn't auto-created by the trigger
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, telegram_link_token: token, telegram_link_expires_at: expires },
      { onConflict: 'id' },
    );
  if (error) {
    console.error('telegram link POST upsert failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    token,
    expires,
    instructions: `שלח לבוט @${process.env.TELEGRAM_BOT_USERNAME || 'RaniTripWatchBot'}:\n/link ${token}`,
  });
}

export async function PATCH(request: Request) {
  const expected = process.env.NAS_API_KEY;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { token, chat_id } = (await request.json().catch(() => ({}))) as {
    token?: string;
    chat_id?: number;
  };
  if (!token || !chat_id) return NextResponse.json({ error: 'token and chat_id required' }, { status: 400 });

  const sb = createAdminClient();
  const { data: profile } = await sb
    .from('profiles')
    .select('id, telegram_link_expires_at')
    .eq('telegram_link_token', token)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: 'invalid token' }, { status: 404 });
  if (profile.telegram_link_expires_at && new Date(profile.telegram_link_expires_at) < new Date()) {
    return NextResponse.json({ error: 'token expired' }, { status: 410 });
  }

  await sb
    .from('profiles')
    .update({
      telegram_chat_id: chat_id,
      telegram_link_token: null,
      telegram_link_expires_at: null,
      notification_prefs: { email: true, in_app: true, telegram: true },
    })
    .eq('id', profile.id);

  return NextResponse.json({ ok: true });
}

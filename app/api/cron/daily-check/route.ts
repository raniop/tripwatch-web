import { NextResponse } from 'next/server';
import { nas } from '@/lib/nas-client';

/**
 * Vercel Cron handler. Configured in vercel.json to fire daily at 07:00 UTC
 * (10:00 Asia/Jerusalem). It just kicks the NAS background runner — the NAS
 * does the actual scrape loop and writes results to Supabase directly.
 *
 * Auth: Vercel Cron sends a header "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const got = request.headers.get('authorization') || '';
  if (expected && got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const r = await nas.triggerDailyCheck();
    return NextResponse.json({ ok: true, ...r });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

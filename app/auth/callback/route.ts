import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  // Behind Vercel's edge, `origin` is the internal URL, not the public one.
  // Use x-forwarded-host to redirect to the real domain (tripwatch.net).
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocal = process.env.NODE_ENV === 'development';
  const publicBase = isLocal
    ? origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : origin;

  if (!code) {
    return NextResponse.redirect(`${publicBase}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${publicBase}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Best-effort profile sync from Google metadata — non-blocking
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const meta = user.user_metadata || {};
      const incomingName =
        meta.full_name || meta.name || user.email?.split('@')[0] || null;
      const incomingAvatar = meta.avatar_url || meta.picture || null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const updates: Record<string, string> = {};
      if (!profile?.display_name && incomingName) updates.display_name = incomingName;
      if (!profile?.avatar_url && incomingAvatar) updates.avatar_url = incomingAvatar;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, ...updates }, { onConflict: 'id' });
      }
    }
  } catch (err) {
    console.warn('profile sync failed (non-fatal):', err);
  }

  return NextResponse.redirect(`${publicBase}${next}`);
}

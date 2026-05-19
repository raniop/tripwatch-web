import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Sync profile metadata from OAuth provider (Google).
    // Only fill display_name / avatar_url if the profile doesn't already have them
    // (so user-uploaded avatars aren't overwritten).
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const meta = user.user_metadata || {};
      const incomingName = meta.full_name || meta.name || user.email?.split('@')[0] || null;
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
  }

  return NextResponse.redirect(`${origin}${next}`);
}

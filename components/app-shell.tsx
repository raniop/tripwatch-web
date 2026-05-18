import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RealtimeNotifications } from '@/components/realtime-notifications';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle()).data
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">✈️</span>
            <span>TripWatch</span>
          </Link>
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="size-7 rounded-full" />
            ) : (
              <div className="grid size-7 place-items-center rounded-full bg-muted text-xs">
                {(profile?.display_name || user?.email || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
              הגדרות
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground" aria-label="התנתקות">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      {user && <RealtimeNotifications userId={user.id} />}
    </div>
  );
}

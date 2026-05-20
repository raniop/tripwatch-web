import Link from 'next/link';
import { Home, LogOut, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RealtimeNotifications } from '@/components/realtime-notifications';
import { CommandPalette } from '@/components/command-palette';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [profileRes, bookingsRes] = user
    ? await Promise.all([
        supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle(),
        supabase
          .from('bookings')
          .select('id, hotel_name, check_in, check_out')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('check_in', { ascending: true })
          .limit(50),
      ])
    : [{ data: null } as { data: null }, { data: null } as { data: null }];
  const profile = profileRes.data;
  const bookings = (bookingsRes.data ?? []) as Array<{
    id: string;
    hotel_name: string | null;
    check_in: string;
    check_out: string;
  }>;

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
            <CmdKHint />
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
              title="דף הבית"
              aria-label="דף הבית"
            >
              <Home className="size-4" />
            </Link>
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
      {user && <CommandPalette bookings={bookings} />}
    </div>
  );
}

function CmdKHint() {
  // Visual ⌘K hint in the header — pressing it opens the palette via the
  // keyboard shortcut listener. Hidden on small screens to save space.
  return (
    <kbd
      className="hidden md:inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground"
      title="חיפוש מהיר (⌘K / Ctrl+K)"
      dir="ltr"
    >
      <Search className="size-3" />
      ⌘K
    </kbd>
  );
}

import { AppShell } from '@/components/app-shell';
import { SettingsForm } from '@/components/settings-form';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'הגדרות · TripWatch' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const profile = data as Profile | null;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">הגדרות</h1>
        <SettingsForm profile={profile} email={user.email ?? ''} />
      </div>
    </AppShell>
  );
}

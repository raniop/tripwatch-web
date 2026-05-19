import { AppShell } from '@/components/app-shell';
import { SettingsForm } from '@/components/settings-form';
import { InboundForwardCard } from '@/components/inbound-forward-card';
import { createClient } from '@/lib/supabase/server';
import { ensureInboundAddress } from '@/app/settings/actions';
import { getGlobalAddress } from '@/lib/inbound/address';
import type { Profile, InboundEmail } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'הגדרות · TripWatch' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profileData }, addressResult, { data: inboundData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    ensureInboundAddress(),
    supabase
      .from('inbound_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(10),
  ]);
  const profile = profileData as Profile | null;
  const personalAddress = addressResult.ok ? addressResult.address : null;
  const recent = (inboundData ?? []) as InboundEmail[];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <InboundForwardCard
          globalAddress={getGlobalAddress()}
          userEmail={user.email ?? ''}
          personalAddress={personalAddress}
          recent={recent}
        />
        <SettingsForm profile={profile} email={user.email ?? ''} />
      </div>
    </AppShell>
  );
}

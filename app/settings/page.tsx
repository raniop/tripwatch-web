import { AppShell } from '@/components/app-shell';
import { SettingsForm } from '@/components/settings-form';
import { InboundForwardCard } from '@/components/inbound-forward-card';
import { createClient } from '@/lib/supabase/server';
import { ensureInboundAddress } from '@/app/settings/actions';
import { getGlobalAddress } from '@/lib/inbound/address';
import { getMessages } from '@/lib/i18n';
import type { Profile, InboundEmail } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings · TripWatch' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const t = await getMessages();

  const [{ data: profileData }, addressResult, { data: inboundData }, { data: verifiedData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    ensureInboundAddress(),
    supabase
      .from('inbound_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(10),
    supabase
      .from('user_verified_emails')
      .select('email, verified_at')
      .eq('user_id', user.id)
      .order('verified_at', { ascending: false }),
  ]);
  const profile = profileData as Profile | null;
  const personalAddress = addressResult.ok ? addressResult.address : null;
  const recent = (inboundData ?? []) as InboundEmail[];
  const verifiedEmails = (verifiedData ?? []) as Array<{ email: string; verified_at: string }>;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t.settings.h1}</h1>
        <InboundForwardCard
          globalAddress={getGlobalAddress()}
          userEmail={user.email ?? ''}
          personalAddress={personalAddress}
          recent={recent}
          verifiedEmails={verifiedEmails}
          messages={t.settings}
        />
        <SettingsForm profile={profile} email={user.email ?? ''} messages={t.settings} />
      </div>
    </AppShell>
  );
}

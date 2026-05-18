'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateNotificationPrefs(prefs: { email: boolean; in_app: boolean; telegram: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };
  const { error } = await supabase
    .from('profiles')
    .update({ notification_prefs: prefs })
    .eq('id', user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/settings');
  return { ok: true as const };
}

export async function updateDefaults(input: { alert_pct_default: number; alert_amount_ils_default: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };
  const { error } = await supabase
    .from('profiles')
    .update({
      alert_pct_default: input.alert_pct_default,
      alert_amount_ils_default: input.alert_amount_ils_default,
    })
    .eq('id', user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/settings');
  return { ok: true as const };
}

export async function unlinkTelegram() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('profiles')
    .update({ telegram_chat_id: null, notification_prefs: { email: true, in_app: true, telegram: false } })
    .eq('id', user.id);
  revalidatePath('/settings');
}

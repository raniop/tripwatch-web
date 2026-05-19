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

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const file = formData.get('avatar') as File | null;
  if (!file) return { ok: false as const, error: 'no file' };
  if (file.size > 2 * 1024 * 1024) return { ok: false as const, error: 'הקובץ גדול מדי (מקסימום 2MB)' };

  const ext = (file.type.split('/')[1] || 'jpg').replace(/[^a-z]/g, '');
  const path = `${user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
    contentType: file.type,
    upsert: true,
    cacheControl: '3600',
  });
  if (upErr) return { ok: false as const, error: upErr.message };

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${publicUrl}?t=${Date.now()}`; // cache-bust

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);
  if (profileErr) return { ok: false as const, error: profileErr.message };

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true as const, url };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  // Try to delete uploaded file(s); ignore errors (might not exist)
  await supabase.storage.from('avatars').remove([
    `${user.id}/avatar.jpg`,
    `${user.id}/avatar.jpeg`,
    `${user.id}/avatar.png`,
    `${user.id}/avatar.webp`,
  ]);

  await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true as const };
}

export async function updateDisplayName(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const clean = name.trim().slice(0, 80);
  if (!clean) return { ok: false as const, error: 'שם לא יכול להיות ריק' };
  await supabase.from('profiles').update({ display_name: clean }).eq('id', user.id);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true as const };
}

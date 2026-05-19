'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { signMergeToken } from '@/lib/merge-token';
import { signVerifyEmailToken } from '@/lib/inbound/verify-token';
import { sendMergeEmail } from '@/lib/notify/merge-email';
import { sendVerifyInboundEmail } from '@/lib/notify/email';
import { generateInboundToken, formatInboundAddress } from '@/lib/inbound/address';

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

/**
 * Request to merge another existing TripWatch account into the current one.
 * Sends a verification email to the OTHER address with a one-time link.
 * Clicking the link performs the merge (move all bookings + delete other user).
 */
export async function requestAccountMerge(otherEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false as const, error: 'unauthorized' };

  const cleanOther = otherEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanOther)) {
    return { ok: false as const, error: 'מייל לא תקין' };
  }
  if (cleanOther === user.email.toLowerCase()) {
    return { ok: false as const, error: 'זה אותו מייל — אין מה לאחד' };
  }

  // Look up the other user via admin
  const admin = createAdminClient();
  let other = null as { id: string; email: string } | null;
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { ok: false as const, error: error.message };
    const match = data.users.find((u) => u.email?.toLowerCase() === cleanOther);
    if (match) {
      other = { id: match.id, email: match.email! };
      break;
    }
    if (data.users.length < 1000) break;
    page++;
  }
  if (!other) {
    return { ok: false as const, error: 'לא נמצא חשבון פעיל עם המייל הזה' };
  }
  if (other.id === user.id) {
    return { ok: false as const, error: 'זה אותו חשבון' };
  }

  // Sign + email
  const token = signMergeToken({
    keep_uid: user.id,
    merge_uid: other.id,
    keep_email: user.email,
    merge_email: other.email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.net';
  const link = `${base}/api/merge/confirm?token=${encodeURIComponent(token)}`;

  try {
    await sendMergeEmail({ to: other.email, keepEmail: user.email, link });
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'שליחת המייל נכשלה' };
  }

  return { ok: true as const, sentTo: other.email };
}

/**
 * Return the user's forwarding address, creating a token on first call.
 * Token collisions on the UNIQUE index are astronomically unlikely; if one
 * does happen, the retry loop covers it.
 */
export async function ensureInboundAddress() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const { data: existing } = await supabase
    .from('profiles')
    .select('inbound_token')
    .eq('id', user.id)
    .maybeSingle();

  if (existing?.inbound_token) {
    return { ok: true as const, address: formatInboundAddress(existing.inbound_token) };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateInboundToken();
    const { error } = await supabase
      .from('profiles')
      .update({ inbound_token: token, inbound_token_created_at: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) {
      return { ok: true as const, address: formatInboundAddress(token) };
    }
    // Collision on UNIQUE → retry with new token
    if ((error as { code?: string }).code !== '23505') {
      return { ok: false as const, error: error.message };
    }
  }
  return { ok: false as const, error: 'could not allocate token' };
}

export async function rotateInboundToken() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateInboundToken();
    const { error } = await supabase
      .from('profiles')
      .update({ inbound_token: token, inbound_token_created_at: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) {
      revalidatePath('/settings');
      return { ok: true as const, address: formatInboundAddress(token) };
    }
    if ((error as { code?: string }).code !== '23505') {
      return { ok: false as const, error: error.message };
    }
  }
  return { ok: false as const, error: 'could not allocate token' };
}

/**
 * Send a verification link to an email the user wants to register as an
 * additional "from" address for inbound forwarding.
 */
export async function requestInboundEmailVerification(rawEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: 'מייל לא תקין' };
  }
  if (email === user.email?.toLowerCase()) {
    return { ok: false as const, error: 'כבר רשום — זה המייל הראשי שלך' };
  }

  // Already verified? short-circuit
  const { data: existing } = await supabase
    .from('user_verified_emails')
    .select('email')
    .eq('user_id', user.id)
    .eq('email', email)
    .maybeSingle();
  if (existing) return { ok: false as const, error: 'הכתובת כבר מאומתת' };

  const token = signVerifyEmailToken({
    user_id: user.id,
    email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.net';
  const link = `${base}/api/email/verify-inbound?token=${encodeURIComponent(token)}`;

  try {
    await sendVerifyInboundEmail({ to: email, link, appUrl: base });
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'שליחת המייל נכשלה' };
  }
  return { ok: true as const, sentTo: email };
}

export async function removeInboundEmail(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'unauthorized' };

  const clean = email.trim().toLowerCase();
  await supabase.from('user_verified_emails').delete().eq('user_id', user.id).eq('email', clean);
  revalidatePath('/settings');
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

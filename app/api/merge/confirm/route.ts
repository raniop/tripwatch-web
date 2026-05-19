/**
 * Account merge confirmation endpoint.
 * Triggered by clicking the link in the merge email.
 * Validates the signed token, moves all data from merge_uid → keep_uid,
 * then deletes merge_uid from auth.users.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyMergeToken } from '@/lib/merge-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.net';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirectWithError('missing_token');
  }

  const payload = verifyMergeToken(token);
  if (!payload) {
    return redirectWithError('invalid_or_expired_token');
  }

  const { keep_uid, merge_uid } = payload;
  if (keep_uid === merge_uid) {
    return redirectWithError('same_user');
  }

  const admin = createAdminClient();

  try {
    // 1. Move bookings
    const { error: bookingsErr } = await admin
      .from('bookings')
      .update({ user_id: keep_uid })
      .eq('user_id', merge_uid);
    if (bookingsErr) throw new Error(`bookings: ${bookingsErr.message}`);

    // 2. Move notifications
    const { error: notifErr } = await admin
      .from('notifications')
      .update({ user_id: keep_uid })
      .eq('user_id', merge_uid);
    if (notifErr) throw new Error(`notifications: ${notifErr.message}`);

    // 3. Merge profile data — pull fields from old profile if keep doesn't have them
    const [keepProf, mergeProf] = await Promise.all([
      admin.from('profiles').select('*').eq('id', keep_uid).maybeSingle(),
      admin.from('profiles').select('*').eq('id', merge_uid).maybeSingle(),
    ]);
    if (mergeProf.data) {
      const updates: Record<string, unknown> = {};
      if (!keepProf.data?.telegram_chat_id && mergeProf.data.telegram_chat_id) {
        updates.telegram_chat_id = mergeProf.data.telegram_chat_id;
      }
      if (!keepProf.data?.avatar_url && mergeProf.data.avatar_url) {
        updates.avatar_url = mergeProf.data.avatar_url;
      }
      if (!keepProf.data?.display_name && mergeProf.data.display_name) {
        updates.display_name = mergeProf.data.display_name;
      }
      if (Object.keys(updates).length > 0) {
        await admin.from('profiles').update(updates).eq('id', keep_uid);
      }
    }

    // 4. Delete the merged user (cascade removes their profile + leftover rows)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(merge_uid);
    if (deleteErr) throw new Error(`delete user: ${deleteErr.message}`);

    return NextResponse.redirect(`${APP_URL}/dashboard?merged=ok`);
  } catch (err) {
    console.error('merge failed:', err);
    return redirectWithError('merge_failed');
  }
}

function redirectWithError(code: string) {
  return NextResponse.redirect(`${APP_URL}/login?merge_error=${code}`);
}

/**
 * Inbound-email verification confirm. The user clicks the link in the
 * verification email; we validate the signed token, insert into
 * user_verified_emails, then redirect to /settings with a toast flag.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyVerifyEmailToken } from '@/lib/inbound/verify-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tripwatch.net';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(`${APP_URL}/settings?verify_error=missing_token`);
  }

  const payload = verifyVerifyEmailToken(token);
  if (!payload) {
    return NextResponse.redirect(`${APP_URL}/settings?verify_error=invalid_or_expired`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('user_verified_emails')
    .upsert(
      { user_id: payload.user_id, email: payload.email.toLowerCase() },
      { onConflict: 'user_id,email' },
    );
  if (error) {
    console.error('[verify-inbound] insert failed', error.message);
    return NextResponse.redirect(`${APP_URL}/settings?verify_error=db`);
  }

  return NextResponse.redirect(`${APP_URL}/settings?verified_email=${encodeURIComponent(payload.email)}#inbound`);
}

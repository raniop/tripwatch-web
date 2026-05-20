'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';

export async function setLocale(locale: Locale) {
  if (!LOCALES.includes(locale)) return { ok: false as const };
  const c = await cookies();
  c.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Persist on the user's profile too, so cron-driven email sends pick up
  // the right language. Silent no-op if the user isn't signed in.
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ locale }).eq('id', user.id);
    }
  } catch {
    // ignore — cookie is the source of truth for guests
  }

  revalidatePath('/', 'layout');
  return { ok: true as const };
}

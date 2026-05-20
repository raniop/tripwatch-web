'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/i18n';

export async function setLocale(locale: Locale) {
  if (!LOCALES.includes(locale)) return { ok: false as const };
  const c = await cookies();
  c.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  // Re-render all routes with the new locale
  revalidatePath('/', 'layout');
  return { ok: true as const };
}

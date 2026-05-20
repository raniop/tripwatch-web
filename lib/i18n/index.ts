/**
 * Cookie-based locale resolution. No URL prefix changes — pages just
 * read the cookie server-side and pick the right dictionary.
 *
 * The single source of truth is the "tw_locale" cookie (he | en).
 * If absent, we fall back to Hebrew (the original primary language).
 */

import { cookies, headers } from 'next/headers';
import type { Locale, Messages } from './types';
import { he } from './messages/he';
import { en } from './messages/en';

export const LOCALES: Locale[] = ['he', 'en'];
export const DEFAULT_LOCALE: Locale = 'he';
export const LOCALE_COOKIE = 'tw_locale';

const DICTIONARIES: Record<Locale, Messages> = { he, en };

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const stored = c.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (stored && LOCALES.includes(stored)) return stored;
  // First-visit hint from the browser's Accept-Language
  const h = await headers();
  const accept = (h.get('accept-language') || '').toLowerCase();
  if (accept.startsWith('en') || accept.includes(',en')) return 'en';
  return DEFAULT_LOCALE;
}

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  return DICTIONARIES[locale];
}

export async function getLocaleAndMessages(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: DICTIONARIES[locale] };
}

export function dir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function htmlLang(locale: Locale): string {
  return locale === 'he' ? 'he' : 'en';
}

export type { Locale, Messages };

/**
 * Lookup the dictionary for a specific user_id. Used by cron-driven email
 * sends where there's no request cookie. Falls back to the default locale
 * if the profile doesn't have a locale set (or doesn't exist).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getMessagesForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ locale: Locale; t: Messages }> {
  const { data } = await supabase
    .from('profiles')
    .select('locale')
    .eq('id', userId)
    .maybeSingle();
  const stored = (data?.locale as Locale | undefined) ?? DEFAULT_LOCALE;
  const locale = LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
  return { locale, t: DICTIONARIES[locale] };
}

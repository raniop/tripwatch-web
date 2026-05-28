import dayjs from 'dayjs';
import 'dayjs/locale/he';

dayjs.locale('he');

const SYMBOLS: Record<string, string> = {
  ILS: '₪',
  THB: '฿',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export function fmtPrice(amount: number | null | undefined, currency: string | null | undefined, opts: { decimals?: number } = {}) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  const sym = currency ? SYMBOLS[currency] ?? '' : '';
  const n = Number(amount).toLocaleString('en-US', { maximumFractionDigits: opts.decimals ?? 0 });
  return sym ? `${sym}${n}` : `${n} ${currency || ''}`.trim();
}

export function fmtDateRange(checkIn: string, checkOut: string) {
  const ci = dayjs(checkIn);
  const co = dayjs(checkOut);
  const sameYear = ci.year() === co.year();
  const sameMonth = sameYear && ci.month() === co.month();
  if (sameMonth) return `${ci.format('D')}–${co.format('D MMM YYYY')}`;
  if (sameYear) return `${ci.format('D MMM')} – ${co.format('D MMM YYYY')}`;
  return `${ci.format('D MMM YYYY')} – ${co.format('D MMM YYYY')}`;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(0, dayjs(checkOut).diff(checkIn, 'day'));
}

export function fmtRelative(iso: string | null | undefined) {
  if (!iso) return 'מעולם לא';
  const d = dayjs(iso);
  const hours = dayjs().diff(d, 'hour');
  if (hours < 1) return 'לפני פחות משעה';
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = dayjs().diff(d, 'day');
  if (days < 7) return `לפני ${days} ימים`;
  return d.format('D MMM YYYY');
}

export function priceDiff(paid: number, current: number) {
  const diff = paid - current;
  const pct = (diff / paid) * 100;
  return { diff, pct, direction: diff > 0 ? 'down' : diff < 0 ? 'up' : 'same' as const };
}

/**
 * Extract the ISO 3166-1 alpha-2 country code from a Booking.com hotel URL.
 * Booking encodes it in the path: /hotel/cy/anassa.html → "CY".
 * Returns uppercased code, or null for non-Booking URLs / unknown shape.
 */
export function parseCountryFromBookingUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!/(^|\.)booking\.com$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/hotel\/([a-z]{2})\//i);
    return m ? m[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

/**
 * Country code → flag emoji (regional indicator pair). "CY" → 🇨🇾.
 * Works in every modern browser & email client that supports emoji 11+.
 */
export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  const A = 0x1f1e6; // regional indicator 'A'
  const cc = code.toUpperCase();
  return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
}

/**
 * Group bookings by check-in month. Returns sorted [monthKey, bookings][]
 * where monthKey is "YYYY-MM" and bookings preserve their input order.
 */
export function groupByCheckInMonth<T extends { check_in: string }>(items: T[]): Array<[string, T[]]> {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = it.check_in.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

/** "2026-07" → "יולי 2026" / "July 2026" depending on locale. */
export function fmtMonthHeader(monthKey: string, locale: 'he' | 'en' = 'he'): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
  return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

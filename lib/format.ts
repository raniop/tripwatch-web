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

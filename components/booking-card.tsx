import Link from 'next/link';
import { Bed, Calendar, UtensilsCrossed, Clock } from 'lucide-react';
import type { Booking } from '@/lib/supabase/types';
import { fmtPrice, fmtDateRange, nightsBetween, priceDiff } from '@/lib/format';
import { convertToILS } from '@/lib/fx';
import { cn } from '@/lib/utils';

interface CardMessages {
  paid: string;
  current: string;
  referencePriceLabel: string;
  notCheckedYet: string;
  trackingPausedShort: string;
  nights: string;
  cancelExpired: string;
  cancelUntilHours: string;
  cancelUntilDays: string;
  cancelUntilDate: string;
}

export async function BookingCard({ booking, messages }: { booking: Booking; messages: CardMessages }) {
  const nights = nightsBetween(booking.check_in, booking.check_out);
  const paidCur = (booking.currency || 'ILS').toUpperCase();
  const lastCur = (booking.last_currency || paidCur).toUpperCase();
  const paidPriceN = Number(booking.paid_price);
  const lastPriceN = booking.last_price !== null ? Number(booking.last_price) : null;
  const hasCheck = lastPriceN !== null;

  // Cross-currency comparison: normalize to ILS so the spread reflects real
  // savings rather than treating, say, 1820 EUR and 6155 ILS as same units.
  let paidIls = booking.paid_price_ils !== null ? Number(booking.paid_price_ils) : null;
  if (paidIls === null && paidCur === 'ILS') paidIls = paidPriceN;
  let currentIls: number | null = null;
  if (lastPriceN !== null) {
    currentIls = lastCur === 'ILS' ? lastPriceN : await convertToILS(lastPriceN, lastCur);
  }
  const currenciesDiffer = paidCur !== lastCur;
  const useIls = currenciesDiffer && paidIls !== null && currentIls !== null;
  // If the matcher had no room hint or scored weak, last_price is "Booking's
  // cheapest fallback" — not the user's actual room. Don't claim a savings.
  const score = booking.last_match_score !== null ? Number(booking.last_match_score) : null;
  const lowConfidence = !booking.room_type || score === null || score < 0.5;
  const diff = hasCheck && !lowConfidence
    ? (useIls
      ? { ...priceDiff(paidIls!, currentIls!), currency: 'ILS' }
      : { ...priceDiff(paidPriceN, lastPriceN!), currency: paidCur })
    : null;
  const deadline = cancellationChip(booking.cancellation_deadline, messages);

  return (
    <Link
      href={`/booking/${booking.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full bg-muted">
        {booking.hotel_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.hotel_image_url}
            alt={booking.hotel_name || ''}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-4xl">🏨</div>
        )}
        {hasCheck && diff && diff.direction === 'down' && diff.pct >= 1 && (
          <div className="absolute right-3 top-3 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white shadow">
            ⬇ {diff.pct.toFixed(0)}%
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold">{booking.hotel_name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {fmtDateRange(booking.check_in, booking.check_out)} · {nights} {messages.nights}
          </p>
          {deadline && (
            <p className={cn(
              'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
              deadline.cls,
            )}>
              <Clock className="size-3" />
              {deadline.text}
            </p>
          )}
        </div>

        {(booking.room_type || booking.meal_plan) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {booking.room_type && (
              <p className="flex items-center gap-1.5 line-clamp-1">
                <Bed className="size-3 shrink-0" />
                {booking.room_type}
              </p>
            )}
            {booking.meal_plan && (
              <p className="flex items-center gap-1.5">
                <UtensilsCrossed className="size-3 shrink-0" />
                {booking.meal_plan}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">{messages.paid}</span>
            <span className="tabular-nums text-sm font-medium">
              {fmtPrice(booking.paid_price, booking.currency)}
              {paidCur !== 'ILS' && paidIls && (
                <span className="ms-1 text-[10px] font-normal text-muted-foreground">≈ {fmtPrice(paidIls, 'ILS')}</span>
              )}
            </span>
          </div>
          {lowConfidence ? (
            <p className="pt-1 text-xs text-warning">⚠ {messages.trackingPausedShort}</p>
          ) : hasCheck ? (
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <span className="text-xs text-muted-foreground">{messages.current}</span>
              <span className={cn(
                'tabular-nums text-base font-bold',
                diff && diff.direction === 'down' && diff.pct >= 1 ? 'text-success' : diff && diff.direction === 'up' && diff.pct <= -1 ? 'text-destructive' : '',
              )}>
                {fmtPrice(booking.last_price, booking.last_currency || booking.currency)}
                {lastCur !== 'ILS' && currentIls && (
                  <span className="ms-1 text-[10px] font-normal text-muted-foreground">≈ {fmtPrice(currentIls, 'ILS')}</span>
                )}
                {diff && diff.direction !== 'same' && (
                  <span className="ms-2 text-xs font-normal">
                    {diff.direction === 'down' ? '⬇' : '⬆'} {Math.abs(diff.pct).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
          ) : (
            <p className="pt-1 text-xs text-muted-foreground">{messages.notCheckedYet}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function cancellationChip(
  iso: string | null,
  messages: Pick<CardMessages, 'cancelExpired' | 'cancelUntilHours' | 'cancelUntilDays' | 'cancelUntilDate'>,
): { text: string; cls: string } | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  const expired = ms <= 0;
  const hours = Math.round(ms / 3_600_000);
  const days = Math.round(ms / 86_400_000);
  // Format the date in the user's locale — JS uses navigator.language at runtime,
  // but for SSR we don't have that; "he-IL" gives consistent dates for both langs
  // since the format ("19 Apr") reads fine in EN too.
  const shortDate = new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });

  let text: string;
  if (expired) text = messages.cancelExpired;
  else if (hours < 24) text = messages.cancelUntilHours.replace('{h}', String(hours));
  else if (days <= 7) text = messages.cancelUntilDays.replace('{date}', shortDate).replace('{d}', String(days));
  else text = messages.cancelUntilDate.replace('{date}', shortDate);

  let cls = 'bg-success/15 text-success';
  if (expired) cls = 'bg-muted text-muted-foreground';
  else if (hours <= 48) cls = 'bg-destructive/15 text-destructive';
  else if (days <= 7) cls = 'bg-warning/15 text-warning';

  return { text, cls };
}

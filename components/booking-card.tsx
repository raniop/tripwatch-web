import Link from 'next/link';
import { Bed, Calendar, UtensilsCrossed } from 'lucide-react';
import type { Booking } from '@/lib/supabase/types';
import { fmtPrice, fmtDateRange, nightsBetween, priceDiff } from '@/lib/format';
import { cn } from '@/lib/utils';

export function BookingCard({ booking }: { booking: Booking }) {
  const nights = nightsBetween(booking.check_in, booking.check_out);
  const hasCheck = booking.last_price !== null;
  const diff = hasCheck ? priceDiff(Number(booking.paid_price), Number(booking.last_price)) : null;

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
            {fmtDateRange(booking.check_in, booking.check_out)} · {nights} לילות
          </p>
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
            <span className="text-xs text-muted-foreground">שילמת</span>
            <span className="tabular-nums text-sm font-medium">
              {fmtPrice(booking.paid_price, booking.currency)}
            </span>
          </div>
          {hasCheck && diff ? (
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <span className="text-xs text-muted-foreground">נוכחי</span>
              <span className={cn(
                'tabular-nums text-base font-bold',
                diff.direction === 'down' && diff.pct >= 1 ? 'text-success' : diff.direction === 'up' && diff.pct <= -1 ? 'text-destructive' : '',
              )}>
                {fmtPrice(booking.last_price, booking.last_currency || booking.currency)}
                {diff.direction !== 'same' && (
                  <span className="ms-2 text-xs font-normal">
                    {diff.direction === 'down' ? '⬇' : '⬆'} {Math.abs(diff.pct).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
          ) : (
            <p className="pt-1 text-xs text-muted-foreground">טרם נבדק — בודק בלילה הקרוב</p>
          )}
        </div>
      </div>
    </Link>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PriceChart } from '@/components/price-chart';
import { BookingActions } from '@/components/booking-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { fmtPrice, fmtDateRange, nightsBetween, priceDiff, fmtRelative } from '@/lib/format';
import type { Booking, PriceCheck } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!booking) notFound();

  const b = booking as Booking;
  const { data: checksData } = await supabase
    .from('price_checks')
    .select('*')
    .eq('booking_id', id)
    .order('checked_at', { ascending: false })
    .limit(90);
  const checks = (checksData as PriceCheck[] | null) || [];

  const hasCheck = b.last_price !== null;
  const diff = hasCheck ? priceDiff(Number(b.paid_price), Number(b.last_price)) : null;

  return (
    <AppShell>
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← חזרה לכל ההזמנות
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Hero + main info */}
        <Card className="md:col-span-2 overflow-hidden">
          {b.hotel_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.hotel_image_url} alt={b.hotel_name || ''} className="aspect-[16/9] w-full object-cover" />
          )}
          <CardContent className="space-y-3 p-6">
            <h1 className="text-2xl font-bold">{b.hotel_name}</h1>
            <p className="text-sm text-muted-foreground">
              {fmtDateRange(b.check_in, b.check_out)} · {nightsBetween(b.check_in, b.check_out)} לילות
            </p>
            {b.guests && (
              <p className="text-sm">
                👥 {b.guests.adults} מבוגרים{b.guests.children > 0 ? `, ${b.guests.children} ילדים` : ''} · 🚪 {b.guests.rooms} חדרים
              </p>
            )}
            {b.room_type && <p className="text-sm">🛏 <span className="text-foreground">{b.room_type}</span></p>}
            {b.meal_plan && <p className="text-sm">🍽 {b.meal_plan}</p>}
            {b.cancellation && <p className="text-sm text-muted-foreground">📋 {b.cancellation}</p>}
            <div className="flex gap-2 pt-2">
              <a href={b.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="size-4" /> פתח ב-Booking
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Price summary */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-xs text-muted-foreground">שילמת</p>
              <p className="tabular-nums text-2xl font-bold">{fmtPrice(b.paid_price, b.currency)}</p>
            </div>
            {hasCheck && diff ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">מחיר נוכחי</p>
                  <p className={`tabular-nums text-3xl font-bold ${diff.direction === 'down' && diff.pct >= 1 ? 'text-success' : diff.direction === 'up' && diff.pct <= -1 ? 'text-destructive' : ''}`}>
                    {fmtPrice(b.last_price, b.last_currency || b.currency)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">עודכן {fmtRelative(b.last_checked_at)}</p>
                </div>
                {diff.direction !== 'same' && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">הפרש</p>
                    <p className={`tabular-nums text-lg font-semibold ${diff.direction === 'down' ? 'text-success' : 'text-destructive'}`}>
                      {diff.direction === 'down' ? '⬇ ' : '⬆ '}
                      {fmtPrice(Math.abs(diff.diff), b.currency)} ({Math.abs(diff.pct).toFixed(1)}%)
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                טרם נבדק. הבדיקה הראשונה תתבצע בלילה הקרוב, או לחץ "בדוק עכשיו".
              </p>
            )}
            <BookingActions bookingId={b.id} />
          </CardContent>
        </Card>

        {/* Chart full-width */}
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">היסטוריית מחירים</h2>
              <p className="text-xs text-muted-foreground">{checks.length} בדיקות</p>
            </div>
            <PriceChart checks={checks} paidPrice={Number(b.paid_price)} currency={b.currency} />
          </CardContent>
        </Card>

        {/* All checks list */}
        {checks.length > 0 && (
          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">בדיקות אחרונות</h2>
              <div className="divide-y divide-border">
                {checks.slice(0, 20).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-muted-foreground">{fmtRelative(c.checked_at)}</span>
                    {c.error ? (
                      <span className="text-destructive">⚠️ {c.error}</span>
                    ) : (
                      <span className="tabular-nums font-medium">
                        {fmtPrice(c.price, c.currency)}
                        {c.match_score !== null && c.match_score !== undefined && (
                          <span className="ms-2 text-xs text-muted-foreground">
                            התאמה {(Number(c.match_score) * 100).toFixed(0)}%
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

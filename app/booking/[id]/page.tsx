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
import { convertToILS } from '@/lib/fx';
import { getMessages } from '@/lib/i18n';
import { CancellationDeadlineEditor } from '@/components/cancellation-deadline-editor';
import { GuestsEditor } from '@/components/guests-editor';
import { normalizeChildrenAges } from '@/lib/guests';
import type { Booking, PriceCheck } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const t = await getMessages();

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

  const paidCur = (b.currency || 'ILS').toUpperCase();
  const lastCur = (b.last_currency || paidCur).toUpperCase();
  const paidPriceN = Number(b.paid_price);
  const lastPriceN = b.last_price !== null ? Number(b.last_price) : null;
  const hasCheck = lastPriceN !== null;

  // Compute ILS equivalents so a spread can be calculated when the booking
  // currency differs from the current scrape currency (e.g. paid in EUR,
  // Booking displaying ILS now).
  let paidIls = b.paid_price_ils !== null ? Number(b.paid_price_ils) : null;
  if (paidIls === null && paidCur === 'ILS') paidIls = paidPriceN;
  let currentIls: number | null = null;
  if (lastPriceN !== null) {
    currentIls = lastCur === 'ILS' ? lastPriceN : await convertToILS(lastPriceN, lastCur);
  }

  const currenciesDiffer = paidCur !== lastCur;
  const useIls = currenciesDiffer && paidIls !== null && currentIls !== null;
  const diff = hasCheck
    ? (useIls
      ? { ...priceDiff(paidIls!, currentIls!), currency: 'ILS' }
      : { ...priceDiff(paidPriceN, lastPriceN!), currency: paidCur })
    : null;

  const lastCheck = checks.find((c) => !c.error) ?? null;

  return (
    <AppShell>
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        {t.bookingDetail.backToList}
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
              {fmtDateRange(b.check_in, b.check_out)} · {nightsBetween(b.check_in, b.check_out)} {t.bookingCard.nights}
            </p>
            {b.guests && (
              <GuestsEditor
                bookingId={b.id}
                initialAdults={b.guests.adults}
                initialChildren={b.guests.children}
                initialChildrenAges={normalizeChildrenAges(b.guests)}
                initialRooms={b.guests.rooms}
                messages={t.bookingDetail}
              />
            )}
            {b.room_type && <p className="text-sm">🛏 <span className="text-foreground">{b.room_type}</span></p>}
            {b.meal_plan && <p className="text-sm">🍽 {b.meal_plan}</p>}
            {b.cancellation && !b.cancellation_deadline && (
              <p className="text-sm text-muted-foreground">📋 {b.cancellation}</p>
            )}
            <CancellationDeadlineEditor
              bookingId={b.id}
              initialIso={b.cancellation_deadline}
              messages={t.bookingDetail}
            />
            <div className="flex gap-2 pt-2">
              <a href={b.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="size-4" /> {t.bookingDetail.openBooking}
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Price summary */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-xs text-muted-foreground">{t.bookingDetail.paid}</p>
              <p className="tabular-nums text-2xl font-bold">{fmtPrice(b.paid_price, b.currency)}</p>
              {paidCur !== 'ILS' && paidIls && (
                <p className="text-xs text-muted-foreground">≈ {fmtPrice(paidIls, 'ILS')}</p>
              )}
            </div>
            {hasCheck && diff ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t.bookingDetail.current}</p>
                  <p className={`tabular-nums text-3xl font-bold ${diff.direction === 'down' && diff.pct >= 1 ? 'text-success' : diff.direction === 'up' && diff.pct <= -1 ? 'text-destructive' : ''}`}>
                    {fmtPrice(b.last_price, b.last_currency || b.currency)}
                  </p>
                  {lastCur !== 'ILS' && currentIls && (
                    <p className="text-xs text-muted-foreground">≈ {fmtPrice(currentIls, 'ILS')}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{t.bookingDetail.updatedRelative.replace('{when}', fmtRelative(b.last_checked_at))}</p>
                </div>
                {diff.direction !== 'same' && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">{t.bookingDetail.diff}</p>
                    <p className={`tabular-nums text-lg font-semibold ${diff.direction === 'down' ? 'text-success' : 'text-destructive'}`}>
                      {diff.direction === 'down' ? '⬇ ' : '⬆ '}
                      {fmtPrice(Math.abs(diff.diff), diff.currency)} ({Math.abs(diff.pct).toFixed(1)}%)
                    </p>
                  </div>
                )}
                {lastCheck?.matched_room && (
                  <details className="rounded-md border border-border bg-muted/30 p-3 [&_summary]:cursor-pointer">
                    <summary className="text-[10px] uppercase tracking-wider text-muted-foreground list-none flex items-center justify-between">
                      <span>
                        {t.bookingDetail.matchHeading}
                        {lastCheck.match_score !== null && (
                          <span className={`ms-1 font-bold ${Number(lastCheck.match_score) >= 0.8 ? 'text-success' : Number(lastCheck.match_score) >= 0.5 ? 'text-warning' : 'text-destructive'}`}>
                            {(Number(lastCheck.match_score) * 100).toFixed(0)}%
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{t.bookingDetail.matchDetails}</span>
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">{t.bookingDetail.selectedRoom}</p>
                        <p className="text-xs">🛏 {lastCheck.matched_room}</p>
                        {lastCheck.matched_meal && <p className="text-[11px] text-muted-foreground mt-0.5">{lastCheck.matched_meal.slice(0, 140)}</p>}
                      </div>
                      {Number(lastCheck.match_score) < 0.7 && (
                        <p className="text-[11px] text-warning">{t.bookingDetail.weakMatch}</p>
                      )}
                      {lastCheck.candidates && lastCheck.candidates.length > 1 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">{t.bookingDetail.allCandidates}</p>
                          <div className="space-y-1.5">
                            {lastCheck.candidates.map((c, i) => (
                              <div key={i} className={`rounded border p-2 text-[11px] ${i === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="truncate font-medium">{c.room}</span>
                                  <span className="tabular-nums font-bold shrink-0">
                                    {c.currency === 'ILS' ? '₪' : ''}{c.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between gap-2 text-muted-foreground mt-0.5">
                                  <span className="truncate">{c.meal.slice(0, 80)}</span>
                                  <span className="shrink-0">{(c.score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.bookingDetail.notCheckedYetCta}
              </p>
            )}
            <BookingActions bookingId={b.id} messages={t.bookingActions} />
          </CardContent>
        </Card>

        {/* Chart full-width */}
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.bookingDetail.priceHistory}</h2>
              <p className="text-xs text-muted-foreground">{t.bookingDetail.checksCount.replace('{n}', String(checks.length))}</p>
            </div>
            <PriceChart checks={checks} paidPrice={Number(b.paid_price)} currency={b.currency} />
          </CardContent>
        </Card>

        {/* All checks list */}
        {checks.length > 0 && (
          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">{t.bookingDetail.recentChecks}</h2>
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
                            {t.bookingDetail.matchPercent.replace('{p}', (Number(c.match_score) * 100).toFixed(0))}
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


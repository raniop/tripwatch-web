import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { BookingCard } from '@/components/booking-card';
import { Button } from '@/components/ui/button';
import { CheckAllButton } from '@/components/check-all-button';
import { createClient } from '@/lib/supabase/server';
import { fmtPrice } from '@/lib/format';
import { convertToILS } from '@/lib/fx';
import type { Booking } from '@/lib/supabase/types';

import { MergeSuccessToast } from '@/components/merge-success-toast';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ merged?: string }>;
}) {
  const sp = (await searchParams) || {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // middleware will redirect

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('check_in', { ascending: true });

  const list = (bookings as Booking[] | null) || [];

  // Sum potential savings across active bookings, normalizing both prices
  // to ILS. paid_price_ils is the FX snapshot at booking time; current price
  // is converted live when its currency differs from ILS.
  const savedPerBooking = await Promise.all(
    list.map(async (b) => {
      if (b.last_price === null) return 0;
      const paidIls = b.paid_price_ils !== null
        ? Number(b.paid_price_ils)
        : (b.currency === 'ILS' ? Number(b.paid_price) : null);
      const lastCur = (b.last_currency || b.currency || 'ILS').toUpperCase();
      const currentIls = lastCur === 'ILS'
        ? Number(b.last_price)
        : await convertToILS(Number(b.last_price), lastCur);
      if (paidIls === null || currentIls === null) return 0;
      const saved = paidIls - currentIls;
      return saved > 0 ? saved : 0;
    }),
  );
  const totalSavedIls = savedPerBooking.reduce((a, b) => a + b, 0);

  return (
    <AppShell>
      {sp.merged === 'ok' && <MergeSuccessToast />}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">הנסיעות שלך</h1>
          {totalSavedIls > 5 && (
            <p className="mt-1 text-sm text-success">
              💰 חיסכון פוטנציאלי: <span className="font-semibold">{fmtPrice(totalSavedIls, 'ILS')}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CheckAllButton totalBookings={list.length} />
          <Link href="/add">
            <Button size="lg" className="h-11">
              <Plus className="size-4" /> הוסף הזמנה
            </Button>
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-muted text-3xl">📸</div>
      <h2 className="text-lg font-semibold">עוד אין הזמנות במעקב</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        שלח לנו צילום מסך של דף ההזמנה מ-Booking, ואנחנו נעקוב אחרי המחיר בשבילך.
      </p>
      <Link href="/add" className="mt-6 inline-block">
        <Button size="lg">
          <Plus className="size-4" /> הוסף הזמנה ראשונה
        </Button>
      </Link>
    </div>
  );
}

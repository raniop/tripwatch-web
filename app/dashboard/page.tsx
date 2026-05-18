import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { BookingCard } from '@/components/booking-card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { fmtPrice } from '@/lib/format';
import type { Booking } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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

  // Sum potential savings across active bookings, converted to ILS using
  // the FX snapshot we recorded at booking time.
  const totalSavedIls = list.reduce((sum, b) => {
    if (b.last_price === null || b.paid_price_ils === null || b.last_currency !== b.currency) {
      return sum;
    }
    const savedNative = Number(b.paid_price) - Number(b.last_price);
    if (savedNative <= 0) return sum;
    const ilsPerNative = Number(b.paid_price_ils) / Number(b.paid_price);
    return sum + savedNative * ilsPerNative;
  }, 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">הנסיעות שלך</h1>
          {totalSavedIls > 5 && (
            <p className="mt-1 text-sm text-success">
              💰 חיסכון פוטנציאלי: <span className="font-semibold">{fmtPrice(totalSavedIls, 'ILS')}</span>
            </p>
          )}
        </div>
        <Link href="/add">
          <Button size="lg">
            <Plus className="size-4" /> הוסף הזמנה
          </Button>
        </Link>
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

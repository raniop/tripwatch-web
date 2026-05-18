'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkNow, removeBooking } from '@/app/booking/[id]/actions';

export function BookingActions({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState<'check' | 'remove' | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onCheck() {
    setBusy('check');
    setMsg(null);
    const r = await checkNow(bookingId);
    setBusy(null);
    if (!r.ok) setMsg(r.error);
    // else page will revalidate
  }

  function onRemove() {
    if (!confirm('להסיר את ההזמנה הזו מהמעקב?')) return;
    setBusy('remove');
    startTransition(() => removeBooking(bookingId));
  }

  return (
    <div className="space-y-2 pt-2">
      <Button onClick={onCheck} disabled={busy !== null} className="w-full" size="lg">
        {busy === 'check' ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        בדוק עכשיו
      </Button>
      <Button onClick={onRemove} disabled={busy !== null} variant="outline" size="lg" className="w-full">
        <Trash2 className="size-4" /> הסר מהמעקב
      </Button>
      {msg && <p className="text-xs text-destructive">{msg}</p>}
    </div>
  );
}

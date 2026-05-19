'use client';

import { useState, useTransition } from 'react';
import { Camera, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { extractFromImage, saveBooking } from '@/app/add/actions';
import type { ExtractedBooking } from '@/lib/nas-client';

type Phase = 'idle' | 'uploading' | 'preview' | 'saving' | 'error';

export function AddBookingFlow() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    extracted: ExtractedBooking;
    url: string;
    image_path: string;
  } | null>(null);
  const [priceOverride, setPriceOverride] = useState('');
  const [currencyOverride, setCurrencyOverride] = useState<string>('');
  const [, startTransition] = useTransition();

  async function onFile(file: File) {
    setPhase('uploading');
    setError(null);
    const fd = new FormData();
    fd.append('image', file);
    const res = await extractFromImage(fd);
    if (!res.ok) {
      setError(res.error);
      setPhase('error');
      return;
    }
    setData(res);
    setPriceOverride(res.extracted.total_price ? String(res.extracted.total_price) : '');
    setCurrencyOverride(res.extracted.currency || 'ILS');
    setPhase('preview');
  }

  async function onConfirm() {
    if (!data) return;
    const price = Number(priceOverride.replace(/,/g, ''));
    if (!price || price <= 0) {
      setError('המחיר חסר או לא תקין');
      return;
    }
    setPhase('saving');
    startTransition(async () => {
      const res = await saveBooking({
        source: data.extracted.source || 'booking.com',
        url: data.url,
        hotel_name: data.extracted.hotel_name,
        check_in: data.extracted.check_in,
        check_out: data.extracted.check_out,
        guests: data.extracted.guests,
        room_type: data.extracted.room_type,
        meal_plan: data.extracted.meal_plan,
        cancellation: data.extracted.cancellation,
        cancellation_deadline: data.extracted.cancellation_deadline,
        currency: currencyOverride || data.extracted.currency || 'ILS',
        paid_price: price,
        source_image_path: data.image_path,
      });
      if (res && !res.ok) {
        setError(res.error);
        setPhase('preview');
      }
      // on success, server action redirects
    });
  }

  if (phase === 'uploading') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">מנתח את הצילום ומחפש את המלון ב-Booking...</p>
          <p className="text-xs text-muted-foreground">(לוקח ~15 שניות)</p>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'saving') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="size-8 animate-spin text-success" />
          <p className="text-sm text-muted-foreground">שומר את ההזמנה...</p>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'preview' && data) {
    const e = data.extracted;
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="font-semibold">{e.hotel_name}</h3>
            <p className="text-sm text-muted-foreground">
              {e.check_in} → {e.check_out} · {e.guests.adults} מבוגרים · {e.guests.rooms} חדרים
            </p>
            {e.room_type && <p className="mt-2 text-sm">🛏 {e.room_type}</p>}
            {e.meal_plan && <p className="text-sm">🍽 {e.meal_plan}</p>}
            {e.cancellation && <p className="text-sm text-muted-foreground">📋 {e.cancellation}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">כמה שילמת בסה"כ?</label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                inputMode="decimal"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                placeholder="7192"
                className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={currencyOverride}
                onChange={(e) => setCurrencyOverride(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ILS">₪ ILS</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="THB">฿ THB</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={onConfirm} className="flex-1" size="lg" disabled={phase === ('saving' as Phase)}>
              {(phase as Phase) === 'saving' ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              שמור והתחל לעקוב
            </Button>
            <Button onClick={() => { setPhase('idle'); setData(null); setError(null); }} variant="outline" size="lg">
              בטל
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // idle or error
  return (
    <Card>
      <CardContent className="p-6">
        <label
          htmlFor="booking-photo"
          className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary hover:bg-muted/40"
        >
          <Camera className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">לחץ או גרור לכאן צילום מסך</p>
            <p className="mt-1 text-xs text-muted-foreground">דף ההזמנה ב-Booking.com</p>
          </div>
          <input
            id="booking-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
        {error && (
          <p className="mt-4 text-center text-sm text-destructive">
            {error}
            <br />
            <button className="mt-1 text-xs underline" onClick={() => setError(null)}>
              נסה שוב
            </button>
          </p>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          הצילום נשמר אצלנו רק כדי לשחזר אם משהו ישתבש. אפשר למחוק אותו בכל עת.
        </p>
      </CardContent>
    </Card>
  );
}

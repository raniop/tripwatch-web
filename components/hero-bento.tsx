'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Bell, Mail, Send } from 'lucide-react';

interface DemoBooking {
  hotel: string;
  city: string;
  dates: string;
  paid: number;
  newPrice: number;
  img: string;
}

const BOOKINGS: DemoBooking[] = [
  {
    hotel: 'Vana Belle',
    city: 'Koh Samui',
    dates: '19–22 באוק׳',
    paid: 7192,
    newPrice: 5482,
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80&auto=format&fit=crop',
  },
  {
    hotel: 'Banyan Tree',
    city: 'Maldives',
    dates: '16–19 באוק׳',
    paid: 5061,
    newPrice: 4200,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&auto=format&fit=crop',
  },
  {
    hotel: 'Canaves Oia',
    city: 'Santorini',
    dates: '12–15 ביוני',
    paid: 4350,
    newPrice: 3580,
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80&auto=format&fit=crop',
  },
];

export function HeroBento() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % BOOKINGS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const active = BOOKINGS[activeIdx];
  const savings = active.paid - active.newPrice;
  const pct = Math.round((savings / active.paid) * 100);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Soft glow */}
      <div className="absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-primary/15 via-purple-500/10 to-pink-400/10 blur-3xl" />

      {/* "Dashboard" container — 3 stacked booking cards */}
      <div className="relative rounded-2xl border border-border bg-card p-3 shadow-2xl shadow-primary/10">
        {/* Tiny dashboard header */}
        <div className="mb-3 flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-success animate-pulse" />
            הזמנות פעילות · {BOOKINGS.length}
          </div>
          <div className="text-[10px] text-muted-foreground">בדיקה אחרונה: עכשיו</div>
        </div>

        <div className="space-y-2">
          {BOOKINGS.map((b, i) => {
            const isActive = i === activeIdx;
            const sav = b.paid - b.newPrice;
            const p = Math.round((sav / b.paid) * 100);
            return (
              <div
                key={b.hotel}
                className={`relative flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-500 ${
                  isActive
                    ? 'border-success/40 bg-success/5 shadow-md scale-[1.02]'
                    : 'border-border/60 bg-background/50 scale-100'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.img} alt="" className="size-full object-cover" />
                  {isActive && (
                    <div className="absolute inset-0 bg-success/20" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">{b.hotel}</p>
                    <span className="text-[10px] text-muted-foreground">· {b.city}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{b.dates} · 3 לילות</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`tabular-nums text-base font-bold ${
                        isActive ? 'text-success' : ''
                      }`}
                    >
                      ₪{(isActive ? b.newPrice : b.paid).toLocaleString()}
                    </span>
                    {isActive && (
                      <span className="tabular-nums text-[11px] text-muted-foreground line-through">
                        ₪{b.paid.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop badge */}
                {isActive && (
                  <div className="flex items-center gap-1 rounded-full bg-success px-2 py-1 text-[10px] font-bold text-white shadow-sm animate-slide-up">
                    <TrendingDown className="size-2.5" /> {p}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating in-app notification — appears for active booking */}
      <div
        key={`bell-${activeIdx}`}
        className="absolute -top-4 -end-4 hidden lg:flex max-w-[270px] items-start gap-2.5 rounded-xl border border-border bg-card p-3 shadow-2xl animate-slide-up"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
          <Bell className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">חיסכון של ₪{savings.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {active.hotel} ירד {pct}%. שווה לבטל ולהזמין מחדש.
          </p>
        </div>
      </div>

      {/* Floating email */}
      <div
        key={`mail-${activeIdx}`}
        className="absolute -bottom-6 -start-6 hidden lg:flex max-w-[290px] items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-2xl animate-slide-up [animation-delay:120ms]"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium text-muted-foreground">TripWatch</p>
            <p className="text-[10px] text-muted-foreground">עכשיו</p>
          </div>
          <p className="text-xs font-semibold truncate">💸 ירידת מחיר ב-{active.hotel}</p>
          <p className="text-[11px] text-muted-foreground truncate">חיסכון של ₪{savings.toLocaleString()}</p>
        </div>
      </div>

      {/* Floating telegram bubble */}
      <div
        key={`tg-${activeIdx}`}
        className="absolute top-1/2 -translate-y-1/2 -end-12 hidden xl:flex w-[230px] items-start gap-2.5 rounded-2xl rounded-tr-sm bg-[#229ED9] p-3 text-white shadow-2xl animate-slide-up [animation-delay:240ms]"
      >
        <Send className="size-4 shrink-0 mt-0.5" />
        <div className="text-xs leading-snug">
          <p className="font-bold">💸 ירידת מחיר!</p>
          <p className="opacity-90 truncate">{active.hotel}, ₪{active.newPrice.toLocaleString()} ({pct}%)</p>
        </div>
      </div>
    </div>
  );
}

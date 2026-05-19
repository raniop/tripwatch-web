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
      {/* Multi-layer glow */}
      <div className="absolute -inset-16 -z-10 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-400/10 blur-3xl" />
      <div className="absolute inset-10 -z-10 rounded-full bg-gradient-to-tr from-accent/15 to-warning/5 blur-3xl" />

      {/* Main "Dashboard" — glassmorphic */}
      <div className="glass rounded-3xl p-3 shadow-2xl shadow-primary/10">
        <div className="mb-3 flex items-center justify-between px-2 pt-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span className="relative inline-flex">
              <span className="size-2 rounded-full bg-success" />
              <span className="absolute inset-0 size-2 rounded-full bg-success animate-ping opacity-75" />
            </span>
            הזמנות פעילות · {BOOKINGS.length}
          </div>
          <div className="text-[10px] text-muted-foreground/70">בדיקה אחרונה: עכשיו</div>
        </div>

        <div className="space-y-2">
          {BOOKINGS.map((b, i) => {
            const isActive = i === activeIdx;
            const sav = b.paid - b.newPrice;
            const p = Math.round((sav / b.paid) * 100);
            return (
              <div
                key={b.hotel}
                className={`relative flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-500 ${
                  isActive
                    ? 'bg-white shadow-lg shadow-success/15 ring-2 ring-success/40 scale-[1.02]'
                    : 'bg-white/40 hover:bg-white/60 scale-100'
                }`}
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.img} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>{b.hotel}</p>
                    <span className="text-[10px] text-muted-foreground">· {b.city}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{b.dates} · 3 לילות</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={`tabular-nums text-base font-bold ${isActive ? 'text-success' : ''}`} style={{ fontFamily: 'var(--font-poppins)' }}>
                      ₪{(isActive ? b.newPrice : b.paid).toLocaleString()}
                    </span>
                    {isActive && (
                      <span className="tabular-nums text-[11px] text-muted-foreground line-through">
                        ₪{b.paid.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="flex items-center gap-1 rounded-full bg-success px-2 py-1 text-[10px] font-bold text-white animate-slide-up">
                    <TrendingDown className="size-2.5" /> {p}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating: notification */}
      <div
        key={`bell-${activeIdx}`}
        className="absolute -top-5 -end-4 hidden lg:flex max-w-[260px] items-start gap-2.5 glass rounded-2xl p-3 shadow-2xl animate-slide-up"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
          <Bell className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-poppins)' }}>חיסכון של ₪{savings.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {active.hotel} ירד {pct}%. שווה לבטל ולהזמין מחדש.
          </p>
        </div>
      </div>

      {/* Floating: email */}
      <div
        key={`mail-${activeIdx}`}
        className="absolute -bottom-6 -start-6 hidden lg:flex max-w-[280px] items-start gap-3 glass rounded-2xl p-3 shadow-2xl animate-slide-up [animation-delay:120ms]"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
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

      {/* Floating: telegram */}
      <div
        key={`tg-${activeIdx}`}
        className="absolute top-1/2 -translate-y-1/2 -end-12 hidden xl:flex w-[220px] items-start gap-2.5 rounded-2xl rounded-tr-sm bg-[#229ED9] p-3 text-white shadow-2xl animate-slide-up [animation-delay:240ms]"
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

'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Bed, UtensilsCrossed } from 'lucide-react';

// Photo: free Unsplash CDN, no API key needed
const HOTEL_IMG = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80';

const PAID = 7192;
const NEW_PRICE = 5482;
const SAVINGS = PAID - NEW_PRICE;
const PCT = Math.round((SAVINGS / PAID) * 100);

export function HeroDemo() {
  const [phase, setPhase] = useState<'before' | 'dropped'>('before');

  useEffect(() => {
    // Wait for hero to settle, then start the cycle
    const start = setTimeout(() => setPhase('dropped'), 1500);
    const cycle = setInterval(() => {
      setPhase((p) => (p === 'before' ? 'dropped' : 'before'));
    }, 4000);
    return () => {
      clearTimeout(start);
      clearInterval(cycle);
    };
  }, []);

  const showing = phase === 'dropped' ? NEW_PRICE : PAID;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Decorative blur behind */}
      <div className="absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-400/10 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        {/* Hotel image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HOTEL_IMG} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Floating savings badge — only when dropped */}
          <div
            className={`absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all duration-500 ${
              phase === 'dropped' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <TrendingDown className="size-3" />
            חיסכון {PCT}%
          </div>

          {/* Hotel name on image */}
          <div className="absolute bottom-3 start-3 end-3 text-white">
            <h3 className="text-base font-bold drop-shadow-lg">Vana Belle, Koh Samui</h3>
            <p className="text-xs opacity-90 drop-shadow">19–22 באוקטובר · 3 לילות</p>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Bed className="size-3" /> Ocean Pool Suite</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1"><UtensilsCrossed className="size-3" /> חצי פנסיון</span>
          </div>

          <div className="flex items-end justify-between border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">שילמת</p>
              <p
                className={`tabular-nums text-base font-medium transition-all ${
                  phase === 'dropped' ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                ₪{PAID.toLocaleString()}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">המחיר היום</p>
              <p
                key={phase}
                className={`tabular-nums text-3xl font-bold ${
                  phase === 'dropped' ? 'text-success animate-price-drop' : 'text-foreground'
                }`}
              >
                ₪{showing.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification toast — floating */}
      <div
        className={`absolute -bottom-6 -start-4 flex max-w-[260px] items-start gap-2.5 rounded-xl border border-border bg-card p-3 shadow-2xl transition-all duration-500 ${
          phase === 'dropped' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-success/15 text-success text-base">
          💸
        </div>
        <div>
          <p className="text-xs font-semibold">חיסכון של ₪{SAVINGS.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            המחיר ירד {PCT}%. שווה לבטל ולהזמין מחדש.
          </p>
        </div>
      </div>
    </div>
  );
}

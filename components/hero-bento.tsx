'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Bed, UtensilsCrossed, Bell, Mail, Send } from 'lucide-react';

const PAID = 7192;
const NEW_PRICE = 5482;
const SAVINGS = PAID - NEW_PRICE;
const PCT = Math.round((SAVINGS / PAID) * 100);

// Curated stable Unsplash IDs — tropical/luxury resort vibes
const HOTEL_IMG = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format&fit=crop';

export function HeroBento() {
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDropped(true), 800);
    const cycle = setInterval(() => setDropped((d) => !d), 5000);
    return () => {
      clearTimeout(t);
      clearInterval(cycle);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Soft glow */}
      <div className="absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-primary/15 via-purple-500/10 to-pink-400/10 blur-3xl" />

      {/* Main booking card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HOTEL_IMG} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div
            className={`absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all duration-500 ${
              dropped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}
          >
            <TrendingDown className="size-3" /> חיסכון {PCT}%
          </div>
          <div className="absolute bottom-3 start-3 end-3 text-white">
            <h3 className="text-base font-bold drop-shadow-lg">Vana Belle, Koh Samui</h3>
            <p className="text-xs opacity-90 drop-shadow">19–22 באוקטובר · 3 לילות</p>
          </div>
        </div>
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
                  dropped ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                ₪{PAID.toLocaleString()}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">המחיר היום</p>
              <p
                key={String(dropped)}
                className={`tabular-nums text-3xl font-bold ${
                  dropped ? 'text-success animate-price-drop' : 'text-foreground'
                }`}
              >
                ₪{(dropped ? NEW_PRICE : PAID).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating in-app notification toast */}
      <div
        className={`absolute -top-4 -end-4 hidden lg:flex max-w-[280px] items-start gap-2.5 rounded-xl border border-border bg-card p-3 shadow-2xl transition-all duration-500 ${
          dropped ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-3 rotate-3'
        }`}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
          <Bell className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">חיסכון של ₪{SAVINGS.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            המחיר ירד {PCT}%. שווה לבטל ולהזמין מחדש.
          </p>
        </div>
      </div>

      {/* Floating email subject */}
      <div
        className={`absolute -bottom-6 -start-6 hidden lg:flex max-w-[300px] items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-2xl transition-all duration-500 delay-100 ${
          dropped ? 'opacity-100 translate-y-0 -rotate-1' : 'opacity-0 translate-y-3 rotate-2'
        }`}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium text-muted-foreground">TripWatch</p>
            <p className="text-[10px] text-muted-foreground">עכשיו</p>
          </div>
          <p className="text-xs font-semibold truncate">💸 ירידת מחיר ב-Vana Belle</p>
          <p className="text-[11px] text-muted-foreground truncate">חיסכון של ₪{SAVINGS.toLocaleString()}</p>
        </div>
      </div>

      {/* Floating telegram bubble */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -end-12 hidden lg:flex w-[240px] items-start gap-2.5 rounded-2xl rounded-tr-sm bg-[#229ED9] p-3 text-white shadow-2xl transition-all duration-500 delay-200 ${
          dropped ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <Send className="size-4 shrink-0 mt-0.5" />
        <div className="text-xs leading-snug">
          <p className="font-bold">💸 ירידת מחיר!</p>
          <p className="opacity-90">Vana Belle, ₪{NEW_PRICE.toLocaleString()} (ירידה של {PCT}%)</p>
        </div>
      </div>
    </div>
  );
}

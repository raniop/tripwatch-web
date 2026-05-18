'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Bed, UtensilsCrossed, Bell } from 'lucide-react';

const PAID = 7192;
const NEW_PRICE = 5482;

export function HeroDemo() {
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'dropped'>('idle');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dropping'), 1200);
    const t2 = setTimeout(() => setPhase('dropped'), 2200);
    const cycle = setInterval(() => {
      setPhase('idle');
      setTimeout(() => setPhase('dropping'), 1200);
      setTimeout(() => setPhase('dropped'), 2200);
    }, 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(cycle);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Phone-ish frame */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
        {/* Hotel image */}
        <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Cpath d=%22M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z%22 fill=%22%23ffffff20%22/%3E%3C/svg%3E')] bg-cover" />
          {phase === 'dropped' && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-bold text-white shadow-lg animate-slide-up">
              <TrendingDown className="size-3" /> חיסכון 24%
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="space-y-3 p-5">
          <div>
            <h3 className="text-lg font-bold">Vana Belle, Koh Samui</h3>
            <p className="text-xs text-muted-foreground">19–22 באוקטובר 2026 · 3 לילות</p>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5"><Bed className="size-3" /> Ocean Pool Suite</p>
            <p className="flex items-center gap-1.5"><UtensilsCrossed className="size-3" /> חצי פנסיון</p>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">שילמת</span>
              <span className="tabular-nums font-medium line-through opacity-60">
                ₪{PAID.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-xs text-muted-foreground">עכשיו</span>
              <span
                key={phase}
                className={`tabular-nums text-2xl font-bold ${
                  phase === 'dropped' ? 'text-success animate-price-drop' : 'text-foreground'
                }`}
              >
                ₪{phase === 'idle' ? PAID.toLocaleString() : NEW_PRICE.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      {phase === 'dropped' && (
        <div className="absolute -bottom-4 -start-4 flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-xl animate-slide-up max-w-[260px]">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
            <Bell className="size-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold">💸 חיסכון של ₪1,710</p>
            <p className="text-muted-foreground">המחיר ירד 24% — שווה לבטל ולהזמין מחדש</p>
          </div>
        </div>
      )}

      {/* Decorative blobs behind */}
      <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
    </div>
  );
}

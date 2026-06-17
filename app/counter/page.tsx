'use client';

import { useEffect, useMemo, useState } from 'react';

// היעד: יום שבת, 20/06/2026 בשעה 13:55 — שעון ישראל (IDT, UTC+3).
// offset מפורש כדי שהספירה תהיה נכונה מכל אזור זמן.
const TARGET = new Date('2026-06-20T13:55:00+03:00').getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function getRemaining(now: number): Remaining {
  const diff = TARGET - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: false,
  };
}

export default function CounterPage() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const r = useMemo(() => (now === null ? null : getRemaining(now)), [now]);

  const units = [
    { label: 'ימים', value: r?.days },
    { label: 'שעות', value: r?.hours },
    { label: 'דקות', value: r?.minutes },
    { label: 'שניות', value: r?.seconds, live: true },
  ];

  return (
    <main dir="rtl" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16 text-white">
      {/* ===== רקע ===== */}
      <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: 'url(/counter-bg.jpg)' }} />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,25,0.62) 0%, rgba(10,8,25,0.18) 30%, rgba(10,8,25,0.20) 58%, rgba(8,6,20,0.78) 100%)',
        }}
      />

      {/* ===== תוכן ===== */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* קיקר */}
        <div
          className="tw-rise inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-black/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100 backdrop-blur-sm"
          style={{ animationFillMode: 'both' }}
        >
          ⛵ Bali 4.6
        </div>

        {/* שם החבורה */}
        <h1
          className="tw-rise mt-7 text-balance text-6xl font-black leading-[0.92] tracking-tight drop-shadow-[0_3px_30px_rgba(0,0,0,0.55)] sm:text-8xl [animation-delay:80ms]"
          style={{ fontFamily: 'var(--font-heebo), sans-serif', animationFillMode: 'both' }}
        >
          ג&apos;ורדן וסיגרים
        </h1>

        {/* קו הפרדה זהב */}
        <div className="tw-rise mt-7 h-px w-24 bg-gradient-to-l from-transparent via-amber-300/80 to-transparent [animation-delay:160ms]" style={{ animationFillMode: 'both' }} />

        {/* טאגליין */}
        <p className="tw-rise mt-6 max-w-md text-balance text-lg font-light leading-relaxed text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-xl [animation-delay:220ms]" style={{ animationFillMode: 'both' }}>
          ספירה לאחור עד ההפלגה לאיים הסרוניים
        </p>

        {/* ===== הספירה ===== */}
        {r?.done ? (
          <div className="tw-rise mt-12 rounded-2xl border border-amber-200/40 bg-black/30 px-10 py-9 backdrop-blur-md [animation-delay:320ms]" style={{ animationFillMode: 'both' }}>
            <p className="text-4xl font-black sm:text-5xl">🥂 הרמנו עוגן!</p>
            <p className="mt-3 text-base text-white/85">בון וויאז׳, ג&apos;ורדן וסיגרים</p>
          </div>
        ) : (
          <div
            dir="ltr"
            className="tw-rise mt-12 flex items-stretch gap-1 rounded-2xl border border-white/15 bg-black/30 px-3 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-2 sm:px-6 sm:py-7 [animation-delay:320ms]"
            style={{ animationFillMode: 'both' }}
            aria-live="polite"
          >
            {units.map((u, i) => (
              <div key={u.label} className="flex items-stretch">
                <div className="flex min-w-[58px] flex-col items-center sm:min-w-[86px]">
                  <span
                    key={u.live ? u.value : undefined}
                    className="tabular-nums text-4xl font-black leading-none tracking-tight sm:text-7xl"
                    style={{ fontFamily: 'var(--font-heebo), sans-serif', animation: u.live ? 'tw-pop 0.6s ease-out' : undefined }}
                  >
                    {u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
                  </span>
                  <span className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-100/75 sm:text-xs">
                    {u.label}
                  </span>
                </div>
                {i < units.length - 1 && <span className="mx-0.5 w-px self-stretch bg-white/10 sm:mx-1.5" />}
              </div>
            ))}
          </div>
        )}

        {/* ===== שורת פרטים ===== */}
        <div className="tw-rise mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] [animation-delay:420ms]" style={{ animationFillMode: 'both' }}>
          <Pill>✈️ שבת · 20.06</Pill>
          <Dot />
          <Pill>🕞 13:55</Pill>
          <Dot />
          <Pill>📍 האיים הסרוניים · יוון</Pill>
        </div>
      </div>
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

function Dot() {
  return <span className="text-white/35">•</span>;
}

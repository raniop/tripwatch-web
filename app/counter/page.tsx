'use client';

import { useEffect, useMemo, useState } from 'react';

// היעד: יום שבת, 20/06/2026 בשעה 13:55 — שעון ישראל (IDT, UTC+3).
// משתמשים ב-offset מפורש כדי שהספירה תהיה נכונה מכל אזור זמן.
const TARGET = new Date('2026-06-20T13:55:00+03:00').getTime();

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getRemaining(now: number): Remaining {
  const diff = TARGET - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

export default function CounterPage() {
  // מתחילים מ-null כדי להימנע מאי-התאמת SSR/Client, ומחשבים בצד הלקוח.
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
    { label: 'שניות', value: r?.seconds },
  ];

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden text-white">
      {/* ===== רקע: שמיים וים יווני ===== */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a2a5e] via-[#1565c0] to-[#39b0d8]" />
      {/* זוהר השמש */}
      <div className="absolute left-1/2 top-[14%] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-rose-400 opacity-90 blur-2xl sm:h-96 sm:w-96" />
      <div className="absolute left-1/2 top-[16%] -z-10 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-100 opacity-95 blur-md sm:h-52 sm:w-52" />

      {/* כוכבי נצנוץ עדינים */}
      <Sparkles />

      {/* ===== תוכן ===== */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-5 pb-40 pt-16 text-center sm:pt-24">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
          ⛵️ הפלגה באיים הסרוניים · יוון
        </span>

        <h1
          className="text-balance text-4xl font-black leading-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)] sm:text-6xl"
          style={{ fontFamily: 'var(--font-heebo), sans-serif', letterSpacing: '-0.02em' }}
        >
          סופרים לאחור
          <br />
          <span className="bg-gradient-to-l from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
            עד שמפליגים!
          </span>
        </h1>

        <p className="mt-4 max-w-md text-balance text-base text-white/85 sm:text-lg">
          טסים עם החבר׳ה לחופשת חלום באיים היווניים.
          <br />
          ההרפתקה מתחילה ברגע שהמטוס ממריא ✈️
        </p>

        {/* ===== הספירה ===== */}
        {r?.done ? (
          <div className="mt-12 animate-pulse rounded-3xl border border-white/25 bg-white/10 px-8 py-10 backdrop-blur-md">
            <p className="text-3xl font-black sm:text-5xl">🎉 הגיע הרגע!</p>
            <p className="mt-3 text-lg text-white/85">בון וויאז׳ — שתהיה הפלגה בלתי נשכחת!</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-4 gap-2.5 sm:gap-4" aria-live="polite">
            {units.map((u) => (
              <div
                key={u.label}
                className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-1 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md sm:px-3 sm:py-6"
              >
                <span
                  className="tabular-nums text-3xl font-black leading-none sm:text-6xl"
                  style={{ fontFamily: 'var(--font-heebo), sans-serif' }}
                >
                  {u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
                </span>
                <span className="mt-2 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:text-sm">
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ===== כרטיס פרטי טיסה ===== */}
        <div className="mt-12 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 text-right backdrop-blur-md sm:p-7">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="text-sm text-white/70">ההמראה</p>
              <p className="text-lg font-bold">יום שבת · 20.06</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            <Detail label="שעת המראה" value="13:55" />
            <Detail label="היעד" value="האיים הסרוניים" />
            <Detail label="הנוסעים" value="אני + החברים" />
            <Detail label="הסטטוס" value="מתרגשים 🔥" />
          </div>
        </div>
      </div>

      {/* ===== סירת מפרש מרחפת ===== */}
      <Sailboat />

      {/* ===== גלים בתחתית ===== */}
      <Waves />
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Sailboat() {
  return (
    <div
      className="pointer-events-none absolute bottom-16 left-[10%] z-10 text-6xl sm:bottom-20 sm:text-7xl"
      style={{ animation: 'tw-bob 4s ease-in-out infinite' }}
      aria-hidden
    >
      ⛵️
    </div>
  );
}

function Sparkles() {
  const dots = [
    { top: '12%', left: '20%', d: '0s' },
    { top: '24%', left: '78%', d: '0.6s' },
    { top: '40%', left: '12%', d: '1.2s' },
    { top: '30%', left: '60%', d: '1.8s' },
    { top: '50%', left: '85%', d: '0.9s' },
    { top: '18%', left: '45%', d: '2.1s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      {dots.map((s, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            animation: `tw-twinkle 3s ease-in-out ${s.d} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Waves() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0" aria-hidden>
      <svg
        viewBox="0 0 1440 220"
        className="h-32 w-full sm:h-44"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#ffffff"
          fillOpacity="0.18"
          d="M0,120 C240,180 480,60 720,110 C960,160 1200,80 1440,130 L1440,220 L0,220 Z"
        />
        <path
          fill="#ffffff"
          fillOpacity="0.28"
          d="M0,150 C240,200 480,110 720,150 C960,190 1200,120 1440,160 L1440,220 L0,220 Z"
        />
        <path
          fill="#ffffff"
          fillOpacity="0.9"
          d="M0,185 C240,215 480,165 720,190 C960,215 1200,170 1440,195 L1440,220 L0,220 Z"
        />
      </svg>
    </div>
  );
}

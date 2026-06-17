'use client';

import { useEffect, useMemo, useState } from 'react';

// היעד: יום שבת, 20/06/2026 בשעה 13:55 — שעון ישראל (IDT, UTC+3).
// offset מפורש כדי שהספירה תהיה נכונה מכל אזור זמן.
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
    <main dir="rtl" className="relative min-h-screen overflow-hidden text-white">
      <Scene />

      {/* ===== תוכן ===== */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-5 pb-44 pt-14 text-center sm:pt-20">
        <span className="tw-rise mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-amber-100 backdrop-blur-md">
          ⛵ Bali 4.6 · קטמרן יוקרה
        </span>

        <p
          className="tw-rise text-sm font-medium uppercase tracking-[0.35em] text-white/70 [animation-delay:80ms]"
          style={{ animationFillMode: 'both' }}
        >
          החבורה של
        </p>

        <h1
          className="tw-rise mt-2 text-balance text-5xl font-black leading-[0.95] sm:text-7xl [animation-delay:140ms]"
          style={{ fontFamily: 'var(--font-heebo), sans-serif', letterSpacing: '-0.02em', animationFillMode: 'both' }}
        >
          <span
            className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(244,207,115,0.35))' }}
          >
            ג&apos;ורדן וסיגרים
          </span>
        </h1>

        <p className="tw-rise mt-5 max-w-md text-balance text-base leading-relaxed text-white/85 sm:text-lg [animation-delay:220ms]" style={{ animationFillMode: 'both' }}>
          מפליגים אל השקיעה באיים הסרוניים.
          <br />
          סופרים לאחור עד שמרימים עוגן ⚓
        </p>

        {/* ===== הספירה ===== */}
        {r?.done ? (
          <div className="tw-rise mt-12 rounded-3xl border border-amber-200/40 bg-white/10 px-8 py-10 backdrop-blur-md">
            <p className="text-4xl font-black sm:text-6xl">🥂 הרמנו עוגן!</p>
            <p className="mt-3 text-lg text-white/85">בון וויאז׳, ג&apos;ורדן וסיגרים — הפלגה בלתי נשכחת!</p>
          </div>
        ) : (
          <div dir="ltr" className="mt-12 grid grid-cols-4 gap-2.5 sm:gap-4" aria-live="polite">
            {units.map((u, i) => (
              <div
                key={u.label}
                className="tw-rise flex flex-col items-center rounded-2xl border border-white/15 bg-white/[0.08] px-1 py-5 shadow-[0_10px_40px_rgba(8,20,45,0.45)] backdrop-blur-xl sm:px-3 sm:py-7"
                style={{ animationDelay: `${300 + i * 90}ms`, animationFillMode: 'both' }}
              >
                <span
                  key={u.live ? u.value : undefined /* re-mount seconds each tick → pop animation */}
                  className="tabular-nums bg-gradient-to-b from-white to-amber-100/80 bg-clip-text text-4xl font-black leading-none text-transparent sm:text-6xl"
                  style={{
                    fontFamily: 'var(--font-heebo), sans-serif',
                    animation: u.live ? 'tw-pop 0.6s ease-out' : undefined,
                  }}
                >
                  {u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
                </span>
                <span className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/70 sm:text-sm">
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ===== כרטיס עלייה למטוס ===== */}
        <BoardingPass />
      </div>
    </main>
  );
}

/* ============================================================ */
/* כרטיס "boarding pass" יוקרתי                                   */
/* ============================================================ */
function BoardingPass() {
  return (
    <div
      className="tw-rise mt-14 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/[0.08] text-right shadow-[0_20px_60px_rgba(8,20,45,0.5)] backdrop-blur-xl [animation-delay:700ms]"
      style={{ animationFillMode: 'both' }}
    >
      {/* פס עליון מוזהב */}
      <div className="flex items-center justify-between bg-gradient-to-l from-amber-400/90 to-amber-200/80 px-6 py-3 text-[#1a1442]">
        <span className="text-xl">✈️</span>
        <span className="text-sm font-black tracking-wide">כרטיס עלייה להפלגה</span>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-5">
          <div className="text-left">
            <p className="text-xs text-white/60">שעת ההמראה</p>
            <p className="text-3xl font-black tabular-nums text-amber-100" style={{ fontFamily: 'var(--font-heebo), sans-serif' }}>
              13:55
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">תאריך</p>
            <p className="text-xl font-bold">שבת · 20.06</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 pt-5 text-sm">
          <Detail label="היעד" value="האיים הסרוניים 🇬🇷" />
          <Detail label="כלי השיט" value="Bali 4.6 ⛵" />
          <Detail label="הצוות" value="ג'ורדן וסיגרים" />
          <Detail label="הסטטוס" value="מתרגשים 🔥" />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/55">{label}</p>
      <p className="font-bold text-white/95">{value}</p>
    </div>
  );
}

/* ============================================================ */
/* הסצנה: תמונת ים אמיתית בשעת זהב + שכבת קריאוּת + נצנוצים        */
/* ============================================================ */
function Scene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* תמונת רקע — קטמרן/מפרשית בים בשעת השקיעה */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/counter-bg.jpg)' }}
      />

      {/* שכבת הכהיה לקריאוּת הטקסט (כהה למעלה, שקוף באמצע, כהה למטה) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(16,12,42,0.72) 0%, rgba(28,20,60,0.42) 26%, rgba(20,40,70,0.18) 48%, rgba(13,55,72,0.5) 78%, rgba(8,40,58,0.78) 100%)',
        }}
      />

      {/* טאצ' זהב חמים מסביב */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 30%, rgba(255,200,120,0.12) 0%, rgba(0,0,0,0) 55%)' }}
      />

      {/* נצנוצים עדינים */}
      <Stars />
    </div>
  );
}

function Stars() {
  const dots = [
    { top: '10%', left: '18%', d: '0s' },
    { top: '16%', left: '74%', d: '0.7s' },
    { top: '8%', left: '52%', d: '1.4s' },
    { top: '22%', left: '86%', d: '2.0s' },
    { top: '13%', left: '34%', d: '1.0s' },
    { top: '26%', left: '8%', d: '2.4s' },
  ];
  return (
    <>
      {dots.map((s, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/80"
          style={{ top: s.top, left: s.left, animation: `tw-twinkle 3.5s ease-in-out ${s.d} infinite` }}
        />
      ))}
    </>
  );
}

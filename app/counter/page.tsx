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
/* הסצנה: שמיים בשעת זהב, שמש, ים, גלים, קטמרן, שחפים            */
/* ============================================================ */
function Scene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* שמיים — מעבר שעת זהב */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #160f3a 0%, #2c1b54 22%, #5b2e6b 42%, #a64e6b 60%, #e87f5a 74%, #f6bd6e 86%, #fcd98b 100%)',
        }}
      />

      {/* קרני שמש מסתובבות */}
      <div
        className="absolute left-1/2 top-[60%] h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{ animation: 'tw-rays 140s linear infinite' }}
      >
        <SunRays />
      </div>

      {/* גוף השמש */}
      <div
        className="absolute left-1/2 top-[58%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-96 sm:w-96"
        style={{
          background: 'radial-gradient(circle, #fff8e6 0%, #ffe6a3 38%, #ffb865 62%, rgba(255,150,90,0) 78%)',
        }}
      />

      {/* כוכבים עדינים בחלק העליון */}
      <Stars />

      {/* שחפים */}
      <Gulls />

      {/* הים — מתחיל מקו האופק (~62%) */}
      <div
        className="absolute inset-x-0 bottom-0 top-[62%]"
        style={{
          background:
            'linear-gradient(180deg, #f6bd6e 0%, #d98a6a 6%, #2f8f9c 26%, #1f7686 55%, #11505f 100%)',
        }}
      />

      {/* עמוד השתקפות מוזהב על המים */}
      <div
        className="absolute left-1/2 top-[62%] h-[40%] w-40 -translate-x-1/2 sm:w-56"
        style={{
          background: 'linear-gradient(180deg, rgba(255,225,150,0.85) 0%, rgba(255,205,120,0) 100%)',
          filter: 'blur(8px)',
          animation: 'tw-shimmer-col 4s ease-in-out infinite',
        }}
      />

      {/* קטמרן */}
      <div
        className="absolute bottom-[20%] left-1/2 z-10 w-44 -translate-x-1/2 sm:w-56"
        style={{ animation: 'tw-bob 5s ease-in-out infinite' }}
      >
        <Catamaran />
      </div>

      {/* גלים בשכבות */}
      <WaveLayer bottom="0" opacity={0.95} fill="#0d4554" duration="9s" reverse />
      <WaveLayer bottom="18px" opacity={0.5} fill="#1f7686" duration="13s" />
      <WaveLayer bottom="42px" opacity={0.32} fill="#3a9aa8" duration="18s" reverse />
    </div>
  );
}

function SunRays() {
  const rays = Array.from({ length: 24 });
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="translate(50 50)">
        {rays.map((_, i) => (
          <polygon
            key={i}
            points="-1.1,0 1.1,0 0,-50"
            transform={`rotate(${(360 / rays.length) * i})`}
            fill="rgba(255,236,170,0.55)"
          />
        ))}
      </g>
    </svg>
  );
}

function Catamaran() {
  return (
    <svg viewBox="0 0 240 220" className="w-full" style={{ filter: 'drop-shadow(0 10px 18px rgba(8,20,45,0.45))' }}>
      {/* תורן */}
      <line x1="120" y1="20" x2="120" y2="150" stroke="#e8e2d0" strokeWidth="3" />
      {/* מפרש ראשי */}
      <path d="M120 22 L120 138 L196 138 Z" fill="#fdfaf2" />
      <path d="M120 22 L120 138 L196 138 Z" fill="url(#sailShade)" />
      {/* ג'יב (מפרש קדמי) */}
      <path d="M118 34 L118 138 L52 138 Z" fill="#f4ead2" />
      {/* תפר זהב על המפרש */}
      <path d="M120 80 L168 138" stroke="#e8b94e" strokeWidth="1.5" opacity="0.5" />
      {/* דגלון */}
      <path d="M120 20 L138 14 L120 8 Z" fill="#e8b94e" />

      {/* פלטפורמת הסיפון בין שתי הגחונים */}
      <rect x="44" y="150" width="152" height="14" rx="5" fill="#f2eee2" />
      {/* תא הנוסעים */}
      <path d="M86 138 L154 138 L146 150 L94 150 Z" fill="#dfe7ea" />
      <rect x="100" y="140" width="40" height="8" rx="2" fill="#8fb7c4" opacity="0.85" />

      {/* גחון שמאלי */}
      <path d="M40 164 Q44 184 70 184 L120 184 L120 164 Z" fill="#ffffff" />
      <path d="M40 164 Q44 184 70 184 L120 184 L120 176 L48 176 Z" fill="#11505f" opacity="0.18" />
      {/* גחון ימני */}
      <path d="M200 164 Q196 184 170 184 L120 184 L120 164 Z" fill="#f4f1e8" />
      <path d="M200 164 Q196 184 170 184 L120 184 L120 176 L192 176 Z" fill="#11505f" opacity="0.22" />
      {/* פס זהב לאורך הגחונים */}
      <rect x="44" y="166" width="152" height="3" fill="#e8b94e" opacity="0.7" />

      <defs>
        <linearGradient id="sailShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#c9a24a" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WaveLayer({
  bottom,
  opacity,
  fill,
  duration,
  reverse,
}: {
  bottom: string;
  opacity: number;
  fill: string;
  duration: string;
  reverse?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[5] h-40 overflow-hidden" style={{ bottom }}>
      <svg
        viewBox="0 0 2880 200"
        preserveAspectRatio="none"
        className="h-full"
        style={{
          width: '200%',
          opacity,
          animation: `${reverse ? 'tw-wave-b' : 'tw-wave-a'} ${duration} linear infinite`,
        }}
      >
        <path
          fill={fill}
          d="M0,90 C360,150 720,30 1080,80 C1440,130 1800,40 2160,85 C2520,125 2700,60 2880,90 L2880,200 L0,200 Z"
        />
      </svg>
    </div>
  );
}

function Stars() {
  const dots = [
    { top: '8%', left: '18%', d: '0s' },
    { top: '14%', left: '72%', d: '0.7s' },
    { top: '6%', left: '50%', d: '1.4s' },
    { top: '20%', left: '86%', d: '2.0s' },
    { top: '11%', left: '34%', d: '1.0s' },
    { top: '24%', left: '8%', d: '2.4s' },
  ];
  return (
    <>
      {dots.map((s, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ top: s.top, left: s.left, animation: `tw-twinkle 3.5s ease-in-out ${s.d} infinite` }}
        />
      ))}
    </>
  );
}

function Gulls() {
  return (
    <>
      <Gull top="22%" left="6%" scale={1} delay="0s" duration="26s" />
      <Gull top="30%" left="2%" scale={0.7} delay="6s" duration="32s" />
      <Gull top="16%" left="10%" scale={0.85} delay="12s" duration="29s" />
    </>
  );
}

function Gull({ top, left, scale, delay, duration }: { top: string; left: string; scale: number; delay: string; duration: string }) {
  return (
    <svg
      className="absolute"
      style={{ top, left, width: 34 * scale, animation: `tw-gull ${duration} linear ${delay} infinite` }}
      viewBox="0 0 40 16"
      fill="none"
    >
      <path d="M2 12 Q10 2 20 9 Q30 2 38 12" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

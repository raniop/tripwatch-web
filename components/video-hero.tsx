'use client';

import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

// Single hero video — tropical resort pool with palm trees
const VIDEO = 'https://videos.pexels.com/video-files/2169880/2169880-hd_1280_720_30fps.mp4';
const POSTER = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80&auto=format&fit=crop';

function partOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning' as const;
  if (h >= 10 && h < 17) return 'day' as const;
  if (h >= 17 && h < 20) return 'sunset' as const;
  return 'night' as const;
}

export function VideoHero({ children }: Props) {
  const [period, setPeriod] = useState<'morning' | 'day' | 'sunset' | 'night'>('day');

  useEffect(() => {
    setPeriod(partOfDay());
  }, []);

  const tintClass = {
    morning: 'bg-gradient-to-b from-amber-800/25 via-black/30 to-black/55',
    day: 'bg-gradient-to-b from-blue-900/25 via-black/30 to-black/55',
    sunset: 'bg-gradient-to-b from-orange-700/30 via-pink-900/25 to-black/60',
    night: 'bg-gradient-to-b from-indigo-950/40 via-slate-950/45 to-black/65',
  }[period];

  return (
    <section className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* Poster always present underneath */}
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${POSTER})` }}
      />
      <video
        className="absolute inset-0 -z-20 size-full object-cover"
        src={VIDEO}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className={`absolute inset-0 -z-10 ${tintClass}`} />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
      {children}
    </section>
  );
}

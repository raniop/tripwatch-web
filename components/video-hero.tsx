'use client';

import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

// Verified working Pexels CDN URLs (vacation / beach / pool vibes)
const VIDEOS = [
  // Ocean waves crashing on tropical beach
  'https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4',
  // Resort pool & palm trees
  'https://videos.pexels.com/video-files/2169880/2169880-hd_1280_720_30fps.mp4',
];

// Beautiful tropical beach fallback (Unsplash)
const POSTER =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop';

function partOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning' as const;
  if (h >= 10 && h < 17) return 'day' as const;
  if (h >= 17 && h < 20) return 'sunset' as const;
  return 'night' as const;
}

export function VideoHero({ children }: Props) {
  const [period, setPeriod] = useState<'morning' | 'day' | 'sunset' | 'night'>('day');
  const [videoIdx, setVideoIdx] = useState(0);

  useEffect(() => {
    setPeriod(partOfDay());
    setVideoIdx(Math.floor(Math.random() * VIDEOS.length));
  }, []);

  // Subtle color cast per time-of-day (overlays on top of video)
  const tintClass = {
    morning: 'bg-gradient-to-b from-amber-700/30 via-black/40 to-black/65',
    day: 'bg-gradient-to-b from-cyan-900/25 via-black/45 to-black/70',
    sunset: 'bg-gradient-to-b from-orange-700/40 via-pink-900/35 to-black/75',
    night: 'bg-gradient-to-b from-indigo-950/55 via-slate-950/60 to-black/80',
  }[period];

  return (
    <section className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden">
      <video
        key={videoIdx}
        className="absolute inset-0 -z-20 size-full object-cover"
        src={VIDEOS[videoIdx]}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Fallback: poster image always present underneath */}
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${POSTER})` }}
      />
      {/* Time-of-day tint */}
      <div className={`absolute inset-0 -z-10 ${tintClass}`} />
      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
      {children}
    </section>
  );
}

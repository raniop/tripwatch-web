'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

// Multiple Pexels stock videos (CDN, no auth). Picks by time-of-day for vibe.
const VIDEOS = {
  morning: {
    src: 'https://videos.pexels.com/video-files/2169307/2169307-hd_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/2169307/free-video-2169307.jpg?w=1600&q=70',
  },
  day: {
    src: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4',
    poster: 'https://images.pexels.com/videos/3209828/free-video-3209828.jpg?w=1600&q=70',
  },
  sunset: {
    src: 'https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/4763824/free-video-4763824.jpg?w=1600&q=70',
  },
  night: {
    src: 'https://videos.pexels.com/video-files/2169307/2169307-hd_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/2169307/free-video-2169307.jpg?w=1600&q=70',
  },
};

function partOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning' as const;
  if (h >= 10 && h < 17) return 'day' as const;
  if (h >= 17 && h < 20) return 'sunset' as const;
  return 'night' as const;
}

export function VideoHero({ children }: Props) {
  const [period, setPeriod] = useState<keyof typeof VIDEOS>('day');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPeriod(partOfDay());
  }, []);

  const v = VIDEOS[period];

  // Overlay strength varies by time of day
  const overlayClass = {
    morning: 'bg-gradient-to-b from-amber-900/30 via-black/45 to-black/70',
    day: 'bg-gradient-to-b from-blue-900/30 via-black/45 to-black/70',
    sunset: 'bg-gradient-to-b from-orange-900/40 via-pink-900/40 to-black/75',
    night: 'bg-gradient-to-b from-indigo-950/60 via-slate-950/65 to-black/80',
  }[period];

  return (
    <section className="relative isolate h-[100vh] min-h-[640px] w-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 size-full object-cover"
        src={v.src}
        poster={v.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className={`absolute inset-0 -z-10 ${overlayClass}`} />
      {/* Soft accent glow */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
      {children}
    </section>
  );
}

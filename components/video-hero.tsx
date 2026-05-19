interface Props {
  children: React.ReactNode;
}

// Single hero video — tropical resort pool with palm trees
const VIDEO = 'https://videos.pexels.com/video-files/2169880/2169880-hd_1280_720_30fps.mp4';
const POSTER = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80&auto=format&fit=crop';

export function VideoHero({ children }: Props) {
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
      {/* Neutral darkening for legibility — no time-of-day color shift */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-black/25 to-black/55" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
      {children}
    </section>
  );
}

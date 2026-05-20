interface Props {
  children: React.ReactNode;
}

// Single hero video — tropical resort pool with palm trees
const VIDEO = 'https://videos.pexels.com/video-files/2169880/2169880-hd_1280_720_30fps.mp4';

export function VideoHero({ children }: Props) {
  return (
    <section className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950">
      {/* Neutral tropical-toned placeholder gradient sits underneath. No
          poster photo — using a still that doesn't match the video caused
          a jarring flash. The video fades in once decoded. */}
      <video
        className="absolute inset-0 -z-20 size-full object-cover animate-video-fade-in"
        src={VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Neutral darkening for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-black/25 to-black/55" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
      {children}
    </section>
  );
}

// Curated stable Unsplash IDs — diverse hotel/destination shots
const HOTELS = [
  { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&auto=format&fit=crop', city: 'מלדיביים', tag: 'מלונות יוקרה' },
  { src: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80&auto=format&fit=crop', city: 'סנטוריני', tag: 'בוטיק' },
  { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80&auto=format&fit=crop', city: 'יוון', tag: 'נוף לים' },
  { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80&auto=format&fit=crop', city: 'איטליה', tag: 'אורבני' },
  { src: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80&auto=format&fit=crop', city: 'תאילנד', tag: 'ריזורט' },
  { src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80&auto=format&fit=crop', city: 'בלי', tag: 'וילות' },
  { src: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80&auto=format&fit=crop', city: 'דובאי', tag: '5 כוכבים' },
  { src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80&auto=format&fit=crop', city: 'מקסיקו', tag: 'all-inclusive' },
];

export function HotelsGallery() {
  return (
    <div className="relative">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-l from-transparent to-background" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-r from-transparent to-background" />

      {/* Mosaic */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-4 md:gap-4">
        {HOTELS.map((h, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-xl border border-border/50 bg-muted ${
              i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
            } ${i === 0 || i === 5 ? 'md:translate-y-4' : ''} ${i === 2 || i === 7 ? 'md:-translate-y-4' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={h.src}
              alt={h.city}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
            <div className="absolute bottom-3 start-3 text-white">
              <p className="text-sm font-bold drop-shadow-lg">{h.city}</p>
              <p className="text-[10px] opacity-90 drop-shadow">{h.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

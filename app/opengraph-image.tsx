import { ImageResponse } from 'next/og';

// Default Node runtime instead of edge — avoids the Google Fonts fetch
// failing inside Vercel's edge sandbox (which had been returning a 200
// with 0 bytes, so social-media crawlers saw a corrupted image).
export const alt = 'TripWatch — Booked a trip? Let us get you money back.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #FF7A00 0%, #FF9F40 35%, #FFB877 60%, #2563EB 100%)',
          position: 'relative',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative top-right radial */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at top right, rgba(255,255,255,0.18) 0%, transparent 55%)',
            display: 'flex',
          }}
        />

        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
          {/* Logo mark — same orange rounded square + white paper plane as the favicon */}
          <div
            style={{
              width: 72,
              height: 72,
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M52 13 L11 31 L24 36 L28 50 L33 42 L46 48 L52 13 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
              display: 'flex',
            }}
          >
            TripWatch
          </div>
          <div
            style={{
              marginInlineStart: 8,
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.22)',
              color: 'white',
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              display: 'flex',
            }}
          >
            BETA
          </div>
        </div>

        {/* Hero copy */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 24,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            Booked a trip?
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: -2,
              marginTop: 8,
              display: 'flex',
              textShadow: '0 2px 24px rgba(0,0,0,0.18)',
            }}
          >
            Let us get you money back.
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.94)',
              marginTop: 36,
              maxWidth: 1000,
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            We watch your Booking reservation&apos;s price every day. The moment it drops — you&apos;re the first to know.
          </div>
        </div>

        {/* URL + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 28,
            fontWeight: 700,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex' }}>tripwatch.net</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              background: 'white',
              color: '#FF7A00',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 26,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            Start free →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

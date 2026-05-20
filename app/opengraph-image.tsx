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
              width: 96,
              height: 96,
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="84" height="84" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              {/* watch bezel */}
              <circle cx="64" cy="64" r="44" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
              {/* hour marks at 12/3/6/9 */}
              <rect x="62" y="22" width="4" height="7" rx="1.5" fill="#FFFFFF"/>
              <rect x="99" y="62" width="7" height="4" rx="1.5" fill="#FFFFFF"/>
              <rect x="62" y="99" width="4" height="7" rx="1.5" fill="#FFFFFF"/>
              <rect x="22" y="62" width="7" height="4" rx="1.5" fill="#FFFFFF"/>
              {/* plane inside (translated path so it's centered inside the dial) */}
              <g transform="translate(64 64)">
                <path d="M28 -22 L-26 0 L-9 6 L-3 22 L1 12 L18 18 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M-9 6 L28 -22" stroke="rgba(217,78,0,0.55)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </g>
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

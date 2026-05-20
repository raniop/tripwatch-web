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

        {/* Brand row — logo mark intentionally large so it's recognizable
            as a tiny preview thumbnail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
          <div
            style={{
              width: 152,
              height: 152,
              background: 'rgba(255,255,255,0.16)',
              borderRadius: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="132" height="132" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              {/* shadow under the plane */}
              <path
                d="M114 18 L8 60 L46 76 L58 116 L74 96 L106 110 Z"
                fill="rgba(0,0,0,0.18)"
                transform="translate(0 4)"
              />
              {/* main plane body */}
              <path
                d="M114 18 L8 60 L46 76 L58 116 L74 96 L106 110 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* center crease (3D depth) */}
              <path
                d="M46 76 L114 18"
                stroke="rgba(217,78,0,0.7)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* tail fold */}
              <path
                d="M58 116 L74 96"
                stroke="rgba(217,78,0,0.3)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              {/* down-arrow accent — "price dropping" */}
              <circle cx="96" cy="94" r="14" fill="#FFFFFF"/>
              <path d="M91 91 L96 98 L101 91" stroke="#D94E00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            TripWatch
          </div>
          <div
            style={{
              marginInlineStart: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.22)',
              color: 'white',
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              display: 'flex',
              alignSelf: 'center',
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

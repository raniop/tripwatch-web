import { ImageResponse } from 'next/og';

export const alt = 'TripWatch';
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
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          background: 'linear-gradient(135deg, #FF7A00 0%, #FF9F40 35%, #FFB877 60%, #2563EB 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* top-right radial highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at top right, rgba(255,255,255,0.22) 0%, transparent 55%)',
            display: 'flex',
          }}
        />

        {/* logo mark — big paper plane on a frosted square */}
        <div
          style={{
            width: 260,
            height: 260,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          }}
        >
          <svg width="220" height="220" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            {/* shadow under the plane */}
            <path
              d="M114 18 L8 60 L46 76 L58 116 L74 96 L106 110 Z"
              fill="rgba(0,0,0,0.18)"
              transform="translate(0 5)"
            />
            {/* main plane body */}
            <path
              d="M114 18 L8 60 L46 76 L58 116 L74 96 L106 110 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* center crease */}
            <path
              d="M46 76 L114 18"
              stroke="rgba(217,78,0,0.72)"
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
          </svg>
        </div>

        {/* wordmark */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: 'white',
            letterSpacing: -4,
            display: 'flex',
            textShadow: '0 4px 24px rgba(0,0,0,0.22)',
          }}
        >
          TripWatch
        </div>
      </div>
    ),
    { ...size },
  );
}

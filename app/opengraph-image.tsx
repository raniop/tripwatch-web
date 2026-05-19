import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TripWatch — מעקב מחירים אוטומטי על המלון שכבר הזמנת';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Hebrew-supporting font (Heebo ExtraBold)
  const heeboBold = await fetch(
    'https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysd0Y.ttf',
  ).then((r) => r.arrayBuffer());
  const heeboReg = await fetch(
    'https://fonts.gstatic.com/s/heebo/v26/NGS6v5_NC0k9P9H7RcLcb0V8.ttf',
  ).then((r) => r.arrayBuffer());

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
          fontFamily: 'Heebo',
        }}
      >
        {/* Decorative overlay pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at top right, rgba(255,255,255,0.15) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* TOP: brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              backdropFilter: 'blur(12px)',
            }}
          >
            ✈️
          </div>
          <div
            style={{
              fontSize: 44,
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
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              display: 'flex',
            }}
          >
            BETA
          </div>
        </div>

        {/* MIDDLE: hero message (RTL) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 30,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.0,
              letterSpacing: -3,
              display: 'flex',
              direction: 'rtl',
            }}
          >
            הזמנת חופשה?
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.0,
              letterSpacing: -3,
              marginTop: 14,
              display: 'flex',
              direction: 'rtl',
              textShadow: '0 2px 24px rgba(0,0,0,0.15)',
            }}
          >
            נחזיר לך כסף.
          </div>
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255,255,255,0.94)',
              marginTop: 42,
              maxWidth: 980,
              lineHeight: 1.35,
              display: 'flex',
              direction: 'rtl',
              fontWeight: 400,
            }}
          >
            עוקבים אחרי המחיר של ההזמנה שלך ב-Booking, כל יום. ירד — אתה הראשון לדעת.
          </div>
        </div>

        {/* BOTTOM: URL */}
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
              direction: 'rtl',
            }}
          >
            התחל בחינם →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Heebo', data: heeboBold, weight: 800, style: 'normal' },
        { name: 'Heebo', data: heeboReg, weight: 400, style: 'normal' },
      ],
    },
  );
}

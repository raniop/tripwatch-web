import type { Metadata, Viewport } from 'next';
import { Heebo, Poppins } from 'next/font/google';
import './globals.css';
import { CookieConsent } from '@/components/cookie-consent';
import { AccessibilityWidget } from '@/components/accessibility-widget';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heebo',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tripwatch.net'),
  title: {
    default: 'TripWatch — הזמנת חופשה? נחזיר לך כסף.',
    template: '%s · TripWatch',
  },
  description:
    'עוקבים אחרי המחיר של ההזמנה שלך ב-Booking, כל יום. ברגע שהוא יורד — אתה הראשון לדעת. חינם.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'TripWatch', statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://tripwatch.net',
    siteName: 'TripWatch',
    title: 'TripWatch — הזמנת חופשה? נחזיר לך כסף.',
    description:
      'עוקבים אחרי המחיר של ההזמנה שלך ב-Booking, כל יום. ברגע שהוא יורד — אתה הראשון לדעת.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripWatch — הזמנת חופשה? נחזיר לך כסף.',
    description: 'עוקבים אחרי המחיר של ההזמנה ב-Booking. ירד — אתה הראשון לדעת. חינם.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${poppins.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <AccessibilityWidget />
        <CookieConsent />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heebo',
});

export const metadata: Metadata = {
  title: 'TripWatch — מעקב מחירים אוטומטי על המלון שכבר הזמנת',
  description:
    'שלח צילום של ההזמנה שלך ב-Booking, ואנחנו נעקוב אחרי המחיר ונשלח לך התראה כשיש ירידה. חינם.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'TripWatch', statusBarStyle: 'default' },
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
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Heebo, Poppins } from 'next/font/google';
import './globals.css';
import { CookieConsent } from '@/components/cookie-consent';
import { AccessibilityWidget } from '@/components/accessibility-widget';
import { getLocaleAndMessages, dir, htmlLang } from '@/lib/i18n';

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

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getLocaleAndMessages();
  return {
    metadataBase: new URL('https://tripwatch.net'),
    title: { default: t.meta.siteTitle, template: '%s · TripWatch' },
    description: t.meta.siteDescription,
    manifest: '/manifest.json',
    appleWebApp: { capable: true, title: 'TripWatch', statusBarStyle: 'default' },
    openGraph: {
      type: 'website',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      url: 'https://tripwatch.net',
      siteName: 'TripWatch',
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getLocaleAndMessages();
  return (
    <html lang={htmlLang(locale)} dir={dir(locale)} className={`${heebo.variable} ${poppins.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <AccessibilityWidget messages={t.a11y} />
        <CookieConsent messages={t.cookies} />
      </body>
    </html>
  );
}

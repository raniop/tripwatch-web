import Link from 'next/link';
import { Plane, Mail, Github } from 'lucide-react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import type { Locale, Messages } from '@/lib/i18n/types';

interface Props {
  locale: Locale;
  messages: {
    footer: Messages['footer'];
    nav: Pick<Messages['nav'], 'howItWorks' | 'faq' | 'login' | 'startFree'>;
    pricing: Pick<Messages['pricing'], 'eyebrow'>;
    faq: Pick<Messages['faq'], 'eyebrow'>;
    testimonials: Pick<Messages['testimonials'], 'eyebrow'>;
    localeSwitcher: Messages['localeSwitcher'];
  };
}

export function MarketingFooter({ locale, messages }: Props) {
  const t = messages.footer;
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        {/* Top: 4 columns */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-bold">
              <Plane className="size-5" />
              <span>TripWatch</span>
              <span className="ms-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">Beta</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t.blurb}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:rani@ophirins.co.il"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="email"
              >
                <Mail className="size-4" />
              </a>
              <a
                href="https://github.com/raniop/tripwatch-web"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
            </div>
            <div className="mt-6">
              <LocaleSwitcher
                current={locale}
                variant="dark"
                ariaLabel={messages.localeSwitcher.ariaLabel}
                heLabel={messages.localeSwitcher.he}
                enLabel={messages.localeSwitcher.en}
              />
            </div>
          </div>

          {/* Product */}
          <Col title={t.productHeading}>
            <FLink href="#how">{messages.nav.howItWorks}</FLink>
            <FLink href="#pricing">{messages.pricing.eyebrow}</FLink>
            <FLink href="#faq">{messages.faq.eyebrow}</FLink>
            <FLink href="/login">{messages.nav.startFree}</FLink>
          </Col>

          {/* Support */}
          <Col title={t.supportHeading}>
            <FLink href="mailto:rani@ophirins.co.il">{t.contactUs}</FLink>
            <FLink href="#faq">{messages.faq.eyebrow}</FLink>
            <FLink href="#testimonials">{messages.testimonials.eyebrow}</FLink>
          </Col>

          {/* Legal */}
          <Col title={t.legalHeading}>
            <FLink href="/privacy">{t.privacy}</FLink>
            <FLink href="/terms">{t.terms}</FLink>
            <FLink href="/accessibility">{t.accessibility}</FLink>
          </Col>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{t.bottomLeft.replace('{year}', String(new Date().getFullYear()))}</p>
          <p>{t.bottomRight}</p>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}

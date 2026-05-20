'use client';

/**
 * Cookies consent banner. Stores the decision in localStorage and hides
 * itself until the user clears their browser storage.
 *
 * "Essential only" is enough for our current stack — we use:
 *   - Supabase auth cookies (essential, no consent needed under most laws)
 *   - No third-party analytics yet
 * The banner exists primarily so users see we asked, and to be ready when
 * we do plug in analytics or tracking.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'tw_cookie_consent_v1';

type Consent = 'all' | 'essential';

interface Props {
  messages: {
    bannerText: string;
    privacyLink: string;
    acceptAll: string;
    essentialOnly: string;
    close: string;
  };
}

export function CookieConsent({ messages }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setShow(true);
    } catch {
      // localStorage blocked → hide banner to avoid annoyance
    }
  }, []);

  function decide(c: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: c, at: new Date().toISOString() }));
    } catch {
      // ignore
    }
    setShow(false);
  }

  if (!show) return null;

  function renderWithPrivacyLink(template: string, linkLabel: string) {
    const parts = template.split('{privacyLink}');
    if (parts.length !== 2) return <>{template}</>;
    return (
      <>
        {parts[0]}
        <Link href="/privacy" className="underline">{linkLabel}</Link>
        {parts[1]}
      </>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Cookie className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed text-foreground">
            {renderWithPrivacyLink(messages.bannerText, messages.privacyLink)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={() => decide('all')} size="sm" className="h-8">
              {messages.acceptAll}
            </Button>
            <Button onClick={() => decide('essential')} variant="outline" size="sm" className="h-8">
              {messages.essentialOnly}
            </Button>
          </div>
        </div>
        <button
          onClick={() => decide('essential')}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={messages.close}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

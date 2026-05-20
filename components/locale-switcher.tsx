'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/actions/set-locale';
import type { Locale } from '@/lib/i18n/types';

interface Props {
  current: Locale;
  variant?: 'light' | 'dark';
  ariaLabel: string;
  heLabel: string;
  enLabel: string;
}

/**
 * Segmented-control style language switcher: a single capsule with both
 * options visible. The active one gets the brand-accent orange background.
 */

// Short visible labels — the full names (passed in via heLabel/enLabel)
// stay around for the aria title/tooltip so screen readers still get them.
const SHORT: Record<Locale, string> = { he: 'עב', en: 'En' };

export function LocaleSwitcher({ current, variant = 'dark', ariaLabel, heLabel, enLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function pick(next: Locale) {
    if (next === current || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const trackCls =
    variant === 'light'
      ? 'bg-white/15 ring-1 ring-white/25'
      : 'bg-muted ring-1 ring-border';
  const inactiveCls =
    variant === 'light'
      ? 'text-white/85 hover:text-white'
      : 'text-muted-foreground hover:text-foreground';

  const items: Array<[Locale, string]> = [
    ['he', heLabel],
    ['en', enLabel],
  ];

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-0.5 rounded-full p-0.5 text-xs font-medium ${trackCls}`}
    >
      {items.map(([code, fullLabel]) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => pick(code)}
            disabled={pending}
            aria-pressed={active}
            aria-label={fullLabel}
            title={fullLabel}
            dir="ltr"
            className={`rounded-full px-2 py-0.5 transition-colors ${
              active ? 'bg-accent text-white shadow-sm' : inactiveCls
            }`}
          >
            {SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}

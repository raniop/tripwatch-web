'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { setLocale } from '@/app/actions/set-locale';
import type { Locale } from '@/lib/i18n/types';

interface Props {
  current: Locale;
  variant?: 'light' | 'dark';
  ariaLabel: string;
  heLabel: string;
  enLabel: string;
}

export function LocaleSwitcher({ current, variant = 'dark', ariaLabel, heLabel, enLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function pick(next: Locale) {
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const lightCls = 'text-white/80 hover:text-white';
  const darkCls = 'text-muted-foreground hover:text-foreground';
  const baseCls = variant === 'light' ? lightCls : darkCls;

  return (
    <div className={`inline-flex items-center gap-1 text-xs ${baseCls}`} aria-label={ariaLabel}>
      <Globe className="size-3.5" />
      <button
        type="button"
        onClick={() => pick('he')}
        disabled={pending}
        className={`px-1.5 transition-colors ${current === 'he' ? 'font-bold text-foreground' : ''} ${variant === 'light' && current === 'he' ? 'text-white' : ''}`}
      >
        {heLabel}
      </button>
      <span className="opacity-50">·</span>
      <button
        type="button"
        onClick={() => pick('en')}
        disabled={pending}
        className={`px-1.5 transition-colors ${current === 'en' ? 'font-bold text-foreground' : ''} ${variant === 'light' && current === 'en' ? 'text-white' : ''}`}
        dir="ltr"
      >
        {enLabel}
      </button>
    </div>
  );
}

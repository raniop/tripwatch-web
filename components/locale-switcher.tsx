'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ChevronDown, Check, Loader2 } from 'lucide-react';
import { setLocale } from '@/app/actions/set-locale';
import type { Locale } from '@/lib/i18n/types';

interface Props {
  current: Locale;
  variant?: 'light' | 'dark';
  ariaLabel: string;
  heLabel: string;
  enLabel: string;
}

const SHORT: Record<Locale, string> = { he: 'עב', en: 'EN' };

export function LocaleSwitcher({ current, variant = 'dark', ariaLabel, heLabel, enLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(next: Locale) {
    setOpen(false);
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const triggerCls =
    variant === 'light'
      ? 'text-white/85 hover:bg-white/10 hover:text-white'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${triggerCls}`}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
        <span className="tabular-nums">{SHORT[current]}</span>
        <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-1 z-[55] min-w-[140px] overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          {[
            ['he', heLabel] as const,
            ['en', enLabel] as const,
          ].map(([code, label]) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              onClick={() => pick(code)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted text-start"
              dir={code === 'he' ? 'rtl' : 'ltr'}
            >
              <span>{label}</span>
              {current === code && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

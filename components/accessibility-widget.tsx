'use client';

/**
 * Custom accessibility widget — floating button + settings panel.
 * Toggles apply CSS classes on <html>; styles live in globals.css.
 * State persists to localStorage so users keep their preferences across visits.
 *
 * WCAG 2.1 AA-oriented: contrast boost, focus ring, motion reduction,
 * link underlining, font scaling.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Accessibility, X, Type, Contrast, Link as LinkIcon, Pause, Focus, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'tw_a11y_v1';

type FontScale = 'normal' | 'large' | 'xl';

interface Settings {
  fontScale: FontScale;
  highContrast: boolean;
  underlineLinks: boolean;
  noMotion: boolean;
  strongFocus: boolean;
}

const DEFAULTS: Settings = {
  fontScale: 'normal',
  highContrast: false,
  underlineLinks: false,
  noMotion: false,
  strongFocus: false,
};

function applyToDom(s: Settings) {
  const el = document.documentElement;
  el.classList.toggle('a11y-font-large', s.fontScale === 'large');
  el.classList.toggle('a11y-font-xl', s.fontScale === 'xl');
  el.classList.toggle('a11y-contrast', s.highContrast);
  el.classList.toggle('a11y-underline-links', s.underlineLinks);
  el.classList.toggle('a11y-no-motion', s.noMotion);
  el.classList.toggle('a11y-strong-focus', s.strongFocus);
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = load();
    setS(loaded);
    applyToDom(loaded);
    setHydrated(true);
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...s, ...patch };
    setS(next);
    applyToDom(next);
    save(next);
  }

  function reset() {
    setS(DEFAULTS);
    applyToDom(DEFAULTS);
    save(DEFAULTS);
  }

  if (!hydrated) return null;

  return (
    <>
      {/* Floating launcher (start side = right in LTR, left in RTL) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 start-5 z-[55] grid size-12 place-items-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
      >
        <Accessibility className="size-6" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="הגדרות נגישות"
          className="fixed bottom-20 start-5 z-[55] w-[300px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            <h2 className="text-sm font-semibold">נגישות</h2>
            <button onClick={() => setOpen(false)} aria-label="סגור" className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3 p-3 text-sm">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Type className="size-3.5" /> גודל גופן
              </label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  ['normal', 'רגיל'],
                  ['large', 'גדול'],
                  ['xl', 'ענק'],
                ] as Array<[FontScale, string]>).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => update({ fontScale: k })}
                    className={`rounded-md border px-2 py-1.5 text-xs ${s.fontScale === k ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              icon={<Contrast className="size-3.5" />}
              label="ניגודיות גבוהה"
              checked={s.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              icon={<LinkIcon className="size-3.5" />}
              label="קישורים מודגשים"
              checked={s.underlineLinks}
              onChange={(v) => update({ underlineLinks: v })}
            />
            <Toggle
              icon={<Pause className="size-3.5" />}
              label="השהיית אנימציות"
              checked={s.noMotion}
              onChange={(v) => update({ noMotion: v })}
            />
            <Toggle
              icon={<Focus className="size-3.5" />}
              label="מסגרת מיקוד בולטת"
              checked={s.strongFocus}
              onChange={(v) => update({ strongFocus: v })}
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" /> איפוס
              </button>
              <Link
                href="/accessibility"
                onClick={() => setOpen(false)}
                className="text-xs text-primary underline"
              >
                הצהרת נגישות מלאה
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer">
      <span className="flex items-center gap-2 text-xs text-foreground">
        {icon}
        {label}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-0.5 rtl:-translate-x-0.5' : 'translate-x-[18px] rtl:-translate-x-[18px]'}`} />
      </span>
    </label>
  );
}

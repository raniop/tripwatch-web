'use client';

/**
 * Cmd+K / Ctrl+K command palette. Lists user-actionable destinations
 * (Dashboard, Add booking, Settings, etc.) and searches user bookings
 * by hotel name. Pre-loaded with bookings as a prop so filtering is
 * client-side and instant.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, LayoutDashboard, Plus, Settings, Home, Hotel,
  LogOut, Accessibility, ArrowLeft,
} from 'lucide-react';

interface BookingItem {
  id: string;
  hotel_name: string | null;
  check_in: string;
  check_out: string;
}

interface Props {
  bookings: BookingItem[];
  loggedIn?: boolean;
  messages: {
    placeholder: string;
    navHeading: string;
    bookingsHeading: string;
    empty: string;
    navHint: string;
    selectHint: string;
    cmdDashboard: string;
    cmdAdd: string;
    cmdSettings: string;
    cmdHome: string;
    cmdA11y: string;
    cmdSignOut: string;
    untitled: string;
  };
}

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
  group: 'navigation' | 'bookings';
}

export function CommandPalette({ bookings, loggedIn = false, messages }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K + custom event for header buttons to open the palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('tw-open-search', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('tw-open-search', onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      // Focus after the modal mounts
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const close = () => setOpen(false);

  const allCommands: Cmd[] = useMemo(() => {
    const nav: Cmd[] = loggedIn
      ? [
          { id: 'dashboard', label: messages.cmdDashboard, icon: <LayoutDashboard className="size-4" />, run: () => { router.push('/dashboard'); close(); }, group: 'navigation' },
          { id: 'add',       label: messages.cmdAdd,       icon: <Plus className="size-4" />,            run: () => { router.push('/add'); close(); },       group: 'navigation' },
          { id: 'settings',  label: messages.cmdSettings,  icon: <Settings className="size-4" />,        run: () => { router.push('/settings'); close(); },  group: 'navigation' },
          { id: 'home',      label: messages.cmdHome,      icon: <Home className="size-4" />,            run: () => { router.push('/'); close(); },           group: 'navigation' },
          { id: 'a11y',      label: messages.cmdA11y,      icon: <Accessibility className="size-4" />,   run: () => { router.push('/accessibility'); close(); }, group: 'navigation' },
          { id: 'signout',   label: messages.cmdSignOut,   icon: <LogOut className="size-4" />,          run: () => { close(); document.getElementById('cmdk-signout-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }, group: 'navigation' },
        ]
      : [
          { id: 'home',     label: messages.cmdHome,    icon: <Home className="size-4" />,          run: () => { router.push('/'); close(); },             group: 'navigation' },
          { id: 'login',    label: messages.cmdDashboard, icon: <LayoutDashboard className="size-4" />, run: () => { router.push('/login'); close(); },     group: 'navigation' },
          { id: 'a11y',     label: messages.cmdA11y,    icon: <Accessibility className="size-4" />, run: () => { router.push('/accessibility'); close(); }, group: 'navigation' },
        ];
    const bks: Cmd[] = bookings.map((b) => ({
      id: `b-${b.id}`,
      label: b.hotel_name || messages.untitled,
      hint: `${b.check_in} → ${b.check_out}`,
      icon: <Hotel className="size-4" />,
      run: () => { router.push(`/booking/${b.id}`); close(); },
      group: 'bookings',
    }));
    return [...nav, ...bks];
  }, [bookings, loggedIn, router, messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      (c.hint && c.hint.toLowerCase().includes(q)),
    );
  }, [query, allCommands]);

  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIdx]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[activeIdx]?.run();
    }
  }

  if (!open) {
    return (
      <>
        {/* Mobile launcher — visible only on small screens */}
        <button
          onClick={() => setOpen(true)}
          aria-label={messages.placeholder}
          className="fixed bottom-5 end-5 z-[55] grid size-12 place-items-center rounded-full bg-foreground text-background shadow-lg sm:hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-foreground/30"
        >
          <Search className="size-5" />
        </button>
        {/* Hidden sign-out form so the "התנתק" command can submit it */}
        <form id="cmdk-signout-form" action="/auth/signout" method="post" className="hidden" />
      </>
    );
  }

  const grouped = {
    navigation: filtered.filter((c) => c.group === 'navigation'),
    bookings: filtered.filter((c) => c.group === 'bookings'),
  };

  let runningIdx = -1;
  const renderGroup = (label: string, items: Cmd[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <ul>
          {items.map((c) => {
            runningIdx++;
            const isActive = runningIdx === activeIdx;
            return (
              <li key={c.id}>
                <button
                  onClick={c.run}
                  onMouseEnter={() => setActiveIdx(filtered.indexOf(c))}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-start text-sm transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/60'}`}
                >
                  <span className="text-muted-foreground">{c.icon}</span>
                  <span className="flex-1 truncate text-foreground">{c.label}</span>
                  {c.hint && <span dir="ltr" className="truncate text-xs text-muted-foreground">{c.hint}</span>}
                  {isActive && <ArrowLeft className="size-3.5 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="חיפוש מהיר"
        className="fixed start-1/2 top-[15vh] z-[71] -translate-x-1/2 rtl:translate-x-1/2 w-[calc(100vw-2rem)] max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={onKeyDown}
            placeholder={messages.placeholder}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={messages.placeholder}
          />
          <kbd className="hidden sm:inline-block rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground" dir="ltr">esc</kbd>
          <button onClick={close} className="text-muted-foreground hover:text-foreground sm:hidden" aria-label="סגור">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {messages.empty.replace('{query}', query)}
            </p>
          ) : (
            <>
              {renderGroup(messages.navHeading, grouped.navigation)}
              {renderGroup(messages.bookingsHeading, grouped.bookings)}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
          <span>
            <kbd className="mx-0.5 rounded border border-border bg-card px-1 py-0.5" dir="ltr">↑</kbd>
            <kbd className="mx-0.5 rounded border border-border bg-card px-1 py-0.5" dir="ltr">↓</kbd>
            {messages.navHint}
          </span>
          <span>
            <kbd className="mx-0.5 rounded border border-border bg-card px-1 py-0.5" dir="ltr">enter</kbd>
            {messages.selectHint}
          </span>
        </div>
      </div>
      <form id="cmdk-signout-form" action="/auth/signout" method="post" className="hidden" />
    </>
  );
}

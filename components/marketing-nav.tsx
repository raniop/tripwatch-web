'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, Plane, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LINKS = [
  { href: '#how', label: 'איך זה עובד' },
  { href: '#testimonials', label: 'משתמשים' },
  { href: '#pricing', label: 'תמחור' },
  { href: '#faq', label: 'שאלות' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-border/40' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 font-bold transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
          <Plane className="size-5" />
          <span className="text-base tracking-tight">TripWatch</span>
          <span className={`ms-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${scrolled ? 'bg-warning/15 text-warning' : 'bg-white/20 text-white'}`}>
            Beta
          </span>
        </Link>

        {/* Center nav (desktop) */}
        <nav className={`hidden md:flex items-center gap-1 text-sm font-medium transition-colors ${scrolled ? 'text-muted-foreground' : 'text-white/85'}`}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 transition-colors ${scrolled ? 'hover:bg-muted hover:text-foreground' : 'hover:bg-white/10 hover:text-white'}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/login" className={`hidden sm:inline-block text-sm font-medium transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/85 hover:text-white'}`}>
            התחבר
          </Link>
          <Link href="/login">
            <Button variant="accent" size="sm" className="h-9 gap-1.5 shadow-glow-orange">
              <span className="hidden sm:inline">התחל בחינם</span>
              <span className="sm:hidden">התחל</span>
              <ArrowLeft className="size-3.5" />
            </Button>
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`md:hidden grid size-9 place-items-center rounded-md transition-colors ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15'}`}
            aria-label="תפריט"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 glass">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              התחבר
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

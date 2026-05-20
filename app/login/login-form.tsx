'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Messages } from '@/lib/i18n/types';

interface Props {
  messages: Messages['login'] & { magicLinkSentSub?: string; magicLinkSendCta?: string };
  termsLabel: string;
  privacyLabel: string;
}

export default function LoginForm({ messages, termsLabel, privacyLabel }: Props) {
  const t = messages;
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithGoogle() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setErr(error.message);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setSending(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  // Render the "terms" line with placeholders substituted for <a> links.
  const termsParts = t.terms.split(/(\{termsLink\}|\{privacyLink\})/);
  const renderedTerms = termsParts.map((part, i) => {
    if (part === '{termsLink}') return <a key={i} href="/terms" className="underline mx-1">{termsLabel}</a>;
    if (part === '{privacyLink}') return <a key={i} href="/privacy" className="underline mx-1">{privacyLabel}</a>;
    return <span key={i}>{part}</span>;
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.title}</CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={signInWithGoogle} variant="outline" size="lg" className="w-full gap-2">
          <GoogleIcon /> {t.google}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">{t.or}</span></div>
        </div>

        {sent ? (
          <div className="rounded-md border border-success/30 bg-success/5 p-4 text-center">
            <div className="mb-2 text-2xl">✉️</div>
            <p className="text-sm font-medium text-foreground">{t.magicLinkSent}</p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              type="email"
              required
              dir="ltr"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-left focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={sending || !email} className="w-full" size="lg">
              {sending ? t.sending : t.sendMagicLink}
            </Button>
          </form>
        )}

        {err && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center text-xs">
            <p className="font-medium text-destructive">{err}</p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          {renderedTerms}
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8c1.8-4.4 6.1-7.5 11.1-7.5 3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.6 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

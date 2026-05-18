'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginForm() {
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
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">TripWatch</CardTitle>
        <CardDescription>היכנס כדי לעקוב אחרי המחירים של ההזמנות שלך</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={signInWithGoogle} variant="outline" size="lg" className="w-full">
          <GoogleIcon /> המשך עם Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">או</span></div>
        </div>

        {sent ? (
          <div className="text-center text-sm text-success">
            ✉️ קישור התחברות נשלח אליך למייל. בדוק את תיבת הדואר.
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              type="email"
              required
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? 'שולח...' : 'שלח לי קישור התחברות'}
            </Button>
          </form>
        )}

        {err && <p className="text-center text-sm text-destructive">{err}</p>}

        <p className="text-center text-xs text-muted-foreground pt-4">
          התחברות מסכימה ל
          <a href="/terms" className="underline mx-1">תנאי שימוש</a>
          ול
          <a href="/privacy" className="underline mx-1">מדיניות פרטיות</a>
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.35 11.1H12v3.2h5.35c-.23 1.24-1.5 3.65-5.35 3.65-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.7 3.62 14.6 2.7 12 2.7 6.95 2.7 2.85 6.8 2.85 12s4.1 9.3 9.15 9.3c5.28 0 8.8-3.7 8.8-8.92 0-.6-.07-1.05-.15-1.28Z" fill="#4285F4" />
    </svg>
  );
}

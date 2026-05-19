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
        {sent ? (
          <div className="rounded-md border border-success/30 bg-success/5 p-4 text-center">
            <div className="mb-2 text-2xl">✉️</div>
            <p className="text-sm font-medium text-foreground">קישור התחברות נשלח אליך למייל</p>
            <p className="mt-1 text-xs text-muted-foreground">בדוק את תיבת הדואר (וגם Spam) ולחץ על הקישור</p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <label className="block text-sm font-medium text-foreground">המייל שלך</label>
            <input
              type="email"
              required
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-left focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={sending || !email} className="w-full" size="lg">
              {sending ? 'שולח...' : 'שלח לי קישור התחברות'}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-1">
              נשלח אליך מייל עם קישור התחברות חד-פעמי. בלי סיסמאות.
            </p>
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

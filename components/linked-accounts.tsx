'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { UserIdentity } from '@supabase/supabase-js';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  email: 'מייל (קישור חד-פעמי)',
  apple: 'Apple',
  github: 'GitHub',
  facebook: 'Facebook',
};

export function LinkedAccounts() {
  const supabase = createClient();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.auth.getUserIdentities();
    if (error) setErr(error.message);
    else setIdentities(data?.identities ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  }

  async function linkGoogle() {
    setBusy('link-google');
    setErr(null);
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/settings?linked=google')}`,
      },
    });
    if (error) {
      setErr(error.message);
      setBusy(null);
    }
    // on success Supabase redirects, no need to setBusy(null)
  }

  async function unlink(identity: UserIdentity) {
    if (identities.length <= 1) {
      setErr('לא ניתן לנתק את שיטת ההתחברות היחידה.');
      return;
    }
    const label = PROVIDER_LABELS[identity.provider] || identity.provider;
    if (!confirm(`לנתק את ${label}? תוכל לקשר אותו שוב בכל עת.`)) return;
    setBusy(`unlink-${identity.identity_id}`);
    setErr(null);
    const { error } = await supabase.auth.unlinkIdentity(identity);
    setBusy(null);
    if (error) setErr(error.message);
    else {
      flash(`${label} נותק`);
      load();
    }
  }

  const hasGoogle = identities.some((i) => i.provider === 'google');

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">חיבורי חשבון</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            שיטות ההתחברות שמקושרות לחשבון שלך. אפשר להוסיף עוד שיטה כדי להתחבר במהירות.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {identities.map((id) => {
              const label = PROVIDER_LABELS[id.provider] || id.provider;
              const email =
                (id.identity_data?.email as string | undefined) ||
                (id.identity_data?.name as string | undefined) ||
                '—';
              const isOnly = identities.length <= 1;
              return (
                <div
                  key={id.identity_id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderIcon provider={id.provider} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground truncate" dir="ltr">{email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => unlink(id)}
                    disabled={busy === `unlink-${id.identity_id}` || isOnly}
                    variant="ghost"
                    size="sm"
                    className="text-destructive disabled:opacity-30"
                    aria-label="נתק"
                  >
                    {busy === `unlink-${id.identity_id}` ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {!hasGoogle && !loading && (
          <Button onClick={linkGoogle} variant="outline" className="w-full gap-2" disabled={busy === 'link-google'}>
            {busy === 'link-google' ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            הוסף התחברות עם Google
          </Button>
        )}

        {err && <p className="text-xs text-destructive">⚠ {err}</p>}
        {msg && <p className="text-xs text-success">✓ {msg}</p>}

        <p className="border-t border-border pt-3 text-[11px] text-muted-foreground">
          💡 פתחת חשבון פעמיים בטעות? שלח מייל ל-
          <a href="mailto:rani@ophir.email" className="underline">rani@ophir.email</a>
          {' '}ואני אאחד אותם תוך 24 שעות.
        </p>
      </CardContent>
    </Card>
  );
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === 'google') {
    return (
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white border border-border">
        <svg className="size-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8c1.8-4.4 6.1-7.5 11.1-7.5 3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.6 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Mail className="size-4" />
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Copy, RefreshCw, Check, Mail, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { rotateInboundToken, requestInboundEmailVerification, removeInboundEmail } from '@/app/settings/actions';
import type { InboundEmail } from '@/lib/supabase/types';
import type { Messages } from '@/lib/i18n/types';

interface Props {
  globalAddress: string;
  userEmail: string;
  personalAddress: string | null;
  recent: InboundEmail[];
  verifiedEmails: Array<{ email: string; verified_at: string }>;
  messages: Messages['settings'];
}

export function InboundForwardCard({ globalAddress, userEmail, personalAddress: initialPersonal, recent, verifiedEmails: initialVerified, messages }: Props) {
  const t = messages;
  const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
    received: { text: t.statusReceived, cls: 'bg-muted text-muted-foreground' },
    parsed:   { text: t.statusParsed,   cls: 'bg-muted text-muted-foreground' },
    created:  { text: t.statusCreated,  cls: 'bg-success/15 text-success' },
    skipped:  { text: t.statusSkipped,  cls: 'bg-muted text-muted-foreground' },
    error:    { text: t.statusError,    cls: 'bg-destructive/15 text-destructive' },
  };
  const [personalAddress, setPersonalAddress] = useState(initialPersonal);
  const [copied, setCopied] = useState<'global' | 'personal' | null>(null);
  const [pending, startTransition] = useTransition();
  const [verifiedEmails, setVerifiedEmails] = useState(initialVerified);
  const [newEmail, setNewEmail] = useState('');
  const [addBusy, setAddBusy] = useState(false);
  const [addMsg, setAddMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function onAddEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAddBusy(true);
    setAddMsg(null);
    const r = await requestInboundEmailVerification(newEmail);
    setAddBusy(false);
    if (r.ok) {
      setAddMsg({ kind: 'ok', text: t.inboundEmailSent.replace('{email}', r.sentTo) });
      setNewEmail('');
    } else {
      setAddMsg({ kind: 'err', text: r.error });
    }
  }

  async function onRemoveEmail(email: string) {
    if (!confirm(t.inboundRemoveConfirm.replace('{email}', email))) return;
    const r = await removeInboundEmail(email);
    if (r.ok) setVerifiedEmails((prev) => prev.filter((v) => v.email !== email));
  }

  async function onCopy(value: string, which: 'global' | 'personal') {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard API may be blocked; user can select manually
    }
  }

  function onRotate() {
    if (!confirm(t.inboundRotateConfirm)) return;
    startTransition(async () => {
      const res = await rotateInboundToken();
      if (res.ok) setPersonalAddress(res.address);
      else alert(res.error || t.inboundPersonalFailed);
    });
  }

  return (
    <Card id="inbound">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">{t.inboundHeading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.inboundDescription}</p>
        </div>

        <div className="flex items-stretch gap-2">
          <div
            className="flex-1 truncate rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm"
            dir="ltr"
          >
            {globalAddress}
          </div>
          <Button
            onClick={() => onCopy(globalAddress, 'global')}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {copied === 'global' ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="hidden sm:inline">{copied === 'global' ? t.inboundCopied : t.inboundCopy}</span>
          </Button>
        </div>

        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          {t.inboundWarning}
        </div>

        <details className="text-sm" open>
          <summary className="cursor-pointer text-muted-foreground">
            {t.inboundVerifiedEmails} ({1 + verifiedEmails.length})
          </summary>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span dir="ltr" className="font-mono">{userEmail}</span>
              </span>
              <span className="text-xs text-muted-foreground">{t.inboundEmailPrimary}</span>
            </li>
            {verifiedEmails.map((v) => (
              <li key={v.email} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span dir="ltr" className="font-mono">{v.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveEmail(v.email)}
                  className="text-destructive hover:text-destructive/80"
                  aria-label="remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={onAddEmail} className="mt-3 flex gap-2">
            <input
              type="email"
              dir="ltr"
              required
              placeholder="add-email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={addBusy || !newEmail} size="sm" className="shrink-0 gap-1">
              {addBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t.inboundSendVerify}
            </Button>
          </form>
          {addMsg && (
            <p className={`mt-2 text-xs ${addMsg.kind === 'ok' ? 'text-success' : 'text-destructive'}`}>
              {addMsg.kind === 'ok' ? '✓ ' : '⚠ '}{addMsg.text}
            </p>
          )}
        </details>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">{t.inboundHowItWorks}</summary>
          <ol className="mt-2 list-decimal space-y-1 pr-5 text-muted-foreground">
            <li>{t.inboundStep1}</li>
            <li>{t.inboundStep2}</li>
            <li>{t.inboundStep3}</li>
          </ol>
        </details>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            {t.inboundPersonalToggle}
          </summary>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">{t.inboundPersonalDescription}</p>
            {personalAddress ? (
              <div className="flex items-stretch gap-2">
                <div
                  className="flex-1 truncate rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs"
                  dir="ltr"
                >
                  {personalAddress}
                </div>
                <Button
                  onClick={() => onCopy(personalAddress, 'personal')}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied === 'personal' ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
                <Button
                  onClick={onRotate}
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  className="shrink-0"
                  aria-label="rotate"
                >
                  <RefreshCw className={pending ? 'size-4 animate-spin' : 'size-4'} />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-destructive">{t.inboundPersonalFailed}</p>
            )}
          </div>
        </details>

        {recent.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">{t.recentEmailsTitle}</h3>
            <ul className="divide-y divide-border rounded-md border border-border">
              {recent.map((row) => {
                const badge = STATUS_LABEL[row.status] || STATUS_LABEL.received;
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{row.subject || '—'}</div>
                      <div className="truncate text-xs text-muted-foreground" dir="ltr">
                        {row.from_address}
                      </div>
                      {row.error && (
                        <div className="mt-1 truncate text-xs text-destructive">{row.error}</div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>
                        {badge.text}
                      </span>
                      {row.booking_id && (
                        <Link
                          href={`/booking/${row.booking_id}`}
                          className="text-xs text-primary underline"
                        >
                          {t.openBooking}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

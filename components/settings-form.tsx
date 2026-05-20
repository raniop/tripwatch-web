'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateNotificationPrefs, updateDefaults, unlinkTelegram } from '@/app/settings/actions';
import { ProfileEditor } from '@/components/profile-editor';
import { LinkedAccounts } from '@/components/linked-accounts';
import type { Profile } from '@/lib/supabase/types';
import type { Messages } from '@/lib/i18n/types';

interface Props {
  profile: Profile | null;
  email: string;
  messages: Messages['settings'];
}

export function SettingsForm({ profile, email, messages }: Props) {
  const t = messages;
  const [prefs, setPrefs] = useState(profile?.notification_prefs || { email: true, in_app: true, telegram: false });
  const [pct, setPct] = useState(String(profile?.alert_pct_default ?? 5));
  const [amt, setAmt] = useState(String(profile?.alert_amount_ils_default ?? 100));
  const [linkData, setLinkData] = useState<{ token: string; instructions: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [telegramCopied, setTelegramCopied] = useState(false);

  async function onCopyLinkCommand() {
    if (!linkData) return;
    try {
      await navigator.clipboard.writeText(`/link ${linkData.token}`);
      setTelegramCopied(true);
      setTimeout(() => setTelegramCopied(false), 1500);
    } catch {
      // clipboard blocked
    }
  }

  async function onSavePrefs() {
    setSaving(true);
    await updateNotificationPrefs(prefs);
    setSaving(false);
    setMsg(t.saved);
    setTimeout(() => setMsg(null), 2000);
  }

  async function onSaveDefaults() {
    setSaving(true);
    await updateDefaults({
      alert_pct_default: Number(pct) || 5,
      alert_amount_ils_default: Number(amt) || 100,
    });
    setSaving(false);
    setMsg(t.saved);
    setTimeout(() => setMsg(null), 2000);
  }

  async function onLinkTelegram() {
    const r = await fetch('/api/telegram/link', { method: 'POST' });
    if (!r.ok) {
      setMsg('error');
      return;
    }
    const data = await r.json();
    setLinkData(data);
  }

  async function onUnlinkTelegram() {
    if (!confirm(t.telegramDisconnectConfirm)) return;
    await unlinkTelegram();
    location.reload();
  }

  return (
    <div className="space-y-6">
      <ProfileEditor profile={profile} email={email} messages={t} />

      <LinkedAccounts messages={t} />

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">{t.notificationsHeading}</h2>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>{t.notifyEmail}</span>
            <input
              type="checkbox"
              checked={prefs.email}
              onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
              className="size-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>{t.notifyInApp}</span>
            <input
              type="checkbox"
              checked={prefs.in_app}
              onChange={(e) => setPrefs({ ...prefs, in_app: e.target.checked })}
              className="size-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>{t.notifyTelegram}</span>
            <input
              type="checkbox"
              checked={prefs.telegram && !!profile?.telegram_chat_id}
              disabled={!profile?.telegram_chat_id}
              onChange={(e) => setPrefs({ ...prefs, telegram: e.target.checked })}
              className="size-5 accent-primary disabled:opacity-50"
            />
          </label>
          <Button onClick={onSavePrefs} disabled={saving} className="w-full">{t.save}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">{t.telegramHeading}</h2>
          {profile?.telegram_chat_id ? (
            <>
              <p className="text-sm text-success">{t.telegramConnected}</p>
              <Button onClick={onUnlinkTelegram} variant="outline" size="sm">{t.telegramDisconnect}</Button>
            </>
          ) : linkData ? (
            <div className="rounded-md bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.telegramInstructionsPrefix}</p>
              <button
                type="button"
                onClick={onCopyLinkCommand}
                className="my-2 inline-flex items-center gap-2 rounded-md bg-background px-3 py-2 font-mono font-bold tracking-wider transition-colors hover:bg-background/70"
                dir="ltr"
                aria-label={t.inboundCopy}
              >
                <span className="text-2xl">/link {linkData.token}</span>
                {telegramCopied
                  ? <Check className="size-5 text-success" />
                  : <Copy className="size-5 text-muted-foreground" />}
              </button>
              <p className="text-xs text-muted-foreground" dir="ltr">{linkData.instructions}</p>
              {telegramCopied && <p className="mt-1 text-xs text-success">{t.telegramInstructionsCopied}</p>}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t.telegramDescription}</p>
              <Button onClick={onLinkTelegram} variant="outline">{t.telegramLinkCta}</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">{t.defaultsHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.defaultsHelp}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t.defaultsPctLabel}</label>
              <input
                type="number"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                min={1}
                max={50}
                step={0.5}
                dir="ltr"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t.defaultsAmountLabel}</label>
              <input
                type="number"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                min={10}
                step={10}
                dir="ltr"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button onClick={onSaveDefaults} disabled={saving} className="w-full">{t.defaultsSave}</Button>
        </CardContent>
      </Card>

      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-success px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateNotificationPrefs, updateDefaults, unlinkTelegram } from '@/app/settings/actions';
import { ProfileEditor } from '@/components/profile-editor';
import { LinkedAccounts } from '@/components/linked-accounts';
import type { Profile } from '@/lib/supabase/types';

export function SettingsForm({ profile, email }: { profile: Profile | null; email: string }) {
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
      // clipboard blocked — user can still select manually
    }
  }

  async function onSavePrefs() {
    setSaving(true);
    await updateNotificationPrefs(prefs);
    setSaving(false);
    setMsg('שמור ✅');
    setTimeout(() => setMsg(null), 2000);
  }

  async function onSaveDefaults() {
    setSaving(true);
    await updateDefaults({
      alert_pct_default: Number(pct) || 5,
      alert_amount_ils_default: Number(amt) || 100,
    });
    setSaving(false);
    setMsg('שמור ✅');
    setTimeout(() => setMsg(null), 2000);
  }

  async function onLinkTelegram() {
    const r = await fetch('/api/telegram/link', { method: 'POST' });
    if (!r.ok) {
      setMsg('שגיאה בהפקת קוד');
      return;
    }
    const data = await r.json();
    setLinkData(data);
  }

  async function onUnlinkTelegram() {
    if (!confirm('לנתק את חשבון הטלגרם?')) return;
    await unlinkTelegram();
    location.reload();
  }

  return (
    <div className="space-y-6">
      <ProfileEditor profile={profile} email={email} />

      <LinkedAccounts />

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">איך לקבל התראות</h2>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>📧 מייל</span>
            <input
              type="checkbox"
              checked={prefs.email}
              onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
              className="size-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>🔔 בתוך האפליקציה</span>
            <input
              type="checkbox"
              checked={prefs.in_app}
              onChange={(e) => setPrefs({ ...prefs, in_app: e.target.checked })}
              className="size-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 py-1">
            <span>✈️ טלגרם</span>
            <input
              type="checkbox"
              checked={prefs.telegram && !!profile?.telegram_chat_id}
              disabled={!profile?.telegram_chat_id}
              onChange={(e) => setPrefs({ ...prefs, telegram: e.target.checked })}
              className="size-5 accent-primary disabled:opacity-50"
            />
          </label>
          <Button onClick={onSavePrefs} disabled={saving} className="w-full">שמור</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">חיבור טלגרם</h2>
          {profile?.telegram_chat_id ? (
            <>
              <p className="text-sm text-success">✓ מחובר</p>
              <Button onClick={onUnlinkTelegram} variant="outline" size="sm">נתק</Button>
            </>
          ) : linkData ? (
            <div className="rounded-md bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">פתח את הבוט ושלח:</p>
              <button
                type="button"
                onClick={onCopyLinkCommand}
                className="my-2 inline-flex items-center gap-2 rounded-md bg-background px-3 py-2 font-mono font-bold tracking-wider transition-colors hover:bg-background/70"
                dir="ltr"
                aria-label="העתק את הפקודה"
              >
                <span className="text-2xl">/link {linkData.token}</span>
                {telegramCopied
                  ? <Check className="size-5 text-success" />
                  : <Copy className="size-5 text-muted-foreground" />}
              </button>
              <p className="text-xs text-muted-foreground" dir="ltr">{linkData.instructions}</p>
              {telegramCopied && <p className="mt-1 text-xs text-success">הועתק ✓</p>}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                קישור חשבון הטלגרם יאפשר לך לקבל התראות ישירות בטלגרם, מהיר יותר ממייל.
              </p>
              <Button onClick={onLinkTelegram} variant="outline">קישור חשבון טלגרם</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">ספי התראה ברירת מחדל</h2>
          <p className="text-sm text-muted-foreground">
            יחולו על הזמנות חדשות. אפשר לשנות לכל הזמנה בנפרד.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">% ירידה מינימלי</label>
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
              <label className="mb-1 block text-xs text-muted-foreground">סכום מינימלי (₪)</label>
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
          <Button onClick={onSaveDefaults} disabled={saving} className="w-full">שמור ברירות מחדל</Button>
        </CardContent>
      </Card>

      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-success px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
    </div>
  );
}

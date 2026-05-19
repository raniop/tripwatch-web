'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { rotateInboundToken } from '@/app/settings/actions';
import type { InboundEmail } from '@/lib/supabase/types';

interface Props {
  globalAddress: string;
  userEmail: string;
  personalAddress: string | null;
  recent: InboundEmail[];
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  received: { text: 'התקבל', cls: 'bg-muted text-muted-foreground' },
  parsed:   { text: 'נותח',   cls: 'bg-muted text-muted-foreground' },
  created:  { text: 'נוסף ✓', cls: 'bg-success/15 text-success' },
  skipped:  { text: 'דולג',   cls: 'bg-muted text-muted-foreground' },
  error:    { text: 'שגיאה',  cls: 'bg-destructive/15 text-destructive' },
};

export function InboundForwardCard({ globalAddress, userEmail, personalAddress: initialPersonal, recent }: Props) {
  const [personalAddress, setPersonalAddress] = useState(initialPersonal);
  const [copied, setCopied] = useState<'global' | 'personal' | null>(null);
  const [pending, startTransition] = useTransition();

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
    if (!confirm('להחליף את הכתובת האישית? פורוורדים שכבר עשית לכתובת הישנה לא יקלטו יותר.')) return;
    startTransition(async () => {
      const res = await rotateInboundToken();
      if (res.ok) setPersonalAddress(res.address);
      else alert(res.error || 'שגיאה בהחלפת הכתובת');
    });
  }

  return (
    <Card id="inbound">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">📧 הוספת הזמנות במייל</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            פורוורד את אישור ההזמנה אל הכתובת הבאה ונחלץ את הפרטים אוטומטית.
            עובד עם Booking.com, Agoda, Expedia ו-Hotels.com.
          </p>
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
            <span className="hidden sm:inline">{copied === 'global' ? 'הועתק' : 'העתק'}</span>
          </Button>
        </div>

        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          ⚠️ חשוב: צריך לפורוורד מהמייל <span dir="ltr" className="font-mono">{userEmail}</span> או
          ממייל אחר שמקושר לחשבון (ראה &quot;חיבורי חשבון&quot; למטה).
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">איך זה עובד?</summary>
          <ol className="mt-2 list-decimal space-y-1 pr-5 text-muted-foreground">
            <li>פתח את אישור ההזמנה ב-Gmail / Outlook.</li>
            <li>לחץ &quot;פורוורד&quot; והדבק את הכתובת למעלה.</li>
            <li>בתוך כמה שניות ההזמנה תופיע ב-Dashboard ותקבל מייל אישור.</li>
          </ol>
        </details>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">
            כתובת אישית — לפורוורד ממייל לא מקושר
          </summary>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              אם אתה רוצה לפורוורד ממייל שלא מקושר ל-TripWatch (למשל מייל של מקום העבודה),
              השתמש בכתובת האישית הסודית הזו. שמור אותה ואל תפרסם.
            </p>
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
                  title="החלף כתובת"
                >
                  <RefreshCw className={pending ? 'size-4 animate-spin' : 'size-4'} />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-destructive">לא הצלחנו להפיק כתובת אישית.</p>
            )}
          </div>
        </details>

        {recent.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">מיילים אחרונים שקיבלנו</h3>
            <ul className="divide-y divide-border rounded-md border border-border">
              {recent.map((row) => {
                const badge = STATUS_LABEL[row.status] || STATUS_LABEL.received;
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{row.subject || '(ללא נושא)'}</div>
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
                          פתח
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

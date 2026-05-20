'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Loader2, Check, X, Trash2 } from 'lucide-react';
import { setCancellationDeadline } from '@/app/booking/[id]/actions';

interface Messages {
  addManualDeadlineCta: string;
  deadlineLabel: string;
  deadlineSave: string;
  deadlineCancel: string;
  deadlineDelete: string;
  deadlineConfirmDelete: string;
  deadlinePicker: string;
  deadlineInvalid: string;
  cancellationBanner: string;
  cancellationExpired: string;
  cancellationUnitHour: string;
  cancellationUnitHours: string;
  cancellationUnitDay: string;
  cancellationUnitDays: string;
  cancellationLessThanHour: string;
}

interface Props {
  bookingId: string;
  initialIso: string | null;
  messages: Messages;
}

export function CancellationDeadlineEditor({ bookingId, initialIso, messages }: Props) {
  const [iso, setIso] = useState(initialIso);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(toDatetimeLocal(initialIso));
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onOpen() {
    setDraft(toDatetimeLocal(iso));
    setEditing(true);
    setErr(null);
  }

  function onCancel() {
    setEditing(false);
    setErr(null);
  }

  function onSave() {
    if (!draft) {
      setErr(messages.deadlinePicker);
      return;
    }
    const isoOut = new Date(draft).toISOString();
    startTransition(async () => {
      const r = await setCancellationDeadline(bookingId, isoOut);
      if (r.ok) {
        setIso(isoOut);
        setEditing(false);
      } else {
        setErr(r.error);
      }
    });
  }

  function onClear() {
    if (!confirm(messages.deadlineConfirmDelete)) return;
    startTransition(async () => {
      const r = await setCancellationDeadline(bookingId, null);
      if (r.ok) {
        setIso(null);
        setEditing(false);
      } else {
        setErr(r.error);
      }
    });
  }

  if (editing) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3">
        <label className="block text-xs text-muted-foreground mb-1.5">
          {messages.deadlineLabel}
        </label>
        <input
          type="datetime-local"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          dir="ltr"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button onClick={onSave} disabled={pending} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
            {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            {messages.deadlineSave}
          </button>
          <button onClick={onCancel} disabled={pending} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs">
            <X className="size-3" />
            {messages.deadlineCancel}
          </button>
          {iso && (
            <button onClick={onClear} disabled={pending} className="ms-auto inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
              <Trash2 className="size-3" />
              {messages.deadlineDelete}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!iso) {
    return (
      <button
        onClick={onOpen}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
      >
        <Plus className="size-4" />
        {messages.addManualDeadlineCta}
      </button>
    );
  }

  return <DeadlineBanner iso={iso} onEdit={onOpen} messages={messages} />;
}

function DeadlineBanner({ iso, onEdit, messages }: { iso: string; onEdit: () => void; messages: Messages }) {
  const now = Date.now();
  const deadline = new Date(iso).getTime();
  const msLeft = deadline - now;
  const expired = msLeft <= 0;
  const hoursLeft = Math.round(msLeft / 3_600_000);
  const daysLeft = Math.round(msLeft / 86_400_000);

  let stateText: string;
  if (expired) stateText = messages.cancellationExpired;
  else if (hoursLeft < 1) stateText = messages.cancellationLessThanHour;
  else if (hoursLeft < 24) stateText = (hoursLeft === 1 ? messages.cancellationUnitHour : messages.cancellationUnitHours).replace('{n}', String(hoursLeft));
  else if (daysLeft === 1) stateText = messages.cancellationUnitDay;
  else stateText = messages.cancellationUnitDays.replace('{n}', String(daysLeft));

  let cls = 'border-success/40 bg-success/10 text-success';
  if (expired) cls = 'border-border bg-muted text-muted-foreground';
  else if (hoursLeft <= 48) cls = 'border-destructive/40 bg-destructive/10 text-destructive';
  else if (daysLeft <= 7) cls = 'border-warning/40 bg-warning/10 text-warning';

  const formatted = new Date(iso).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${cls}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">
          {messages.cancellationBanner.replace('{state}', stateText)}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs opacity-80" dir="ltr">{formatted}</span>
          <button
            onClick={onEdit}
            className="opacity-70 hover:opacity-100"
            aria-label={messages.deadlineSave}
          >
            <Pencil className="size-3.5" />
          </button>
        </span>
      </div>
    </div>
  );
}

/**
 * ISO timestamp → "YYYY-MM-DDTHH:mm" for <input type="datetime-local"> (in
 * the user's local timezone).
 */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

'use client';

import { useState, useTransition } from 'react';
import { Pencil, Loader2, Check, X, Minus, Plus } from 'lucide-react';
import { updateGuests } from '@/app/booking/[id]/actions';

interface Messages {
  adults: string;
  children: string;
  rooms: string;
  /** Inline display: "👥 2 מבוגרים, 2 ילדים (גילאי 10, 10) · 🚪 1 חדר" */
  guestsAgesPrefix: string;
  editGuestsAria: string;
  guestsEditTitle: string;
  childAgeLabel: string;
  childAgeHint: string;
  guestsSave: string;
  guestsCancel: string;
  guestsRechecking: string;
  guestsRecheckedTo: string;
  guestsRecheckFailed: string;
  guestsRecheckSkipped: string;
}

interface Props {
  bookingId: string;
  initialAdults: number;
  initialChildren: number;
  initialChildrenAges: number[];
  initialRooms: number;
  messages: Messages;
}

export function GuestsEditor({
  bookingId,
  initialAdults,
  initialChildren,
  initialChildrenAges,
  initialRooms,
  messages,
}: Props) {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [ages, setAges] = useState<number[]>(normalize(initialChildrenAges, initialChildren));
  const [rooms, setRooms] = useState(initialRooms);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'skipped'; text: string } | null>(null);

  // The display line — what users see when not editing.
  const childrenPart =
    children > 0
      ? `, ${children} ${messages.children}${
          ages.length > 0 ? ` ${messages.guestsAgesPrefix}${ages.join(', ')})` : ''
        }`
      : '';
  const display = `👥 ${adults} ${messages.adults}${childrenPart} · 🚪 ${rooms} ${messages.rooms}`;

  function onChildrenChange(next: number) {
    const clamped = Math.max(0, Math.min(8, Math.floor(next)));
    setChildren(clamped);
    setAges((prev) => normalize(prev, clamped));
  }

  function setAge(idx: number, value: number) {
    setAges((prev) => prev.map((a, i) => (i === idx ? Math.max(0, Math.min(17, Math.floor(value))) : a)));
  }

  function onSave() {
    setStatus(null);
    startTransition(async () => {
      const r = await updateGuests(bookingId, {
        adults,
        children,
        children_ages: ages,
        rooms,
      });
      if (!r.ok) {
        setStatus({ kind: 'err', text: r.error });
        return;
      }
      setEditing(false);
      if ('result' in r && r.result) {
        const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
        setStatus({
          kind: 'ok',
          text: messages.guestsRecheckedTo.replace('{price}', `${fmt.format(r.result.amount)} ${r.result.currency}`),
        });
      } else if ('recheckError' in r && r.recheckError) {
        setStatus({
          kind: 'skipped',
          text: messages.guestsRecheckFailed.replace('{error}', r.recheckError),
        });
      } else {
        setStatus({ kind: 'skipped', text: messages.guestsRecheckSkipped });
      }
    });
  }

  function onCancel() {
    setAdults(initialAdults);
    setChildren(initialChildren);
    setAges(normalize(initialChildrenAges, initialChildren));
    setRooms(initialRooms);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <p className="text-sm group">
        {display}{' '}
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={messages.editGuestsAria}
          className="ms-1 inline-flex items-center text-muted-foreground opacity-60 hover:opacity-100 transition-opacity align-middle"
        >
          <Pencil className="size-3.5" />
        </button>
        {status && (
          <span
            className={`block mt-1 text-xs ${
              status.kind === 'ok'
                ? 'text-success'
                : status.kind === 'err'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            {status.text}
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs font-semibold text-muted-foreground mb-3">{messages.guestsEditTitle}</p>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <Counter label={messages.adults} value={adults} min={1} max={10} onChange={setAdults} />
        <Counter label={messages.children} value={children} min={0} max={8} onChange={onChildrenChange} />
        <Counter label={messages.rooms} value={rooms} min={1} max={5} onChange={setRooms} />
      </div>

      {children > 0 && (
        <div className="mb-3 space-y-2 border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">{messages.childAgeHint}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ages.map((age, i) => (
              <label key={i} className="block">
                <span className="text-[11px] text-muted-foreground">
                  {messages.childAgeLabel.replace('{n}', String(i + 1))}
                </span>
                <input
                  type="number"
                  min={0}
                  max={17}
                  value={age}
                  onChange={(e) => setAge(i, Number(e.target.value))}
                  dir="ltr"
                  className="mt-0.5 h-9 w-full rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {status?.kind === 'err' && <p className="mb-2 text-xs text-destructive">{status.text}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          {pending ? messages.guestsRechecking : messages.guestsSave}
        </button>
        <button
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs"
        >
          <X className="size-3" />
          {messages.guestsCancel}
        </button>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between rounded-md border border-border bg-background">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label="-"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="tabular-nums text-sm font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
          aria-label="+"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function normalize(ages: number[], n: number): number[] {
  const out = ages.slice(0, n).map((a) => (Number.isFinite(a) ? Math.max(0, Math.min(17, Math.floor(a))) : 10));
  while (out.length < n) out.push(10);
  return out;
}

'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Loader2, Check, X } from 'lucide-react';
import { updateRoomType } from '@/app/booking/[id]/actions';

interface Messages {
  /** Inline display prefix when room_type is set, e.g. "🛏 " */
  roomIconPrefix: string;
  mealIconPrefix: string;
  roomEditTitle: string;
  roomAddCta: string;
  roomLabel: string;
  roomPlaceholder: string;
  mealLabel: string;
  mealPlaceholder: string;
  roomSave: string;
  roomSaving: string;
  roomCancel: string;
  roomAriaEdit: string;
  /** "✓ נשמר ונבדק: {price}" */
  roomRecheckedTo: string;
  roomRecheckFailed: string;
  roomSavedNoRecheck: string;
}

interface Props {
  bookingId: string;
  initialRoomType: string | null;
  initialMealPlan: string | null;
  messages: Messages;
}

export function RoomTypeEditor({ bookingId, initialRoomType, initialMealPlan, messages }: Props) {
  const [roomType, setRoomType] = useState(initialRoomType ?? '');
  const [mealPlan, setMealPlan] = useState(initialMealPlan ?? '');
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'note'; text: string } | null>(null);

  // Stable initial values for cancel/revert.
  const savedRoom = initialRoomType ?? '';
  const savedMeal = initialMealPlan ?? '';

  function onSave() {
    setStatus(null);
    startTransition(async () => {
      const r = await updateRoomType(bookingId, { room_type: roomType, meal_plan: mealPlan });
      if (!r.ok) {
        setStatus({ kind: 'err', text: r.error });
        return;
      }
      setEditing(false);
      if ('result' in r && r.result) {
        const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
        setStatus({
          kind: 'ok',
          text: messages.roomRecheckedTo.replace('{price}', `${fmt.format(r.result.amount)} ${r.result.currency}`),
        });
      } else if ('recheckError' in r && r.recheckError) {
        setStatus({ kind: 'note', text: messages.roomRecheckFailed.replace('{error}', r.recheckError) });
      } else {
        setStatus({ kind: 'note', text: messages.roomSavedNoRecheck });
      }
    });
  }

  function onCancel() {
    setRoomType(savedRoom);
    setMealPlan(savedMeal);
    setEditing(false);
    setStatus(null);
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{messages.roomEditTitle}</p>

        <label className="block">
          <span className="text-[11px] text-muted-foreground">{messages.roomLabel}</span>
          <input
            type="text"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            placeholder={messages.roomPlaceholder}
            className="mt-0.5 h-9 w-full rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="text-[11px] text-muted-foreground">{messages.mealLabel}</span>
          <input
            type="text"
            value={mealPlan}
            onChange={(e) => setMealPlan(e.target.value)}
            placeholder={messages.mealPlaceholder}
            className="mt-0.5 h-9 w-full rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        {status?.kind === 'err' && <p className="text-xs text-destructive">{status.text}</p>}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onSave}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            {pending ? messages.roomSaving : messages.roomSave}
          </button>
          <button
            onClick={onCancel}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs"
          >
            <X className="size-3" />
            {messages.roomCancel}
          </button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div className="space-y-1">
      {savedRoom ? (
        <p className="text-sm group">
          {messages.roomIconPrefix}
          <span className="text-foreground">{savedRoom}</span>{' '}
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={messages.roomAriaEdit}
            className="ms-1 inline-flex items-center text-muted-foreground opacity-60 hover:opacity-100 transition-opacity align-middle"
          >
            <Pencil className="size-3.5" />
          </button>
        </p>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        >
          <Plus className="size-4" />
          {messages.roomAddCta}
        </button>
      )}
      {savedMeal && <p className="text-sm">{messages.mealIconPrefix}{savedMeal}</p>}
      {status && (
        <p
          className={`text-xs ${
            status.kind === 'ok' ? 'text-success' : status.kind === 'err' ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkAllBookings, type CheckAllResult } from '@/app/dashboard/actions';

interface Props {
  totalBookings: number;
  messages: {
    check: string;
    busy: string;
    toastDone?: string;
    toastDrops?: string;
    toastErrors?: string;
    errorFallback?: string;
  };
}

export function CheckAllButton({ totalBookings, messages }: Props) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<CheckAllResult | null>(null);

  async function onClick() {
    if (totalBookings === 0) return;
    setPhase('running');
    setResult(null);
    const r = await checkAllBookings();
    setResult(r);
    setPhase(r.ok ? 'done' : 'error');
    setTimeout(() => {
      setPhase('idle');
      setResult(null);
    }, 6000);
  }

  if (totalBookings === 0) return null;

  const estimateSec = Math.max(15, totalBookings * 18);
  const busyLabel = (messages.busy || '')
    .replace('{total}', String(totalBookings))
    .replace('{sec}', String(estimateSec));

  return (
    <>
      <Button
        onClick={onClick}
        disabled={phase === 'running'}
        variant="outline"
        size="lg"
        className="h-11 gap-2"
      >
        {phase === 'running' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : phase === 'done' ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {phase === 'running' ? busyLabel : messages.check}
      </Button>

      {phase === 'done' && result && messages.toastDone && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-success/30 bg-success/10 px-5 py-3 text-sm font-medium text-foreground shadow-xl animate-fade-up">
          {messages.toastDone
            .replace('{checked}', String(result.checked ?? 0))
            .replace('{total}', String(result.total ?? 0))}
          {result.drops! > 0 && messages.toastDrops && (
            <span className="ms-2 text-success">{messages.toastDrops.replace('{drops}', String(result.drops))}</span>
          )}
          {result.errors! > 0 && messages.toastErrors && (
            <span className="ms-2 text-destructive">{messages.toastErrors.replace('{errors}', String(result.errors))}</span>
          )}
        </div>
      )}
      {phase === 'error' && result && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm font-medium text-destructive shadow-xl animate-fade-up">
          ⚠️ {result.error || messages.errorFallback || 'unknown error'}
        </div>
      )}
    </>
  );
}

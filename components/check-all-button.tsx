'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkAllBookings, type CheckAllResult } from '@/app/dashboard/actions';

interface Props {
  totalBookings: number;
}

export function CheckAllButton({ totalBookings }: Props) {
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
        {phase === 'running' ? `בודק ${totalBookings} הזמנות (עד ~${estimateSec} שניות)...` : 'בדוק את כל ההזמנות'}
      </Button>

      {phase === 'done' && result && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-success/30 bg-success/10 px-5 py-3 text-sm font-medium text-foreground shadow-xl animate-fade-up">
          ✅ נבדקו {result.checked} מתוך {result.total}
          {result.drops! > 0 && <span className="ms-2 text-success">· {result.drops} ירידות מחיר</span>}
          {result.errors! > 0 && <span className="ms-2 text-destructive">· {result.errors} שגיאות</span>}
        </div>
      )}
      {phase === 'error' && result && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm font-medium text-destructive shadow-xl animate-fade-up">
          ⚠️ {result.error || 'שגיאה לא ידועה'}
        </div>
      )}
    </>
  );
}

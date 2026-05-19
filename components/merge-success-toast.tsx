'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';

export function MergeSuccessToast() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      router.replace('/dashboard');
    }, 6000);
    return () => clearTimeout(t);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-4 shadow-2xl animate-fade-up">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-success/20 text-success">
        <CheckCircle2 className="size-5" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-foreground">✅ החשבונות אוחדו!</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          כל ההזמנות וההגדרות מהחשבון האחר עברו לכאן. החשבון הישן נמחק.
        </p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          router.replace('/dashboard');
        }}
        className="text-muted-foreground hover:text-foreground"
        aria-label="סגור"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

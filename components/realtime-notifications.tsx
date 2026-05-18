'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/supabase/types';

export function RealtimeNotifications({ userId }: { userId: string }) {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => setToasts((prev) => [...prev, payload.new as Notification]),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2" dir="rtl">
      {toasts.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg animate-in slide-in-from-bottom-2"
        >
          <Bell className="size-5 shrink-0 text-primary" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">{n.title}</p>
            {n.body && <p className="mt-1 text-muted-foreground">{n.body}</p>}
          </div>
          <button onClick={() => dismiss(n.id)} className="text-muted-foreground hover:text-foreground" aria-label="סגור">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

import { Mail, Send, Bell } from 'lucide-react';

export function InAction() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {/* Email preview */}
      <Panel icon={<Mail className="size-4" />} title="במייל" sub="כל יום בערב, אם יש שינוי">
        <div className="rounded-lg border border-border bg-background p-4 text-end">
          <p className="text-[11px] text-muted-foreground">From: TripWatch</p>
          <p className="text-xs font-bold mt-1">💸 ירידת מחיר ב-Vana Belle</p>
          <div className="mt-3 rounded-md bg-muted/60 p-3">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span className="tabular-nums">₪7,192</span>
              <span>שילמת</span>
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
              <span className="tabular-nums">₪5,482</span>
              <span>עכשיו</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between text-success font-bold">
              <span className="tabular-nums text-base">₪1,710 (24%)</span>
              <span className="text-xs">חיסכון</span>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-primary py-2 text-center text-xs font-semibold text-white">
            פתח את ההזמנה ב-Booking
          </div>
        </div>
      </Panel>

      {/* Telegram preview */}
      <Panel icon={<Send className="size-4" />} title="בטלגרם" sub="אם חיברת את החשבון">
        <div className="rounded-lg bg-slate-900 p-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">T</div>
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#229ED9] px-3 py-2 text-xs text-white">
              <p className="font-bold">💸 ירידת מחיר!</p>
              <p className="mt-0.5">🏨 Vana Belle</p>
              <p>📅 19–22 באוק&apos; 2026</p>
              <div className="my-1.5 border-t border-white/20" />
              <p>שילמת: ₪7,192</p>
              <p>עכשיו: ₪5,482</p>
              <p className="font-bold mt-1">חיסכון: ₪1,710 (24%)</p>
            </div>
          </div>
          <div className="flex items-center gap-1 ps-9 text-[10px] text-slate-400">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400" /> נקרא · עכשיו
          </div>
        </div>
      </Panel>

      {/* In-app preview */}
      <Panel icon={<Bell className="size-4" />} title="באפליקציה" sub="התראה חיה במסך">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="rounded-md bg-muted/30 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>הזמנות פעילות</span>
              <span>2</span>
            </div>
            <div className="rounded-md border border-border bg-card p-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Vana Belle</p>
                <p className="text-[10px] text-muted-foreground">19–22 באוק׳</p>
              </div>
              <div className="text-end">
                <p className="text-[10px] text-muted-foreground line-through tabular-nums">₪7,192</p>
                <p className="text-sm font-bold text-success tabular-nums">₪5,482</p>
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-2.5 flex items-center justify-between opacity-70">
              <div>
                <p className="text-xs font-semibold">Banyan Tree</p>
                <p className="text-[10px] text-muted-foreground">16–19 באוק׳</p>
              </div>
              <p className="text-sm font-bold tabular-nums">₪5,061</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-2 animate-pulse-soft">
            <div className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success text-xs">💸</div>
            <div className="text-[10px] leading-tight">
              <p className="font-semibold text-foreground">חיסכון של ₪1,710</p>
              <p className="text-muted-foreground">Vana Belle ירד 24%</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

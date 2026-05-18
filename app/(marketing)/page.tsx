import Link from 'next/link';
import { Camera, Eye, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { fmtPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase.from('public_stats').select('*').maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">✈️</span>
            <span>TripWatch</span>
            <span className="ms-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">Beta</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">התחבר</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-12 pb-16 text-center md:pt-20 md:pb-24">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          המחיר ירד.<br />
          <span className="text-primary">אנחנו ניתן לך לדעת.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          שלח לנו צילום של דף ההזמנה ב-Booking. אנחנו נעקוב אחרי המחיר בכל יום,
          ונשלח לך התראה ברגע שיש ירידה משמעותית — שתוכל לבטל ולהזמין מחדש.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base">
              התחל בחינם <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">אין צורך בכרטיס אשראי · בטא חינם</p>
        </div>

        {stats && Number(stats.total_potential_savings_ils) > 100 && (
          <p className="mt-6 text-sm text-muted-foreground">
            עד עכשיו עזרנו ל-{stats.total_users} משתמשים לחסוך{' '}
            <span className="font-semibold text-success">
              {fmtPrice(Number(stats.total_potential_savings_ils), 'ILS')}
            </span>
          </p>
        )}
      </section>

      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">איך זה עובד</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Step n="1" Icon={Camera} title="צלם את ההזמנה">
              מסך הזמנה ב-Booking? צילום מסך אחד, גרירה לאתר, סיימת.
              <br />זה הכל מהצד שלך.
            </Step>
            <Step n="2" Icon={Eye} title="אנחנו עוקבים">
              כל יום בודקים את אותו חדר, אותם תאריכים, אותו תעריף.
              <br />חצי פנסיון? ביטול חופשי? ניקח את זה בחשבון.
            </Step>
            <Step n="3" Icon={Bell} title="אתה חוסך">
              ברגע שהמחיר יורד מעל סף שתגדיר — מגיעה לך התראה במייל ובטלגרם.
              <br />בטל את הישנה והזמן את החדשה.
            </Step>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">למה זה עובד?</h2>
          <p className="mb-8 text-muted-foreground">
            מחירי מלונות זזים יום-יום בלי שום היגיון. בעוד 3 חודשים אותו חדר עשוי להיות זול ב-20%.
            אם הזמנת עם ביטול חופשי — כל יום שאתה לא בודק הוא כסף שאתה משאיר על השולחן.
            אנחנו בודקים בשבילך.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base">
              התחל לעקוב <ArrowLeft className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground md:flex-row">
          <span>TripWatch — בטא</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">פרטיות</Link>
            <Link href="/terms" className="hover:text-foreground">תנאי שימוש</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, Icon, title, children }: { n: string; Icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div className="mb-1 text-xs font-semibold text-primary">שלב {n}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft, Camera, Eye, Bell, Sparkles, ShieldCheck, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroDemo } from '@/components/hero-demo';
import { AnimatedCounter } from '@/components/animated-counter';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase.from('public_stats').select('*').maybeSingle();

  const totalBookings = Number(stats?.total_bookings ?? 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative bg */}
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-bottom opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">✈️</span>
            <span>TripWatch</span>
            <span className="ms-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">Beta</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">היכנס</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 md:pt-20 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Left: text */}
          <div className="text-center lg:text-start animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-warning" />
              חינם · בלי כרטיס אשראי
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              המחירים ב-Booking{' '}
              <span className="text-gradient">זזים כל יום.</span>{' '}
              <span className="text-muted-foreground/70">אנחנו עוקבים בשבילך.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg lg:mx-0">
              צילום מסך אחד של ההזמנה שלך → אנחנו בודקים את אותו חדר, אותם תאריכים, אותו תעריף — מדי יום.
              <br />
              מחיר ירד? תקבל התראה. מבטל וחוסך.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg" className="h-12 gap-2 px-7 text-base shadow-lg shadow-primary/30">
                  התחל לחסוך — חינם
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">30 שניות להתחבר · בלי התקנה</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <TrustItem Icon={ShieldCheck}>בלי לתת סיסמת Booking</TrustItem>
              <TrustItem Icon={Clock}>בדיקה כל יום אוטומטית</TrustItem>
              <TrustItem Icon={Zap}>התראה במייל ובטלגרם</TrustItem>
            </div>
          </div>

          {/* Right: live demo */}
          <div className="relative pt-4 pb-8">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <Stat
              value={<>₪<AnimatedCounter to={2000} />+</>}
              label="חיסכון מוכח על הזמנה אחת"
              sub="Banyan Tree Samui · מאי 2026"
            />
            <Stat
              value="100%"
              label="התאמה לחדר ולתעריף שלך"
              sub="כולל חצי פנסיון, ביטול חופשי, וכו'"
            />
            <Stat
              value="24/7"
              label="בדיקה אוטומטית מהענן"
              sub={totalBookings > 0 ? `${totalBookings} הזמנות במעקב כרגע` : 'בלי שתצטרך לעשות כלום'}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
            איך זה עובד
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            3 צעדים. <span className="text-muted-foreground">אפס מאמץ.</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Step n={1} Icon={Camera} title="צלם" highlight="3 שניות">
            סיימת להזמין ב-Booking? צלם מסך של דף האישור.
            <strong className="block mt-1 text-foreground">זהו, סיימת.</strong>
          </Step>
          <Step n={2} Icon={Eye} title="אנחנו עוקבים" highlight="כל 24 שעות">
            המערכת מזהה את החדר, התאריכים, ואפילו אם לקחת חצי פנסיון או ביטול חופשי — ובודקת בדיוק את אותו תעריף.
          </Step>
          <Step n={3} Icon={Bell} title="אתה חוסך" highlight="התראה מיידית">
            מחיר ירד מעל הסף שלך — מייל, התראה באפליקציה, אופציונלית בטלגרם. בטל את הישנה, הזמן את החדשה.
          </Step>
        </div>
      </section>

      {/* WHY */}
      <section className="border-t border-border/50 bg-gradient-to-b from-muted/40 to-transparent py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">
            למה <span className="text-gradient">זה באמת חוסך כסף</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            מחירי מלונות זזים יום-יום בלי שום היגיון. אותו חדר ב-Booking יכול לעלות ₪7,000 היום ו-₪5,500 בעוד שבועיים.
            אם הזמנת עם ביטול חופשי — כל יום שאתה לא בודק זה כסף שנשאר על השולחן.
            הבעיה שאף אחד לא הולך לחזור לבדוק כל יום.
          </p>
          <p className="mt-5 text-2xl font-bold text-foreground">אנחנו כן.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-24">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">שאלות נפוצות</h2>
        <div className="space-y-3">
          <Faq q="זה באמת חינם?">
            כן. בטא חינמי לחלוטין. בעתיד תהיה תוכנית בתשלום עם פיצ'רים מתקדמים (טיסות, השכרת רכב, התראות SMS) — אבל הליבה תישאר חינם.
          </Faq>
          <Faq q="אני צריך לתת לכם סיסמה ל-Booking?">
            <strong className="text-foreground">לא, אף פעם.</strong> כל מה שצריך זה צילום מסך של דף ההזמנה. אנחנו לא מתחברים לחשבון שלך ולא רואים פרטי תשלום.
          </Faq>
          <Faq q="מה אם המחיר השתנה והחדר אזל?">
            לפני שאתה מבטל — תיכנס ל-Booking, תוודא שהחדר באמת זמין במחיר החדש. אנחנו מתריעים, ההחלטה והפעולה שלך.
          </Faq>
          <Faq q="זה עובד עם מלון ספציפי + חדר ספציפי + ארוחות?">
            כן. המערכת מזהה את החדר המדויק שהזמנת (Ocean Pool 1BR Suite למשל) ואת תוכנית הארוחות (חצי פנסיון / ארוחת בוקר / ללא ארוחות). הבדיקות משוות בדיוק את אותו צירוף — לא איזה מחיר זול אקראי בדף.
          </Faq>
          <Faq q="ומה לגבי Agoda, Expedia, Airbnb?">
            כרגע Booking.com בלבד. Agoda + Expedia בדרך. Airbnb לא — שם אין באמת ירידות מחיר.
          </Faq>
          <Faq q="כמה זמן לוקח להוסיף הזמנה?">
            פחות מ-30 שניות. שולח צילום → המערכת קוראת אותו ב-AI ומציגה את הפרטים → אתה מאשר. זהו.
          </Faq>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            כמה אלפי שקלים <span className="text-gradient">מחכים לך</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            ההזמנה הראשונה שלך חינם. כל ההזמנות הבאות גם.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 gap-2 px-8 text-base shadow-xl shadow-primary/30">
                בוא נתחיל
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span>✈️</span>
            <span>TripWatch · בנוי באהבה בישראל</span>
          </div>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">פרטיות</Link>
            <Link href="/terms" className="hover:text-foreground">תנאי שימוש</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-success" />
      {children}
    </div>
  );
}

function Stat({ value, label, sub }: { value: React.ReactNode; label: string; sub?: string }) {
  return (
    <div>
      <div className="text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">{value}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Step({
  n,
  Icon,
  title,
  highlight,
  children,
}: {
  n: number;
  Icon: React.ElementType;
  title: string;
  highlight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -top-3 -start-3 grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-xs font-bold text-white shadow-lg">
        {n}
      </div>
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-xs font-medium text-muted-foreground">· {highlight}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-border bg-card transition-shadow open:shadow-md">
      <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold list-none">
        {q}
        <span className="ms-3 text-2xl font-light text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

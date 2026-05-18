import Link from 'next/link';
import { ArrowLeft, Camera, Eye, Bell, Sparkles, ShieldCheck, Clock, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroDemo } from '@/components/hero-demo';
import { AnimatedCounter } from '@/components/animated-counter';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase.from('public_stats').select('*').maybeSingle();

  const totalUsers = Number(stats?.total_users ?? 0);
  const totalBookings = Number(stats?.total_bookings ?? 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative background */}
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
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 md:pt-20 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-start animate-slide-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3 text-warning" />
              חינם · בלי כרטיס אשראי · בלי באנרים
            </div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              הזמנת מלון.<br />
              <span className="text-gradient">המחיר ירד.</span><br />
              <span className="text-muted-foreground/80">קיבלת חזרה ₪1,710.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              שלח לנו צילום מסך אחד של ההזמנה ב-Booking. אנחנו נעקוב אחרי המחיר כל יום — ונודיע לך בשנייה שהוא יורד. אתה מבטל, מזמין מחדש, וחוסך.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg" className="h-12 gap-2 px-7 text-base shadow-lg shadow-primary/30">
                  התחל לחסוך — חינם
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">30 שניות להתחבר. בלי התקנה.</p>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-success" />
                בלי לתת סיסמת Booking
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-success" />
                בדיקה אוטומטית כל יום
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-success" />
                התראה במייל + טלגרם
              </div>
            </div>
          </div>

          {/* Live demo card */}
          <div className="relative">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / STATS */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <Stat
            value={<><AnimatedCounter to={Math.max(totalUsers, 1)} /></>}
            label={totalUsers > 1 ? 'משתמשים פעילים' : 'משתמש ראשון (אתה הבא?)'}
          />
          <Stat
            value={<><AnimatedCounter to={Math.max(totalBookings, 2)} /></>}
            label="הזמנות במעקב"
          />
          <Stat
            value={<>₪<AnimatedCounter to={2000} />+</>}
            label="חיסכון מוכח על הזמנה אחת"
            sub="הצילום מתחת לא תרחיש — זה קרה ב-Banyan Tree Samui, מאי 2026"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
            איך זה עובד
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            3 צעדים. <span className="text-muted-foreground">אפס מאמץ.</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Step n={1} Icon={Camera} title="צלם" highlight="3 שניות">
            סיימת להזמין ב-Booking? צלם מסך של דף האישור. <strong className="text-foreground">זהו, סיימת.</strong>
          </Step>
          <Step n={2} Icon={Eye} title="אנחנו עוקבים" highlight="כל 24 שעות">
            המערכת מזהה את החדר, התאריכים, ואפילו אם לקחת חצי פנסיון או ביטול חופשי — ובודקת בדיוק את אותו תעריף מדי יום.
          </Step>
          <Step n={3} Icon={Bell} title="אתה חוסך" highlight="התראה מיידית">
            ברגע שהמחיר יורד מעל הסף שלך — מייל, התראה באפליקציה, ואופציונלית גם טלגרם. בטל את הישנה, הזמן את החדשה.
          </Step>
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="border-t border-border/50 bg-gradient-to-b from-muted/30 to-transparent py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">
            למה <span className="text-gradient">זה באמת חוסך כסף</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            מחירי מלונות זזים יום-יום בלי שום היגיון. אותו חדר ב-Booking יכול לעלות ₪7,000 היום ו-₪5,500 בעוד שבועיים.
            אם הזמנת עם ביטול חופשי — כל יום שאתה לא בודק זה כסף שנשאר על השולחן.
            הבעיה שאף אחד לא הולך לחזור לבדוק כל יום.
            <br /><br />
            <strong className="text-foreground">אנחנו כן.</strong>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">שאלות נפוצות</h2>
        <div className="space-y-4">
          <Faq q="זה באמת חינם?">
            כן. בטא חינמי לחלוטין. בעתיד תהיה תוכנית בתשלום עם פיצ'רים מתקדמים (טיסות, השכרת רכב, התראות SMS), אבל הליבה תישאר חינם.
          </Faq>
          <Faq q="אני צריך לתת לכם סיסמה ל-Booking?">
            <strong className="text-foreground">ממש לא.</strong> כל מה שצריך זה צילום מסך של דף ההזמנה. אנחנו לא מתחברים לחשבון שלך ולא רואים פרטי תשלום.
          </Faq>
          <Faq q="מה אם המחיר השתנה והחדר אזל?">
            לפני שאתה מבטל — תיכנס ל-Booking, תוודא שהחדר באמת זמין במחיר החדש. אנחנו רק מתריעים, ההחלטה והפעולה שלך.
          </Faq>
          <Faq q="זה עובד עם מלון ספציפי + חדר ספציפי + ארוחות?">
            כן. המערכת מזהה את החדר המדויק שהזמנת (למשל Ocean Pool 1BR Suite) ואת תוכנית הארוחות (חצי פנסיון / ארוחת בוקר / ללא ארוחות). הבדיקות משוות בדיוק את אותו צירוף.
          </Faq>
          <Faq q="ומה לגבי Agoda, Expedia, Airbnb?">
            כרגע Booking.com בלבד. Agoda + Expedia בדרך (שבועות הקרובים). Airbnb לא — שם אין באמת ירידות מחיר.
          </Faq>
          <Faq q="כמה זמן לוקח להוסיף הזמנה?">
            פחות מ-30 שניות. שולח צילום → המערכת קוראת אותו ב-AI ומציגה את הפרטים → אתה מאשר. זהו.
          </Faq>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            בוא נחסוך לך <span className="text-gradient">כמה אלפי שקלים</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            ההזמנה הראשונה שלך חינם. כל ההזמנות הבאות גם.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 gap-2 px-8 text-base shadow-xl shadow-primary/30">
                בוא נתחיל
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span>✈️</span>
            <span>TripWatch — בטא, בנוי באהבה בישראל</span>
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

function Stat({ value, label, sub }: { value: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold tracking-tight md:text-5xl">
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
    <div className="group relative rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -top-3 -start-3 grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-lg">
        {n}
      </div>
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon className="size-6" />
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-xs font-medium text-muted-foreground">· {highlight}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-border bg-card open:shadow-md">
      <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold list-none">
        {q}
        <span className="ms-3 text-2xl font-light text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

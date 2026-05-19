import Link from 'next/link';
import { ArrowLeft, Camera, Eye, Bell, Sparkles, ShieldCheck, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroBento } from '@/components/hero-bento';
import { HotelsGallery } from '@/components/hotels-gallery';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmosphere */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[900px] bg-mesh" />
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-bottom opacity-25" />

      {/* Sticky nav with sticky CTA (per landing pattern #1) */}
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white text-sm shadow-md shadow-primary/30" style={{ fontFamily: 'var(--font-poppins)' }}>
              T
            </div>
            <span className="text-base" style={{ fontFamily: 'var(--font-poppins)' }}>TripWatch</span>
            <span className="ms-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">Beta</span>
          </Link>
          <Link href="/login">
            <Button variant="accent" size="sm" className="h-9">
              התחל בחינם
              <ArrowLeft className="size-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-32 sm:px-8 md:pt-24 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="text-center lg:text-start animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-warning" />
              חינם · בלי כרטיס אשראי
            </div>

            <h1
              className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]"
              style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}
            >
              המחירים ב-Booking{' '}
              <span className="text-gradient">זזים כל יום.</span>
              <br className="hidden lg:inline" />
              <span className="text-muted-foreground/80"> אנחנו עוקבים בשבילך.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              צילום מסך אחד של ההזמנה שלך → אנחנו בודקים את אותו חדר, אותם תאריכים, אותו תעריף — מדי יום. מחיר ירד? תקבל התראה. מבטל וחוסך.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/login">
                <Button variant="accent" size="lg" className="h-12 gap-2 px-8 text-base font-semibold">
                  התחל לחסוך — חינם
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">30 שניות להתחבר · בלי התקנה</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <TrustItem Icon={ShieldCheck}>בלי סיסמת Booking</TrustItem>
              <TrustItem Icon={Clock}>בדיקה כל יום</TrustItem>
              <TrustItem Icon={Zap}>מייל + טלגרם</TrustItem>
            </div>
          </div>

          <div className="relative">
            <HeroBento />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — minimal cards */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 md:pb-32">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium">
            איך זה עובד
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>
            3 צעדים. <span className="text-muted-foreground/70">אפס מאמץ.</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Step n={1} Icon={Camera} title="צלם" highlight="3 שניות">
            סיימת להזמין ב-Booking? צלם מסך של דף האישור.
            <strong className="block mt-1 text-foreground">זהו, סיימת.</strong>
          </Step>
          <Step n={2} Icon={Eye} title="אנחנו עוקבים" highlight="כל 24 שעות">
            המערכת מזהה את החדר, התאריכים, ואפילו אם לקחת חצי פנסיון או ביטול חופשי — ובודקת את אותו תעריף בדיוק.
          </Step>
          <Step n={3} Icon={Bell} title="אתה חוסך" highlight="התראה מיידית">
            מחיר ירד? מייל, התראה באפליקציה, אופציונלית גם טלגרם. בטל את הישנה, הזמן את החדשה.
          </Step>
        </div>
      </section>

      {/* GALLERY */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-transparent py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>
              כל מלון. <span className="text-gradient">כל יעד.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              מבייג&apos;ק עד מילאן, מסנטוריני עד סמואי — כל הזמנה ב-Booking.com במעקב.
            </p>
          </div>
          <HotelsGallery />
        </div>
      </section>

      {/* WHY */}
      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>
            למה <span className="text-gradient">זה באמת חוסך כסף</span>
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            מחירי מלונות זזים יום-יום בלי שום היגיון. אותו חדר ב-Booking יכול לעלות ₪7,000 היום ו-₪5,500 בעוד שבועיים.
            אם הזמנת עם ביטול חופשי — כל יום שאתה לא בודק זה כסף שנשאר על השולחן.
            הבעיה שאף אחד לא הולך לחזור לבדוק כל יום.
          </p>
          <p className="mt-6 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>אנחנו כן.</p>
        </div>
      </section>

      {/* FAQ — quieter, more confident */}
      <section className="border-t border-border/40 bg-muted/20 py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>
            שאלות נפוצות
          </h2>
          <div className="space-y-3">
            <Faq q="זה באמת חינם?">
              כן. בטא חינמי לחלוטין. בעתיד תהיה תוכנית בתשלום עם פיצ&apos;רים מתקדמים (טיסות, השכרת רכב, התראות SMS) — אבל הליבה תישאר חינם.
            </Faq>
            <Faq q="אני צריך לתת לכם סיסמה ל-Booking?">
              <strong className="text-foreground">לא, אף פעם.</strong> כל מה שצריך זה צילום מסך של דף ההזמנה. אנחנו לא מתחברים לחשבון שלך ולא רואים פרטי תשלום.
            </Faq>
            <Faq q="מה אם המחיר השתנה והחדר אזל?">
              לפני שאתה מבטל — תיכנס ל-Booking, תוודא שהחדר באמת זמין במחיר החדש. אנחנו מתריעים, ההחלטה והפעולה שלך.
            </Faq>
            <Faq q="זה עובד עם חדר ספציפי + ארוחות?">
              כן. המערכת מזהה את החדר המדויק שהזמנת (Ocean Pool 1BR Suite למשל) ואת תוכנית הארוחות. הבדיקות משוות בדיוק את אותו צירוף — לא מחיר זול אקראי בדף.
            </Faq>
            <Faq q="ומה לגבי Agoda, Expedia, Airbnb?">
              כרגע Booking.com בלבד. Agoda + Expedia בדרך. Airbnb לא — שם אין באמת ירידות מחיר.
            </Faq>
            <Faq q="כמה זמן לוקח להוסיף הזמנה?">
              פחות מ-30 שניות. שולח צילום → המערכת קוראת אותו ב-AI ומציגה את הפרטים → אתה מאשר. זהו.
            </Faq>
          </div>
        </div>
      </section>

      {/* FINAL CTA — accent orange glow per skill rules */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-80" />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 md:py-32">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>
            כמה אלפי שקלים <span className="text-gradient">מחכים לך</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            ההזמנה הראשונה שלך חינם. כל ההזמנות הבאות גם.
          </p>
          <div className="mt-9 flex justify-center">
            <Link href="/login">
              <Button variant="accent" size="lg" className="h-14 gap-2 px-10 text-base font-semibold">
                בוא נתחיל
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <div className="grid size-5 place-items-center rounded bg-gradient-to-br from-primary to-purple-600 text-white text-[10px] font-bold">T</div>
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
    <div className="group relative rounded-2xl glass p-6 transition-all hover:shadow-glow hover:-translate-y-1">
      <div className="absolute -top-3 -start-3 grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-lg" style={{ fontFamily: 'var(--font-poppins)' }}>
        {n}
      </div>
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-poppins), var(--font-heebo)' }}>{title}</h3>
        <span className="text-xs font-medium text-muted-foreground">· {highlight}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-border/60 bg-card transition-shadow open:shadow-md">
      <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold list-none">
        {q}
        <span className="ms-3 text-2xl font-light text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

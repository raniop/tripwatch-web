import Link from 'next/link';
import {
  ArrowLeft, Camera, Eye, Bell, ShieldCheck, Sparkles,
  PiggyBank, Lock, Zap, Globe, Check, Star, Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoHero } from '@/components/video-hero';
import { MarketingNav } from '@/components/marketing-nav';
import { MarketingFooter } from '@/components/marketing-footer';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <MarketingNav />

      {/* ======================== HERO (video) ======================== */}
      <VideoHero>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-white sm:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-medium text-white animate-fade-up">
            <Sparkles className="size-3.5 text-warning" />
            חינם · 30 שניות להתחבר · בלי הורדה
          </div>

          <h1 className="font-display max-w-5xl text-balance text-5xl leading-[0.95] sm:text-7xl md:text-8xl lg:text-[110px] animate-fade-up [animation-delay:120ms]">
            הזמנת חופשה?<br />
            <span className="text-gradient-warm">בוא נחזיר לך כסף.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl animate-fade-up [animation-delay:240ms]">
            מחירי מלונות זזים יום-יום. ברגע שהמחיר על ההזמנה שלך יורד —
            <strong className="text-white"> נתריע לך מיד לבטל ולהזמין מחדש זול יותר.</strong>
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row animate-fade-up [animation-delay:360ms]">
            <Link href="/login">
              <Button variant="accent" size="lg" className="h-14 gap-2 px-10 text-base font-bold shadow-glow-orange">
                התחל לחסוך — חינם
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <p className="text-xs text-white/70">30 שניות · בלי כרטיס אשראי · בלי הורדה</p>
          </div>

          {/* Floating trust strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 animate-fade-up [animation-delay:480ms]">
            <TrustItem Icon={ShieldCheck}>בלי סיסמה ל-Booking</TrustItem>
            <span className="hidden sm:inline text-white/30">•</span>
            <TrustItem Icon={Zap}>בדיקה כל יום</TrustItem>
            <span className="hidden sm:inline text-white/30">•</span>
            <TrustItem Icon={Globe}>כל יעד בעולם</TrustItem>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60">
            <div className="size-6 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
              <div className="size-1 rounded-full bg-white/80 animate-pulse" />
            </div>
          </div>
        </div>
      </VideoHero>

      {/* ======================== PROMISES ======================== */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">ההבטחה שלנו</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              4 דברים שאנחנו <span className="text-gradient-warm">מבטיחים</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Promise Icon={PiggyBank} title="חיסכון אמיתי">
              לא Genius discount או הנחת קופון. ירידת מחיר אמיתית של אותו חדר שכבר הזמנת.
            </Promise>
            <Promise Icon={Lock} title="פרטיות מוחלטת">
              לעולם לא ניגע בסיסמה שלך ל-Booking. רק צילום מסך — וזה הכל.
            </Promise>
            <Promise Icon={Zap} title="התראה מיידית">
              ברגע שמחיר יורד מעל סף שתגדיר — מייל, התראה, אופציונלית גם טלגרם.
            </Promise>
            <Promise Icon={Globe} title="חינם, באמת">
              ללא כרטיס אשראי. ללא תקופת ניסיון. בטא חינמי לכל המשתמשים הראשונים.
            </Promise>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section id="how" className="bg-muted/40 py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">איך זה עובד</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              3 צעדים. <span className="text-muted-foreground/70">אפס מאמץ.</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Step n={1} Icon={Camera} title="צלם">
              סיימת להזמין ב-Booking? צלם מסך של דף האישור. זהו, סיימת.
            </Step>
            <Step n={2} Icon={Eye} title="אנחנו עוקבים">
              המערכת מזהה את החדר, התאריכים, ואפילו אם לקחת חצי פנסיון — ובודקת בדיוק את אותו תעריף.
            </Step>
            <Step n={3} Icon={Bell} title="אתה חוסך">
              מחיר ירד? מייל, התראה, טלגרם. בטל את הישנה, הזמן את החדשה. הכל בשליטתך.
            </Step>
          </div>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section id="testimonials" className="py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">מה אומרים בבטא</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              משתמשים ראשונים. <span className="text-gradient-warm">חיסכון אמיתי.</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="הזמנתי 2 מלונות בתאילנד לחודש אוקטובר. אחרי 3 שבועות קיבלתי התראה שאחד מהם ירד ב-2,000 ש״ח. ביטלתי, הזמנתי מחדש, עשיתי כסף."
              name="רני"
              role="מנהל מוצר · תל אביב"
              savings="₪2,000"
            />
            <Testimonial
              quote="הזמנתי דירת נופש בסנטוריני 4 חודשים מראש. TripWatch מצא לי ירידה של 18% שלא הייתי שם לב אליה לבד. ביטול חופשי - חיסכון נטו."
              name="דנה"
              role="מעצבת UX · רמת גן"
              savings="₪1,450"
            />
            <Testimonial
              quote="פיצ׳ר הטלגרם פשוט מצוין. אני נוסע הרבה לעבודה, וההתראות מגיעות גם כשאני באוויר. חסכתי על 3 מלונות בחודשיים."
              name="עומר"
              role="יזם · הרצליה"
              savings="₪3,820"
            />
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            * משתמשי בטא ראשונים. סכומים מדויקים, סיפורים מעובדים לפרטיות.
          </p>
        </div>
      </section>

      {/* ======================== PRICING ======================== */}
      <section id="pricing" className="bg-gradient-to-b from-muted/40 to-transparent py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">תמחור</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              חינם עכשיו. <span className="text-gradient-warm">לתמיד.</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              אנחנו עוד מפתחים. עכשיו הזמן להצטרף לבטא.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border-2 border-accent bg-white p-8 shadow-xl shadow-accent/10">
              <div className="absolute -top-1 end-6 rounded-b-lg bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                כל המשתמשים
              </div>
              <h3 className="font-display text-3xl">Beta</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl">₪0</span>
                <span className="text-muted-foreground">/לעולם</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">בלי כרטיס אשראי. בלי הגבלת זמן.</p>
              <ul className="mt-6 space-y-3 text-sm">
                <Feature>הזמנות בלתי מוגבלות</Feature>
                <Feature>בדיקת מחיר אוטומטית יומית</Feature>
                <Feature>זיהוי AI של חדר + ארוחות</Feature>
                <Feature>התראות במייל ובאפליקציה</Feature>
                <Feature>חיבור טלגרם</Feature>
                <Feature>היסטוריית מחירים מלאה</Feature>
              </ul>
              <Link href="/login" className="mt-8 block">
                <Button variant="accent" className="w-full h-12 text-base font-semibold shadow-glow-orange">
                  התחל עכשיו
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8">
              <div className="absolute -top-1 end-6 rounded-b-lg bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                בקרוב
              </div>
              <h3 className="font-display text-3xl text-muted-foreground">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl text-muted-foreground">₪19</span>
                <span className="text-muted-foreground">/חודש</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">למי שנוסע באמת הרבה.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <Feature muted>כל מה שיש בבטא</Feature>
                <Feature muted>בדיקת מחיר כל 6 שעות</Feature>
                <Feature muted>השכרת רכב (Rentalcars)</Feature>
                <Feature muted>טיסות (Skyscanner / Kiwi)</Feature>
                <Feature muted>Agoda + Expedia + Hotels.com</Feature>
                <Feature muted>התראות SMS / WhatsApp</Feature>
              </ul>
              <Button variant="outline" disabled className="mt-8 w-full h-12 text-base">
                בקרוב — אנחנו נודיע
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== FAQ ======================== */}
      <section id="faq" className="py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">שאלות נפוצות</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              עוד שאלות?
            </h2>
          </div>
          <div className="space-y-3">
            <Faq q="זה באמת חינם לתמיד?">
              הליבה — כן. בעתיד יהיו פיצ&apos;רים מתקדמים בתשלום (Pro), אבל מעקב על מלונות ב-Booking תמיד יישאר חינם.
            </Faq>
            <Faq q="אני צריך לתת לכם סיסמה ל-Booking?">
              <strong className="text-foreground">לא, אף פעם.</strong> רק צילום מסך של דף ההזמנה. אנחנו לא נכנסים לחשבון שלך.
            </Faq>
            <Faq q="מה אם המחיר השתנה והחדר אזל?">
              לפני שאתה מבטל — תיכנס ל-Booking, תוודא שהחדר זמין במחיר החדש. אנחנו רק מתריעים, ההחלטה והפעולה שלך.
            </Faq>
            <Faq q="זה עובד עם חדר ספציפי + ארוחות?">
              כן. המערכת מזהה את החדר המדויק שהזמנת (Ocean Pool 1BR Suite למשל) ואת תוכנית הארוחות. הבדיקות משוות בדיוק את אותו צירוף.
            </Faq>
            <Faq q="ומה לגבי Agoda, Expedia, Airbnb?">
              כרגע Booking.com בלבד. Agoda + Expedia בדרך. Airbnb לא — שם אין באמת ירידות מחיר.
            </Faq>
            <Faq q="כמה זמן לוקח להוסיף הזמנה?">
              פחות מ-30 שניות. שולח צילום → המערכת קוראת אותו ב-AI ומציגה את הפרטים → אתה מאשר.
            </Faq>
          </div>
        </div>
      </section>

      {/* ======================== FINAL CTA ======================== */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-dots opacity-15" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center text-white sm:px-8 md:py-32">
          <h2 className="font-display text-balance text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
            הנסיעה הבאה שלך<br />
            יכולה להיות זולה יותר.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
            השאלה היא אם תדע על זה.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 gap-2 bg-white px-10 text-base font-bold text-accent hover:bg-white/95">
                התחל בחינם — 30 שניות
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/80">בלי כרטיס אשראי · בלי הורדה · בלי התחייבות</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function TrustItem({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-4" />
      {children}
    </div>
  );
}

function Promise({ Icon, title, children }: { Icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="group rounded-3xl border border-border bg-white p-7 transition-all hover:border-accent/30 hover:shadow-glow-orange hover:-translate-y-1">
      <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
        <Icon className="size-7" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Step({ n, Icon, title, children }: { n: number; Icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl bg-card p-8 shadow-sm">
      <div className="absolute -top-4 -start-4 grid size-12 place-items-center rounded-2xl bg-accent text-lg font-bold text-white shadow-glow-orange">
        {n}
      </div>
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Testimonial({ quote, name, role, savings }: { quote: string; name: string; role: string; savings: string }) {
  return (
    <div className="relative flex flex-col rounded-3xl border border-border bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <Quote className="size-8 text-accent/40" />
      <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">{quote}</p>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <div className="text-end">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">חסך</p>
          <p className="font-display text-2xl text-success">{savings}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-accent text-accent" />)}
      </div>
    </div>
  );
}

function Feature({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <Check className={`size-5 shrink-0 ${muted ? 'text-muted-foreground' : 'text-success'}`} />
      <span>{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-card transition-shadow open:shadow-md open:border-accent/30">
      <summary className="flex cursor-pointer items-center justify-between p-6 font-bold list-none text-base">
        {q}
        <span className="ms-3 text-2xl font-light text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';
import { MarketingFooter } from '@/components/marketing-footer';
import { createClient } from '@/lib/supabase/server';
import { getLocaleAndMessages } from '@/lib/i18n';

export const metadata = {
  title: 'הצהרת נגישות · TripWatch',
};

export const dynamic = 'force-dynamic';

export default async function AccessibilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { locale, t } = await getLocaleAndMessages();

  return (
    <div className="relative min-h-screen bg-background">
      <MarketingNav loggedIn={!!user} messages={t.nav} />

      <main className="mx-auto max-w-3xl px-5 py-32 sm:px-8">
        <h1 className="font-display text-4xl sm:text-5xl">הצהרת נגישות</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          עודכן לאחרונה: מאי 2026 · גרסה 1.0
        </p>

        <div className="prose-section mt-10 space-y-8 text-foreground">
          <Section title="מחויבות לנגישות">
            <p>
              TripWatch מחויבת להפוך את שירותיה לנגישים לכלל המשתמשים, כולל אנשים עם
              מוגבלויות, בהתאם לתקן הישראלי <strong>ת״י 5568</strong> (המבוסס על
              WCAG 2.1 ברמה AA) ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות
              נגישות לשירות), התשע״ג-2013.
            </p>
            <p>
              הנגישות באתר היא תהליך מתמשך. אנו פועלים לשיפור מתמיד ומקבלים בברכה
              כל משוב.
            </p>
          </Section>

          <Section title="כלי הנגישות באתר">
            <p>בכל עמוד באתר זמין סרגל נגישות (סמל 🧑‍🦽 בפינה השמאלית התחתונה) המאפשר:</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>הגדלה של גודל הגופן (רגיל / גדול / ענק)</li>
              <li>הפעלת מצב ניגודיות גבוהה</li>
              <li>סימון קישורים בקו תחתון</li>
              <li>השהיית אנימציות וחיפוץ</li>
              <li>הדגשת מסגרת המיקוד למשתמשי מקלדת</li>
              <li>איפוס כל ההעדפות</li>
            </ul>
            <p>ההעדפות נשמרות במכשיר שלך ויחולו בכל ביקור עתידי באתר.</p>
          </Section>

          <Section title="ניווט מקלדת">
            <p>
              ניתן לנווט בכל האתר באמצעות מקלדת בלבד: <kbd>Tab</kbd> למעבר בין
              אלמנטים, <kbd>Enter</kbd> להפעלה, <kbd>Esc</kbd> לסגירת חלוניות.
              למשתמשים מחוברים זמין גם קיצור <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>
              לחיפוש גלובלי.
            </p>
          </Section>

          <Section title="התאמות נוספות שיושמו">
            <ul className="list-disc pr-6 space-y-1">
              <li>תיוג סמנטי של כל הכותרות, התפריטים והטפסים</li>
              <li>תיאורי <code>alt</code> לכל התמונות המשמעותיות</li>
              <li>תמיכה ב-<code>prefers-reduced-motion</code> של מערכת ההפעלה</li>
              <li>יחס ניגודיות מינימלי 4.5:1 לכל טקסט (WCAG AA)</li>
              <li>יכולת הגדלה ל-200% ללא איבוד תוכן</li>
              <li>תמיכה בכיווניות RTL מלאה (עברית) ו-LTR (אנגלית, בקרוב)</li>
            </ul>
          </Section>

          <Section title="חלקים שטרם הותאמו במלואם">
            <p>אנחנו מודעים שהבאים עדיין דורשים עבודה:</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>קוראי מסך — נבדק עם NVDA ו-VoiceOver, ייתכנו בעיות קלות בטפסים מסוימים</li>
              <li>גרף היסטוריית מחירים — כרגע ויזואלי בלבד, בקרוב נוסיף תיאור מילולי</li>
              <li>חתימות הזמנה — מבוססות תמונה, מוקבלות בהדרגתיות לטקסט נגיש</li>
            </ul>
          </Section>

          <Section title="פנייה בנושאי נגישות">
            <p>
              נתקלתם בבעיית נגישות? נשמח לשמוע ולתקן. רכז הנגישות שלנו:
            </p>
            <p className="mt-2 leading-relaxed">
              <strong>רני אופיר</strong><br />
              דוא״ל: <a href="mailto:rani@ophirins.co.il" className="text-primary underline">rani@ophirins.co.il</a><br />
              טלפון: <a href="tel:+972732721110" dir="ltr" className="text-primary underline">073-272-1110</a>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              נשתדל להשיב לכל פנייה תוך 7 ימי עסקים.
            </p>
          </Section>

          <Section title="פרטים נוספים">
            <p>
              לקריאה נוספת על זכויותיכם ראו את אתר{' '}
              <a
                href="https://www.gov.il/he/departments/topics/accessibility_to_persons_with_disabilities"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                נציבות שוויון זכויות לאנשים עם מוגבלות
              </a>
              .
            </p>
            <p className="mt-3">
              חזרה ל-<Link href="/" className="text-primary underline">דף הבית</Link>.
            </p>
          </Section>
        </div>
      </main>

      <MarketingFooter locale={locale} messages={{
        footer: t.footer,
        nav: { howItWorks: t.nav.howItWorks, faq: t.nav.faq, login: t.nav.login, startFree: t.nav.startFree },
        pricing: { eyebrow: t.pricing.eyebrow },
        faq: { eyebrow: t.faq.eyebrow },
        testimonials: { eyebrow: t.testimonials.eyebrow },
        localeSwitcher: t.localeSwitcher,
      }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

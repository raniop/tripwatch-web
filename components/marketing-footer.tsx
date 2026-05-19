import Link from 'next/link';
import { Plane, Mail, Github } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        {/* Top: 4 columns */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-bold">
              <Plane className="size-5" />
              <span>TripWatch</span>
              <span className="ms-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">Beta</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              עוקבים אחרי המחיר של ההזמנה שלך ב-Booking — כל יום.
              ברגע שהוא יורד, אתה הראשון לדעת.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:rani@ophir.email"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="מייל"
              >
                <Mail className="size-4" />
              </a>
              <a
                href="https://github.com/raniop/tripwatch-web"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <Col title="מוצר">
            <FLink href="#how">איך זה עובד</FLink>
            <FLink href="#pricing">תמחור</FLink>
            <FLink href="#faq">שאלות נפוצות</FLink>
            <FLink href="/login">התחל בחינם</FLink>
          </Col>

          {/* Support */}
          <Col title="תמיכה">
            <FLink href="mailto:rani@ophir.email">צור קשר</FLink>
            <FLink href="#faq">מרכז עזרה</FLink>
            <FLink href="#testimonials">סיפורי הצלחה</FLink>
          </Col>

          {/* Legal */}
          <Col title="חוקי">
            <FLink href="/privacy">פרטיות</FLink>
            <FLink href="/terms">תנאי שימוש</FLink>
          </Col>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TripWatch · בנוי באהבה בישראל 🇮🇱</p>
          <p>
            לא קשור ל-Booking.com · אנחנו רק עוקבים אחרי מחירים פומביים בשבילך
          </p>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}

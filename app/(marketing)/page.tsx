import Link from 'next/link';
import {
  ArrowLeft, Camera, Eye, Bell, ShieldCheck, Sparkles,
  PiggyBank, Lock, Zap, Globe, Check, Star, Quote, LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoHero } from '@/components/video-hero';
import { MarketingNav } from '@/components/marketing-nav';
import { MarketingFooter } from '@/components/marketing-footer';
import { createClient } from '@/lib/supabase/server';
import { getLocaleAndMessages } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const loggedIn = !!user;
  const ctaHref = loggedIn ? '/dashboard' : '/login';
  const { locale, t } = await getLocaleAndMessages();

  return (
    <div className="relative min-h-screen bg-background">
      <MarketingNav loggedIn={loggedIn} locale={locale} messages={t.nav} localeMessages={t.localeSwitcher} />

      {/* ======================== HERO (video) ======================== */}
      <VideoHero>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-white sm:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-medium text-white animate-fade-up">
            <Sparkles className="size-3.5 text-warning" />
            {loggedIn ? t.hero.badgeWelcomeBack : t.hero.badgeFree}
          </div>

          <h1 className="font-display max-w-5xl text-balance text-5xl leading-[0.95] sm:text-7xl md:text-8xl lg:text-[110px] animate-fade-up [animation-delay:120ms]">
            {t.hero.titleLine1}<br />
            <span className="text-gradient-warm">{t.hero.titleLine2}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl animate-fade-up [animation-delay:240ms]">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row animate-fade-up [animation-delay:360ms]">
            <Link href={ctaHref}>
              <Button variant="accent" size="lg" className="h-14 gap-2 px-10 text-base font-bold shadow-glow-orange">
                {loggedIn ? (
                  <>
                    <LayoutDashboard className="size-4" />
                    {t.hero.ctaOpenDashboard}
                  </>
                ) : (
                  <>
                    {t.hero.ctaStartSaving}
                    <ArrowLeft className="size-4" />
                  </>
                )}
              </Button>
            </Link>
            {!loggedIn && <p className="text-xs text-white/70">{t.hero.microcopy}</p>}
          </div>

          {/* Floating trust strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 animate-fade-up [animation-delay:480ms]">
            <TrustItem Icon={ShieldCheck}>{t.hero.trust1}</TrustItem>
            <span className="hidden sm:inline text-white/30">•</span>
            <TrustItem Icon={Zap}>{t.hero.trust2}</TrustItem>
            <span className="hidden sm:inline text-white/30">•</span>
            <TrustItem Icon={Globe}>{t.hero.trust3}</TrustItem>
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
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">{t.promises.eyebrow}</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              {t.promises.title} <span className="text-gradient-warm">{t.promises.titleAccent}</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Promise Icon={PiggyBank} accent="success" title={t.promises.p1Title}>{t.promises.p1Body}</Promise>
            <Promise Icon={Lock} accent="primary" title={t.promises.p2Title}>{t.promises.p2Body}</Promise>
            <Promise Icon={Zap} accent="accent" title={t.promises.p3Title}>{t.promises.p3Body}</Promise>
            <Promise Icon={Globe} accent="warning" title={t.promises.p4Title}>{t.promises.p4Body}</Promise>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section id="how" className="bg-muted/40 py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">{t.howItWorks.eyebrow}</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              {t.howItWorks.title} <span className="text-muted-foreground/70">{t.howItWorks.titleAccent}</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Step n={1} Icon={Camera} title={t.howItWorks.s1Title}>{t.howItWorks.s1Body}</Step>
            <Step n={2} Icon={Eye} title={t.howItWorks.s2Title}>{t.howItWorks.s2Body}</Step>
            <Step n={3} Icon={Bell} title={t.howItWorks.s3Title}>{t.howItWorks.s3Body}</Step>
          </div>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section id="testimonials" className="py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">{t.testimonials.eyebrow}</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              {t.testimonials.title} <span className="text-gradient-warm">{t.testimonials.titleAccent}</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial quote={t.testimonials.t1Quote} name={t.testimonials.t1Name} role={t.testimonials.t1Role} savings="₪2,000" savedLabel={t.testimonials.saved} />
            <Testimonial quote={t.testimonials.t2Quote} name={t.testimonials.t2Name} role={t.testimonials.t2Role} savings="₪1,450" savedLabel={t.testimonials.saved} />
            <Testimonial quote={t.testimonials.t3Quote} name={t.testimonials.t3Name} role={t.testimonials.t3Role} savings="₪3,820" savedLabel={t.testimonials.saved} />
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">{t.testimonials.footnote}</p>
        </div>
      </section>

      {/* ======================== PRICING ======================== */}
      <section id="pricing" className="bg-gradient-to-b from-muted/40 to-transparent py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">{t.pricing.eyebrow}</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              {t.pricing.title} <span className="text-gradient-warm">{t.pricing.titleAccent}</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">{t.pricing.subtitle}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border-2 border-accent bg-card p-8 shadow-xl shadow-accent/10">
              <div className="absolute -top-1 end-6 rounded-b-lg bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {t.pricing.betaBadge}
              </div>
              <h3 className="font-display text-3xl">{t.pricing.betaName}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl">₪0</span>
                <span className="text-muted-foreground">{t.pricing.betaPriceSuffix}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.pricing.betaNote}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.pricing.betaFeatures.map((f, i) => <Feature key={i}>{f}</Feature>)}
              </ul>
              <Link href={ctaHref} className="mt-8 block">
                <Button variant="accent" className="w-full h-12 text-base font-semibold shadow-glow-orange">
                  {loggedIn ? (
                    <>
                      <LayoutDashboard className="size-4" />
                      {t.pricing.betaCtaLoggedIn}
                    </>
                  ) : (
                    <>
                      {t.pricing.betaCta}
                      <ArrowLeft className="size-4" />
                    </>
                  )}
                </Button>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8">
              <div className="absolute -top-1 end-6 rounded-b-lg bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.pricing.proBadge}
              </div>
              <h3 className="font-display text-3xl text-muted-foreground">{t.pricing.proName}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl text-muted-foreground">₪19</span>
                <span className="text-muted-foreground">{t.pricing.proPriceSuffix}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.pricing.proNote}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {t.pricing.proFeatures.map((f, i) => <Feature key={i} muted>{f}</Feature>)}
              </ul>
              <Button variant="outline" disabled className="mt-8 w-full h-12 text-base">
                {t.pricing.proCta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== FAQ ======================== */}
      <section id="faq" className="py-24 md:py-32 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">{t.faq.eyebrow}</p>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
              {t.faq.title}
            </h2>
          </div>
          <div className="space-y-3">
            {t.faq.items.map((item, i) => (
              <Faq key={i} q={item.q} aHtml={item.aHtml} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FINAL CTA ======================== */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-dots opacity-15" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center text-white sm:px-8 md:py-32">
          <h2 className="font-display text-balance text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
            {t.finalCta.titleLine1}<br />
            {t.finalCta.titleLine2}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
            {t.finalCta.subtitle}
          </p>
          <div className="mt-10 flex justify-center">
            <Link href={ctaHref}>
              <Button size="lg" className="h-14 gap-2 bg-white px-10 text-base font-bold text-accent hover:bg-white/95">
                {loggedIn ? (
                  <>
                    <LayoutDashboard className="size-4" />
                    {t.finalCta.ctaLoggedIn}
                  </>
                ) : (
                  <>
                    {t.finalCta.cta}
                    <ArrowLeft className="size-4" />
                  </>
                )}
              </Button>
            </Link>
          </div>
          {!loggedIn && <p className="mt-6 text-xs text-white/80">{t.finalCta.microcopy}</p>}
        </div>
      </section>

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

function TrustItem({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-4" />
      {children}
    </div>
  );
}

type PromiseAccent = 'success' | 'primary' | 'accent' | 'warning';

function Promise({
  Icon,
  title,
  accent,
  children,
}: {
  Icon: React.ElementType;
  title: string;
  accent: PromiseAccent;
  children: React.ReactNode;
}) {
  const tones: Record<PromiseAccent, { icon: string; hoverBorder: string; check: string }> = {
    success: { icon: 'bg-success/10 text-success', hoverBorder: 'hover:border-success/40', check: 'text-success' },
    primary: { icon: 'bg-primary/10 text-primary', hoverBorder: 'hover:border-primary/40', check: 'text-primary' },
    accent:  { icon: 'bg-accent/10 text-accent',   hoverBorder: 'hover:border-accent/40',  check: 'text-accent'  },
    warning: { icon: 'bg-warning/10 text-warning', hoverBorder: 'hover:border-warning/40', check: 'text-warning' },
  };
  const tone = tones[accent];
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all ${tone.hoverBorder} hover:shadow-lg hover:-translate-y-1`}>
      <div className={`mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${tone.icon} transition-transform group-hover:scale-110`}>
        <Icon className="size-7" />
      </div>
      <div className={`absolute end-5 top-5 ${tone.check} opacity-60`}>
        <Check className="size-5" />
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

function Testimonial({ quote, name, role, savings, savedLabel }: { quote: string; name: string; role: string; savings: string; savedLabel: string }) {
  return (
    <div className="relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <Quote className="size-8 text-accent/40" />
      <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">{quote}</p>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <div className="text-end">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{savedLabel}</p>
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

function Faq({ q, aHtml }: { q: string; aHtml: string }) {
  return (
    <details className="group rounded-2xl border border-border bg-card transition-shadow open:shadow-md open:border-accent/30">
      <summary className="flex cursor-pointer items-center justify-between p-6 font-bold list-none text-base">
        {q}
        <span className="ms-3 text-2xl font-light text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: aHtml }} />
    </details>
  );
}

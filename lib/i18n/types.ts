/**
 * Translation dictionary shape — both messages/he.ts and messages/en.ts
 * conform to this type so calls like `t.marketing.heroTitle` are typed.
 *
 * Adding a new string: drop it here first, then fill in both locales.
 */

export type Locale = 'he' | 'en';

export interface Messages {
  meta: {
    siteTitle: string;
    siteTagline: string;
    siteDescription: string;
  };
  nav: {
    howItWorks: string;
    testimonials: string;
    pricing: string;
    faq: string;
    login: string;
    startFree: string;
    startFreeShort: string;
    openDashboard: string;
    openDashboardShort: string;
    home: string;
    settings: string;
    accessibilityStatement: string;
  };
  hero: {
    badgeFree: string;
    badgeWelcomeBack: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaStartSaving: string;
    ctaOpenDashboard: string;
    microcopy: string;
    trust1: string;
    trust2: string;
    trust3: string;
  };
  promises: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    p1Title: string;
    p1Body: string;
    p2Title: string;
    p2Body: string;
    p3Title: string;
    p3Body: string;
    p4Title: string;
    p4Body: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    s1Title: string;
    s1Body: string;
    s2Title: string;
    s2Body: string;
    s3Title: string;
    s3Body: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    t1Quote: string;
    t1Name: string;
    t1Role: string;
    t2Quote: string;
    t2Name: string;
    t2Role: string;
    t3Quote: string;
    t3Name: string;
    t3Role: string;
    saved: string;
    footnote: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    betaBadge: string;
    betaName: string;
    betaPriceSuffix: string;
    betaNote: string;
    betaCta: string;
    betaCtaLoggedIn: string;
    betaFeatures: string[];
    proBadge: string;
    proName: string;
    proPriceSuffix: string;
    proNote: string;
    proCta: string;
    proFeatures: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    // aHtml may contain &lt;strong&gt; and &lt;a&gt; tags from our own dictionary —
    // rendered via dangerouslySetInnerHTML. Never user-supplied.
    items: Array<{ q: string; aHtml: string }>;
  };
  finalCta: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    cta: string;
    ctaLoggedIn: string;
    microcopy: string;
  };
  footer: {
    blurb: string;
    productHeading: string;
    supportHeading: string;
    contactUs: string;
    legalHeading: string;
    privacy: string;
    terms: string;
    accessibility: string;
    bottomLeft: string;
    bottomRight: string;
  };
  login: {
    pageTitle: string;
    title: string;
    subtitle: string;
    google: string;
    or: string;
    emailPlaceholder: string;
    sendMagicLink: string;
    magicLinkSent: string;
    terms: string;
  };
  cookies: {
    bannerText: string;
    privacyLink: string;
    acceptAll: string;
    essentialOnly: string;
    close: string;
  };
  a11y: {
    launcherAria: string;
    panelTitle: string;
    fontSizeLabel: string;
    fontNormal: string;
    fontLarge: string;
    fontXl: string;
    highContrast: string;
    underlineLinks: string;
    noMotion: string;
    strongFocus: string;
    reset: string;
    statementLink: string;
    close: string;
  };
  commandPalette: {
    placeholder: string;
    navHeading: string;
    bookingsHeading: string;
    empty: string;
    navHint: string;
    selectHint: string;
    cmdDashboard: string;
    cmdAdd: string;
    cmdSettings: string;
    cmdHome: string;
    cmdA11y: string;
    cmdSignOut: string;
    untitled: string;
  };
  localeSwitcher: {
    ariaLabel: string;
    he: string;
    en: string;
  };
}

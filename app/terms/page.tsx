import { getMessages } from '@/lib/i18n';

export const metadata = { title: 'Terms · TripWatch' };
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const t = (await getMessages()).legal;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-7" dir={t.dir}>
      <h1 className="mb-4 text-2xl font-bold">{t.termsTitle}</h1>
      <p className="text-muted-foreground">{t.lastUpdated}</p>

      <p className="mt-6">{t.termsIntro}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.termsResponsibilityHeading}</h2>
      <p>{t.termsResponsibilityBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.termsChangesHeading}</h2>
      <p>{t.termsChangesBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.termsContactHeading}</h2>
      <p>
        <a href="mailto:rani@ophirins.co.il" className="underline">{t.termsContactBody}</a>
      </p>
    </div>
  );
}

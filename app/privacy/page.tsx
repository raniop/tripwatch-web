import { getMessages } from '@/lib/i18n';

export const metadata = { title: 'Privacy · TripWatch' };
export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const t = (await getMessages()).legal;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-7" dir={t.dir}>
      <h1 className="mb-4 text-2xl font-bold">{t.privacyTitle}</h1>
      <p className="text-muted-foreground">{t.lastUpdated}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.privacyCollectHeading}</h2>
      <p>{t.privacyCollectBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.privacyDontHeading}</h2>
      <p>{t.privacyDontBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.privacyShareHeading}</h2>
      <p>{t.privacyShareBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.privacyRightsHeading}</h2>
      <p>{t.privacyRightsBody}</p>

      <h2 className="mt-6 text-lg font-semibold">{t.privacyContactHeading}</h2>
      <p>
        <a href={`mailto:${t.privacyContactBody}`} className="underline">{t.privacyContactBody}</a>
      </p>
    </div>
  );
}

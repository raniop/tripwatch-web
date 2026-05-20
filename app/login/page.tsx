import { Suspense } from 'react';
import LoginForm from './login-form';
import { getMessages } from '@/lib/i18n';

export const metadata = { title: 'Log in · TripWatch' };

export default async function LoginPage() {
  const t = await getMessages();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm messages={t.login} termsLabel={t.footer.terms} privacyLabel={t.footer.privacy} />
      </Suspense>
    </div>
  );
}

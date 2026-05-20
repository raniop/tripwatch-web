import { AppShell } from '@/components/app-shell';
import { AddBookingFlow } from '@/components/add-booking-flow';
import { getGlobalAddress } from '@/lib/inbound/address';
import { getMessages } from '@/lib/i18n';

export const metadata = { title: 'Add booking · TripWatch' };

export default async function AddBookingPage() {
  const inbox = getGlobalAddress();
  const t = await getMessages();
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">{t.add.h1}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t.add.subtitle}</p>
        <AddBookingFlow messages={{ ...t.add, adults: t.bookingDetail.adults, rooms: t.bookingDetail.rooms }} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.add.forwardAlt} <span dir="ltr" className="font-mono">{inbox}</span>
        </p>
      </div>
    </AppShell>
  );
}

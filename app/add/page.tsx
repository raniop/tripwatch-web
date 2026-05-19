import { AppShell } from '@/components/app-shell';
import { AddBookingFlow } from '@/components/add-booking-flow';
import { getGlobalAddress } from '@/lib/inbound/address';

export const metadata = { title: 'הוסף הזמנה · TripWatch' };

export default function AddBookingPage() {
  const inbox = getGlobalAddress();
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">הוסף הזמנה</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          שלח צילום מסך של דף ההזמנה ב-Booking — נזהה הכל אוטומטית
        </p>
        <AddBookingFlow />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          📧 או העבר את מייל אישור ההזמנה אל
          <span dir="ltr" className="font-mono">{inbox}</span>
        </p>
      </div>
    </AppShell>
  );
}

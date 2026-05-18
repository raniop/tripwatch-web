import { AppShell } from '@/components/app-shell';
import { AddBookingFlow } from '@/components/add-booking-flow';

export const metadata = { title: 'הוסף הזמנה · TripWatch' };

export default function AddBookingPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">הוסף הזמנה</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          שלח צילום מסך של דף ההזמנה ב-Booking — נזהה הכל אוטומטית
        </p>
        <AddBookingFlow />
      </div>
    </AppShell>
  );
}

export const metadata = { title: 'תנאי שימוש · TripWatch' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-7" dir="rtl">
      <h1 className="mb-4 text-2xl font-bold">תנאי שימוש</h1>
      <p className="text-muted-foreground">עדכון אחרון: מאי 2026</p>

      <p className="mt-6">
        TripWatch הוא שירות בטא חינמי. אנחנו עוקבים אחר מחירים בשבילך ושולחים לך התראות —
        אבל לא מבטיחים זמינות, דיוק או הצלחה.
      </p>

      <h2 className="mt-6 text-lg font-semibold">אתה אחראי על ההזמנות שלך</h2>
      <p>
        ההחלטה לבטל הזמנה ולהזמין מחדש היא שלך בלבד. אנחנו לא צד להזמנה. ודא שיש לך ביטול חופשי
        לפני שאתה מסתמך על התראות שלנו.
      </p>

      <h2 className="mt-6 text-lg font-semibold">שינויים בשירות</h2>
      <p>
        זה בטא — דברים יכולים להישבר, להשתנות, או להיעצר ללא הודעה מראש.
        ננסה להודיע במייל לפני שינויים גדולים.
      </p>

      <h2 className="mt-6 text-lg font-semibold">פניות</h2>
      <p>
        שאלות? <a href="mailto:rani@ophir.email" className="underline">rani@ophir.email</a>
      </p>
    </div>
  );
}

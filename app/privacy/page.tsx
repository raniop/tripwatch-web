export const metadata = { title: 'מדיניות פרטיות · TripWatch' };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-7" dir="rtl">
      <h1 className="mb-4 text-2xl font-bold">מדיניות פרטיות</h1>
      <p className="text-muted-foreground">עדכון אחרון: מאי 2026</p>

      <h2 className="mt-6 text-lg font-semibold">מה אנחנו אוספים</h2>
      <p>
        בעת הרשמה אנחנו שומרים את כתובת המייל שלך וקוד זיהוי מ-Google אם בחרת להתחבר דרך Google.
        בעת הוספת הזמנה אנחנו שומרים את הצילום ששלחת (כדי לשחזר אם משהו נשבר), את הפרטים שזיהינו ממנו
        (שם המלון, תאריכים, חדר, מחיר), וכל בדיקת מחיר שאנו מבצעים אחר כך.
      </p>

      <h2 className="mt-6 text-lg font-semibold">מה אנחנו לא עושים</h2>
      <p>
        איננו מוכרים את הנתונים שלך לאף אחד. איננו משדכים את הזהות שלך לרשתות פרסום.
        איננו מבצעים פעולות בשם שלך ב-Booking (אנחנו רק קוראים מחירים בדף הציבורי).
      </p>

      <h2 className="mt-6 text-lg font-semibold">איפה הנתונים מאוחסנים</h2>
      <p>
        Supabase (אירופה) לאחסון הנתונים, Vercel (ארה"ב/אירופה) להפעלת האפליקציה,
        ו-NAS פרטי בישראל לחישובים. כל החיבורים מוצפנים (HTTPS).
      </p>

      <h2 className="mt-6 text-lg font-semibold">מחיקת חשבון</h2>
      <p>
        כתוב לנו ב-rani@ophir.email ואנחנו נמחק את כל הנתונים שלך תוך 48 שעות.
        בעתיד נוסיף כפתור "מחק חשבון" בדף ההגדרות.
      </p>
    </div>
  );
}

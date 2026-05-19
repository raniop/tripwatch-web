# TripWatch — מדריך פריסה (Phase 2 Beta)

מדריך מקצה לקצה לפריסת האפליקציה. אם אתה מבצע פעם ראשונה, סדר השלבים חשוב — ה-Vercel דורש את ה-Supabase, וה-NAS צריך את ה-Supabase + URL של Vercel.

**זמן משוער:** 60-90 דקות.

---

## דרישות מקדימות

- [ ] חשבון GitHub (חינם)
- [ ] חשבון Vercel (חינם) — להתחבר עם GitHub
- [ ] חשבון Supabase (חינם)
- [ ] חשבון Cloudflare (חינם) — לטונל ל-NAS
- [ ] חשבון Resend (חינם — 3,000 מיילים/חודש)
- [ ] חשבון Google Cloud Console (חינם — לקבל Client ID/Secret ל-Google OAuth)
- [ ] טוקן הטלגרם הקיים (כבר ב-`\\Nas\data\TripWatch\.env`)
- [ ] מפתח Anthropic API (כבר ב-`\\Nas\data\TripWatch\.env`)

---

## שלב 1 — Supabase (15 דקות)

### 1.1 פרויקט חדש
1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. שם: `tripwatch` · אזור: **West Europe (Ireland)** · סיסמה: שמור במקום בטוח
3. חכה ~2 דקות שהמסד יוקם

### 1.2 הרצת המיגרציה
1. פרויקט → **SQL Editor** → **New query**
2. הדבק את כל התוכן של `supabase/migrations/0001_init.sql`
3. **Run** — צריך לראות `Success. No rows returned.`

### 1.3 Storage bucket
1. פרויקט → **Storage** → **New bucket**
2. שם: `booking-images` · **Private** (לא Public) · **Save**
3. לחץ על ה-bucket → **Policies** → **New policy** → "For full customization"
   - שם: `users upload own`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'booking-images' AND (storage.foldername(name))[1] = auth.uid()::text`
4. הוסף עוד policy:
   - שם: `users read own`
   - Operation: `SELECT`
   - Roles: `authenticated`
   - USING: `bucket_id = 'booking-images' AND (storage.foldername(name))[1] = auth.uid()::text`

### 1.4 Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → צור פרויקט אם אין
2. **OAuth consent screen** → External · שם: TripWatch · scopes: email + profile · domain: `tripwatch.vercel.app`
3. **Credentials** → **Create OAuth client ID** → Web application
   - Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback` (תוכל למצוא ב-Supabase תחת Authentication → Providers → Google)
4. שמור Client ID + Client Secret
5. ב-Supabase: **Authentication** → **Providers** → **Google** → הדבק Client ID + Secret → **Save**

### 1.5 שמור את הקרדנשלים
מ-Supabase **Settings** → **API**, העתק:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` ← זה סודי! → `SUPABASE_SERVICE_ROLE_KEY`

---

## שלב 2 — Cloudflare Tunnel (15 דקות)

זה החיבור המאובטח בין Vercel (בענן) ל-NAS שלך (ביתי).

### 2.1 התקן cloudflared ב-NAS
דרך SSH או Container Manager:
```bash
# Synology DSM:
# Download Station → enter URL: https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
# Save to /volume1/data/TripWatch/cloudflared
chmod +x /volume1/data/TripWatch/cloudflared
```

חלופה — הרץ כקונטיינר Docker (קל יותר):
```yaml
# Add to \\Nas\data\TripWatch\docker-compose.yml:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    env_file: .env
```

### 2.2 צור tunnel
1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → Networks → **Tunnels** → **Create a tunnel** → Cloudflared
2. שם: `tripwatch-nas`
3. **Copy the token** ושמור → `CLOUDFLARE_TUNNEL_TOKEN` ב-`.env`
4. דלג להוראות "Run a connector" — אם אתה משתמש ב-Docker, ה-compose שלמעלה כבר מטפל
5. אחרי שה-tunnel רץ (סטטוס "Healthy") → **Public Hostname** → **Add a public hostname**
   - Subdomain: `tripwatch-nas` (חינמי, על דומיין `.trycloudflare.com` או דומיין שלך)
   - **או** השתמש בדומיין Cloudflare שלך
   - Service: HTTP · URL: `localhost:3001`
6. כעת `https://tripwatch-nas-XXX.trycloudflare.com/health` אמור להחזיר JSON

### 2.3 הגן עם bearer token
1. צור מפתח: `openssl rand -hex 32` או באתר [random.org](https://random.org/bytes/)
2. הוסף ל-`\\Nas\data\TripWatch\.env`:
   ```
   NAS_API_KEY=<המפתח>
   ```
3. Rebuild קונטיינר TripWatch כדי שיטען את ה-env החדש

---

## שלב 3 — Vercel + GitHub (15 דקות)

### 3.1 פוש לגיטהאב
```bash
cd "\\Nas\data\TripWatchWeb"
git init
git add .
git commit -m "Initial commit"
# צור repo ב-GitHub (private), העתק URL
git remote add origin <URL>
git branch -M main
git push -u origin main
```

### 3.2 חבר ל-Vercel
1. [vercel.com/new](https://vercel.com/new) → ייבא את ה-repo
2. **Framework Preset**: Next.js (זוהה אוטומטית)
3. **Environment Variables** — הוסף את כל המשתנים מ-`.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NAS_API_URL` (https://tripwatch-nas-XXX.trycloudflare.com)
   - `NAS_API_KEY` (אותו אחד שב-NAS)
   - `TELEGRAM_BOT_TOKEN` (אותו אחד שב-NAS)
   - `TELEGRAM_BOT_USERNAME` (`RaniTripWatchBot`)
   - `RESEND_API_KEY` (אחרי שלב 4)
   - `RESEND_FROM` (`TripWatch <noreply@YOUR_DOMAIN>`)
   - `CRON_SECRET` (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_APP_URL` (אחרי deploy: `https://tripwatch-XXX.vercel.app`)
4. **Deploy** — לוקח ~2 דקות
5. אחרי הצלחה, ה-URL הזמני: `https://tripwatch-XXX.vercel.app` — שנה אותו ב-`NEXT_PUBLIC_APP_URL` ו-Redeploy

### 3.3 הוסף Supabase Database Webhook
1. Supabase → **Database** → **Webhooks** → **Create a new hook**
2. Name: `dispatch-notifications`
3. Table: `notifications` · Events: `Insert`
4. Type: `HTTP Request` · Method: POST
5. URL: `https://tripwatch-XXX.vercel.app/api/notifications/dispatch`
6. HTTP Headers:
   ```
   Authorization: Bearer <CRON_SECRET>
   Content-Type: application/json
   ```
7. **Save**

---

## שלב 4 — Resend (5 דקות)

1. [resend.com](https://resend.com) → הירשם
2. **API Keys** → **Create API Key** → שם: `tripwatch-prod` · permissions: Sending access
3. העתק → `RESEND_API_KEY` ב-Vercel
4. **Domains** → אם יש לך דומיין, הוסף ואמת. אם לא — השתמש בדומיין הברירת מחדל `onboarding@resend.dev` (מוגבל ל-100 מיילים ליום, מספיק ל-beta)
   - `RESEND_FROM=TripWatch <onboarding@resend.dev>`

---

## שלב 4ב — Resend Inbound לקבלת הזמנות במייל (15 דקות)

מאפשר למשתמש להעביר אישור הזמנה ל-**`trip@tripwatch.net`** ולקבל את ההזמנה אוטומטית.
המערכת מזהה את המשתמש לפי כתובת השולח (כל מייל מקושר לחשבון).
לכל משתמש יש גם כתובת אישית חלופית `book.{token}@inbound.tripwatch.net` למקרה שרוצה לשלוח ממייל לא מקושר.

### 4ב.1 DNS — שני דומיינים ב-Resend
**מטרה: לפתוח גם את `tripwatch.net` וגם את `inbound.tripwatch.net` ל-inbound.**

#### A. דומיין ראשי (`tripwatch.net`)
1. Resend → **Domains** → **Add Domain** → `tripwatch.net` (זה כבר אמור להיות שם ל-outbound)
2. הפעל את האפשרות **Inbound** ⇒ Resend יציג MX חדש:
   - `tripwatch.net.  MX  10  feedback-smtp.resend.com.` (הערך המדויק יופיע ב-Resend)
3. הוסף את ה-MX ב-DNS שלך.
   - ⚠️ אם יש כבר MX records אחרים על `tripwatch.net` (Google Workspace למשל) — זה ידרוס אותם. ודא שאתה לא רוצה לקבל מייל אחר על הדומיין הראשי, או הוסף את ה-MX של Resend כעדיפות גבוהה יותר (priority 10 לעומת 20 לקיים).

#### B. סאב-דומיין לכתובות אישיות (`inbound.tripwatch.net`)
1. Resend → **Domains** → **Add Domain** → `inbound.tripwatch.net`
2. הפעל Inbound, הוסף את ה-MX שיציג.
3. **Verify** את שניהם.

### 4ב.2 Inbound Webhook
1. Resend → **Webhooks** → **Add endpoint**
2. URL: `https://tripwatch.net/api/inbound/email`
3. Events: `email.received` (או `inbound.email.received` — תלוי בגרסה של Resend)
4. אותו endpoint משרת את שני הדומיינים (אנחנו עושים routing לפי הכתובת בקוד).
5. שמור את ה-**Signing Secret** (`whsec_...`).

### 4ב.3 Vercel env vars
```
RESEND_INBOUND_SIGNING_SECRET=whsec_...
INBOUND_GLOBAL_ADDRESS=trip@tripwatch.net
INBOUND_EMAIL_DOMAIN=inbound.tripwatch.net
```
ואז **Redeploy**.

### 4ב.4 NAS scraper — endpoint חדש
ה-webhook קורא ל-`/text/extract` ב-NAS:
- `POST /text/extract` עם payload `{ text, html, subject, from, source_hint }`
- מחזיר schema של `ExtractedBooking` כמו `/vision/extract`, או `{"not_a_booking": true}`.
- LLM שמבין Booking.com, Agoda, Expedia ו-Hotels.com.

### 4ב.5 הרץ מיגרציות
ב-Supabase SQL Editor:
1. `supabase/migrations/0003_inbound_email.sql`
2. `supabase/migrations/0004_find_user_by_email.sql`

### 4ב.6 בדיקה
1. היכנס ל-`/settings` — תראה את `trip@tripwatch.net` ככתובת הראשית.
2. פתח Gmail עם המייל שאיתו נרשמת → אישור Booking → **Forward** → `trip@tripwatch.net`.
3. תוך 5-30 שניות ההזמנה תופיע ב-Dashboard + מייל אישור.
4. אם הגיע bounce עם "המייל לא רשום" — סימן ששלחת ממייל לא מקושר. הוסף אותו ב-Linked Accounts, או השתמש בכתובת האישית.
5. אם בכלל לא הגיע כלום — Vercel Logs → `/api/inbound/email`.

---

## שלב 5 — עדכון NAS .env (5 דקות)

ב-`\\Nas\data\TripWatch\.env` ודא שיש את כל אלה:
```
BOT_TOKEN=<קיים>
ANTHROPIC_API_KEY=<קיים>
NAS_API_KEY=<חדש משלב 2.3>
SUPABASE_URL=<מ-1.5>
SUPABASE_SERVICE_ROLE_KEY=<מ-1.5>
WEB_APP_URL=https://tripwatch-XXX.vercel.app
CLOUDFLARE_TUNNEL_TOKEN=<אם משתמש בקונטיינר>
```

ואז **Container Manager → tripwatch → Action → Build** כדי לטעון את הקוד החדש ואת ה-env.

---

## שלב 6 — בדיקה מקצה לקצה (15 דקות)

1. **`/health`** — דפדפן: `https://tripwatch-nas-XXX.trycloudflare.com/health` → `{"ok":true,...}`
2. **לוגין** — `https://tripwatch-XXX.vercel.app/login` → לחץ "המשך עם Google"
3. **דשבורד ריק** — אמור להגיע ל-`/dashboard` עם empty state
4. **הוסף הזמנה** — `/add` → גרור צילום של דף Booking → המתן ~15 שניות → סיכום → לחץ שמור
5. **דף הזמנה** — `/booking/<id>` → לחץ "בדוק עכשיו" → המתן ~15 שניות → גרף עם נקודה אחת
6. **חיבור טלגרם** — `/settings` → "קישור חשבון טלגרם" → קבל קוד → פתח טלגרם → שלח `/link XXXXXXXX` לבוט → אישור
7. **סימולציית התראה** — Supabase SQL Editor:
   ```sql
   UPDATE bookings SET paid_price = paid_price * 1.3 WHERE id = '<your_booking_id>';
   ```
   ואז ב-Vercel Dashboard → Project → Cron → "Run now" → התראה אמורה להגיע (in-app toast + מייל + טלגרם)

---

## בעיות נפוצות

**"NAS_API_URL / NAS_API_KEY not configured" בלוגים של Vercel**
→ שכחת להוסיף את ה-env vars ב-Vercel. הוסף + Redeploy.

**Cloudflare Tunnel "Unhealthy"**
→ ה-NAS לא רץ. בדוק `docker ps` שהקונטיינר tripwatch למעלה ושפורט 3001 פנוי.

**"unauthorized" בכל קריאה ל-NAS**
→ ה-NAS_API_KEY שונה בין NAS לבין Vercel. ודא ששניהם זהים.

**Google login נכשל עם "Redirect URI mismatch"**
→ ה-URI שב-Google Cloud Console חייב להיות בדיוק `https://YOUR_PROJECT.supabase.co/auth/v1/callback` — לא ה-Vercel URL.

**Image upload נכשל ב-Supabase Storage**
→ שכחת ליצור את ה-policies ב-step 1.3. ללא policies, Supabase דוחה גם משתמשים מאומתים.

---

## הפעלת משתמשי beta

1. צור קודי הזמנה: ב-Supabase SQL Editor:
   ```sql
   INSERT INTO beta_invites (code, note) VALUES
     ('FRIEND1', 'Alex'),
     ('FRIEND2', 'Dani');
   ```
2. שלח לחברים את הקישור + הקוד שלהם
3. **TODO** — הוסף לוגיקה ב-`/api/auth/callback` שדורשת קוד תקף לפני יצירת המשתמש (לא קיים עדיין — דחיתי לאחרי הגנת ה-MVP)

---

## ניטור

- **Vercel**: Logs tab → לוגים בזמן אמת
- **Supabase**: Logs → API/Auth/Postgres
- **NAS**: Container Manager → tripwatch → Log
- **Cloudflare**: Zero Trust → Tunnels → tripwatch-nas → Connections

אם משהו נופל, התחל מ-Vercel logs (זה תמיד הצד הראשון שמקבל את הבקשה).

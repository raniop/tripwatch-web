# TripWatch — Web App (Phase 2)

Beta web app for tracking Booking.com hotel prices and getting alerts when they drop.

**Live:** https://tripwatch.vercel.app (after deploy)
**Scraper backend:** existing NAS at `\\Nas\data\TripWatch` (Phase 1 code, now exposed via REST API)

## Quick start (local dev)

```bash
npm install
cp .env.example .env.local   # fill in Supabase + NAS values
npm run dev                  # → http://localhost:3000
```

## Architecture

- **Next.js 15** (App Router, RSC, TypeScript) on **Vercel**
- **Supabase** for Postgres + Auth + Storage + Realtime
- **NAS** runs the Playwright scraper + Claude vision (Phase 1 code), exposed as REST API via **Cloudflare Tunnel**
- **Resend** for transactional email
- **Telegram bot** (Telegraf, on NAS) as optional notification channel

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full setup instructions.

## What's in here

```
app/
  (marketing)/page.tsx        # public landing
  login/                      # auth UI
  dashboard/                  # main view (booking cards)
  add/                        # photo upload → vision → save
  booking/[id]/               # detail view + price chart
  settings/                   # notification prefs + Telegram link
  api/
    cron/daily-check/         # Vercel Cron handler
    nas/[...path]/            # secure proxy to NAS API
    notifications/dispatch/   # Supabase webhook → email + Telegram fan-out
    telegram/link/            # OAuth-style Telegram linking

components/                   # UI + flow components
lib/
  supabase/                   # server + browser clients
  notify/                     # email + telegram senders
  nas-client.ts               # typed fetch wrapper for NAS API
  format.ts                   # currency + dates

supabase/migrations/          # schema (run in Supabase SQL editor)
```

## Phase 1 backbone (NAS)

The web app talks to the NAS scraper for:
- `POST /vision/extract` → Claude Haiku reads booking screenshots
- `POST /search` → finds canonical Booking URL from hotel name + dates
- `POST /scrape` → Playwright + room/meal smart matcher returns the right price
- `POST /trigger-daily-check` → background runner iterates all active bookings

All endpoints require `Authorization: Bearer NAS_API_KEY`.

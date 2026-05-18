/**
 * Authenticated proxy from the browser to the NAS API. Most NAS calls happen
 * from server-side code via lib/nas-client, but a few client components need
 * to call directly (e.g. "check now" button without a full page reload).
 *
 * This route requires a signed-in user; it adds the bearer token server-side
 * so we never expose NAS_API_KEY to the browser.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_PATHS = new Set([
  'health',
  'scrape',
  'vision/extract',
  'search',
  'resolve-share',
  'parse-url',
]);

async function proxy(request: Request, params: { path: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const pathStr = params.path.join('/');
  if (!ALLOWED_PATHS.has(pathStr)) {
    return NextResponse.json({ error: 'path not allowed' }, { status: 403 });
  }

  const base = process.env.NAS_API_URL;
  const key = process.env.NAS_API_KEY;
  if (!base || !key) {
    return NextResponse.json({ error: 'NAS not configured' }, { status: 500 });
  }

  const body = request.method !== 'GET' ? await request.text() : undefined;
  const res = await fetch(`${base.replace(/\/$/, '')}/${pathStr}`, {
    method: request.method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  });
}

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await ctx.params);
}
export async function POST(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await ctx.params);
}

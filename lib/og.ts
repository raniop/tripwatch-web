/**
 * Lightweight OG metadata fetcher. Use for sites that render og: tags in
 * static HTML (Booking, most CMSes). Doesn't need a real browser.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TripWatchBot/1.0; +https://tripwatch.vercel.app)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

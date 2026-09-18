/**
 * Tiny in-memory sliding-window rate limiter for the contact route.
 *
 * Honest caveat: on serverless platforms (e.g. Vercel) each instance has
 * its own memory, so this is a *best-effort* bot/spam deterrent layered
 * on top of the honeypot field — not a hard security boundary.
 */

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

const hits = new Map<string, number[]>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)

  // Occasional cleanup so the map cannot grow unbounded.
  if (hits.size > 256) {
    for (const [k, v] of hits) {
      const kept = v.filter((t) => now - t < WINDOW_MS)
      if (kept.length > 0) hits.set(k, kept)
      else hits.delete(k)
    }
  }

  return recent.length > MAX_REQUESTS
}

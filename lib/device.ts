'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Device capability + visibility helpers.
 *
 * The page runs two animation systems at once (a WebGL hero and a full-page
 * 2D constellation field). On a desktop that is affordable; on a mid-range
 * phone it is not. Rather than deleting the visuals, every expensive system
 * asks these helpers two questions:
 *
 *   1. "How much can this device take?"  -> `detectDeviceTier()`
 *   2. "Is anyone actually looking?"     -> `useActive()`
 *
 * Both answers are cheap, and together they remove the bulk of the wasted
 * work: off-screen render loops, 80k-triangle geometry on a 6-inch screen,
 * and animation that keeps running in a background tab.
 */

export type DeviceTier = 'low' | 'mid' | 'high'

/** Breakpoint the layout treats as "desktop composition". */
export const DESKTOP_MIN_WIDTH = 1024

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * Coarse capability bucket. Viewport width is the primary signal because it
 * correlates with both GPU class and how large the scene is drawn; memory and
 * core count catch the cheap-tablet case that lies about its width.
 */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 8
  const width = window.innerWidth
  const coarse = !hasFinePointer()

  if (width < 768 || memory <= 4 || cores <= 4) return 'low'
  if (width < 1280 || coarse) return 'mid'
  return 'high'
}

type IdleHandle = { id: number; kind: 'idle' | 'timeout' }

/** requestIdleCallback with a setTimeout fallback (Safari has no rIC). */
function scheduleIdle(fn: () => void, timeout: number): IdleHandle {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    cancelIdleCallback?: (id: number) => void
  }
  if (typeof w.requestIdleCallback === 'function') {
    return { id: w.requestIdleCallback(fn, { timeout }), kind: 'idle' }
  }
  return { id: window.setTimeout(fn, Math.min(timeout, 500)), kind: 'timeout' }
}

function cancelIdle(handle: IdleHandle) {
  const w = window as Window & { cancelIdleCallback?: (id: number) => void }
  if (handle.kind === 'idle' && typeof w.cancelIdleCallback === 'function') {
    w.cancelIdleCallback(handle.id)
  } else {
    window.clearTimeout(handle.id)
  }
}

/** Reactive media query. Always `false` during SSR and the first render. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * `true` once the browser has gone idle after first paint. Anything gated on
 * this can never delay the first contentful paint or the LCP element.
 */
export function useIdleReady(timeout = 1200): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handle = scheduleIdle(() => setReady(true), timeout)
    return () => cancelIdle(handle)
  }, [timeout])

  return ready
}

/** Capability snapshot, resolved after mount so SSR output stays stable. */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')

  useEffect(() => {
    setTier(detectDeviceTier())

    // Only width can change at runtime, and only the low/mid boundary
    // matters, so a debounced resize check is enough.
    let timer: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(timer)
      timer = setTimeout(() => setTier(detectDeviceTier()), 250)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return tier
}

/**
 * `true` while the element is on (or near) screen *and* the tab is visible.
 * Expensive render loops use this as their run switch.
 */
export function useActive(ref: RefObject<Element | null>, rootMargin = '200px 0px'): boolean {
  const [onScreen, setOnScreen] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const marginRef = useRef(rootMargin)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries[0].isIntersecting),
      { rootMargin: marginRef.current },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return onScreen && tabVisible
}

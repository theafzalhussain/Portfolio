'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import { detectDeviceTier, hasFinePointer, type DeviceTier } from '@/lib/device'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface Comet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  len: number
}

/** Distant, fixed star. Only its brightness animates. */
interface Star {
  x: number
  y: number
  r: number
  a: number
  /** twinkle speed */
  tw: number
  /** twinkle phase offset */
  ph: number
  /** bright enough to earn a halo */
  big: boolean
}

interface Palette {
  node: string
  link: string
  glow: string
  star: string
  nodeA: number
  linkA: number
  glowA: number
  starA: number
}

const DARK: Palette = {
  node: '120, 235, 225',
  link: '45, 212, 191',
  glow: '94, 234, 212',
  star: '209, 250, 245',
  nodeA: 0.55,
  linkA: 0.16,
  glowA: 0.16,
  starA: 0.7,
}

const LIGHT: Palette = {
  node: '13, 100, 100',
  link: '13, 148, 136',
  glow: '15, 118, 110',
  star: '15, 118, 110',
  nodeA: 0.4,
  linkA: 0.1,
  glowA: 0.07,
  starA: 0.3,
}

/** Per-device work budget. */
interface Budget {
  /** Viewport area per node — higher divisor means fewer nodes. */
  nodeArea: number
  nodeMax: number
  starArea: number
  starMax: number
  fps: number
  comets: boolean
  maxDpr: number
}

const BUDGETS: Record<DeviceTier, Budget> = {
  high: { nodeArea: 17000, nodeMax: 96, starArea: 6400, starMax: 210, fps: 40, comets: true, maxDpr: 2 },
  mid: { nodeArea: 22000, nodeMax: 68, starArea: 8200, starMax: 150, fps: 32, comets: true, maxDpr: 1.75 },
  low: { nodeArea: 30000, nodeMax: 40, starArea: 12000, starMax: 90, fps: 26, comets: false, maxDpr: 1.5 },
}

/** Alpha buckets used to batch draw calls. */
const LINK_BUCKETS = 5
const STAR_BUCKETS = 7

/**
 * Page-wide constellation field: a twinkling star layer, drifting nodes,
 * links between nearby pairs, and a soft glow that lags behind the pointer.
 *
 * Deliberately cheap, because a WebGL hero scene is already running:
 *  - node and star counts scale with viewport area *and* device tier, so a
 *    mid-range phone does not run a desktop-sized O(n²) link loop
 *  - draw calls are batched into alpha buckets: the link layer used to issue
 *    one `beginPath`/`stroke` pair per connected pair (thousands per frame)
 *    and the star layer one `fillStyle` assignment per star. Both are now a
 *    handful of paths per frame, which is where most of the 2D cost went
 *  - the halo behind bright stars is a pre-rendered sprite instead of a fresh
 *    radial gradient per star per frame
 *  - pointer interaction (repulsion + cursor glow) is skipped entirely on
 *    touch devices, where there is no cursor to follow
 *  - pauses on `visibilitychange`, and freezes after one draw under
 *    `prefers-reduced-motion`
 */
export function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const paletteRef = useRef<Palette>(DARK)
  const repaintRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    paletteRef.current = theme === 'light' ? LIGHT : DARK
    // Reduced motion draws a single frame, so a theme switch has to force it.
    repaintRef.current?.()
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const budget = BUDGETS[detectDeviceTier()]
    const pointerEnabled = hasFinePointer()
    const INTERVAL = 1000 / budget.fps

    let width = 0
    let height = 0
    let link = 150
    let nodes: Node[] = []
    let stars: Star[] = []
    let comets: Comet[] = []
    let nextComet = 2500 + Math.random() * 6000
    let running = true
    let raf = 0
    let last = 0
    let time = 0

    // Reused per frame: batching link segments and star arcs by alpha bucket
    // turns thousands of canvas state changes into a few dozen.
    const linkBuckets: number[][] = Array.from({ length: LINK_BUCKETS }, () => [])
    const starBuckets: number[][] = Array.from({ length: STAR_BUCKETS }, () => [])

    /** Pre-rendered halo for bright stars, redrawn only when the palette flips. */
    let halo: HTMLCanvasElement | null = null
    let haloKey = ''

    function buildHalo(colour: string) {
      if (haloKey === colour && halo) return
      const size = 64
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const g = c.getContext('2d')
      if (!g) return
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      grad.addColorStop(0, `rgba(${colour},1)`)
      grad.addColorStop(1, `rgba(${colour},0)`)
      g.fillStyle = grad
      g.fillRect(0, 0, size, size)
      halo = c
      haloKey = colour
    }

    const ptr = { x: -9999, y: -9999, gx: -9999, gy: -9999, active: false }

    function seed() {
      const area = width * height
      const target = Math.max(28, Math.min(budget.nodeMax, Math.round(area / budget.nodeArea)))
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        r: Math.random() * 1.15 + 0.7,
      }))

      // Star layer sits behind the network: denser, smaller, and fixed, so it
      // reads as deep space rather than more of the same drifting mesh.
      const starCount = Math.max(60, Math.min(budget.starMax, Math.round(area / budget.starArea)))
      stars = Array.from({ length: starCount }, () => {
        const big = Math.random() < 0.06
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: big ? Math.random() * 0.9 + 1.2 : Math.random() * 0.65 + 0.35,
          a: big ? Math.random() * 0.25 + 0.7 : Math.random() * 0.5 + 0.22,
          tw: Math.random() * 1.6 + 0.5,
          ph: Math.random() * Math.PI * 2,
          big,
        }
      })
    }

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, budget.maxDpr)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      link = width < 640 ? 112 : 150
      seed()
    }

    function draw() {
      if (!ctx) return
      const P = paletteRef.current
      buildHalo(P.star)
      ctx.clearRect(0, 0, width, height)

      // ── Star layer ───────────────────────────────────────────────
      // Brightness is a squared sine, which spends most of its time dim and
      // spikes briefly: that asymmetry is what makes a twinkle look real.
      for (const b of starBuckets) b.length = 0

      for (const s of stars) {
        const osc = Math.sin(time * s.tw + s.ph)
        const f = s.a * P.starA * (0.35 + 0.65 * osc * osc)

        if (s.big && halo) {
          const d = s.r * 14
          ctx.globalAlpha = f * 0.5
          ctx.drawImage(halo, s.x - d / 2, s.y - d / 2, d, d)
          ctx.globalAlpha = 1
        }

        // Quantise the brightness into buckets so every star in a bucket can
        // be filled in one path with one fillStyle. Normalising by the
        // palette's ceiling keeps the same fidelity in both themes.
        const norm = P.starA > 0 ? f / P.starA : 0
        const bucket = Math.min(STAR_BUCKETS - 1, Math.max(0, Math.floor(norm * STAR_BUCKETS)))
        starBuckets[bucket].push(s.x, s.y, s.r)
      }

      for (let b = 0; b < STAR_BUCKETS; b++) {
        const list = starBuckets[b]
        if (list.length === 0) continue
        const alpha = ((b + 0.5) / STAR_BUCKETS) * P.starA
        ctx.fillStyle = `rgba(${P.star},${alpha.toFixed(3)})`
        ctx.beginPath()
        for (let i = 0; i < list.length; i += 3) {
          const x = list[i]
          const y = list[i + 1]
          const r = list[i + 2]
          ctx.moveTo(x + r, y)
          ctx.arc(x, y, r, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      // ── Link mesh ────────────────────────────────────────────────
      for (const b of linkBuckets) b.length = 0

      const linkSq = link * link
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > linkSq) continue
          const t = 1 - Math.sqrt(d2) / link
          const bucket = Math.min(LINK_BUCKETS - 1, Math.floor(t * LINK_BUCKETS))
          linkBuckets[bucket].push(a.x, a.y, b.x, b.y)
        }
      }

      ctx.lineWidth = 0.6
      for (let b = 0; b < LINK_BUCKETS; b++) {
        const list = linkBuckets[b]
        if (list.length === 0) continue
        const t = (b + 0.5) / LINK_BUCKETS
        ctx.strokeStyle = `rgba(${P.link},${(t * P.linkA).toFixed(3)})`
        ctx.beginPath()
        for (let i = 0; i < list.length; i += 4) {
          ctx.moveTo(list[i], list[i + 1])
          ctx.lineTo(list[i + 2], list[i + 3])
        }
        ctx.stroke()
      }

      // ── Nodes ────────────────────────────────────────────────────
      ctx.fillStyle = `rgba(${P.node},${P.nodeA})`
      ctx.beginPath()
      for (const n of nodes) {
        ctx.moveTo(n.x + n.r, n.y)
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      }
      ctx.fill()

      // Shooting stars: a slow, occasional streak so the field feels alive
      // without becoming a screensaver.
      for (const c of comets) {
        const tailX = c.x - c.vx * c.len
        const tailY = c.y - c.vy * c.len
        const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y)
        grad.addColorStop(0, `rgba(${P.glow},0)`)
        grad.addColorStop(1, `rgba(${P.glow},${(0.55 * c.life).toFixed(3)})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(c.x, c.y)
        ctx.stroke()

        ctx.fillStyle = `rgba(${P.glow},${(0.85 * c.life).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      if (pointerEnabled && ptr.active && ptr.gx > -9000) {
        const grad = ctx.createRadialGradient(ptr.gx, ptr.gy, 0, ptr.gx, ptr.gy, 120)
        grad.addColorStop(0, `rgba(${P.glow},${P.glowA})`)
        grad.addColorStop(0.45, `rgba(${P.glow},${(P.glowA * 0.3).toFixed(3)})`)
        grad.addColorStop(1, `rgba(${P.glow},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(ptr.gx, ptr.gy, 120, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${P.glow},0.75)`
        ctx.beginPath()
        ctx.arc(ptr.gx, ptr.gy, 2.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function step() {
      time += INTERVAL / 1000

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy

        if (n.x < -20) n.x = width + 20
        if (n.x > width + 20) n.x = -20
        if (n.y < -20) n.y = height + 20
        if (n.y > height + 20) n.y = -20

        if (pointerEnabled && ptr.active) {
          const dx = n.x - ptr.x
          const dy = n.y - ptr.y
          const d2 = dx * dx + dy * dy
          if (d2 < 15000 && d2 > 1) {
            const f = (1 - d2 / 15000) * 0.5
            const d = Math.sqrt(d2)
            n.x += (dx / d) * f
            n.y += (dy / d) * f
          }
        }
      }

      if (pointerEnabled) {
        ptr.gx += (ptr.x - ptr.gx) * 0.06
        ptr.gy += (ptr.y - ptr.gy) * 0.06
      }

      if (!budget.comets) return

      nextComet -= INTERVAL
      if (nextComet <= 0 && comets.length < 2) {
        nextComet = 7000 + Math.random() * 11000
        const fromLeft = Math.random() > 0.5
        const speed = 3.4 + Math.random() * 2.2
        const angle = (Math.random() * 0.35 + 0.18) * Math.PI
        comets.push({
          x: fromLeft ? -40 : width + 40,
          y: Math.random() * height * 0.55,
          vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          len: 26 + Math.random() * 18,
        })
      }

      for (const c of comets) {
        c.x += c.vx
        c.y += c.vy
        // fade out over the back half of the crossing
        if (c.y > height * 0.55 || c.x < -80 || c.x > width + 80) c.life -= 0.012
      }
      comets = comets.filter(
        (c) => c.life > 0 && c.y < height + 120 && c.x > -220 && c.x < width + 220,
      )
    }

    function frame(ts: number) {
      raf = requestAnimationFrame(frame)
      if (!running) return
      if (ts - last < INTERVAL) return
      last = ts
      step()
      draw()
    }

    resize()
    repaintRef.current = draw

    if (reduced) {
      draw()
    } else {
      raf = requestAnimationFrame(frame)
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resize()
        if (reduced) draw()
      }, 180)
    }

    function onMove(e: PointerEvent) {
      if (ptr.gx < -9000) {
        ptr.gx = e.clientX
        ptr.gy = e.clientY
      }
      ptr.x = e.clientX
      ptr.y = e.clientY
      ptr.active = true
    }

    function onLeave() {
      ptr.active = false
    }

    function onVisibility() {
      running = !document.hidden
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (pointerEnabled) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      repaintRef.current = null
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      {/* Slow-drifting colour depth behind the network. Pure CSS, so it
          composites on the GPU and costs nothing per frame. */}
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <canvas ref={canvasRef} className="constellation-canvas" aria-hidden="true" />
    </>
  )
}

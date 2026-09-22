'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface Palette {
  node: string
  link: string
  glow: string
  nodeA: number
  linkA: number
  glowA: number
}

const DARK: Palette = {
  node: '120, 235, 225',
  link: '45, 212, 191',
  glow: '94, 234, 212',
  nodeA: 0.55,
  linkA: 0.16,
  glowA: 0.16,
}

const LIGHT: Palette = {
  node: '13, 100, 100',
  link: '13, 148, 136',
  glow: '15, 118, 110',
  nodeA: 0.4,
  linkA: 0.1,
  glowA: 0.07,
}

/**
 * Page-wide constellation field: drifting nodes, links between nearby pairs,
 * and a soft glow that lags behind the pointer.
 *
 * Deliberately cheap, because a WebGL hero scene is already running:
 *  - throttled to ~40fps (the drift is slow; 60fps buys nothing)
 *  - node count scales with viewport area and is hard-capped, so a 4K display
 *    does not get a 600-node O(n^2) link loop
 *  - pauses entirely on `visibilitychange`
 *  - draws once and freezes under `prefers-reduced-motion`
 */
export function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const paletteRef = useRef<Palette>(DARK)

  useEffect(() => {
    paletteRef.current = theme === 'light' ? LIGHT : DARK
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let link = 150
    let nodes: Node[] = []
    let running = true
    let raf = 0
    let last = 0
    const INTERVAL = 1000 / 40

    const ptr = { x: -9999, y: -9999, gx: -9999, gy: -9999, active: false }

    function seed() {
      const target = Math.max(34, Math.min(118, Math.round((width * height) / 15500)))
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        r: Math.random() * 1.15 + 0.7,
      }))
    }

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
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
      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 0.6
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > link * link) continue
          const t = 1 - Math.sqrt(d2) / link
          ctx.strokeStyle = `rgba(${P.link},${(t * P.linkA).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      ctx.fillStyle = `rgba(${P.node},${P.nodeA})`
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (ptr.active && ptr.gx > -9000) {
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
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy

        if (n.x < -20) n.x = width + 20
        if (n.x > width + 20) n.x = -20
        if (n.y < -20) n.y = height + 20
        if (n.y > height + 20) n.y = -20

        if (ptr.active) {
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

      ptr.gx += (ptr.x - ptr.gx) * 0.06
      ptr.gy += (ptr.y - ptr.gy) * 0.06
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
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Repaint immediately on theme change so the field does not wait a frame.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // reduced-motion draws once, so force a redraw with the new palette
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [theme])

  return <canvas ref={canvasRef} className="constellation-canvas" aria-hidden="true" />
}

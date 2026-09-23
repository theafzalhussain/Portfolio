'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  baseX: number
  baseY: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Hide the default cursor for a custom experience
    document.body.style.cursor = 'none'

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let rafId = 0
    const mouse = { x: -9999, y: -9999 }
    const cursor = { x: -9999, y: -9999 } // Lagging cursor for the glow effect

    const GAP = 90
    const INFLUENCE = 140
    const LINK_DIST = 120

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      particles = []
      for (let x = GAP / 2; x < width; x += GAP) {
        for (let y = GAP / 2; y < height; y += GAP) {
          const jx = x + (Math.random() - 0.5) * GAP * 0.6
          const jy = y + (Math.random() - 0.5) * GAP * 0.6
          particles.push({ x: jx, y: jy, baseX: jx, baseY: jy, vx: 0, vy: 0 })
        }
      }
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height)

      if (!reduceMotion) {
        // Smoothly move the lagging cursor towards the real mouse position
        cursor.x += (mouse.x - cursor.x) * 0.1
        cursor.y += (mouse.y - cursor.y) * 0.1

        // Draw a premium, glowing orb at the lagging cursor's position
        const gradient = ctx!.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 24)
        gradient.addColorStop(0, 'rgba(94, 234, 212, 0.25)') // teal-300
        gradient.addColorStop(1, 'rgba(94, 234, 212, 0)')

        ctx!.fillStyle = gradient
        ctx!.beginPath()
        ctx!.arc(cursor.x, cursor.y, 24, 0, Math.PI * 2)
        ctx!.fill()
      }

      for (const p of particles) {
        if (!reduceMotion) {
          const dx = cursor.x - p.x // Interaction is now with the lagging cursor
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < INFLUENCE) {
            const force = (1 - dist / INFLUENCE) * 1.4
            p.vx -= (dx / dist) * force
            p.vy -= (dy / dist) * force
          }
          // spring back to base
          p.vx += (p.baseX - p.x) * 0.015
          p.vy += (p.baseY - p.y) * 0.015
          p.vx *= 0.9
          p.vy *= 0.9
          p.x += p.vx
          p.y += p.vy
        }

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.35)'
        ctx!.fill()
      }

      if (!reduceMotion) {
        // Draw a small dot for the actual cursor position for precision
        ctx!.beginPath()
        ctx!.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(125, 211, 252, 1)' // sky-300
        ctx!.fill()
      }

      // connecting lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          if (Math.abs(dx) > LINK_DIST || Math.abs(dy) > LINK_DIST) continue
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.strokeStyle = `rgba(94, 234, 212, ${(1 - dist / LINK_DIST) * 0.12})`
            ctx!.lineWidth = 1
            ctx!.stroke()
          }
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function onLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      // Restore default cursor on component unmount
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Ambient mesh glows */}
      <div className="animate-mesh absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[140px]" />
      <div
        className="animate-mesh absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[140px]"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="animate-mesh absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-[140px]"
        style={{ animationDelay: '-12s' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

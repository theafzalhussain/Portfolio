'use client'

import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Reusable 3D perspective-tilt wrapper. Tracks the pointer and rotates
 * the card a few degrees toward it (like a physical card on a desk).
 * Disabled automatically for coarse pointers (touch) and reduced motion.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTransform(
      `perspective(900px) rotateY(${(px * max).toFixed(2)}deg) rotateX(${(py * -max).toFixed(2)}deg) scale(1.015)`,
    )
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTransform('')}
      style={{
        transform,
        transition: transform ? 'transform 0.1s ease-out' : 'transform 0.4s ease',
        willChange: 'transform',
      }}
      className={cn('relative', className)}
    >
      {children}
    </div>
  )
}

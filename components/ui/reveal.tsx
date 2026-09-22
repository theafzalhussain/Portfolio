'use client'

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

/**
 * Fades + lifts its children into view once.
 *
 * Rendered through `createElement` rather than `<Tag>` JSX: a polymorphic
 * JSX tag combined with a ref makes TypeScript collapse the children prop
 * to `never`, which fails the build.
 *
 * Falls back to visible immediately when IntersectionObserver is missing,
 * and the CSS drops the transition under prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  delay?: number
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    let timer: ReturnType<typeof setTimeout> | undefined

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        timer = setTimeout(() => setShown(true), delay)
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [delay])

  return createElement(
    as,
    {
      ref,
      className: cn('reveal', className),
      'data-in': shown ? 'true' : 'false',
    },
    children,
  )
}

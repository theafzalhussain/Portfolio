const TECH = [
  'React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express',
  'MongoDB', 'Mongoose', 'Redis', 'BullMQ', 'Socket.IO', 'Razorpay',
  'Three.js', 'Framer Motion', 'Redux Toolkit', 'TanStack Query', 'SWR',
  'Cloudinary', 'Firebase', 'PWA', 'REST APIs', 'Git',
]

/**
 * Infinite tech ticker.
 *
 * No `'use client'`: it has no state, no effects and no handlers, so it is a
 * server component and ships zero JavaScript. The scroll is a pure CSS
 * animation on `transform`, which the compositor runs off the main thread —
 * the marquee keeps moving smoothly even while React is busy elsewhere.
 */
export function TechMarquee() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 overflow-hidden border-y border-border bg-card/85 py-3 md:bg-card/70 md:py-3.5 md:backdrop-blur-md"
    >
      <div className="animate-marquee flex w-max items-center gap-5 font-mono text-[0.68rem] tracking-[0.06em] whitespace-nowrap text-muted-foreground sm:gap-6 sm:text-[0.74rem] sm:tracking-[0.08em]">
        {[...TECH, ...TECH].map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center gap-5 sm:gap-6">
            {t}
            <i className="text-[0.55rem] not-italic text-primary">◆</i>
          </span>
        ))}
      </div>
    </div>
  )
}

'use client'

const TECH = [
  'React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express',
  'MongoDB', 'Mongoose', 'Redis', 'BullMQ', 'Socket.IO', 'Razorpay',
  'Three.js', 'Framer Motion', 'Redux Toolkit', 'TanStack Query', 'SWR',
  'Cloudinary', 'Firebase', 'Python', 'Kotlin', 'PWA', 'REST APIs', 'Git',
]

export function TechMarquee() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 overflow-hidden border-y border-border bg-card/70 py-3.5 backdrop-blur-md"
    >
      <div className="group flex w-max animate-marquee items-center gap-6 font-mono text-[0.74rem] tracking-[0.08em] whitespace-nowrap text-muted-foreground hover:[animation-play-state:paused]">
        {[...TECH, ...TECH].map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center gap-6">
            {t}
            <i className="text-[0.55rem] not-italic text-primary">◆</i>
          </span>
        ))}
      </div>
    </div>
  )
}

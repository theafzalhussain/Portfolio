const items = [
  'MongoDB',
  'React',
  'Node.js',
  'Express',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'Framer Motion',
  'REST APIs',
  'Git & GitHub',
  'Bootstrap 5',
  'TMDB API',
  'GNews API',
  'OpenWeather API',
]

/**
 * Infinite tech marquee strip (seamless: the list is rendered twice and
 * the track translates exactly -50%). Purely decorative → aria-hidden.
 */
export function TechMarquee() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 overflow-hidden border-y border-border/60 bg-card/40 py-4 backdrop-blur-sm"
    >
      <div className="animate-marquee flex w-max">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-10 pr-10">
            {items.map((item) => (
              <span
                key={`${dup}-${item}`}
                className="flex items-center gap-3 font-mono text-sm whitespace-nowrap text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary/70" />
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

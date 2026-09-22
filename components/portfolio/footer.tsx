import { GithubIcon, LinkedinIcon } from '@/components/portfolio/brand-icons'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-card/70 py-9 backdrop-blur-md">
      <div className="mx-auto grid w-[min(72rem,calc(100%-2rem))] gap-5 md:w-[min(72rem,calc(100%-4rem))] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-1">
          <strong className="font-heading text-xl font-semibold">Afzal Hussain</strong>
          <span className="text-[0.85rem] text-muted-foreground">
            Frontend Developer · New Delhi, India
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-5" aria-label="Footer">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.85rem] text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/theafzalhussain"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <GithubIcon className="size-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/theafzalhussain/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <LinkedinIcon className="size-4" />
          </a>
        </nav>

        <p className="border-t border-border/60 pt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground lg:col-span-2">
          © {new Date().getFullYear()} · Open to internships, India &amp; remote
        </p>
      </div>
    </footer>
  )
}

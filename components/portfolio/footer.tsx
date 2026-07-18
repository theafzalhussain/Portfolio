import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from '@/components/portfolio/brand-icons'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border py-10">
      <div className="mx-auto flex w-[min(72rem,calc(100%-2.5rem))] flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-sm text-muted-foreground">
          {'<'}
          <span className="text-primary">AH</span>
          {' /> '}
          &copy; {new Date().getFullYear()} Afzal Hussain. Crafted with care.
        </p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/theafzalhussain"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <GithubIcon className="size-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/afzalhussain"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <LinkedinIcon className="size-4" />
          </a>
          <a
            href="https://wa.me/918447859784"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <WhatsappIcon className="size-4" />
          </a>
          <a
            href="https://www.instagram.com/theafzalhussain"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <InstagramIcon className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}

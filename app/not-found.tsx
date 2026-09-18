import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-sm tracking-[0.4em] text-accent">ERROR 404</p>
      <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
        This page got <span className="text-primary">lost in space</span>
      </h1>
      <p className="max-w-md leading-relaxed text-muted-foreground">
        The URL you are looking for does not exist on this portfolio. Let&apos;s get you back to
        safe ground.
      </p>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        Back to Home
      </Link>
    </main>
  )
}

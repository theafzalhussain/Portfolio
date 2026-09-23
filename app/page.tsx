import { Toaster } from 'react-hot-toast'
import { Preloader } from '@/components/portfolio/preloader'
import { Constellation } from '@/components/portfolio/constellation'
import { Navbar } from '@/components/portfolio/navbar'
import { Hero } from '@/components/portfolio/hero'
import { TechMarquee } from '@/components/portfolio/marquee'
import { Projects } from '@/components/portfolio/projects'
import { Skills } from '@/components/portfolio/skills'
import { Experience } from '@/components/portfolio/experience'
import { About } from '@/components/portfolio/about'
import { Contact } from '@/components/portfolio/contact'
import { Footer } from '@/components/portfolio/footer'
import { BackToTop } from '@/components/portfolio/back-to-top'

export default function Page() {
  return (
    <>
      <Preloader />
      <Constellation />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        {/* Work sits directly under the hero: a recruiter should reach the
            projects in the first scroll, not an icon grid. */}
        <Projects />
        <Skills />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Theme tokens, not hard-coded colours: the old literal dark values
          // left a dark toast floating on the light theme.
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            fontSize: '0.9rem',
            maxWidth: 'min(22rem, calc(100vw - 2rem))',
          },
        }}
      />
    </>
  )
}

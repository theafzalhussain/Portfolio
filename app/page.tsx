import { Toaster } from 'react-hot-toast'
import { ParticleField } from '@/components/portfolio/particle-field'
import { Preloader } from '@/components/portfolio/preloader'
import { Navbar } from '@/components/portfolio/navbar'
import { Hero } from '@/components/portfolio/hero'
import { TechMarquee } from '@/components/portfolio/marquee'
import { About } from '@/components/portfolio/about'
import { Skills } from '@/components/portfolio/skills'
import { Services } from '@/components/portfolio/services'
import { Experience } from '@/components/portfolio/experience'
import { Projects } from '@/components/portfolio/projects'
import { Testimonials } from '@/components/portfolio/testimonials'
import { Resume } from '@/components/portfolio/resume'
import { Certifications } from '@/components/portfolio/certifications'
import { Faq } from '@/components/portfolio/faq'
import { Contact } from '@/components/portfolio/contact'
import { Footer } from '@/components/portfolio/footer'
import { BackToTop } from '@/components/portfolio/back-to-top'

export default function Page() {
  return (
    <>
      <Preloader />
      <ParticleField />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        <Testimonials />
        <Resume />
        <Certifications />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'oklch(0.17 0.014 252)',
            color: 'oklch(0.95 0.005 250)',
            border: '1px solid oklch(1 0 0 / 12%)',
          },
        }}
      />
    </>
  )
}

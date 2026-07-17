import { Toaster } from 'react-hot-toast'
import { ParticleField } from '@/components/portfolio/particle-field'
import { Navbar } from '@/components/portfolio/navbar'
import { Hero } from '@/components/portfolio/hero'
import { About } from '@/components/portfolio/about'
import { Skills } from '@/components/portfolio/skills'
import { Projects } from '@/components/portfolio/projects'
import { Resume } from '@/components/portfolio/resume'
import { Certifications } from '@/components/portfolio/certifications'
import { Contact } from '@/components/portfolio/contact'
import { Footer } from '@/components/portfolio/footer'

export default function Page() {
  return (
    <>
      <ParticleField />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Resume />
        <Certifications />
        <Contact />
      </main>
      <Footer />
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

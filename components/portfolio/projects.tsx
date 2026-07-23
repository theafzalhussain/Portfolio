'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, FolderGit2, Sparkles } from 'lucide-react'
import { GithubIcon } from '@/components/portfolio/brand-icons'

const projects = [
  {
    title: 'eShopperr',
    subtitle: 'E-Commerce Platform',
    description:
      'A full-featured MERN stack e-commerce website built with the help of AI and GitHub Copilot. Includes product catalog, cart, and a complete shopping experience.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB Atlas'],
    image: '/images/eshopper.png',
    liveUrl: 'https://eshopperr.me',
    sourceUrl: 'https://github.com/theafzalhussain',
    featured: true,
    highlights: ['Full MERN stack architecture', 'Built with AI & GitHub Copilot', 'Responsive shopping experience'],
  },
  {
    title: 'MovieZone',
    subtitle: 'Movie Discovery App',
    description:
      'A movie browsing web app that fetches real-time movie data from the TMDB API — explore trending, popular, and upcoming films with search.',
    tags: ['React', 'Tailwind CSS', 'JavaScript', 'TMDB API'],
    image: '/images/moviezone.png',
    liveUrl: 'https://moviezone.dev',
    sourceUrl: 'https://github.com/theafzalhussain',
    featured: false,
    highlights: ['Live TMDB API integration', 'Search & filter movies'],
  },
  {
    title: 'MyNews Web',
    subtitle: 'News Discovery App',
    description:
      'A news discovery web app that fetches real-time news from the GNews API. Explore top headlines and search for news articles on various topics.',
    tags: ['React', 'CSS', 'JavaScript', 'GNews API'],
    image: '/images/news.png',
    liveUrl: 'https://mynews-web.vercel.app/',
    sourceUrl: 'https://github.com/theafzalhussain',
    featured: false,
    highlights: ['Live GNews API integration', 'Search for news articles', 'Responsive design'],
  },
  {
    title: 'Weather App',
    subtitle: 'Real-Time Weather',
    description:
      'A responsive weather dashboard integrating the OpenWeather API with geolocation to auto-detect location and search 200,000+ cities.',
    tags: ['HTML', 'CSS', 'JavaScript', 'OpenWeather API','Tailwind CSS'],
    image: '/images/weather.png',
    liveUrl: 'https://myweather-web.vercel.app/',
    sourceUrl: 'https://github.com/theafzalhussain',
    featured: false,
    highlights: ['Geolocation auto-detect', 'Dynamic weather icons'],
  },
  {
    title: 'REST Countries Explorer',
    subtitle: 'Country Explorer',
    description:
      'An interactive explorer fetching data for 250+ countries with flags, demographics, and region details, plus real-time search and filters.',
    tags: ['HTML', 'CSS', 'JavaScript', 'REST API', 'Express', 'React','Tailwind CSS'],
    image: '/images/restcountry.png',
    liveUrl: 'https://myrest-country.vercel.app/',
    sourceUrl: 'https://github.com/theafzalhussain',
    featured: false,
    highlights: ['250+ countries data', 'Search & region filter'],
  },

]

function ProjectCard({
  project,
  index,
  featured = false,
}: {
  project: (typeof projects)[number]
  index: number
  featured?: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className={`glass group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_60px_-16px_var(--glow)] ${
        featured ? 'md:flex-row' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          featured ? 'aspect-[16/10] md:aspect-auto md:w-[55%]' : 'aspect-[16/10]'
        }`}
      >
        <Image
          src={project.image || '/placeholder.svg'}
          alt={`Screenshot of ${project.title} — ${project.subtitle}`}
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 1024px) 100vw, 50vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-30"
        />
        {featured && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-[0_0_24px_-4px_var(--glow)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Featured Project
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-6 ${featured ? 'md:justify-center md:p-10' : ''}`}>
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">
            {project.subtitle}
          </p>
          <h3 className={`font-bold leading-snug ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {project.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
          {project.description}
        </p>

        <ul className="flex flex-col gap-1.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
              {h}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <a
            href={project.liveUrl}
            target={project.liveUrl.startsWith('http') ? '_blank' : undefined}
            rel={project.liveUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] hover:shadow-[0_0_28px_-6px_var(--glow)] active:scale-95"
          >
            Live Demo
            <ArrowUpRight className="size-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </a>
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" /> Source
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export function Projects() {
  const [featured, ...rest] = projects

  return (
    <section id="projects" className="relative z-10 py-20 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-start gap-4 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <FolderGit2 className="size-3.5" aria-hidden="true" />
            Portfolio
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            A selection of production applications I&apos;ve designed and built end-to-end — from
            architecture and APIs to pixel-perfect interfaces.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8">
          <ProjectCard project={featured} index={0} featured />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {rest.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

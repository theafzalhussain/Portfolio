'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Atom,
  Bot,
  Code2,
  Database,
  FileCode2,
  FileJson,
  GitBranch,
  Layers,
  Palette,
  Server,
  Wind,
  Workflow,
  Zap,
} from 'lucide-react'

type Category = 'All' | 'Frontend' | 'Backend' | 'Databases/Tools'

const categories: Category[] = ['All', 'Frontend', 'Backend', 'Databases/Tools']

const skills: {
  name: string
  icon: typeof Atom
  category: Exclude<Category, 'All'>
  glow: string
  text: string
}[] = [
  { name: 'HTML', icon: Code2, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#fb923c]', text: 'text-orange-400' },
  { name: 'CSS', icon: Palette, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#60a5fa]', text: 'text-blue-400' },
  { name: 'JavaScript', icon: FileJson, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#facc15]', text: 'text-yellow-400' },
  { name: 'React', icon: Atom, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#22d3ee]', text: 'text-cyan-400' },
  // { name: 'Next.js', icon: Layers, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#e5e7eb]', text: 'text-foreground' },
  { name: 'Tailwind CSS', icon: Wind, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#67e8f9]', text: 'text-cyan-300' },
  { name: 'Framer Motion', icon: Zap, category: 'Frontend', glow: 'hover:shadow-[0_0_32px_-6px_#f472b6]', text: 'text-pink-400' },
  { name: 'Node.js', icon: Server, category: 'Backend', glow: 'hover:shadow-[0_0_32px_-6px_#4ade80]', text: 'text-green-400' },
  { name: 'Express', icon: Workflow, category: 'Backend', glow: 'hover:shadow-[0_0_32px_-6px_#e5e7eb]', text: 'text-foreground' },
  { name: 'REST APIs', icon: FileCode2, category: 'Backend', glow: 'hover:shadow-[0_0_32px_-6px_#fbbf24]', text: 'text-amber-400' },
  { name: 'MongoDB Atlas', icon: Database, category: 'Databases/Tools', glow: 'hover:shadow-[0_0_32px_-6px_#34d399]', text: 'text-emerald-400' },
  { name: 'AI Tools', icon: Bot, category: 'Databases/Tools', glow: 'hover:shadow-[0_0_32px_-6px_#22d3ee]', text: 'text-cyan-400' },
  { name: 'Git / GitHub', icon: GitBranch, category: 'Databases/Tools', glow: 'hover:shadow-[0_0_32px_-6px_#fb923c]', text: 'text-orange-400' },
]

export function Skills() {
  const [active, setActive] = useState<Category>('All')

  const visible = active === 'All' ? skills : skills.filter((s) => s.category === active)

  return (
    <section id="skills" className="relative z-10 py-16 md:py-24">
      <div className="mx-auto w-[min(72rem,calc(100%-2rem))]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-2xl"
        >
        
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Technical <span className="text-primary">Expertise</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Tools and technologies I use daily to ship robust, scalable products.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div role="tablist" aria-label="Skill categories" className="mb-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                active === cat
                  ? 'text-primary-foreground'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {active === cat && (
                <motion.span
                  layoutId="skill-tab"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Skill grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`glass group flex items-center gap-3 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.04] ${skill.glow}`}
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary ${skill.text}`}>
                  <skill.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{skill.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{skill.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

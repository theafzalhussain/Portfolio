'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
})

/**
 * Minimal theme system: the root <html> starts with the `dark` class
 * (set in app/layout.tsx). An inline script in the layout head swaps it
 * to `light` before first paint when the saved preference is light,
 * so there is no flash of the wrong theme. This provider only keeps
 * React state in sync and exposes the toggle.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setTheme(root.classList.contains('light') ? 'light' : 'dark')
    setMounted(true)
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      const root = document.documentElement
      root.classList.toggle('light', next === 'light')
      root.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem('theme', next)
      } catch {
        // private mode / storage blocked — theme still works for the session
      }
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

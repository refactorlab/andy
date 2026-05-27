import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'andy-theme'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export interface Origin {
  x: number
  y: number
}

export function useTheme(): [Theme, (t: Theme, origin?: Origin) => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
  }, [theme])

  // Reveal the new theme as a circle expanding from the click point via the
  // View Transitions API; the DOM flip happens synchronously inside the
  // callback so it's captured. Instant swap where unsupported / reduced motion.
  const setTheme = (next: Theme, origin?: Origin) => {
    const doc = document as ViewTransitionDocument
    if (!doc.startViewTransition || prefersReducedMotion()) {
      setThemeState(next)
      return
    }

    const root = document.documentElement
    const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${radius}px`)

    doc.startViewTransition(() => {
      applyTheme(next)
      setThemeState(next)
    })
  }

  return [theme, setTheme]
}

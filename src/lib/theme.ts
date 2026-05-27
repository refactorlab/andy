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

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
  }, [theme])

  // Crossfade the whole page through the View Transitions API when available;
  // the DOM flip happens synchronously inside the callback so it's captured.
  const setTheme = (next: Theme) => {
    const doc = document as ViewTransitionDocument
    if (doc.startViewTransition && !prefersReducedMotion()) {
      doc.startViewTransition(() => {
        applyTheme(next)
        setThemeState(next)
      })
    } else {
      setThemeState(next)
    }
  }

  return [theme, setTheme]
}

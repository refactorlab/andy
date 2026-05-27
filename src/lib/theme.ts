import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export interface Origin {
  x: number
  y: number
}

const STORAGE_KEY = 'andy-theme'
const EVENT = 'andy-themechange'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

export function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const fromDom = document.documentElement.dataset.theme
    if (fromDom === 'light' || fromDom === 'dark') return fromDom
  }
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  }
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

/**
 * Single source of truth for the theme. Commits to the DOM + storage and
 * broadcasts a `themechange` event so every `useTheme()` consumer (nav toggle,
 * command palette, …) updates together. Reveals via an expanding-circle View
 * Transition from the origin point when supported.
 */
export function setTheme(next: Theme, origin?: Origin) {
  const commit = () => {
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable — non-fatal */
    }
    window.dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: next }))
  }

  const doc = document as ViewTransitionDocument
  if (doc.startViewTransition && !prefersReducedMotion()) {
    const root = document.documentElement
    const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${radius}px`)
    doc.startViewTransition(commit)
  } else {
    commit()
  }
}

export function toggleTheme(origin?: Origin) {
  const current = (document.documentElement.dataset.theme as Theme) || 'light'
  setTheme(current === 'light' ? 'dark' : 'light', origin)
}

/** Subscribes to the shared theme and returns [theme, toggle(origin?)]. */
export function useTheme(): [Theme, (origin?: Origin) => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme) // keep DOM in sync on first mount
    const onChange = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail)
    window.addEventListener(EVENT, onChange as EventListener)
    return () => window.removeEventListener(EVENT, onChange as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [theme, (origin?: Origin) => toggleTheme(origin)]
}

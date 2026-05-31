import { useEffect, useState } from 'react'

interface ScrollState {
  /** True after the document has scrolled past the lift threshold (~24 px). */
  scrolled: boolean
  /** 0 → 1 reading-progress for the whole document. */
  progress: number
}

/**
 * Minimal scroll tracker. One passive scroll listener; updates state at most
 * once per animation frame and skips repeated values to avoid re-rendering
 * the nav 60 times per second. Reads `document.documentElement` so it works
 * with `<html>` as the scroll container (matches `animation-timeline: scroll(root)`).
 */
export function useScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, progress: 0 })

  useEffect(() => {
    let raf = 0
    let lastScrolled = false
    let lastProgress = -1

    const read = () => {
      raf = 0
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      const y = root.scrollTop
      const progress = max > 0 ? Math.max(0, Math.min(1, y / max)) : 0
      const scrolled = y > 24
      // Coalesce to 3 decimal places so 0.7491 → 0.749 → no re-render until it actually shifts.
      const next = Math.round(progress * 1000) / 1000
      if (scrolled === lastScrolled && next === lastProgress) return
      lastScrolled = scrolled
      lastProgress = next
      setState({ scrolled, progress: next })
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return state
}

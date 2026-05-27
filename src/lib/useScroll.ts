import { useEffect, useState } from 'react'

export interface ScrollState {
  /** True once the page has scrolled past a small threshold. */
  scrolled: boolean
  /** Reading progress through the document, 0 → 1. */
  progress: number
}

/**
 * rAF-throttled scroll position, used to drive the nav's elevation and the
 * reading-progress bar. One passive listener, coalesced into a single frame.
 */
export function useScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, progress: 0 })

  useEffect(() => {
    let frame = 0

    const measure = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const y = window.scrollY || doc.scrollTop
      setState({
        scrolled: y > 8,
        progress: max > 0 ? Math.min(1, y / max) : 0,
      })
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return state
}

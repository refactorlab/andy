import { useEffect } from 'react'

/**
 * Choreographs entrance animations with a single IntersectionObserver.
 *
 * Mark any element with `data-reveal` (single fade-up) or `data-reveal-stagger`
 * (its direct children cascade in). When the element scrolls into view we add
 * `is-visible`; the actual motion lives in CSS so it can be fully disabled via
 * `prefers-reduced-motion`. Above-the-fold elements fire on the first frame,
 * which doubles as the page's load animation.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]'),
    )
    if (els.length === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          obs.unobserve(entry.target)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

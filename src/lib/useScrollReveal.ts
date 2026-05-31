import { useEffect } from 'react'

/**
 * Scroll-reveal driver. Modern browsers don't need this hook at all — the
 * `animation-timeline: view()` rules in App.css drive the entrance from the
 * compositor without any JS. This hook is only the legacy fallback path:
 * it opts in to the from-invisible CSS state (by adding
 * `has-reveal-fallback` to <html>) and then walks the document with one
 * IntersectionObserver, flipping `is-visible` as elements scroll in.
 *
 * Importantly, we *don't* add the fallback class on modern browsers — that
 * keeps SSR-rendered content visible from the very first paint instead of
 * briefly hiding it while JS attaches.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasTimeline =
      typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')

    // Modern path: CSS owns the animation; nothing to do here.
    if (hasTimeline && !reduceMotion) return

    document.documentElement.classList.add('has-reveal-fallback')

    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]'),
    )
    if (els.length === 0) return

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

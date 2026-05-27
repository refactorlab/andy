import { useEffect, useRef } from 'react'

/**
 * Writes a normalised cursor position (`--px` / `--py`, each −1…1) onto the
 * returned element. Layers inside it read those vars via the CSS `translate`
 * property, which composes with any existing `transform` (reveal, tilt, scroll
 * timelines) rather than fighting it. Fine-pointer + motion-allowed only.
 */
export function useMouseParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let frame = 0
    const clamp = (n: number) => Math.max(-1, Math.min(1, n))

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--px', clamp(px).toFixed(3))
        el.style.setProperty('--py', clamp(py).toFixed(3))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return ref
}

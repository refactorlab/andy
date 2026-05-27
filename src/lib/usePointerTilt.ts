import { useEffect, useRef } from 'react'

interface TiltOptions {
  /** Maximum rotation in degrees at the card edges. */
  maxTilt?: number
}

/**
 * Pointer-reactive 3D tilt + spotlight. Writes CSS custom properties the card
 * reads in `App.css`:
 *   --rx / --ry   rotation driven by cursor position
 *   --mx / --my   spotlight origin (0–100%)
 *   --active      0/1 toggle for the glow opacity
 *
 * Only engages for fine pointers (mouse/trackpad) and when motion is allowed,
 * so touch and reduced-motion users get a clean static card. rAF-coalesced.
 */
export function usePointerTilt<T extends HTMLElement>({ maxTilt = 6 }: TiltOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduceMotion) return

    let frame = 0

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width // 0 → 1
      const py = (e.clientY - rect.top) / rect.height
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${(0.5 - py) * maxTilt * 2}deg`)
        el.style.setProperty('--ry', `${(px - 0.5) * maxTilt * 2}deg`)
        el.style.setProperty('--mx', `${px * 100}%`)
        el.style.setProperty('--my', `${py * 100}%`)
        el.style.setProperty('--active', '1')
      })
    }

    const onLeave = () => {
      cancelAnimationFrame(frame)
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--active', '0')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [maxTilt])

  return ref
}

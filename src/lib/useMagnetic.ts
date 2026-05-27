import { useEffect } from 'react'

/**
 * Gives every `[data-magnetic]` element a magnetic pull toward the cursor:
 * while the pointer is over (and just around) the element it eases toward it,
 * then springs back on leave. Writes `--mag-x` / `--mag-y` (consumed by the
 * button transform) plus `--mx` / `--my` for an optional spotlight.
 *
 * Fine-pointer + motion-allowed only; one delegated effect for all buttons.
 */
export function useMagnetic(strength = 0.32) {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduceMotion) return

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    if (els.length === 0) return

    const teardowns = els.map((el) => {
      let frame = 0

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        const relX = e.clientX - (rect.left + rect.width / 2)
        const relY = e.clientY - (rect.top + rect.height / 2)
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          el.style.setProperty('--mag-x', `${relX * strength}px`)
          el.style.setProperty('--mag-y', `${relY * strength}px`)
          el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
          el.style.setProperty('--my', `${e.clientY - rect.top}px`)
        })
      }

      const onLeave = () => {
        cancelAnimationFrame(frame)
        el.style.setProperty('--mag-x', '0px')
        el.style.setProperty('--mag-y', '0px')
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        cancelAnimationFrame(frame)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    })

    return () => teardowns.forEach((fn) => fn())
  }, [strength])
}

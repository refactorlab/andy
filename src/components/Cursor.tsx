import { useEffect, useRef } from 'react'

/**
 * A trailing accent ring that eases toward the pointer and swells over
 * interactive targets. Additive only — the OS cursor stays visible, so nothing
 * about clicking/selecting changes. Fine-pointer + motion-allowed only.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return

    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduceMotion) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let raf = 0
    let visible = false

    const loop = () => {
      x += (targetX - x) * 0.18
      y += (targetY - y) * 0.18
      ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!visible) {
        visible = true
        ring.classList.add('is-visible')
      }
    }
    const onLeaveWindow = () => {
      visible = false
      ring.classList.remove('is-visible')
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    // Delegated hover: grow over any interactive target.
    const interactiveSelector = 'a, button, [data-magnetic], .tilt-card, input, summary'
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null
      if (el && el.closest(interactiveSelector)) ring.classList.add('is-pointer')
    }
    const onOut = (e: PointerEvent) => {
      const el = e.target as Element | null
      if (el && el.closest(interactiveSelector)) ring.classList.remove('is-pointer')
    }

    document.body.classList.add('has-cursor-ring')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeaveWindow)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor-ring')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeaveWindow)
    }
  }, [])

  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
}

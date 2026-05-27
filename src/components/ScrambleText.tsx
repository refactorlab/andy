import { useEffect, useRef, useState } from 'react'
import { scrambleFrame } from '../lib/scramble'

interface ScrambleTextProps {
  text: string
  className?: string
}

/**
 * Resolves `text` from random glyphs left-to-right the first time it scrolls
 * into view — a terminal decode effect, on-brand for a dev tool. Whitespace is
 * never scrambled so word shapes stay stable (no layout shift). The real text
 * is the initial/committed value, so it's correct for SEO and reduced motion.
 */
export function ScrambleText({ text, className }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }

    let raf = 0
    let started = false

    const run = () => {
      const start = performance.now()
      const total = Math.max(520, text.length * 36)
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / total)
        const revealed = Math.floor(p * text.length)
        setDisplay(scrambleFrame(text, revealed))
        if (p < 1) raf = requestAnimationFrame(tick)
        else setDisplay(text)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            run()
            io.disconnect()
          }
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

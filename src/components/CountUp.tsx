import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** Animation length in ms. */
  duration?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts from 0 → `value` the first time it scrolls into view. Self-observing,
 * so it works anywhere on the page; jumps straight to the final value under
 * reduced motion. Width is held steady via `tabular-nums` to avoid reflow.
 */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    let frame = 0
    let started = false

    const animate = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setDisplay(value * easeOutCubic(t))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            animate()
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration])

  // The animating digits are decorative; screen readers get the final value once.
  return (
    <>
      <span ref={ref} aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">{prefix}{value.toFixed(decimals)}{suffix}</span>
    </>
  )
}

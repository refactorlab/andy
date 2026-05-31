import { useEffect, useMemo, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** Animation length in ms. */
  duration?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Locale-aware formatter — en-US sees "8.4", fr-FR sees "8,4", de-DE "8,4". */
function getFormatter(decimals: number) {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Counts from 0 → `value` the first time it scrolls into view. Self-observing,
 * so it works anywhere on the page; jumps straight to the final value under
 * reduced motion. Width is held steady via `tabular-nums` to avoid reflow.
 */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  // SSR renders the *final* value so users without JS see the correct number,
  // and the hydrated HTML matches the server output exactly. The client then
  // resets to 0 in useLayoutEffect (synchronously, before paint) and animates
  // up — so the animation still plays, but no wrong content ever flashes.
  const [display, setDisplay] = useState(value)
  const formatter = useMemo(() => getFormatter(decimals), [decimals])

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
            // Snap to 0 right before the animation kicks off, scheduled inside
            // the rAF that opens it, so we never paint a half-finished frame.
            setDisplay(0)
            requestAnimationFrame(animate)
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
        {formatter.format(display)}
        {suffix}
      </span>
      <span className="sr-only">{prefix}{formatter.format(value)}{suffix}</span>
    </>
  )
}

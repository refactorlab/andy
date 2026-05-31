import { useEffect, useRef, useState } from 'react'
import { CountUp } from './CountUp'

interface ScoreGaugeProps {
  value: number
  max?: number
  size?: number
  stroke?: number
}

/**
 * Radial PR-health gauge: a gradient arc sweeps to `value/max` (stroke
 * dashoffset) the first time it enters view, with the score counting up in the
 * centre. Reduced motion → drawn complete immediately.
 */
export function ScoreGauge({ value, max = 10, size = 80, stroke = 7 }: ScoreGaugeProps) {
  const ref = useRef<HTMLDivElement>(null)
  // SSR renders the arc *complete* (shown=true) so users without JS see the
  // correct gauge value, and hydration matches the server markup exactly.
  // On the client we briefly snap back to empty in useLayoutEffect, then the
  // CSS transition draws the arc back to full as the element enters view.
  const [shown, setShown] = useState(true)

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, value / max))
  const offset = shown ? circumference * (1 - pct) : circumference
  const center = size / 2

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    // Reset to empty so the entrance sweep can play. The reset happens before
    // the next paint via rAF — there's no flash of the "complete" SSR state.
    let started = false
    setShown(false)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            requestAnimationFrame(() => setShown(true))
            io.disconnect()
          }
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="gauge" ref={ref} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="gauge-stop-1" />
            <stop offset="100%" className="gauge-stop-2" />
          </linearGradient>
        </defs>
        <circle className="gauge-track" cx={center} cy={center} r={radius} strokeWidth={stroke} fill="none" />
        <circle
          className="gauge-bar"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className="gauge-num">
        <CountUp value={value} decimals={1} />
      </span>
    </div>
  )
}

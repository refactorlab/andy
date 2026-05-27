import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/**
 * Mini architecture map that draws itself when scrolled into view: the
 * connector paths stroke on (via pathLength="1" + dashoffset) and the nodes
 * pop in, staggered — illustrating how Andy fans one PR into its artifacts.
 * Reduced motion renders it complete immediately.
 */

interface Branch {
  label: string
  y: number
  tone: string
}

const BRANCHES: Branch[] = [
  { label: 'Architecture map', y: 12, tone: 'var(--accent)' },
  { label: 'Value card', y: 60, tone: 'var(--success)' },
  { label: 'Risk quadrant', y: 108, tone: 'var(--danger)' },
  { label: 'Ranked suggestions', y: 156, tone: 'var(--info)' },
]

// Curved connector from Andy's output edge to each branch node.
const EDGE_PATHS = [
  'M430,98 C492,82 502,31 560,31',
  'M430,100 C492,96 502,79 560,79',
  'M430,103 C492,112 502,127 560,127',
  'M430,106 C492,150 502,175 560,175',
]

const delay = (i: number) => ({ '--d': `${i * 0.12}s` } as CSSProperties)

export function ArchDiagram() {
  const ref = useRef<HTMLDivElement>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <figure className={`arch-wrap${drawn ? ' is-drawn' : ''}`} ref={ref}>
      <figcaption className="arch-cap">Architecture map · auto-generated per PR</figcaption>
      <svg className="arch-svg" viewBox="0 0 760 206" role="img" aria-label="Andy turns one pull request into an architecture map, value card, risk quadrant, and ranked suggestions">
        <defs>
          <linearGradient id="arch-andy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="gauge-stop-1" />
            <stop offset="100%" className="gauge-stop-2" />
          </linearGradient>
        </defs>

        {/* edges */}
        <path className="arch-edge" pathLength={1} style={delay(1)} d="M144,101 L320,101" />
        {EDGE_PATHS.map((d, i) => (
          <path className="arch-edge" pathLength={1} style={delay(2 + i)} d={d} key={d} />
        ))}

        {/* PR source node */}
        <g className="arch-node" style={delay(0)}>
          <rect x="16" y="78" width="128" height="46" rx="11" className="arch-box" />
          <text x="80" y="106" className="arch-text" textAnchor="middle">PR · 100 files</text>
        </g>

        {/* Andy node */}
        <g className="arch-node" style={delay(1)}>
          <rect x="320" y="74" width="110" height="54" rx="13" fill="url(#arch-andy)" />
          <text x="375" y="106" className="arch-andy-text" textAnchor="middle">Andy</text>
        </g>

        {/* branch nodes */}
        {BRANCHES.map((b, i) => (
          <g className="arch-node" style={delay(3 + i)} key={b.label}>
            <rect x="560" y={b.y} width="184" height="38" rx="10" className="arch-box" />
            <circle cx="582" cy={b.y + 19} r="4" style={{ fill: b.tone }} />
            <text x="598" y={b.y + 24} className="arch-text">{b.label}</text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

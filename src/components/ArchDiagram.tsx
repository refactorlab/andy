import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/**
 * Mini architecture map that draws itself when scrolled into view: the
 * connector paths stroke on (pathLength="1" + dashoffset), the nodes pop in
 * staggered, then a glowing "data packet" pulses along each wire once —
 * illustrating one PR fanning through Andy into its six artifacts. The 1→hub→6
 * composition (with a file-stack source) keeps the diagram dense and balanced
 * rather than sparse. Reduced motion renders it complete, no pulse.
 */

interface Out {
  label: string
  cy: number
  tone: string
}

// Six outputs (one per artifact) tightly stacked down the right — fills the
// vertical space so the figure reads dense, not empty. h=30, gap=7 → y=14+i*37.
const OUTPUTS: Out[] = [
  { label: 'Architecture map', cy: 29, tone: 'var(--accent)' },
  { label: 'Value card', cy: 66, tone: 'var(--success)' },
  { label: 'Ranked suggestions', cy: 103, tone: 'var(--info)' },
  { label: 'Risk quadrant', cy: 140, tone: 'var(--danger)' },
  { label: 'Hot-touch mindmap', cy: 177, tone: 'var(--accent-2)' },
  { label: 'Business context', cy: 214, tone: 'color-mix(in oklch, var(--accent), var(--info))' },
]

// Trunk (PR→Andy) then the six-way fan (Andy→each output).
const EDGES = [
  'M156,125 L270,125',
  'M382,125 C432,125 430,29 480,29',
  'M382,125 C432,125 430,66 480,66',
  'M382,125 C430,118 440,103 480,103',
  'M382,125 C430,132 440,140 480,140',
  'M382,125 C432,125 430,177 480,177',
  'M382,125 C432,125 430,214 480,214',
]

const delay = (i: number) => ({ '--d': `${i * 0.1}s` } as CSSProperties)

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
      <svg className="arch-svg" viewBox="0 0 700 250" role="img" aria-label="Andy turns one pull request into six artifacts: an architecture map, value card, ranked suggestions, risk quadrant, hot-touch mindmap, and business context">
        <defs>
          <linearGradient id="arch-andy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="gauge-stop-1" />
            <stop offset="100%" className="gauge-stop-2" />
          </linearGradient>
        </defs>

        {/* Connector wires draw on once, then a glowing packet flows along each. */}
        {EDGES.map((d, i) => (
          <path className="arch-edge" pathLength={1} style={delay(1 + i)} d={d} key={`e${i}`} />
        ))}
        {EDGES.map((d, i) => (
          <path className="arch-pulse" pathLength={1} style={delay(2 + i)} d={d} key={`p${i}`} />
        ))}

        {/* PR source — a file stack (two faint cards behind) suggests 100 files. */}
        <g className="arch-node" style={delay(0)}>
          <rect x="40" y="113" width="128" height="44" rx="11" className="arch-stack" />
          <rect x="34" y="108" width="128" height="44" rx="11" className="arch-stack" />
          <rect x="28" y="103" width="128" height="44" rx="11" className="arch-box" />
          <text x="92" y="129" className="arch-text" textAnchor="middle">PR · 100 files</text>
        </g>

        {/* Andy hub */}
        <g className="arch-node" style={delay(1)}>
          <rect x="270" y="97" width="112" height="56" rx="14" fill="url(#arch-andy)" />
          <text x="326" y="129" className="arch-andy-text" textAnchor="middle">Andy</text>
        </g>

        {/* Six output chips */}
        {OUTPUTS.map((o, i) => (
          <g className="arch-node" style={delay(3 + i)} key={o.label}>
            <rect x="480" y={o.cy - 15} width="208" height="30" rx="9" className="arch-box" />
            <circle cx="502" cy={o.cy} r="4" style={{ fill: o.tone }} />
            <text x="518" y={o.cy + 4} className="arch-text">{o.label}</text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

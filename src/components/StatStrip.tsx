import { CountUp } from './CountUp'

interface Stat {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
  hint?: string
}

const STATS: Stat[] = [
  { value: 30, suffix: 's', label: 'Typical review time', hint: 'per pull request' },
  { value: 6, label: 'Artifacts per comment', hint: 'arch, value, risk, …' },
  { value: 0, prefix: '$', label: 'Service cost', hint: 'runs in your runner' },
  { value: 1, label: 'YAML file to install', hint: 'no token, no key' },
]

/**
 * Marketing trust strip — four hard numbers in a tile row. Each number rolls
 * up from 0 the first time the strip scrolls into view (via CountUp's own
 * IntersectionObserver). No layout shift: tabular-nums keeps widths stable.
 */
export function StatStrip() {
  return (
    <div className="stat-strip" data-reveal-stagger>
      {STATS.map((s) => (
        <div className="stat-tile" key={s.label}>
          <div className="stat-tile-value">
            <CountUp
              value={s.value}
              decimals={s.decimals ?? 0}
              prefix={s.prefix ?? ''}
              suffix={s.suffix ?? ''}
            />
          </div>
          <div className="stat-tile-label">{s.label}</div>
          {s.hint ? <div className="stat-tile-hint">{s.hint}</div> : null}
        </div>
      ))}
    </div>
  )
}

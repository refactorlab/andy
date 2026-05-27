import { useScrollSpy } from '../lib/useScrollSpy'

const SECTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'problem', label: 'Problem' },
  { id: 'what', label: 'What you get' },
  { id: 'install', label: 'Install' },
  { id: 'example', label: 'Example' },
]

const IDS = SECTIONS.map((s) => s.id)

/**
 * Fixed dot-rail mirroring scroll position. Real anchor links, so it works and
 * is reachable without JS; the active dot just reflects the scrollspy. Hidden
 * on narrow viewports via CSS.
 */
export function SectionRail() {
  const active = useScrollSpy(IDS)
  // Before any section is marked active (very top), treat "top" as current.
  const current = active || 'top'

  return (
    <nav className="section-rail" aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`rail-dot${current === s.id ? ' is-active' : ''}`}
          aria-current={current === s.id ? 'true' : undefined}
        >
          <span className="rail-label">{s.label}</span>
        </a>
      ))}
    </nav>
  )
}

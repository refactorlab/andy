import { TiltCard } from './TiltCard'

const items = [
  {
    icon: '🏗',
    title: 'Architecture map',
    body: 'Before → after diagrams of what your PR changed, plus the data structures connecting the two. Rendered as Mermaid.',
    tags: ['mermaid', 'before/after', 'symbols'],
  },
  {
    icon: '📊',
    title: 'Value card',
    body: 'Money, customer, runtime, runtime-UX — each scored with the formula, the inputs that produced it, and a confidence label.',
    tags: ['formulas', 'inputs', 'confidence'],
  },
  {
    icon: '💡',
    title: 'Ranked suggestions',
    body: 'Every code suggestion ships with a confidence score, a category, an applyable diff, and references to specs or docs.',
    tags: ['≥0.75 conf', 'applyable', 'references'],
  },
  {
    icon: '⚠️',
    title: 'Risk quadrant',
    body: 'Severity × likelihood map of every risk Andy spotted. You see what to block on before merge versus what to monitor.',
    tags: ['severity', 'likelihood', 'blocking'],
  },
  {
    icon: '🗂',
    title: 'Hot-touch mindmap',
    body: 'The files reviewers should open first, grouped by subsystem — the difference between a 100-file PR and a 6-file mental model.',
    tags: ['subsystems', 'priority', 'graph'],
  },
  {
    icon: '🧭',
    title: 'Business context',
    body: 'A product-level diagram with the slice your PR touches highlighted — so reviewers see why the change exists, not just what.',
    tags: ['product', 'slice', 'intent'],
  },
]

export function Artifacts() {
  return (
    <section className="section" id="what">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <span className="kicker">// what andy ships in every review</span>
          <h2>Six artifacts. <span className="hl">One PR comment.</span></h2>
          <p className="section-lede">
            One sticky comment per pull request, re-rendered on every push.
            Inside it: the visuals that turn a large diff into a guided handoff,
            plus the code suggestions and risks that actually need a reviewer's
            eye.
          </p>
        </header>

        <div className="artifact-grid">
          {items.map((it, i) => (
            <TiltCard className="artifact" key={it.title} revealDelay={(i % 3) * 0.08} maxTilt={5}>
              <div className="artifact-icon" aria-hidden="true">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <div className="artifact-tags">
                {it.tags.map((t) => (
                  <span className="tagchip" key={t}>{t}</span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

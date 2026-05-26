const features = [
  {
    icon: '🏗',
    title: 'Architecture flow',
    body: 'Before → after diagrams of what your PR changed, plus the data structures connecting the two. Generated from the diff, rendered as Mermaid.',
  },
  {
    icon: '🧭',
    title: 'Business logic context',
    body: 'A product-level diagram with the slice your PR touches highlighted — so reviewers see why the change exists, not just what changed.',
  },
  {
    icon: '📊',
    title: 'Four-axis value card',
    body: 'Money, customer, runtime, runtime UX — each scored with the formula, inputs, and confidence label that produced the number.',
  },
  {
    icon: '💡',
    title: 'Code suggestions, ranked',
    body: 'Every suggestion ships with confidence, category, a diff you can apply, and real doc/spec references explaining the call.',
  },
  {
    icon: '⚠️',
    title: 'Risk quadrant',
    body: 'Severity × likelihood map of every risk Andy spotted — so you know what to act on before merge versus what to monitor.',
  },
  {
    icon: '🗂',
    title: 'Hot-touch mindmap',
    body: 'The files reviewers should open first, grouped by subsystem — the difference between a 100-file PR and a 6-file mental model.',
  },
]

export function Features() {
  return (
    <section id="features">
      <div className="container">
        <p className="section-eyebrow">// what andy ships in every review</p>
        <h2 className="section-title">Six artifacts. One PR comment.</h2>
        <p className="section-lede">
          Andy posts one comment per PR. Inside it: the visuals that turn a
          large diff into a guided handoff, plus the code suggestions and risks
          that actually need a reviewer's eye.
        </p>

        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

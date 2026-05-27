const pains = [
  {
    label: '01',
    title: '"LGTM"',
    body: 'Reviewers approve PRs they didn\'t fully understand because nobody has 90 minutes to trace a 100-file diff. Bugs ship in the gap between "looks right" and "is right".',
  },
  {
    label: '02',
    title: 'Why does this exist?',
    body: 'Context lives in Linear, Slack threads, and the author\'s head — not in the PR. New reviewers spend half their time inferring intent before they can judge the code.',
  },
  {
    label: '03',
    title: 'What did it cost?',
    body: 'No one can answer in dollars or minutes. The PR closes, the impact disappears into vibes, and the team forgets what they shipped by next quarter.',
  },
]

export function Problem() {
  return (
    <section className="section section-tight" id="problem">
      <div className="wrap">
        <header className="section-head">
          <span className="kicker">// the pull-request review, today</span>
          <h2>Three questions every PR comment fails to answer.</h2>
        </header>

        <div className="problem-grid">
          {pains.map((p) => (
            <article className="problem-card" key={p.label}>
              <div className="problem-num">{p.label}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

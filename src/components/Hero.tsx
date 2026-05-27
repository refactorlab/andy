const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="tag">
              <span className="tag-dot" />
              GitHub Action · MIT · v1
            </span>

            <h1 className="hero-title">
              The PR review that explains{' '}
              <span className="hl">what actually changed</span>.
            </h1>

            <p className="hero-sub">
              Andy reads every pull request and posts one comment: an
              architecture map, a money / time impact card, ranked code
              suggestions, and a risk quadrant. Drops in via one YAML file. No
              service to authorize.
            </p>

            <div className="hero-cta">
              <a className="btn btn-primary" href={MARKETPLACE} target="_blank" rel="noopener noreferrer">
                Install from Marketplace
                <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-ghost" href="./pr36-github-ui_2.html" target="_blank" rel="noopener noreferrer">
                See an example review
              </a>
            </div>

            <ul className="hero-meta" aria-label="At a glance">
              <li><strong>~30s</strong> per PR</li>
              <li><strong>$0</strong> service cost</li>
              <li><strong>1 file</strong> to install</li>
            </ul>
          </div>

          <aside className="hero-card" aria-label="Andy PR comment preview">
            <header className="hcard-head">
              <div className="hcard-avatar" aria-hidden="true">A</div>
              <div className="hcard-meta">
                <div className="hcard-name">
                  <strong>andy-bot</strong>
                  <span className="hcard-badge">bot</span>
                  <span className="hcard-when">commented just now</span>
                </div>
                <div className="hcard-sub">#36 · refactorlab/drift · 100 files · +15.7k / −2.6k</div>
              </div>
            </header>

            <div className="hcard-body">
              <div className="hcard-score">
                <div>
                  <div className="hcard-score-num">8.4<span className="hcard-score-den">/10</span></div>
                  <div className="hcard-score-label">PR health · 4-axis weighted</div>
                </div>
                <div className="hcard-pills">
                  <span className="pill pill-good">5 features</span>
                  <span className="pill pill-warn">3 risks</span>
                  <span className="pill pill-info">12 tests</span>
                </div>
              </div>

              <div className="hcard-axes">
                {[
                  { label: '💰 Money', value: '+32%', pct: 32, tone: 'good' },
                  { label: '👥 Customer', value: '+48%', pct: 48, tone: 'good' },
                  { label: '⚙ Runtime', value: '+60%', pct: 60, tone: 'info' },
                  { label: '🎨 UX', value: '+25%', pct: 25, tone: 'soft' },
                ].map((a) => (
                  <div className="axis" key={a.label}>
                    <span className="axis-label">{a.label}</span>
                    <div className="axis-track"><div className={`axis-fill axis-${a.tone}`} style={{ width: `${a.pct}%` }} /></div>
                    <span className="axis-value">{a.value}</span>
                  </div>
                ))}
              </div>

              <div className="hcard-foot">
                <span>9 findings · 3 above suggestion threshold</span>
                <a href="./pr36-github-ui_2.html" target="_blank" rel="noopener noreferrer">Open full review →</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

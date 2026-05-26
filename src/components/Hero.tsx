export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div>
          <div className="hero-pill">
            <span className="dot" />
            <span>v0.1 · GitHub Action · MIT licensed</span>
          </div>
          <h1>
            Every PR, <br />
            handed off like the <span className="accent">author</span> wrote it.
          </h1>
          <p className="lede">
            Andy is a GitHub Action that turns every pull request into a guided
            handoff — architecture diagrams, business-value scoring, focused
            code suggestions, and a risk map. Drop-in companion for reviewers,
            built by Drift.
          </p>
          <div className="hero-ctas">
            <a
              className="btn btn-primary"
              href="https://github.com/marketplace/actions/andy-pr-handoff-by-drift"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
              </svg>
              Install from Marketplace
            </a>
            <a
              className="btn"
              href="https://github.com/refactorlab/andy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
              View on GitHub
            </a>
            <a className="btn" href="./pr36-github-ui_2.html" target="_blank">
              <span aria-hidden="true">📄</span>
              See an example review
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <strong>4-axis</strong> impact scoring
            </span>
            <span>
              <strong>0-config</strong> install
            </span>
            <span>
              <strong>MIT</strong> open source
            </span>
          </div>
        </div>

        <div className="pr-mock" aria-hidden="true">
          <div className="pr-mock-header">
            <div className="traffic">
              <span />
              <span />
              <span />
            </div>
            <span className="url">github.com/refactorlab/drift/pull/36</span>
          </div>
          <div className="pr-mock-body">
            <div className="pr-mock-banner">
              <div className="andy-logo">A</div>
              <div>
                <h3>Automated PR Review</h3>
                <p>3 visuals · 3 suggestions · 1 visual summary</p>
              </div>
              <div className="score">
                <div className="l">Avg. impact ▲</div>
                <div className="v">▲ 41%</div>
              </div>
            </div>
            <div className="pr-mock-axes">
              <div className="pr-mock-axis money">
                <div className="tag">💰 Money</div>
                <div className="pct">▲ 32%</div>
              </div>
              <div className="pr-mock-axis customer">
                <div className="tag">👥 Customer</div>
                <div className="pct">▲ 48%</div>
              </div>
              <div className="pr-mock-axis runtime">
                <div className="tag">⚙️ Runtime</div>
                <div className="pct">▲ 60%</div>
              </div>
              <div className="pr-mock-axis ux">
                <div className="tag">🎨 Runtime UX</div>
                <div className="pct">▲ 25%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

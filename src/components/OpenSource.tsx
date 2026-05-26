export function OpenSource() {
  return (
    <section id="open-source">
      <div className="container">
        <p className="section-eyebrow">// open source · forever</p>
        <h2 className="section-title">MIT licensed. No tokens to manage.</h2>
        <p className="section-lede">
          Andy ships as a single GitHub Action. The source is on GitHub, the
          license is MIT, and the build runs on your own Action minutes — no
          third-party service to authorize.
        </p>

        <div className="os-grid">
          <div className="os-stats">
            <div className="os-stat">
              <div className="v">MIT</div>
              <div className="l">License</div>
            </div>
            <div className="os-stat">
              <div className="v">0$</div>
              <div className="l">Cost to install</div>
            </div>
            <div className="os-stat">
              <div className="v">1</div>
              <div className="l">YAML file to add</div>
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 16px 0', color: 'var(--fg-muted)' }}>
              Want to dig in, file an issue, or contribute a new visualization?
              The repo is the source of truth — all roadmap and decisions live
              there.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                className="btn btn-primary"
                href="https://github.com/refactorlab/andy"
                target="_blank"
                rel="noopener noreferrer"
              >
                ⭐ Star on GitHub
              </a>
              <a
                className="btn"
                href="https://github.com/refactorlab/andy/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                File an issue
              </a>
              <a
                className="btn"
                href="https://github.com/refactorlab/andy/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the MIT license
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <section className="footer-cta" data-reveal aria-labelledby="footer-cta-title">
          <span className="footer-cta-mark" aria-hidden="true">andy</span>
          <div className="footer-cta-inner">
            <span className="kicker">// ready when you are</span>
            <h2 id="footer-cta-title">
              Give every pull request a <span className="hl">real handoff.</span>
            </h2>
            <p className="footer-cta-sub">
              One YAML file · ~30 seconds per review · $0 service cost. No account,
              no API key, nothing leaves your runner.
            </p>
            <div className="footer-cta-actions">
              <a className="btn btn-primary" data-magnetic href={MARKETPLACE} target="_blank" rel="noopener noreferrer">
                Install from Marketplace
                <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-ghost" href="./pr36-github-ui_2.html" target="_blank" rel="noopener noreferrer">
                See an example review
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap footer-inner">
        <div className="footer-brand">
          <span className="footer-logo" aria-hidden="true">A</span>
          <span>andy</span>
          <span className="footer-by">by Refactor Labs</span>
        </div>

        <nav className="footer-links" aria-label="Resources">
          <a href="https://github.com/refactorlab/andy" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/marketplace/actions/andy-pr-handoff-by-drift" target="_blank" rel="noopener noreferrer">Marketplace</a>
          <a href="https://github.com/refactorlab/andy/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>
          <a href="https://github.com/refactorlab/andy/issues" target="_blank" rel="noopener noreferrer">Issues</a>
          <a href="#contact">Contact</a>
          <a href="https://calendly.com/schuldi/30mins" target="_blank" rel="noopener noreferrer">Book a meeting</a>
        </nav>

        <div className="footer-meta">
          © {new Date().getFullYear()} refactorlab · MIT
        </div>
      </div>
    </footer>
  )
}

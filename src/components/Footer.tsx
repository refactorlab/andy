export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #3fb950, #2f81f7)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
          >
            A
          </div>
          <span>Andy</span>
          <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>
            · by Drift
          </span>
        </div>

        <div className="footer-links">
          <a
            href="https://github.com/refactorlab/andy"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://github.com/marketplace/actions/andy-pr-handoff-by-drift"
            target="_blank"
            rel="noopener noreferrer"
          >
            Marketplace
          </a>
          <a
            href="https://github.com/refactorlab/andy/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
          </a>
          <a href="mailto:schuldi@gmail.com">Contact</a>
        </div>

        <div className="footer-meta">
          © {new Date().getFullYear()} refactorlab · MIT
        </div>
      </div>
    </footer>
  )
}

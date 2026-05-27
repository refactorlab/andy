export function Footer() {
  return (
    <footer className="footer">
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
          <a href="mailto:schuldi@gmail.com">Contact</a>
        </nav>

        <div className="footer-meta">
          © {new Date().getFullYear()} refactorlab · MIT
        </div>
      </div>
    </footer>
  )
}

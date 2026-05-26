export function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <div className="contact-card">
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>
              // talk to a human
            </p>
            <h3>Have a question or want to pilot Andy on a repo?</h3>
            <p>
              The fastest way to reach the maintainer is email. Issues and
              feature requests are equally welcome on GitHub.
            </p>
            <a className="email" href="mailto:schuldi@gmail.com">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z" />
              </svg>
              schuldi@gmail.com
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              className="btn btn-primary"
              href="mailto:schuldi@gmail.com?subject=Andy%20%E2%80%94%20interested%20in%20piloting"
            >
              Email maintainer
            </a>
            <a
              className="btn"
              href="https://github.com/refactorlab/andy/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open a discussion
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

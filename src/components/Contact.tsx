const CALENDLY = 'https://calendly.com/schuldi/30mins'
const EMAIL = 'schuldi@gmail.com'

export function Contact() {
  return (
    <section className="section section-tight" id="contact">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <span className="kicker">// get in touch</span>
          <h2>Questions, integrations, or a quick demo?</h2>
          <p className="section-lede">
            Drop a line or grab a slot — we usually reply within a day and the
            call is 30 minutes, no slide deck.
          </p>
        </header>

        <div className="contact-grid" data-reveal-stagger>
          <a className="contact-card contact-card-primary" href={CALENDLY} target="_blank" rel="noopener noreferrer">
            <span className="contact-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <circle cx="8" cy="15" r="1.2" fill="currentColor" />
                <circle cx="12" cy="15" r="1.2" fill="currentColor" />
                <circle cx="16" cy="15" r="1.2" fill="currentColor" />
              </svg>
            </span>
            <div className="contact-body">
              <h3>Book a 30-min meeting</h3>
              <p>Pick a time on Calendly — walk through the action live or talk integration.</p>
            </div>
            <span className="contact-cta" aria-hidden="true">calendly.com/schuldi →</span>
          </a>

          <a className="contact-card" href={`mailto:${EMAIL}?subject=Andy%20%E2%80%94%20hello`}>
            <span className="contact-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <div className="contact-body">
              <h3>Send an email</h3>
              <p>Async questions, partnership ideas, or anything that needs a thread.</p>
            </div>
            <span className="contact-cta" aria-hidden="true">{EMAIL} →</span>
          </a>
        </div>
      </div>
    </section>
  )
}

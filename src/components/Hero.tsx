import type { CSSProperties } from 'react'
import { TiltCard } from './TiltCard'
import { CountUp } from './CountUp'
import { HeroCanvas } from './HeroCanvas'
import { ScoreGauge } from './ScoreGauge'
import { KineticHeading } from './KineticHeading'
import { SafeBoundary } from './SafeBoundary'

const HEADLINE = [
  { text: 'The' },
  { text: 'PR' },
  { text: 'review' },
  { text: 'that' },
  { text: 'explains' },
  { text: 'what', highlight: true },
  { text: 'actually', highlight: true },
  { text: 'changed.', highlight: true },
]

const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'

export function Hero() {
  return (
    <section className="hero" id="top">
      <SafeBoundary label="hero-canvas"><HeroCanvas /></SafeBoundary>
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy" data-reveal-stagger>
            <span className="tag">
              <span className="tag-dot" />
              GitHub Action · MIT · v1
            </span>

            <KineticHeading className="hero-title" words={HEADLINE} />

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
              <li><strong>~<CountUp value={30} suffix="s" /></strong> per PR</li>
              <li><strong>$0</strong> service cost</li>
              <li><strong>1 file</strong> to install</li>
            </ul>

            <div className="hero-proof" aria-label="Built on">
              <span className="hero-proof-label">Built on</span>
              <span className="hero-proof-chip">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                </svg>
                GitHub Actions
              </span>
              <span className="hero-proof-chip">MIT licensed</span>
              <span className="hero-proof-chip">Zero PII out</span>
            </div>
          </div>

          <div className="hero-card-shell">
            <TiltCard className="hero-card" aria-label="Andy PR comment preview" revealDelay={0.18}>
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
                  <div className="hcard-gauge">
                    <ScoreGauge value={8.4} />
                    <div className="hcard-score-label">PR health<br />4-axis weighted</div>
                  </div>
                  <div className="hcard-pills">
                    <span className="pill pill-good">5 features</span>
                    <span className="pill pill-warn">3 risks</span>
                    <span className="pill pill-info">12 tests</span>
                  </div>
                </div>

                <div className="hcard-axes">
                  {[
                    { label: '💰 Money', pct: 32, tone: 'good' },
                    { label: '👥 Customer', pct: 48, tone: 'good' },
                    { label: '⚙ Runtime', pct: 60, tone: 'info' },
                    { label: '🎨 UX', pct: 25, tone: 'soft' },
                  ].map((a) => (
                    <div className="axis" key={a.label}>
                      <span className="axis-label">{a.label}</span>
                      <div className="axis-track"><div className={`axis-fill axis-${a.tone}`} style={{ '--w': `${a.pct}%` } as CSSProperties} /></div>
                      <span className="axis-value"><CountUp value={a.pct} prefix="+" suffix="%" /></span>
                    </div>
                  ))}
                </div>

                <div className="hcard-foot">
                  <span>9 findings · 3 above suggestion threshold</span>
                  <a href="./pr36-github-ui_2.html" target="_blank" rel="noopener noreferrer">Open full review →</a>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  )
}

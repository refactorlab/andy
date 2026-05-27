import type { CSSProperties } from 'react'
import { TiltCard } from './TiltCard'
import { CountUp } from './CountUp'
import { HeroCanvas } from './HeroCanvas'
import { ScoreGauge } from './ScoreGauge'
import { KineticHeading } from './KineticHeading'
import { SafeBoundary } from './SafeBoundary'
import { useMouseParallax } from '../lib/useMouseParallax'

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
  const heroRef = useMouseParallax<HTMLElement>()
  return (
    <section className="hero" id="top" ref={heroRef}>
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
              <a className="btn btn-primary" data-magnetic href={MARKETPLACE} target="_blank" rel="noopener noreferrer">
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
          </div>

          <TiltCard className="hero-card" aria-label="Andy PR comment preview" revealDelay={0.18} maxTilt={7}>
            <span className="hcard-scan" aria-hidden="true" />
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
    </section>
  )
}

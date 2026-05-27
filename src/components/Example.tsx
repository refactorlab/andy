import type { CSSProperties } from 'react'
import { CountUp } from './CountUp'
import { ScrambleText } from './ScrambleText'
import { ArchDiagram } from './ArchDiagram'

export function Example() {
  return (
    <section className="section" id="example">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <ScrambleText className="kicker" text="// inside an andy review" />
          <h2>A peek at the output.</h2>
          <p className="section-lede">
            Two artifacts pulled from a real review on a 100-file PR. The full
            comment also includes the architecture map, risk quadrant, and
            three more ranked code suggestions.
          </p>
        </header>

        <div className="example-grid">
          <article className="example-card" data-reveal>
            <div className="example-head">
              <span>🎯 PR Value Card</span>
              <span className="example-scale">▲ improvement</span>
            </div>
            <div className="axes">
              {[
                { label: '💰 Money', pct: 32 },
                { label: '👥 Customer value', pct: 48 },
                { label: '⚙️ Software runtime', pct: 60 },
                { label: '🎨 Runtime UX', pct: 25 },
              ].map((a) => (
                <div className="axis" key={a.label}>
                  <span className="axis-label">{a.label}</span>
                  <div className="axis-track"><div className="axis-fill axis-good" style={{ '--w': `${a.pct}%` } as CSSProperties} /></div>
                  <span className="axis-value">▲ <CountUp value={a.pct} suffix="%" /></span>
                </div>
              ))}
            </div>
            <p className="example-note">
              Net infra + dev-time: <strong>−$1,840 / mo</strong> · debug-loop:{' '}
              <strong>16 → 12 min median</strong> · scan artifact:{' '}
              <strong>9.83 → 3.9 MB</strong>.
            </p>
          </article>

          <article className="example-card" data-reveal style={{ '--reveal-delay': '0.1s' } as CSSProperties}>
            <div className="example-head">
              <span className="suggestion-cat">🅑 Product correctness</span>
              <span className="example-file">compact.rs</span>
              <span className="example-conf">0.77 conf</span>
            </div>
            <p className="example-why">
              <strong>Why it matters:</strong> <code>pagerank == 0.0</code> is
              a valid value for isolated nodes. Treating <code>0.0</code> as
              "not set" silently ships wrong output the moment another f64
              intrinsic copies this pattern.
            </p>
            <div className="diff">
              <div className="diff-line del"><span className="ln">42</span><span className="src">{`fn prefer_frame_f64(frame_v: f64, node_v: f64) -> f64 {`}</span></div>
              <div className="diff-line del"><span className="ln">43</span><span className="src">{`    if frame_v != 0.0 { frame_v } else { node_v }`}</span></div>
              <div className="diff-line add"><span className="ln">42</span><span className="src">{`fn prefer_frame_f64(frame_v: Option<f64>, node_v: f64) -> f64 {`}</span></div>
              <div className="diff-line add"><span className="ln">43</span><span className="src">{`    frame_v.unwrap_or(node_v)`}</span></div>
            </div>
          </article>
        </div>

        <ArchDiagram />

        <div className="example-cta" data-reveal>
          <a className="btn btn-primary" data-magnetic href="./pr36-github-ui_2.html" target="_blank" rel="noopener noreferrer">
            Open the full example review →
          </a>
        </div>
      </div>
    </section>
  )
}

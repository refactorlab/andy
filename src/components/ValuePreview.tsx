export function ValuePreview() {
  return (
    <section id="example">
      <div className="container">
        <p className="section-eyebrow">// inside an andy review</p>
        <h2 className="section-title">A glance at the output.</h2>
        <p className="section-lede">
          These two cards are taken straight from the Andy review on a real
          100-file PR. Want the full version with diagrams, risk map, and all
          three suggestions? Open the live example.
        </p>

        <div className="value-preview">
          <div className="value-card">
            <div className="value-card-header">
              <span>🎯 PR Value Card · % change by axis</span>
              <span className="scale">▲ improvement · ▼ regression</span>
            </div>
            <div className="bars">
              <div className="bar-row">
                <span className="bar-label">💰 Money</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '16%' }} />
                </div>
                <span className="bar-value">▲ 32%</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">👥 Customer value</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '24%' }} />
                </div>
                <span className="bar-value">▲ 48%</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">⚙️ Software runtime</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '30%' }} />
                </div>
                <span className="bar-value">▲ 60%</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">🎨 Runtime UX</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: '12.5%' }} />
                </div>
                <span className="bar-value">▲ 25%</span>
              </div>
            </div>
          </div>

          <div className="suggestion-preview">
            <div className="suggestion-preview-header">
              <span className="suggestion-cat">🅑 Product correctness</span>
              <span className="suggestion-file">
                <span className="dim">drift-static-profiler/src/</span>compact.rs
              </span>
              <span className="suggestion-conf">
                confidence <span className="num">0.77</span>
              </span>
            </div>
            <div className="suggestion-preview-body">
              <p>
                <strong>Why it matters:</strong> <code>pagerank == 0.0</code> is
                a valid value for isolated nodes. Treating <code>0.0</code> as
                "not set" will silently ship wrong output the moment a new f64
                intrinsic copies this pattern.
              </p>
              <div className="diff-block">
                <div className="line del">
                  <span className="gutter">42</span>
                  <span className="code">{`fn prefer_frame_f64(frame_v: f64, node_v: f64) -> f64 {`}</span>
                </div>
                <div className="line del">
                  <span className="gutter">43</span>
                  <span className="code">{`    if frame_v != 0.0 { frame_v } else { node_v }`}</span>
                </div>
                <div className="line add">
                  <span className="gutter">42</span>
                  <span className="code">{`fn prefer_frame_f64(frame_v: Option<f64>, node_v: f64) -> f64 {`}</span>
                </div>
                <div className="line add">
                  <span className="gutter">43</span>
                  <span className="code">{`    frame_v.unwrap_or(node_v)`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a className="btn btn-primary" href="./pr36-github-ui_2.html" target="_blank">
            Open the full example review →
          </a>
        </div>
      </div>
    </section>
  )
}

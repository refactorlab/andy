import { Typewriter } from './Typewriter'
import { ScrambleText } from './ScrambleText'

const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'

const yaml = `name: Drift
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  checks: write
  models: read

jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: refactorlab/drift@main`

const steps = [
  {
    n: '1',
    title: 'Add the workflow',
    body: 'Copy the YAML into .github/workflows/drift.yml. No tokens, no profile commands, no extra config.',
  },
  {
    n: '2',
    title: 'Open a PR',
    body: 'Andy auto-detects the latest profiler release, caches it via $RUNNER_TOOL_CACHE, and posts a sticky comment within ~30 seconds.',
  },
  {
    n: '3',
    title: 'Re-run on each push',
    body: 'The comment is overwritten in place (identified by a hidden marker). A "Drift / PR review" check run summarises the verdict.',
  },
]

export function Install() {
  return (
    <section className="section section-alt" id="install">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <ScrambleText className="kicker" text="// install in 30 seconds" />
          <h2>One YAML file. Then push.</h2>
          <p className="section-lede">
            Andy runs as a GitHub Action on your own runner. Nothing leaves the
            workflow — no service to authorize, no API key to manage.
          </p>
        </header>

        <div className="install-grid">
          <div className="code-card" aria-label=".github/workflows/drift.yml" data-reveal>
            <div className="code-head">
              <div className="code-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <span className="code-path">.github/workflows/drift.yml</span>
              <span className="code-lang">YAML</span>
            </div>
            <pre className="code-block"><Typewriter text={yaml} /></pre>
            <div className="code-foot">
              <a className="btn btn-primary btn-sm" data-magnetic href={MARKETPLACE} target="_blank" rel="noopener noreferrer">
                Install from Marketplace →
              </a>
              <a className="link-inline" href="https://github.com/refactorlab/andy" target="_blank" rel="noopener noreferrer">
                View source on GitHub
              </a>
            </div>
          </div>

          <ol className="steps" data-reveal-stagger>
            {steps.map((s) => (
              <li key={s.n} className="step">
                <span className="step-num">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="container">
        <p className="section-eyebrow">// setup in under a minute</p>
        <h2 className="section-title">How it works</h2>
        <p className="section-lede">
          Andy runs as a GitHub Action. Add the workflow, push a PR, and Andy
          posts the review as a bot comment on the pull request.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-num">STEP 01</div>
            <h3>Install from Marketplace</h3>
            <p>
              Find Andy on the GitHub Marketplace and click <em>Install</em> for
              the repos you want covered.
            </p>
            <a
              className="btn"
              href="https://github.com/marketplace/actions/andy-pr-handoff-by-drift"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Marketplace →
            </a>
          </div>

          <div className="step">
            <div className="step-num">STEP 02</div>
            <h3>Add the workflow</h3>
            <p>
              Drop this file into{' '}
              <code>.github/workflows/andy.yml</code>:
            </p>
            <pre className="step-code-block">
              <span className="c"># .github/workflows/andy.yml</span>
              {'\n'}
              <span className="k">name</span>: andy
              {'\n'}
              <span className="k">on</span>: [pull_request]
              {'\n'}
              <span className="k">jobs</span>:
              {'\n'}  review:
              {'\n'}    <span className="k">runs-on</span>: ubuntu-latest
              {'\n'}    <span className="k">steps</span>:
              {'\n'}      - <span className="k">uses</span>: refactorlab/andy@v1
              {'\n'}        <span className="k">with</span>:
              {'\n'}          github-token: <span className="s">$&#123;&#123; secrets.GITHUB_TOKEN &#125;&#125;</span>
            </pre>
          </div>

          <div className="step">
            <div className="step-num">STEP 03</div>
            <h3>Open a PR</h3>
            <p>
              On every pull request, Andy posts one comment with the
              diagrams, value card, suggestions, and risk map — all clickable,
              all sourced.
            </p>
            <a className="btn" href="./pr36-github-ui_2.html" target="_blank">
              See an example output →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

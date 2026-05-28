import type { CSSProperties } from 'react'
import { ScrambleText } from './ScrambleText'

const FAQS = [
  {
    q: 'Does Andy upload my code anywhere?',
    a: 'No. Andy runs entirely inside your GitHub Action runner — public or private. Nothing leaves the workflow.',
  },
  {
    q: 'What does it cost?',
    a: 'The Action is free and MIT-licensed. You pay only your usual GitHub Actions runner minutes (Andy typically finishes in ~30 seconds).',
  },
  {
    q: 'Does it work on private repos?',
    a: 'Yes. It runs on whatever runner the repo uses — public, private, or self-hosted.',
  },
  {
    q: "Will it slow down my pull requests?",
    a: 'No. Andy runs in parallel with your other checks and posts within ~30 seconds of a push, overwriting its previous comment.',
  },
  {
    q: 'How is it different from a Copilot-style review?',
    a: 'Andy ships a fixed bundle of artifacts — architecture map, value card, risk quadrant, ranked suggestions — with confidence-scored, applyable diffs and references. Not free-text vibes.',
  },
]

/**
 * Native HTML accordion via <details name="...">: opening one automatically
 * closes the others in the group — no JS, no library. The `name` attribute is
 * a 2024 feature; older browsers simply allow multiple open at once (graceful).
 */
export function Faq() {
  return (
    <section className="section section-tight" id="faq">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <ScrambleText className="kicker" text="// common questions, straight answers" />
          <h2>Things people ask before installing.</h2>
        </header>
        <ul className="faq-list">
          {FAQS.map((item, i) => (
            <li
              key={item.q}
              className="faq-row"
              data-reveal
              style={{ '--reveal-delay': `${i * 0.06}s` } as CSSProperties}
            >
              <details name="faq" className="faq-item">
                <summary className="faq-q">
                  <span>{item.q}</span>
                  <span className="faq-chevron" aria-hidden="true">+</span>
                </summary>
                <div className="faq-a">{item.a}</div>
              </details>
            </li>
          ))}
        </ul>
        <p className="faq-more" data-reveal>
          Still have a question? <a href="#contact">Talk to us →</a>
        </p>
      </div>
    </section>
  )
}

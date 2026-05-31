const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'

/**
 * Floating "Install" pill that fades in after the hero scrolls past. Pure
 * CSS scroll-driven animation — no JS scroll listener, no React re-render.
 * Compositor-only fade. Hidden on touch viewports where the floating UI
 * would crowd the bottom edge.
 */
export function StickyCTA() {
  return (
    <a
      className="sticky-cta"
      href={MARKETPLACE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Install Andy from the GitHub Marketplace"
    >
      <span className="sticky-cta-dot" aria-hidden="true" />
      <span className="sticky-cta-text">Install Andy</span>
      <span className="sticky-cta-arrow" aria-hidden="true">→</span>
    </a>
  )
}

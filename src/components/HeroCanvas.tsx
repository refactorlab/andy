/**
 * Hero backdrop dot-field. Rendered as a single CSS radial-gradient pattern
 * (one paint, no JS, no rAF, no pointer listeners). The accent colour comes
 * from CSS custom properties so it stays theme-aware. A soft radial mask
 * fades the grid toward the edges so it reads as texture, not a panel.
 */
export function HeroCanvas() {
  return <div className="hero-canvas" aria-hidden="true" />
}

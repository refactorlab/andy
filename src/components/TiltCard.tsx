import type { CSSProperties, ReactNode } from 'react'

interface TiltCardProps {
  className?: string
  children: ReactNode
  style?: CSSProperties
  /** Scroll-reveal delay in seconds. */
  revealDelay?: number
  'aria-label'?: string
}

/**
 * Card with a scroll-reveal entrance and a static spotlight glow. The earlier
 * pointer-tracked 3D tilt was great fidelity but required a `pointermove`
 * listener writing CSS variables on every move — measurable overhead for a
 * marketing flourish. The card now feels modern with just its entrance and
 * a CSS-only hover state.
 */
export function TiltCard({
  className = '',
  children,
  style,
  revealDelay,
  ...rest
}: TiltCardProps) {
  return (
    <div
      className="tilt-scene"
      data-reveal
      style={revealDelay ? ({ '--reveal-delay': `${revealDelay}s` } as CSSProperties) : undefined}
    >
      <div className={`tilt-card ${className}`} style={style} {...rest}>
        <span className="tilt-glow" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

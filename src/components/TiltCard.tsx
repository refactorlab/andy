import type { CSSProperties, ReactNode } from 'react'
import { usePointerTilt } from '../lib/usePointerTilt'

interface TiltCardProps {
  className?: string
  children: ReactNode
  style?: CSSProperties
  /** Scroll-reveal delay in seconds. */
  revealDelay?: number
  /** Max tilt in degrees. */
  maxTilt?: number
  'aria-label'?: string
}

/**
 * Two layers on purpose:
 *  - `.tilt-scene` owns the scroll-reveal (slow translate/opacity) + perspective
 *  - `.tilt-card`  owns the pointer tilt (snappy rotate) + spotlight glow
 * Keeping them on separate elements means the two transforms never collide.
 */
export function TiltCard({
  className = '',
  children,
  style,
  revealDelay,
  maxTilt = 6,
  ...rest
}: TiltCardProps) {
  const ref = usePointerTilt<HTMLDivElement>({ maxTilt })

  return (
    <div
      className="tilt-scene"
      data-reveal
      style={revealDelay ? ({ '--reveal-delay': `${revealDelay}s` } as CSSProperties) : undefined}
    >
      <div ref={ref} className={`tilt-card ${className}`} style={style} {...rest}>
        <span className="tilt-glow" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

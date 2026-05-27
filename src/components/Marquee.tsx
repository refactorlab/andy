import { useEffect, useRef } from 'react'

interface MarqueeProps {
  items: string[]
  /** Base drift in px/frame. */
  speed?: number
}

/**
 * Infinite ticker that reacts to scroll velocity: it always drifts, but
 * scrolling adds momentum and a slight skew, then eases back — the kinetic
 * "speed lines" effect from motion-led sites. Content is duplicated for a
 * seamless wrap. Reduced motion → a static strip.
 */
export function Marquee({ items, speed = 0.5 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let x = 0
    let velocity = 0
    let half = track.scrollWidth / 2
    let lastScrollY = window.scrollY
    let raf = 0

    const remeasure = () => {
      half = track.scrollWidth / 2
    }
    const onScroll = () => {
      const y = window.scrollY
      velocity += y - lastScrollY
      lastScrollY = y
    }

    const loop = () => {
      x -= speed + velocity * 0.18
      velocity *= 0.9 // ease momentum back to drift
      if (half > 0) {
        if (x <= -half) x += half
        else if (x > 0) x -= half
      }
      const skew = Math.max(-6, Math.min(6, velocity * 0.2))
      track.style.transform = `translate3d(${x}px, 0, 0) skewX(${skew}deg)`
      raf = requestAnimationFrame(loop)
    }

    remeasure()
    document.fonts?.ready.then(remeasure).catch(() => {})
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
    }
  }, [speed])

  const doubled = [...items, ...items]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {doubled.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
            <span className="marquee-sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

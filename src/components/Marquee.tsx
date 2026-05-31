interface MarqueeProps {
  items: string[]
}

/**
 * Infinite ticker — pure CSS animation. Content is duplicated so the track
 * wraps seamlessly; the animation runs on the compositor with zero JS work.
 * Reduced motion disables the animation via the global rule in index.css.
 */
export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
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

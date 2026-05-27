import type { CSSProperties } from 'react'

export interface HeadingWord {
  text: string
  highlight?: boolean
}

interface KineticHeadingProps {
  words: HeadingWord[]
  className?: string
}

/**
 * Splits a headline into words and reveals each one with a clip-masked
 * slide-up + 3D rotate + blur-sharpen, staggered via `--i`. Each word is its
 * own overflow-clipped box so the motion reads as type "settling" into place.
 * Reduced-motion users see it static (the animated baseline is gated in CSS).
 * The full text stays selectable/legible — we only split on spaces.
 */
export function KineticHeading({ words, className = '' }: KineticHeadingProps) {
  return (
    <h1 className={`kinetic-heading ${className}`}>
      {words.map((word, i) => (
        <span className="kw" key={`${word.text}-${i}`}>
          <span
            className={`kw-inner${word.highlight ? ' hl' : ''}`}
            style={{ '--i': i } as CSSProperties}
          >
            {word.text}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  )
}

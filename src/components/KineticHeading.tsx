import { Fragment, type CSSProperties } from 'react'

export interface HeadingWord {
  text: string
  highlight?: boolean
}

interface KineticHeadingProps {
  words: HeadingWord[]
  className?: string
}

/**
 * Per-word slide-up reveal driven by a CSS keyframe + staggered via `--i`.
 * Each word is its own overflow-clipped box so motion reads as type
 * "settling" into place. Reduced motion → static (rule gated in CSS).
 */
export function KineticHeading({ words, className = '' }: KineticHeadingProps) {
  return (
    <h1 className={`kinetic-heading ${className}`}>
      {words.map((word, i) => (
        <Fragment key={`${word.text}-${i}`}>
          <span className="kw">
            <span
              className={`kw-inner${word.highlight ? ' hl' : ''}`}
              style={{ '--i': i } as CSSProperties}
            >
              {word.text}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </h1>
  )
}

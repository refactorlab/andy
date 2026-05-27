import { Fragment, useEffect, useRef, useState } from 'react'
import { tokenizeYaml } from '../lib/yaml'

interface TypewriterProps {
  text: string
  /** ms per character. */
  speed?: number
}

/**
 * Types `text` out character-by-character on first scroll-into-view, now with
 * live YAML syntax highlighting: the typed prefix is re-tokenised and coloured
 * each frame. The not-yet-typed remainder renders transparent so the block
 * holds its final size from frame one — zero layout shift. Full text is exposed
 * to assistive tech via aria-label; reduced motion shows it complete at once.
 */
export function Typewriter({ text, speed = 11 }: TypewriterProps) {
  const ref = useRef<HTMLElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length)
      return
    }

    let started = false
    let timer = 0
    let i = 0
    const step = () => {
      i += 1
      setCount(i)
      if (i < text.length) timer = window.setTimeout(step, speed)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            step()
            io.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [text, speed])

  const done = count >= text.length
  const typed = tokenizeYaml(text.slice(0, count))

  return (
    <code ref={ref} className="typewriter" aria-label={text}>
      <span aria-hidden="true">
        {typed.map((tok, idx) => (
          <Fragment key={idx}>
            {tok.t === 'plain' ? tok.v : <span className={`tok-${tok.t}`}>{tok.v}</span>}
          </Fragment>
        ))}
      </span>
      <span className={`tw-caret${done ? ' tw-caret-done' : ''}`} aria-hidden="true" />
      <span className="tw-rest" aria-hidden="true">{text.slice(count)}</span>
    </code>
  )
}

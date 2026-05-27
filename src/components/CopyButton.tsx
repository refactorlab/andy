import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
}

/** A radial burst of dots, remounted on each copy via its key. */
function Spark() {
  const bits = Array.from({ length: 10 })
  return (
    <span className="spark" aria-hidden="true">
      {bits.map((_, i) => {
        const angle = (Math.PI * 2 * i) / bits.length + Math.random() * 0.5
        const dist = 16 + Math.random() * 16
        return (
          <span
            key={i}
            className="spark-bit"
            style={{ '--tx': `${Math.cos(angle) * dist}px`, '--ty': `${Math.sin(angle) * dist}px` } as CSSProperties}
          />
        )
      })}
    </span>
  )
}

/**
 * Copy-to-clipboard with a morphing label (Copy → Copied) and a small spark
 * burst — the satisfying micro-celebration of a dev tool. Spark is skipped
 * under reduced motion; the button still announces success.
 */
export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [burst, setBurst] = useState(0)
  const timer = useRef<number>(0)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    setBurst((b) => b + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1700)
  }

  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' is-copied' : ''} ${className ?? ''}`}
      onClick={onClick}
      aria-label="Copy workflow YAML"
    >
      <span className="copy-ic copy-ic-copy" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      </span>
      <span className="copy-ic copy-ic-check" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m20 6-11 11-5-5" />
        </svg>
      </span>
      <span className="copy-label">{copied ? 'Copied' : 'Copy'}</span>
      {!reduceMotion && copied && <Spark key={burst} />}
    </button>
  )
}

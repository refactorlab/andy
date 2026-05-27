import { useEffect, useRef, useState } from 'react'
import { advanceKonami, normalizeKey } from '../lib/konami'

const COLORS = ['#ff6b3d', '#ffb547', '#00a86b', '#1d4ed8', '#ff9558']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  color: string
}

/**
 * Hidden dev-culture delight: the Konami code (↑↑↓↓←→←→ B A) fires a confetti
 * burst + a toast. Entirely opt-in, never affects normal use. Confetti is
 * canvas-based and self-stops; under reduced motion only the toast shows.
 */
export function EasterEgg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [toast, setToast] = useState(false)
  const progress = useRef(0)
  const toastTimer = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const result = advanceKonami(progress.current, normalizeKey(e.key))
      progress.current = result.progress
      if (result.triggered) trigger()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = () => {
    setToast(true)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(false), 3200)
  }

  const trigger = () => {
    showToast()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    runConfetti()
  }

  const runConfetti = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const parts: Particle[] = Array.from({ length: 150 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 240,
      y: H * 0.32 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -13 - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      size: 5 + Math.random() * 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }))

    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, W, H)
      for (const p of parts) {
        p.vy += 0.32 // gravity
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 2600)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
      if (elapsed < 2600) requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W, H)
    }
    requestAnimationFrame(tick)
  }

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  return (
    <>
      <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
      <div className={`egg-toast${toast ? ' is-shown' : ''}`} role="status" aria-live="polite">
        {toast ? '🚀 Turbo review mode unlocked' : ''}
      </div>
    </>
  )
}

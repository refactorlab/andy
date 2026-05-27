import { useEffect, useRef } from 'react'

/**
 * Interactive dot-field behind the hero. Dots sit on a grid, drift on a slow
 * ambient wave, and bow away from / brighten near the cursor (a soft gravity
 * lens). Pure canvas — no deps.
 *
 * Performance & a11y guards:
 *  - DPR-capped at 2; rebuilds the grid on resize
 *  - rAF loop pauses when the hero leaves the viewport or the tab is hidden
 *  - reduced motion → one static frame, no loop, no pointer reactivity
 *  - re-reads the accent colour when the theme flips
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    // Low-power devices skip the interactive dot-field entirely.
    if (document.documentElement.classList.contains('perf-lite')) return
    const context = canvasEl.getContext('2d')
    if (!context) return
    // Non-null aliases so the render closures keep their narrowed types.
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = context

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const GAP = 33
    const RADIUS = 150 // cursor influence radius

    let width = 0
    let height = 0
    let dots: { x: number; y: number }[] = []
    const pointer = { x: -9999, y: -9999, active: false }
    let raf = 0
    let running = false
    let accent = readAccent()

    function readAccent() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
      return v || '#ff6b3d'
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = []
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          dots.push({ x, y })
        }
      }
      if (!running) draw(performance.now())
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, width, height)
      for (const d of dots) {
        const dx = d.x - pointer.x
        const dy = d.y - pointer.y
        const dist = Math.hypot(dx, dy)

        let push = 0
        let size = 0.9
        let alpha = 0.13

        if (pointer.active && dist < RADIUS) {
          const f = 1 - dist / RADIUS
          push = f * 12
          size = 0.9 + f * 2.4
          alpha = 0.13 + f * 0.6
        }

        const wave = reduceMotion ? 0 : Math.sin((d.x + d.y) * 0.012 + t * 0.0014) * 0.5
        const inv = dist > 0 ? 1 / dist : 0
        const nx = d.x + dx * inv * push
        const ny = d.y + dy * inv * push + wave

        ctx.beginPath()
        ctx.arc(nx, ny, size, 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.globalAlpha = alpha
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (running) raf = requestAnimationFrame(draw)
    }

    function start() {
      if (running || reduceMotion) return
      running = true
      raf = requestAnimationFrame(draw)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (reduceMotion) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active =
        pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height
    }
    const onPointerLeave = () => {
      pointer.active = false
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    )
    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    // Runtime governor asked us to back off → stop for good (CSS hides us).
    const onPerfLite = () => {
      io.disconnect()
      stop()
    }
    const themeObserver = new MutationObserver(() => {
      accent = readAccent()
    })

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('andy-perf-lite', onPerfLite)
    io.observe(canvas)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('andy-perf-lite', onPerfLite)
      io.disconnect()
      themeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}

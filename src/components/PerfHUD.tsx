import { useEffect, useState } from 'react'

/**
 * On-brand developer HUD (hidden by default; toggle via the ⌘K command
 * "Toggle performance HUD"). Shows live FPS plus the core Web Vitals — LCP,
 * CLS, and a max-event-latency proxy for INP — captured with PerformanceObserver.
 * Vitals observers run from mount (cheap); the FPS sampler only runs while shown.
 */
export function PerfHUD() {
  const [visible, setVisible] = useState(false)
  const [fps, setFps] = useState(0)
  const [lcp, setLcp] = useState(0)
  const [cls, setCls] = useState(0)
  const [inp, setInp] = useState(0)

  useEffect(() => {
    const onToggle = () => setVisible((v) => !v)
    window.addEventListener('toggle-perf-hud', onToggle)
    return () => window.removeEventListener('toggle-perf-hud', onToggle)
  }, [])

  // Web Vitals — guarded per type; unsupported entry types just no-op.
  useEffect(() => {
    const observers: PerformanceObserver[] = []
    const observe = (type: string, cb: (l: PerformanceObserverEntryList) => void, extra?: object) => {
      try {
        const obs = new PerformanceObserver(cb)
        obs.observe({ type, buffered: true, ...extra } as PerformanceObserverInit)
        observers.push(obs)
      } catch {
        /* entry type unsupported */
      }
    }

    observe('largest-contentful-paint', (list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) setLcp(last.startTime)
    })

    let clsTotal = 0
    observe('layout-shift', (list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) clsTotal += e.value
      }
      setCls(clsTotal)
    })

    let inpMax = 0
    observe(
      'event',
      (list) => {
        for (const e of list.getEntries()) inpMax = Math.max(inpMax, e.duration)
        setInp(inpMax)
      },
      { durationThreshold: 16 },
    )

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // FPS sampler — only while the HUD is on screen.
  useEffect(() => {
    if (!visible) return
    let raf = 0
    let frames = 0
    let last = performance.now()
    const loop = (now: number) => {
      frames += 1
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  if (!visible) return null

  const fpsTone = fps === 0 ? '' : fps >= 55 ? 'perf-good' : fps >= 40 ? 'perf-warn' : 'perf-bad'

  return (
    <aside className="perf-hud" role="status" aria-live="off" aria-label="Performance metrics">
      <div className="perf-row"><span>FPS</span><strong className={fpsTone}>{fps || '—'}</strong></div>
      <div className="perf-row"><span>LCP</span><strong>{lcp ? `${(lcp / 1000).toFixed(2)}s` : '—'}</strong></div>
      <div className="perf-row"><span>CLS</span><strong>{cls.toFixed(3)}</strong></div>
      <div className="perf-row"><span>INP*</span><strong>{inp ? `${Math.round(inp)}ms` : '—'}</strong></div>
      <div className="perf-hud-foot">⌘K › perf</div>
    </aside>
  )
}

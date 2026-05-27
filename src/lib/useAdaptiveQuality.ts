import { useEffect } from 'react'
import { engagePerfLite } from './perf'

/**
 * Runtime quality governor. After the entrance animations settle, it samples
 * frame rate for a short window; if the device can't sustain a smooth frame
 * rate it engages `perf-lite` (which the shader + canvas listen for and tear
 * down). Complements the static, pre-mount detection in perf.ts — this catches
 * devices that *pass* the static check but still struggle under the live load.
 */
export function useAdaptiveQuality() {
  useEffect(() => {
    if (document.documentElement.classList.contains('perf-lite')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let frames = 0
    let start = 0

    const sample = (now: number) => {
      if (!start) start = now
      frames += 1
      const elapsed = now - start
      if (elapsed >= 2500) {
        const fps = (frames * 1000) / elapsed
        if (fps < 38) engagePerfLite()
        return
      }
      raf = requestAnimationFrame(sample)
    }

    // Let the load-time cascade finish before judging steady-state FPS.
    const settle = window.setTimeout(() => {
      raf = requestAnimationFrame(sample)
    }, 2200)

    return () => {
      window.clearTimeout(settle)
      cancelAnimationFrame(raf)
    }
  }, [])
}

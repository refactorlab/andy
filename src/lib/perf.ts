export interface DeviceSignals {
  saveData?: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

/**
 * Pure capability evaluation (no globals → unit-testable). Conservative: only
 * genuinely weak environments (Save-Data on, ≤2 GB RAM, or ≤2 logical cores)
 * count as low-power, so we never downgrade a normal laptop or mid-range phone.
 */
export function evaluateLowPower(signals: DeviceSignals): boolean {
  if (signals.saveData) return true
  if (typeof signals.deviceMemory === 'number' && signals.deviceMemory > 0 && signals.deviceMemory <= 2) {
    return true
  }
  if (
    typeof signals.hardwareConcurrency === 'number' &&
    signals.hardwareConcurrency > 0 &&
    signals.hardwareConcurrency <= 2
  ) {
    return true
  }
  return false
}

/**
 * Reads device signals from `navigator` and evaluates them. When true we add
 * `perf-lite` to <html>, which drops the GPU shader, hero canvas, grain, and
 * motion-path pulses (the CSS aurora fallback covers the backdrop).
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  return evaluateLowPower({
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  })
}

/** Engages reduced-effects mode at runtime (used by the FPS governor). */
export function engagePerfLite() {
  if (typeof document === 'undefined') return
  if (document.documentElement.classList.contains('perf-lite')) return
  document.documentElement.classList.add('perf-lite')
  window.dispatchEvent(new Event('andy-perf-lite'))
}

/** True if the document is currently in reduced-effects mode. */
export function isPerfLite(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('perf-lite')
}

/** Applied before React mounts so heavy components can opt out at init. */
export function applyPerfMode() {
  if (isLowPowerDevice()) {
    document.documentElement.classList.add('perf-lite')
  }
}

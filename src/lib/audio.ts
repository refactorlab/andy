/**
 * Pure helpers for the audio-summary player. Kept framework-free (and unit
 * tested) so the React component stays a thin shell over deterministic logic.
 */

/** Length of the narrated example summary, in seconds (matches the transcript). */
export const AUDIO_DURATION = 52

/** Number of bars in the rendered waveform. */
export const WAVEFORM_BARS = 48

/**
 * Format a number of seconds as `m:ss` — 0 → "0:00", 52 → "0:52", 75 → "1:15".
 * Negatives clamp to 0; fractional seconds floor (a clock never shows 0:60).
 */
export function formatTimecode(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Deterministic, speech-like waveform envelope: `n` bar heights in [0.16, 1].
 *
 * Built from two detuned sines under a slow sine envelope so it reads as an
 * organic voice clip (lead-in, peaks, trail-off) rather than noise. It is
 * intentionally PURE — no `Math.random` — and rounded to 3 decimals so the
 * Bun-rendered SSR markup and the browser's hydration produce byte-identical
 * inline styles (cross-engine `Math.sin` can differ in the last ULP, which a
 * 3-decimal round collapses away → no hydration mismatch).
 */
export function waveform(n: number = WAVEFORM_BARS): number[] {
  const bars: number[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const peaks = 0.32 * Math.sin(i * 0.7) * Math.cos(i * 0.27) + 0.18 * Math.sin(i * 1.93 + 0.6)
    const envelope = 0.55 + 0.45 * Math.sin(Math.PI * t) // fade the start + end
    const raw = Math.abs(0.5 + peaks) * envelope
    const clamped = Math.min(1, Math.max(0.16, raw))
    bars.push(Math.round(clamped * 1000) / 1000)
  }
  return bars
}

/**
 * How many waveform bars are "played" at a given elapsed time — used to paint
 * the fill. Clamped to [0, n] so end-of-clip and seeks past the end are safe.
 */
export function playedBars(elapsed: number, n: number = WAVEFORM_BARS, duration: number = AUDIO_DURATION): number {
  if (duration <= 0) return 0
  const frac = Math.max(0, Math.min(1, elapsed / duration))
  return Math.min(n, Math.round(frac * n))
}

/** Minimal shape of a SpeechSynthesisVoice — kept local so this stays testable
 *  without the DOM lib. */
export interface VoiceLike {
  name: string
  lang: string
}

/**
 * Preferred male English voices, best-quality first. The Web Speech API has no
 * gender field, so the only way to get a male voice is to match a known one by
 * name. These are the high-quality system/neural voices across platforms:
 *   - macOS:   Alex (en-US), Daniel (en-GB)
 *   - Windows: Microsoft Guy / Ryan (neural, online), David (offline)
 *   - Chrome:  Google UK English Male
 *   - Android/India: Rishi
 */
export const MALE_VOICE_PRIORITY = [
  'Microsoft Guy Online',
  'Microsoft Ryan Online',
  'Google UK English Male',
  'Daniel',
  'Alex',
  'Microsoft David',
  'Aaron',
  'Tom',
  'Arthur',
  'Rishi',
  'Fred',
]

const isEnglish = (lang: string) => /^en([-_]|$)/i.test(lang)

/**
 * Choose the best available male English voice from the system list.
 *   1) a known high-quality male voice, in priority order;
 *   2) otherwise any voice that advertises "male" in its name (but not "female");
 *   3) otherwise `undefined` — caller leaves the browser default in place.
 * English voices are preferred; if none are tagged English we still scan all.
 */
export function pickMaleVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  if (!voices || voices.length === 0) return undefined
  const english = voices.filter((v) => isEnglish(v.lang))
  const pool = english.length ? english : voices

  for (const name of MALE_VOICE_PRIORITY) {
    const lower = name.toLowerCase()
    const exact = pool.find((v) => v.name === name)
    if (exact) return exact
    const partial = pool.find((v) => v.name.toLowerCase().includes(lower))
    if (partial) return partial
  }

  const labelled = pool.find((v) => /\bmale\b/i.test(v.name) && !/female/i.test(v.name))
  return labelled ?? undefined
}

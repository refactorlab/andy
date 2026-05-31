import { describe, expect, test } from 'bun:test'
import { AUDIO_DURATION, WAVEFORM_BARS, formatTimecode, pickMaleVoice, playedBars, waveform } from './audio'

describe('formatTimecode', () => {
  test('formats sub-minute times with a zero-padded seconds field', () => {
    expect(formatTimecode(0)).toBe('0:00')
    expect(formatTimecode(7)).toBe('0:07')
    expect(formatTimecode(52)).toBe('0:52')
  })

  test('rolls over into minutes', () => {
    expect(formatTimecode(60)).toBe('1:00')
    expect(formatTimecode(75)).toBe('1:15')
  })

  test('floors fractional seconds (never shows :60)', () => {
    expect(formatTimecode(59.9)).toBe('0:59')
  })

  test('clamps negatives to 0:00', () => {
    expect(formatTimecode(-3)).toBe('0:00')
  })
})

describe('waveform', () => {
  test('returns the requested number of bars', () => {
    expect(waveform(WAVEFORM_BARS)).toHaveLength(WAVEFORM_BARS)
    expect(waveform(12)).toHaveLength(12)
  })

  test('keeps every bar within the visible [0.16, 1] range', () => {
    for (const h of waveform(WAVEFORM_BARS)) {
      expect(h).toBeGreaterThanOrEqual(0.16)
      expect(h).toBeLessThanOrEqual(1)
    }
  })

  test('is deterministic and pre-rounded (SSR === client hydration)', () => {
    expect(waveform(WAVEFORM_BARS)).toEqual(waveform(WAVEFORM_BARS))
    for (const h of waveform(WAVEFORM_BARS)) {
      // 3-decimal rounding means no value carries float noise past the 3rd place.
      expect(Math.round(h * 1000)).toBe(h * 1000)
    }
  })
})

describe('pickMaleVoice', () => {
  const V = (name: string, lang = 'en-US') => ({ name, lang })

  test('returns undefined for an empty list', () => {
    expect(pickMaleVoice([])).toBeUndefined()
  })

  test('prefers a known high-quality male voice in priority order', () => {
    const voices = [V('Samantha'), V('Daniel', 'en-GB'), V('Alex'), V('Victoria')]
    // Daniel outranks Alex in the priority list.
    expect(pickMaleVoice(voices)?.name).toBe('Daniel')
  })

  test('matches priority names as a substring (e.g. OS suffixes)', () => {
    const voices = [V('Microsoft David Desktop - English (United States)'), V('Zira')]
    expect(pickMaleVoice(voices)?.name).toContain('David')
  })

  test('falls back to a voice tagged "male" but never "female"', () => {
    const voices = [V('Some Female Voice'), V('Custom Male Voice')]
    expect(pickMaleVoice(voices)?.name).toBe('Custom Male Voice')
  })

  test('does not mistake "female" for a male match', () => {
    expect(pickMaleVoice([V('Google US English Female')])).toBeUndefined()
  })

  test('prefers English voices over non-English ones', () => {
    const voices = [V('Thomas', 'fr-FR'), V('Daniel', 'en-GB')]
    expect(pickMaleVoice(voices)?.lang).toBe('en-GB')
  })
})

describe('playedBars', () => {
  test('is empty at the start and full at the end', () => {
    expect(playedBars(0)).toBe(0)
    expect(playedBars(AUDIO_DURATION)).toBe(WAVEFORM_BARS)
  })

  test('advances roughly linearly through the clip', () => {
    expect(playedBars(AUDIO_DURATION / 2)).toBe(WAVEFORM_BARS / 2)
  })

  test('clamps out-of-range elapsed values', () => {
    expect(playedBars(-10)).toBe(0)
    expect(playedBars(AUDIO_DURATION * 5)).toBe(WAVEFORM_BARS)
  })
})

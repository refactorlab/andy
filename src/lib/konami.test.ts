import { describe, expect, test } from 'bun:test'
import { advanceKonami, KONAMI_SEQUENCE, normalizeKey } from './konami'

describe('normalizeKey', () => {
  test('lowercases single characters, leaves named keys', () => {
    expect(normalizeKey('B')).toBe('b')
    expect(normalizeKey('ArrowUp')).toBe('ArrowUp')
  })
})

describe('advanceKonami', () => {
  const feed = (keys: string[]) =>
    keys.reduce(
      (acc, k) => {
        const r = advanceKonami(acc.progress, normalizeKey(k))
        return { progress: r.progress, triggered: acc.triggered || r.triggered }
      },
      { progress: 0, triggered: false },
    )

  test('triggers on the full sequence', () => {
    expect(feed([...KONAMI_SEQUENCE]).triggered).toBe(true)
  })

  test('does not trigger on a partial sequence', () => {
    expect(feed(['ArrowUp', 'ArrowUp', 'ArrowDown']).triggered).toBe(false)
  })

  test('resets on a wrong key', () => {
    const r = advanceKonami(3, 'x')
    expect(r.progress).toBe(0)
    expect(r.triggered).toBe(false)
  })

  test('a mismatch that is itself the start counts as progress 1', () => {
    expect(advanceKonami(3, 'ArrowUp').progress).toBe(1)
  })

  test('recovers after a stumble', () => {
    expect(feed(['ArrowUp', 'x', ...KONAMI_SEQUENCE]).triggered).toBe(true)
  })
})

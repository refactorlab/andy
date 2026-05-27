import { describe, expect, test } from 'bun:test'
import { scrambleFrame } from './scramble'

describe('scrambleFrame', () => {
  const text = 'hello world'

  test('preserves length regardless of progress (no layout shift)', () => {
    for (let r = 0; r <= text.length; r++) {
      expect(scrambleFrame(text, r).length).toBe(text.length)
    }
  })

  test('revealed prefix matches the source', () => {
    expect(scrambleFrame(text, 5).slice(0, 5)).toBe('hello')
  })

  test('never scrambles whitespace', () => {
    const out = scrambleFrame(text, 0, 'X', () => 0)
    expect(out[5]).toBe(' ')
    expect(out).toBe('XXXXX XXXXX')
  })

  test('fully revealed equals the source', () => {
    expect(scrambleFrame(text, text.length)).toBe(text)
  })

  test('uses the injected RNG deterministically', () => {
    expect(scrambleFrame('ab', 0, 'XYZ', () => 0)).toBe('XX')
  })
})

import { describe, expect, test } from 'bun:test'
import { evaluateLowPower } from './perf'

describe('evaluateLowPower', () => {
  test('flags Save-Data', () => {
    expect(evaluateLowPower({ saveData: true })).toBe(true)
  })

  test('flags low memory (≤2 GB) and low core counts (≤2)', () => {
    expect(evaluateLowPower({ deviceMemory: 2 })).toBe(true)
    expect(evaluateLowPower({ hardwareConcurrency: 2 })).toBe(true)
  })

  test('does NOT flag normal hardware', () => {
    expect(evaluateLowPower({ deviceMemory: 8, hardwareConcurrency: 8 })).toBe(false)
  })

  test('ignores missing / zero signals (no false positives)', () => {
    expect(evaluateLowPower({})).toBe(false)
    expect(evaluateLowPower({ deviceMemory: 0, hardwareConcurrency: 0 })).toBe(false)
  })
})

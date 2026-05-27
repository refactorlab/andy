import { describe, expect, test } from 'bun:test'
import { tokenizeYaml } from './yaml'

const join = (src: string) => tokenizeYaml(src).map((t) => t.v).join('')

describe('tokenizeYaml', () => {
  test('round-trips the original source exactly', () => {
    const src = 'name: Drift\non:\n  pull_request:\n    types: [opened, synchronize]'
    expect(join(src)).toBe(src)
  })

  test('classifies a key/value line', () => {
    const tokens = tokenizeYaml('name: Drift')
    expect(tokens.find((t) => t.v === 'name')?.t).toBe('key')
    expect(tokens.find((t) => t.v === 'Drift')?.t).toBe('str')
  })

  test('detects comments, numbers, and punctuation', () => {
    expect(tokenizeYaml('# a comment')[0].t).toBe('comment')
    const nums = tokenizeYaml('with: { fetch-depth: 0 }')
    expect(nums.find((t) => t.v === '0')?.t).toBe('num')
    expect(nums.some((t) => t.v === '{' && t.t === 'punct')).toBe(true)
  })

  test('tolerates a partial (mid-type) prefix without throwing', () => {
    expect(() => tokenizeYaml('jobs:\n  drift:\n    runs-on: ubun')).not.toThrow()
    expect(join('jobs:\n  drift:\n    runs-on: ubun')).toBe('jobs:\n  drift:\n    runs-on: ubun')
  })

  test('handles a list-item dash', () => {
    const tokens = tokenizeYaml('      - uses: actions/checkout@v4')
    expect(tokens.some((t) => t.v === '- ' && t.t === 'punct')).toBe(true)
    expect(tokens.find((t) => t.v === 'uses')?.t).toBe('key')
  })
})

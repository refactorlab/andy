export type YamlToken = { v: string; t: 'plain' | 'comment' | 'punct' | 'key' | 'num' | 'str' }

/**
 * Lightweight, dependency-free YAML tokenizer. Tolerant of partial input
 * (mid-type prefixes), so it can re-run on a growing typed slice every frame.
 * Pure — no DOM, no globals — which makes it unit-testable.
 */
export function tokenizeYaml(src: string): YamlToken[] {
  const tokens: YamlToken[] = []
  const lines = src.split('\n')

  lines.forEach((line, li) => {
    if (li > 0) tokens.push({ v: '\n', t: 'plain' })

    let rest = line
    const indent = rest.match(/^\s+/)
    if (indent) {
      tokens.push({ v: indent[0], t: 'plain' })
      rest = rest.slice(indent[0].length)
    }
    if (rest.startsWith('#')) {
      tokens.push({ v: rest, t: 'comment' })
      return
    }
    const dash = rest.match(/^- /)
    if (dash) {
      tokens.push({ v: '- ', t: 'punct' })
      rest = rest.slice(2)
    }
    const key = rest.match(/^([A-Za-z0-9_.-]+)(\s*:)/)
    if (key) {
      tokens.push({ v: key[1], t: 'key' })
      tokens.push({ v: key[2], t: 'punct' })
      rest = rest.slice(key[0].length)
    }
    const re = /(\{|\}|\[|\]|,|:)|(\b\d+\b)|([^\s{}[\],:]+)|(\s+)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(rest))) {
      if (m[1]) tokens.push({ v: m[1], t: 'punct' })
      else if (m[2]) tokens.push({ v: m[2], t: 'num' })
      else if (m[3]) tokens.push({ v: m[3], t: 'str' })
      else tokens.push({ v: m[0], t: 'plain' })
    }
  })
  return tokens
}

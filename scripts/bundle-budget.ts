/**
 * Bundle-size budget guard — run in CI after `bun run build`:
 *   bun scripts/bundle-budget.ts
 *
 * Fails the build if the gzipped INITIAL JS or TOTAL CSS payload exceeds its
 * budget. Budgets are set with real headroom over the measured baseline so the
 * gate catches *regressions* (an accidental heavy import, a CSS framework),
 * not the normal few-hundred-byte growth of shipping a feature. When a change
 * legitimately pushes a payload over budget, re-baseline by bumping the
 * constant below in the same commit — and note why.
 *
 * Reliability (why this is a script, not an inline CI one-liner):
 *  - CSS is measured wherever it can ship: inlined <style> blocks (the
 *    inline-main-css plugin) AND any dist/assets/*.css left on disk. CSS can't
 *    slip past the budget just by changing how it's delivered.
 *  - The <style> matcher tolerates attributes (e.g. a future CSP nonce) — a
 *    bare-tag regex would silently match nothing and pass with 0 bytes.
 *  - Measuring 0 bytes of CSS is treated as a BROKEN PROBE, not a pass: the
 *    page always ships CSS, so zero means extraction failed.
 *  - "Initial JS" = the entry module + every chunk index.html eagerly loads
 *    (<script type=module> + <link rel=modulepreload>), i.e. the true cold-load
 *    payload — not just the entry chunk.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIST = 'dist'
const ASSETS = join(DIST, 'assets')

// ── Budgets (gzipped bytes) ─────────────────────────────────────────────────
// CSS baseline ≈ 12.0 KB gz as of 2026-05 (includes the audio-summary UI).
// 15 KB ≈ 25% headroom — absorbs feature growth + gzip nondeterminism, still
// trips on a real regression (e.g. importing a CSS framework).
const CSS_BUDGET = 15000
// Initial JS baseline ≈ 20 KB gz (entry + Preact `framework` chunk); decorative
// components are lazy. 80 KB leaves wide room before we'd regress the SPA win.
const JS_BUDGET = 82000

const gz = (buf: Buffer): number => gzipSync(buf).length
const pct = (n: number, budget: number): string => `${((n / budget) * 100).toFixed(1)}%`

const fail = (msg: string): never => {
  console.error(msg)
  process.exit(1)
}

const html = (() => {
  try {
    return readFileSync(join(DIST, 'index.html'), 'utf8')
  } catch {
    return fail('::error::dist/index.html not found — run `bun run build` first.')
  }
})()

function listFiles(dir: string, ext: string): string[] {
  let out: string[] = []
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ent of entries) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) out = out.concat(listFiles(p, ext))
    else if (ent.name.endsWith(ext)) out.push(p)
  }
  return out
}

// ── CSS: inlined <style> blocks + any standalone .css on disk ───────────────
const inlineCss = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
  .map((m) => m[1])
  .join('')
const standaloneCss = listFiles(ASSETS, '.css')
  .map((f) => readFileSync(f, 'utf8'))
  .join('')

const cssSource = inlineCss + standaloneCss
if (Buffer.byteLength(cssSource) === 0) {
  fail('::error::Bundle-budget probe measured 0 bytes of CSS — extraction is broken (the page always ships CSS). Check the <style> matcher / inline-main-css plugin.')
}
const cssGz = gz(Buffer.from(cssSource))

// ── Initial JS: the entry script + everything index.html eagerly preloads ───
const jsUrls = new Set<string>()
for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"/gi)) jsUrls.add(m[1])
for (const m of html.matchAll(/<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+\.js)"/gi)) jsUrls.add(m[1])
// Attribute order isn't guaranteed — also catch href-before-rel.
for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+\.js)"[^>]*\brel="modulepreload"/gi)) jsUrls.add(m[1])

let jsGz = 0
let jsCount = 0
for (const url of jsUrls) {
  const file = join(ASSETS, url.split('/').pop() as string)
  try {
    jsGz += gz(readFileSync(file))
    jsCount++
  } catch {
    /* referenced JS not under dist/assets — skip */
  }
}
// Fallback: if HTML parsing surfaced nothing, measure the entry chunk directly.
if (jsCount === 0) {
  const entry = listFiles(ASSETS, '.js').find((f) => /\/index-[^/]*\.js$/.test(f))
  if (!entry) fail('::error::No initial JS found to measure under dist/assets.')
  jsGz = gz(readFileSync(entry as string))
  jsCount = 1
}

// ── Report + enforce ────────────────────────────────────────────────────────
console.log(`Initial JS  gzip: ${jsGz}\t/ budget ${JS_BUDGET}\t(${pct(jsGz, JS_BUDGET)}, ${jsCount} file${jsCount === 1 ? '' : 's'})`)
console.log(`Total CSS   gzip: ${cssGz}\t/ budget ${CSS_BUDGET}\t(${pct(cssGz, CSS_BUDGET)})`)

let breached = false
if (jsGz > JS_BUDGET) {
  console.error(`::error file=dist/index.html::Initial JS gzip ${jsGz} > budget ${JS_BUDGET}. Lazy-load more, or re-baseline JS_BUDGET in scripts/bundle-budget.ts.`)
  breached = true
}
if (cssGz > CSS_BUDGET) {
  console.error(`::error file=dist/index.html::Total CSS gzip ${cssGz} > budget ${CSS_BUDGET}. Trim CSS, or re-baseline CSS_BUDGET in scripts/bundle-budget.ts.`)
  breached = true
}
process.exit(breached ? 1 : 0)

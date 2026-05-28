/**
 * CDP-driven screenshot generator for docs/screenshots/.
 *
 * Features:
 *  - theme: 'light' | 'dark'   — set via localStorage before navigation, so
 *                                  the page's bootstrap script picks it up
 *  - selector                  — scroll target into view before capturing
 *  - clipSelector              — crop to an element's bounding box (close-ups)
 *  - fullPage                  — captureBeyondViewport for tall overview shots
 *  - prepare                   — arbitrary JS to run before capture (e.g. open palette)
 *
 * Usage:
 *   bun scripts/screenshots.ts <devPort> <chromePort>
 */

import { mkdirSync, writeFileSync } from 'node:fs'

const DEV_PORT = process.argv[2] ?? '5174'
const CHROME_PORT = process.argv[3] ?? '9333'
const ORIGIN = `http://localhost:${DEV_PORT}`
const BASE = '/andy'
const OUT = 'docs/screenshots'

mkdirSync(OUT, { recursive: true })

type Theme = 'light' | 'dark'

interface Shot {
  name: string
  path: string
  width: number
  height: number
  theme?: Theme
  selector?: string
  clipSelector?: string
  fullPage?: boolean
  prepare?: string
  padding?: number
}

const SHOTS: Shot[] = [
  // ─── Light theme: section overviews ─────────────────────────────────────
  { name: 'hero-light', path: '/', width: 1440, height: 900, theme: 'light' },
  { name: 'bento-light', path: '/', width: 1440, height: 1200, theme: 'light', selector: '#what' },
  { name: 'install-light', path: '/', width: 1440, height: 1080, theme: 'light', selector: '#install' },
  { name: 'example-light', path: '/', width: 1440, height: 1500, theme: 'light', selector: '#example' },
  { name: 'palette-light', path: '/', width: 1440, height: 900, theme: 'light', prepare: `window.dispatchEvent(new Event('open-command-palette'));` },
  { name: 'overview-light', path: '/', width: 1440, height: 1100, theme: 'light', fullPage: true },

  // ─── Dark theme: same sections ─────────────────────────────────────────
  { name: 'hero-dark', path: '/', width: 1440, height: 900, theme: 'dark' },
  { name: 'bento-dark', path: '/', width: 1440, height: 1200, theme: 'dark', selector: '#what' },
  { name: 'install-dark', path: '/', width: 1440, height: 1080, theme: 'dark', selector: '#install' },
  { name: 'example-dark', path: '/', width: 1440, height: 1500, theme: 'dark', selector: '#example' },
  { name: 'palette-dark', path: '/', width: 1440, height: 900, theme: 'dark', prepare: `window.dispatchEvent(new Event('open-command-palette'));` },

  // ─── Close-up zooms (cropped to a single element's bounding box) ───────
  { name: 'hero-card', path: '/', width: 1440, height: 1000, theme: 'light', clipSelector: '.hero-card', padding: 16 },
  { name: 'arch-diagram', path: '/', width: 1440, height: 1400, theme: 'light', selector: '#example', clipSelector: '.arch-wrap', padding: 18 },
  { name: 'yaml-block', path: '/', width: 1440, height: 1100, theme: 'light', selector: '#install', clipSelector: '.code-card', padding: 18 },

  // ─── The real PR comment (separate page) ───────────────────────────────
  { name: 'comment', path: '/pr36-github-ui_2.html', width: 1440, height: 1800, theme: 'light' },
]

// ── CDP bootstrap ─────────────────────────────────────────────────────────
const tabs = (await (await fetch(`http://localhost:${CHROME_PORT}/json`)).json()) as Array<{
  webSocketDebuggerUrl: string
  type: string
}>
const pageTab = tabs.find((t) => t.type === 'page') ?? tabs[0]
if (!pageTab) throw new Error('No Chrome page tab — is Chrome launched with --remote-debugging-port?')

const ws = new WebSocket(pageTab.webSocketDebuggerUrl)
let nextId = 0
const pending = new Map<number, (v: { result?: unknown; error?: { message: string } }) => void>()

ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data as string) as { id?: number; result?: unknown; error?: { message: string } }
  if (typeof msg.id === 'number') {
    const resolve = pending.get(msg.id)
    if (resolve) {
      pending.delete(msg.id)
      resolve(msg)
    }
  }
})
await new Promise<void>((resolve, reject) => {
  ws.addEventListener('open', () => resolve())
  ws.addEventListener('error', (e) => reject(e))
})

async function cdp<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
  const id = ++nextId
  return new Promise<T>((resolve, reject) => {
    pending.set(id, (msg) => {
      if (msg.error) reject(new Error(`${method}: ${msg.error.message}`))
      else resolve(msg.result as T)
    })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

await cdp('Page.enable')
await cdp('Runtime.enable')

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Warm up: land on the origin once so we can write to localStorage.
await cdp('Page.navigate', { url: `${ORIGIN}${BASE}/` })
await sleep(1500)

for (const shot of SHOTS) {
  // 1. Set viewport
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: shot.width,
    height: shot.height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  // 2. Reduced motion → deterministic, no half-played animations.
  await cdp('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-reduced-motion', value: 'reduce' },
      { name: 'prefers-color-scheme', value: shot.theme ?? 'light' },
    ],
  })
  // 3. Theme: write to localStorage so the page's bootstrap picks it up on load.
  await cdp('Runtime.evaluate', {
    expression: `try { localStorage.setItem('andy-theme', ${JSON.stringify(shot.theme ?? 'light')}); } catch {}`,
  })

  // 4. Navigate
  await cdp('Page.navigate', { url: `${ORIGIN}${BASE}${shot.path}` })
  await sleep(2400) // let fonts/JS/IO settle

  if (shot.prepare) {
    await cdp('Runtime.evaluate', { expression: shot.prepare })
    await sleep(600)
  }

  if (shot.selector) {
    await cdp('Runtime.evaluate', {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(shot.selector)}); if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }); })()`,
    })
    await sleep(500)
  }

  const params: Record<string, unknown> = { format: 'png' }

  if (shot.clipSelector) {
    // Measure the element's page-coordinates rect and use as clip.
    const evalRes = (await cdp('Runtime.evaluate', {
      expression: `JSON.stringify((() => { const el = document.querySelector(${JSON.stringify(shot.clipSelector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }; })())`,
      returnByValue: true,
    })) as { result: { value: string | null } }
    const raw = evalRes.result?.value
    if (!raw) {
      console.log(`✗ ${shot.name.padEnd(14)}  selector ${shot.clipSelector} not found`)
      continue
    }
    const rect = JSON.parse(raw) as { x: number; y: number; w: number; h: number }
    const pad = shot.padding ?? 0
    params.clip = {
      x: Math.max(0, rect.x - pad),
      y: Math.max(0, rect.y - pad),
      width: rect.w + pad * 2,
      height: rect.h + pad * 2,
      scale: 1,
    }
    params.captureBeyondViewport = true
  } else if (shot.fullPage) {
    params.captureBeyondViewport = true
  }

  const res = (await cdp<{ data: string }>('Page.captureScreenshot', params)) as { data: string }
  writeFileSync(`${OUT}/${shot.name}.png`, Buffer.from(res.data, 'base64'))
  const kb = Math.round(res.data.length * 0.75 / 1024)
  console.log(`✓ ${shot.name.padEnd(14)}  ${shot.width}×${shot.fullPage ? 'full' : shot.height}  ~${kb}KB  theme=${shot.theme ?? 'light'}`)
}

ws.close()

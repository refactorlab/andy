/**
 * Banner generator for docs/screenshots/*.png — the section banners embedded
 * in the PR-comment markdown (pr-comment-python-fastapi.md).
 *
 * Each banner is a gradient "pill" that HUGS its title — no subtitle, no arrow,
 * and no empty trailing space: the pill ends where its content ends. Most are
 * title-only; the audio banner also carries a white waveform after its title.
 * Render is done in headless Chrome (transparent background, so the PNGs sit
 * cleanly on both light and dark GitHub themes); the capture is cropped tight
 * to the pill's bounding box — no surrounding gap, no glow.
 *
 * Because widths now vary per title, the markdown sizes these images by
 * `height=` (not `width=`) so the chips stay a consistent height.
 *
 * This script launches its own Chrome instance, so it is self-contained:
 *   bun scripts/banners.ts [chromePort]
 *
 * To change a banner's wording, edit BANNERS below and re-run.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CHROME_PORT = process.argv[2] ?? '9444'
const OUT = 'docs/screenshots'
// Generous viewport so the widest pill never wraps; we crop to the pill after.
const VIEW_W = 1840
const VIEW_H = 360
const GLOW_PAD = 0 // crop tight to the pill — no surrounding gap or glow

// The six section banners. Filename ↔ title; `waveform` adds the audio bars.
const BANNERS: Array<{ name: string; title: string; waveform?: boolean }> = [
  { name: 'drift-review', title: 'Drift review' },
  { name: 'summary-audio', title: 'Audio summary', waveform: true },
  { name: 'architecture', title: 'Architecture diagram' },
  { name: 'business-value', title: 'Business value' },
  { name: 'code-suggestions', title: 'Code suggestions' },
  { name: 'andy', title: 'Andy' },
]

// An audio-style waveform: rounded white bars of varying height, vertically
// centred — rendered as inline SVG so it scales crisply with the pill.
function waveformSvg(): string {
  const heights = [20, 38, 12, 54, 28, 44, 6, 58, 24, 40, 10, 48, 18, 6, 34, 14]
  const barW = 7
  const gap = 8
  const H = 60
  const W = heights.length * barW + (heights.length - 1) * gap
  const bars = heights
    .map((h, i) => {
      const x = i * (barW + gap)
      const y = (H - h) / 2
      return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="${barW / 2}" fill="#fff" fill-opacity="0.9"/>`
    })
    .join('')
  return `<svg class="wave" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`
}

// Content-hugging chip: 100° coral→amber gradient, rounded pill, heavy white
// title with symmetric padding so it ends at the text (plus optional waveform).
function bannerHtml(title: string, withWave: boolean): string {
  const safe = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const wave = withWave ? waveformSvg() : ''
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:transparent;}
    .pill{
      position:absolute;top:0;left:0;
      display:inline-flex;align-items:center;
      border-radius:34px;padding:30px 64px;
      background:linear-gradient(100deg,#f0532e 0%,#fb9e3b 100%);
    }
    .title{
      font-family:-apple-system,"SF Pro Display","SF Pro Rounded","Helvetica Neue",Arial,sans-serif;
      font-weight:800;font-size:66px;line-height:1;color:#fff;letter-spacing:-0.5px;
      text-shadow:0 1px 2px rgba(120,40,10,0.12);
    }
    .wave{margin-left:40px;flex:0 0 auto;display:block;}
  </style></head><body><div class="pill"><span class="title">${safe}</span>${wave}</div></body></html>`
}

mkdirSync(OUT, { recursive: true })

// ── Launch a dedicated headless Chrome ──────────────────────────────────────
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${CHROME_PORT}`,
  '--user-data-dir=/tmp/andy-banners-profile',
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Poll the DevTools endpoint until a page target is up.
async function waitForPageTab(): Promise<string> {
  for (let i = 0; i < 50; i++) {
    try {
      const tabs = (await (await fetch(`http://localhost:${CHROME_PORT}/json`)).json()) as Array<{
        webSocketDebuggerUrl: string
        type: string
      }>
      const tab = tabs.find((t) => t.type === 'page') ?? tabs[0]
      if (tab?.webSocketDebuggerUrl) return tab.webSocketDebuggerUrl
    } catch {
      /* not up yet */
    }
    await sleep(200)
  }
  throw new Error('Chrome DevTools endpoint never came up')
}

const wsUrl = await waitForPageTab()
const ws = new WebSocket(wsUrl)
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

try {
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: VIEW_W,
    height: VIEW_H,
    deviceScaleFactor: 1,
    mobile: false,
  })
  // Transparent canvas so the banner sits on any GitHub theme.
  await cdp('Emulation.setDefaultBackgroundColorOverride', {
    color: { r: 0, g: 0, b: 0, a: 0 },
  })

  for (const banner of BANNERS) {
    const dataUrl = `data:text/html;base64,${Buffer.from(bannerHtml(banner.title, !!banner.waveform)).toString('base64')}`
    await cdp('Page.navigate', { url: dataUrl })
    await sleep(300)
    // Wait for the system font so the measured pill width is correct.
    await cdp('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
    await sleep(120)

    // Measure the pill so we can crop to it (+ glow) instead of the viewport.
    const evalRes = (await cdp('Runtime.evaluate', {
      expression: `JSON.stringify((() => { const el = document.querySelector('.pill'); const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }; })())`,
      returnByValue: true,
    })) as { result: { value: string } }
    const rect = JSON.parse(evalRes.result.value) as { x: number; y: number; w: number; h: number }

    const res = (await cdp<{ data: string }>('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, rect.x - GLOW_PAD),
        y: Math.max(0, rect.y - GLOW_PAD),
        width: rect.w + GLOW_PAD * 2,
        height: rect.h + GLOW_PAD * 2,
        scale: 1,
      },
      captureBeyondViewport: true,
    })) as { data: string }
    writeFileSync(`${OUT}/${banner.name}.png`, Buffer.from(res.data, 'base64'))
    const w = Math.round(rect.w + GLOW_PAD * 2)
    const h = Math.round(rect.h + GLOW_PAD * 2)
    console.log(`✓ ${banner.name.padEnd(16)} ${w}×${h}  "${banner.title}"`)
  }
} finally {
  ws.close()
  chrome.kill()
}

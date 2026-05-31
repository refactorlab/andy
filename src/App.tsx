import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Artifacts } from './components/Artifacts'
import { AudioSummary } from './components/AudioSummary'
import { Install } from './components/Install'
import { Example } from './components/Example'
import { Faq } from './components/Faq'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { SafeBoundary } from './components/SafeBoundary'
import { SectionDock } from './components/SectionDock'
import { StatStrip } from './components/StatStrip'
import { StickyCTA } from './components/StickyCTA'
import { useScrollReveal } from './lib/useScrollReveal'

// Mount-after-idle for *passive* decoration only — the marquee renders even
// without user intent, so it makes sense to fetch its tiny chunk during idle.
const Marquee = lazy(() => import('./components/Marquee').then((m) => ({ default: m.Marquee })))
const PerfHUD = import.meta.env.DEV
  ? lazy(() => import('./components/PerfHUD').then((m) => ({ default: m.PerfHUD })))
  : null

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
  cancelIdleCallback?: (id: number) => void
}

function MountWhenIdle({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const w = window as IdleWindow
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => w.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setReady(true), 800)
    return () => clearTimeout(id)
  }, [])
  return ready ? <>{children}</> : null
}

function Deferred({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SafeBoundary label={label}>
      <MountWhenIdle>
        <Suspense fallback={null}>{children}</Suspense>
      </MountWhenIdle>
    </SafeBoundary>
  )
}

/**
 * Mounts a lazy component the first time any of the listed event names fire on
 * `window`. Until then, the chunk is never even fetched.
 *
 * This is stronger than "lazy after idle": the bytes only travel the network
 * if the user actually triggers the feature. The marketing flourishes (⌘K
 * palette, easter egg) cost 0 KB on first visit unless the user opens them.
 */
function TriggerMount({
  events,
  load,
  onMounted,
  label,
}: {
  events: string[]
  load: () => Promise<{ default: ComponentType }>
  onMounted?: () => void
  label: string
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null)

  useEffect(() => {
    if (Component) return
    let cancelled = false
    const trigger = () => {
      if (cancelled || Component) return
      load().then((m) => {
        if (!cancelled) setComponent(() => m.default)
      })
    }
    events.forEach((ev) => window.addEventListener(ev, trigger, { passive: true, once: true }))
    return () => {
      cancelled = true
      events.forEach((ev) => window.removeEventListener(ev, trigger))
    }
  }, [events, load, Component])

  // Once the child has mounted and its own effects are attached, replay the
  // original intent (e.g. open the palette). Wait a macrotask so child useEffects
  // have run and any window-level listeners they install are live.
  useEffect(() => {
    if (!Component || !onMounted) return
    const id = setTimeout(onMounted, 0)
    return () => clearTimeout(id)
  }, [Component, onMounted])

  if (!Component) return null
  return (
    <SafeBoundary label={label}>
      <Component />
    </SafeBoundary>
  )
}

/**
 * Listens for the first ⌘K / Ctrl+K (or palette open event from the nav
 * button), loads the palette chunk, then dispatches `open-command-palette`
 * once the palette's listeners are live — so the user only presses ⌘K once.
 */
function PaletteTrigger() {
  return (
    <TriggerMount
      label="palette"
      events={['open-command-palette', 'keydown-cmdk']}
      load={() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette }))}
      onMounted={() => window.dispatchEvent(new Event('open-command-palette'))}
    />
  )
}

function EasterEggTrigger() {
  return (
    <TriggerMount
      label="easter-egg"
      events={['keydown-arrow']}
      load={() => import('./components/EasterEgg').then((m) => ({ default: m.EasterEgg }))}
    />
  )
}

/**
 * Tiny pre-trigger: watches global keydowns and re-emits app-specific events
 * the TriggerMount loaders listen for. This is ~40 bytes of inline JS, vs
 * shipping the entire palette + easter-egg chunks on idle.
 */
function useTriggerEvents() {
  useEffect(() => {
    const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        // Don't preventDefault here — the palette will handle it after load.
        window.dispatchEvent(new Event('keydown-cmdk'))
      }
      if (ARROW_KEYS.has(e.key)) {
        window.dispatchEvent(new Event('keydown-arrow'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useScrollReveal()
  useTriggerEvents()
  return (
    <div className="page">
      <a className="skip-link" href="#main">Skip to content</a>

      {/* One static gradient layer painted to the root element via CSS. No blur,
       * no blend mode, no filter, no per-frame work. */}
      <div className="backdrop" aria-hidden="true" />

      <PaletteTrigger />
      <EasterEggTrigger />
      {PerfHUD && (
        <Deferred label="perf-hud"><PerfHUD /></Deferred>
      )}

      <Nav />
      <SectionDock />
      <StickyCTA />
      <main id="main">
        <Hero />
        <section className="section section-tight stat-section" aria-labelledby="stat-heading">
          <div className="wrap">
            {/* Visually-hidden heading: gives the stat band a slot in the
                document outline (between the h1 hero and the h2 sections) and
                names the landmark for assistive tech. */}
            <h2 id="stat-heading" className="sr-only">Andy at a glance</h2>
            <StatStrip />
          </div>
        </section>
        <Problem />
        <Artifacts />
        <AudioSummary />
        <Deferred label="marquee">
          <Marquee
            items={[
              'architecture map',
              'value card',
              'risk quadrant',
              'ranked suggestions',
              'hot-touch mindmap',
              'business context',
              'audio summary',
            ]}
          />
        </Deferred>
        <Install />
        <Example />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

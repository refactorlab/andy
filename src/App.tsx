import { lazy, Suspense, type ReactNode } from 'react'
import './App.css'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Artifacts } from './components/Artifacts'
import { Install } from './components/Install'
import { Example } from './components/Example'
import { Faq } from './components/Faq'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { SafeBoundary } from './components/SafeBoundary'
import { useScrollReveal } from './lib/useScrollReveal'
import { useMagnetic } from './lib/useMagnetic'
import { useAdaptiveQuality } from './lib/useAdaptiveQuality'

// Decorative / non-critical layers are code-split: they leave the initial
// bundle and load on their own chunk after content paints (faster LCP/TTI).
const Cursor = lazy(() => import('./components/Cursor').then((m) => ({ default: m.Cursor })))
const ShaderBackground = lazy(() => import('./components/ShaderBackground').then((m) => ({ default: m.ShaderBackground })))
const SectionRail = lazy(() => import('./components/SectionRail').then((m) => ({ default: m.SectionRail })))
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })))
const EasterEgg = lazy(() => import('./components/EasterEgg').then((m) => ({ default: m.EasterEgg })))
const PerfHUD = lazy(() => import('./components/PerfHUD').then((m) => ({ default: m.PerfHUD })))
const Marquee = lazy(() => import('./components/Marquee').then((m) => ({ default: m.Marquee })))

/** Error-isolated + lazy: a failed import or render just yields nothing. */
function Deferred({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SafeBoundary label={label}>
      <Suspense fallback={null}>{children}</Suspense>
    </SafeBoundary>
  )
}

export default function App() {
  useScrollReveal()
  useMagnetic()
  useAdaptiveQuality()
  return (
    <div className="page">
      <a className="skip-link" href="#main">Skip to content</a>

      <Deferred label="cursor"><Cursor /></Deferred>
      <Deferred label="palette"><CommandPalette /></Deferred>
      <Deferred label="easter-egg"><EasterEgg /></Deferred>
      <Deferred label="perf-hud"><PerfHUD /></Deferred>
      <Deferred label="shader"><ShaderBackground /></Deferred>
      <div className="aurora" aria-hidden="true">
        <span className="aurora-blob aurora-blob-1" />
        <span className="aurora-blob aurora-blob-2" />
        <span className="aurora-blob aurora-blob-3" />
      </div>
      <div className="grain" aria-hidden="true" />
      <Deferred label="section-rail"><SectionRail /></Deferred>

      <Nav />
      <main id="main">
        <Hero />
        <Problem />
        <Artifacts />
        <Deferred label="marquee">
          <Marquee
            items={[
              'architecture map',
              'value card',
              'risk quadrant',
              'ranked suggestions',
              'hot-touch mindmap',
              'business context',
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

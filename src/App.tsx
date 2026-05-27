import './App.css'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Artifacts } from './components/Artifacts'
import { Install } from './components/Install'
import { Example } from './components/Example'
import { Footer } from './components/Footer'
import { useScrollReveal } from './lib/useScrollReveal'

export default function App() {
  useScrollReveal()
  return (
    <div className="page">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Artifacts />
        <Install />
        <Example />
      </main>
      <Footer />
    </div>
  )
}

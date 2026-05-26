import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ValuePreview } from './components/ValuePreview'
import { OpenSource } from './components/OpenSource'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ValuePreview />
        <OpenSource />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App

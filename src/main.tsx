import { StrictMode } from 'react'
import { hydrate, render } from 'preact'
import './index.css'
import './App.css'
import App from './App.tsx'
import { applyPerfMode } from './lib/perf'

// Decide effect quality before the first component mounts.
applyPerfMode()

const root = document.getElementById('root')!
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

// If the build pre-rendered the App into #root, attach (hydrate) the live tree
// onto the existing DOM. Otherwise fall back to a fresh render. This lets us
// ship a fully-painted HTML page that JS only enhances, instead of waiting
// for JS to paint anything at all.
if (root.firstElementChild) {
  hydrate(tree, root)
} else {
  render(tree, root)
}

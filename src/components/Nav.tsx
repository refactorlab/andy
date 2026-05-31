import { useEffect, useRef } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useScrollSpy } from '../lib/useScrollSpy'
import { isMac } from '../lib/platform'

// Cached so repeated hovers don't re-import. Vite returns the same Promise on
// subsequent calls anyway, but this saves the import-graph lookup.
let palettePrefetch: Promise<unknown> | null = null
function prefetchPalette() {
  if (palettePrefetch) return
  palettePrefetch = import('./CommandPalette')
}

const NAV_LINKS = [
  { id: 'problem', label: 'Problem' },
  { id: 'what', label: 'What you get' },
  { id: 'install', label: 'Install' },
  { id: 'example', label: 'Example' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

const SECTION_IDS = NAV_LINKS.map((link) => link.id)

/**
 * The nav's elevation state and the reading-progress bar are driven entirely
 * by native CSS scroll-driven animations (see `.nav` and `.nav-progress` in
 * App.css). No scroll listener, no React re-render per frame, no JS work
 * during scroll — the whole thing runs on the compositor.
 *
 * Section-spy is the only JS, and it's a one-shot IntersectionObserver. The
 * mobile sheet is a native `<dialog>` so there's no open-state in React.
 */
export function Nav() {
  const active = useScrollSpy(SECTION_IDS)
  const sheetRef = useRef<HTMLDialogElement>(null)

  // Close the sheet on hash change (an in-page nav click).
  useEffect(() => {
    const onHash = () => sheetRef.current?.close()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="nav-brand" href="#top" aria-label="Refactor Labs — Andy">
          <span className="nav-logo" aria-hidden="true">RL</span>
          <span className="nav-name">Refactor&nbsp;Labs</span>
          <span className="nav-divider" aria-hidden="true">/</span>
          <span className="nav-org">andy</span>
        </a>

        <div className="nav-links" aria-label="Sections">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'active' : undefined}
              aria-current={active === link.id ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-cmdk"
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            // Hover/focus is a strong signal the user is about to invoke the
            // palette — start the chunk download now so the click is instant.
            onPointerEnter={prefetchPalette}
            onFocus={prefetchPalette}
            aria-label="Open command palette"
            title="Command palette"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <ThemeToggle />
          <a
            className="nav-github"
            href="https://github.com/refactorlab/andy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            <span>GitHub</span>
          </a>

          <button
            type="button"
            className="nav-menu-btn"
            onClick={() => sheetRef.current?.showModal()}
            aria-label="Open sections menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="nav-progress" aria-hidden="true" />

      <dialog ref={sheetRef} className="nav-sheet" aria-label="Sections menu">
        <div className="nav-sheet-head">
          <strong>Sections</strong>
          <button
            type="button"
            className="nav-sheet-close"
            onClick={() => sheetRef.current?.close()}
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <ul className="nav-sheet-list">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} onClick={() => sheetRef.current?.close()}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </nav>
  )
}

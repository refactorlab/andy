import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toggleTheme } from '../lib/theme'

const MARKETPLACE = 'https://github.com/marketplace/actions/andy-pr-handoff-by-drift'
const REPO = 'https://github.com/refactorlab/andy'
const EXAMPLE = './pr36-github-ui_2.html'
const CALENDLY = 'https://calendly.com/schuldi/30mins'

interface Command {
  id: string
  label: string
  hint: string
  group: 'Jump to' | 'Actions'
  run: () => void
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

const COMMANDS: Command[] = [
  { id: 'go-problem', label: 'Problem', hint: 'Why PR reviews fall short', group: 'Jump to', run: () => scrollTo('problem') },
  { id: 'go-what', label: 'What you get', hint: 'The six artifacts', group: 'Jump to', run: () => scrollTo('what') },
  { id: 'go-audio', label: 'Audio summary', hint: 'The PR, read aloud', group: 'Jump to', run: () => scrollTo('audio') },
  { id: 'go-install', label: 'Install', hint: 'One YAML file', group: 'Jump to', run: () => scrollTo('install') },
  { id: 'go-example', label: 'Example', hint: 'A real review', group: 'Jump to', run: () => scrollTo('example') },
  { id: 'go-faq', label: 'FAQ', hint: 'Common questions', group: 'Jump to', run: () => scrollTo('faq') },
  { id: 'go-contact', label: 'Contact', hint: 'Email or book a meeting', group: 'Jump to', run: () => scrollTo('contact') },
  { id: 'a-install', label: 'Install from Marketplace', hint: 'Open GitHub Marketplace', group: 'Actions', run: () => openUrl(MARKETPLACE) },
  { id: 'a-example', label: 'See an example review', hint: 'Open the full PR comment', group: 'Actions', run: () => openUrl(EXAMPLE) },
  {
    id: 'a-audio',
    label: 'Play the audio summary',
    hint: 'Hear the PR narrated',
    group: 'Actions',
    run: () => {
      scrollTo('audio')
      // Let the scroll settle (and the section mount) before starting playback.
      window.setTimeout(() => window.dispatchEvent(new Event('play-audio-summary')), 360)
    },
  },
  { id: 'a-calendly', label: 'Book a 30-min meeting', hint: 'Open Calendly', group: 'Actions', run: () => openUrl(CALENDLY) },
  { id: 'a-github', label: 'View source on GitHub', hint: 'refactorlab/andy', group: 'Actions', run: () => openUrl(REPO) },
  { id: 'a-theme', label: 'Toggle theme', hint: 'Switch light / dark', group: 'Actions', run: () => toggleTheme() },
  { id: 'a-perf', label: 'Toggle performance HUD', hint: 'Live FPS + Web Vitals', group: 'Actions', run: () => window.dispatchEvent(new Event('toggle-perf-hud')) },
]

/**
 * ⌘K / Ctrl+K command palette built on the native <dialog> element:
 *  - showModal() gives a real top-layer modal, focus trap, and focus
 *    restoration to the opener for free (no manual bookkeeping)
 *  - entry/exit animate via @starting-style + transition-behavior:
 *    allow-discrete (see App.css) — modern, JS-free open/close motion
 * Fuzzy filter, ↑ ↓ / Tab to move, Enter to run, Esc closes natively.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q),
    )
  }, [query])

  const runCommand = useCallback((cmd: Command | undefined) => {
    if (!cmd) return
    setOpen(false)
    requestAnimationFrame(() => cmd.run())
  }, [])

  // Open shortcut + nav-button event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpenEvent = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpenEvent)
    }
  }, [])

  // Drive the native modal + sync state when the browser closes it (Esc).
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    const onClose = () => setOpen(false)
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  // On open: reset, focus the input, lock background scroll.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(id)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (active >= results.length) setActive(Math.max(0, results.length - 1))
  }, [results, active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(results[active])
    }
  }

  // Click outside the panel (on the backdrop region) closes.
  const onDialogClick = (e: React.MouseEvent) => {
    const d = dialogRef.current
    if (!d) return
    const r = d.getBoundingClientRect()
    const outside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    if (outside) setOpen(false)
  }

  return (
    <dialog ref={dialogRef} className="cmdk" aria-label="Command palette" onClick={onDialogClick} onCancel={() => setOpen(false)}>
      <div className="cmdk-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          className="cmdk-input"
          type="text"
          aria-label="Search sections and commands"
          placeholder="Jump to a section or run a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="cmdk-esc">esc</kbd>
      </div>

      <ul className="cmdk-list" id="cmdk-list" role="listbox">
        {results.length === 0 && <li className="cmdk-empty">No matches</li>}
        {results.map((cmd, i) => {
          const showGroup = i === 0 || results[i - 1].group !== cmd.group
          return (
            <li key={cmd.id} role="presentation">
              {showGroup && <div className="cmdk-group">{cmd.group}</div>}
              <button
                type="button"
                id={`cmdk-${cmd.id}`}
                role="option"
                aria-selected={i === active}
                tabIndex={-1}
                className={`cmdk-item${i === active ? ' is-active' : ''}`}
                onClick={() => runCommand(cmd)}
                onMouseMove={() => setActive(i)}
              >
                <span className="cmdk-item-label">{cmd.label}</span>
                <span className="cmdk-item-hint">{cmd.hint}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="cmdk-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> select</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </dialog>
  )
}

import { useScrollSpy } from '../lib/useScrollSpy'

interface DockItem {
  id: string
  label: string
}

const ITEMS: DockItem[] = [
  { id: 'top', label: 'Top' },
  { id: 'problem', label: 'Problem' },
  { id: 'what', label: 'What you get' },
  { id: 'audio', label: 'Audio' },
  { id: 'install', label: 'Install' },
  { id: 'example', label: 'Example' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

const SPY_IDS = ITEMS.map((i) => i.id)

/**
 * Right-edge vertical scroll dock. Each anchor doubles as a progress dot;
 * hovering one reveals the section label inline (CSS-only). The active item
 * is fed by the existing IntersectionObserver-backed `useScrollSpy`, so the
 * widget contributes one observer and zero scroll listeners.
 *
 * Hidden on touch / narrow viewports — wouldn't fit and adds little value
 * when the user can swipe-scroll.
 */
export function SectionDock() {
  const active = useScrollSpy(SPY_IDS)
  return (
    <aside className="dock" aria-label="Page sections">
      <ul className="dock-list">
        {ITEMS.map((item) => {
          const isActive = active === item.id || (active === '' && item.id === 'top')
          return (
            <li key={item.id} className={isActive ? 'dock-item is-active' : 'dock-item'}>
              <a href={`#${item.id}`} aria-current={isActive ? 'true' : undefined}>
                <span className="dock-dot" aria-hidden="true" />
                <span className="dock-label">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

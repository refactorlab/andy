import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently in the viewport's reading band.
 * Uses a tall negative rootMargin so a section becomes "active" only once it
 * reaches the middle of the screen, which matches how people read down a page.
 */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((section) => io.observe(section))
    return () => io.disconnect()
  }, [ids])

  return active
}

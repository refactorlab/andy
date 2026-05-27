export const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
] as const

/** Normalises a KeyboardEvent.key the way the matcher expects. */
export function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key
}

/**
 * Pure state machine for sequence detection. Given the current match length and
 * the next normalised key, returns the next length and whether the full
 * sequence just completed. Handles restart-on-mismatch (and the case where a
 * mismatch is itself the start of the sequence).
 */
export function advanceKonami(
  progress: number,
  key: string,
  sequence: readonly string[] = KONAMI_SEQUENCE,
): { progress: number; triggered: boolean } {
  let next = key === sequence[progress] ? progress + 1 : key === sequence[0] ? 1 : 0
  if (next === sequence.length) {
    return { progress: 0, triggered: true }
  }
  return { progress: next, triggered: false }
}

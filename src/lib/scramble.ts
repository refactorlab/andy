export const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}=+*^?#·:;~01'

/**
 * Pure frame computation for a left-to-right "decode" effect: characters before
 * `revealed` show their final value, the rest show random glyphs, and
 * whitespace is never scrambled (keeps word shapes stable → no layout shift).
 * `rand` is injectable so tests can be deterministic.
 */
export function scrambleFrame(
  text: string,
  revealed: number,
  glyphs: string = SCRAMBLE_GLYPHS,
  rand: () => number = Math.random,
): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === ' ' || i < revealed) out += ch
    else out += glyphs[(rand() * glyphs.length) | 0]
  }
  return out
}

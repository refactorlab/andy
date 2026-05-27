/** True on Apple platforms — used to show ⌘ vs Ctrl in shortcut hints. */
export const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

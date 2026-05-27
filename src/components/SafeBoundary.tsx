import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Optional label for diagnostics. */
  label?: string
}
interface State {
  failed: boolean
}

/**
 * Renders nothing if a child throws, so a failure in a non-essential visual
 * layer (WebGL shader, canvas field, palette, easter egg) degrades gracefully
 * instead of taking down the page. Wrap decorative/experimental subtrees only —
 * never core content.
 */
export class SafeBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env?.DEV) {
      console.warn(`[SafeBoundary${this.props.label ? ` · ${this.props.label}` : ''}] suppressed:`, error, info)
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

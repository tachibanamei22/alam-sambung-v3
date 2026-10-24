import { TriangleAlert } from 'lucide-react'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import i18n from '@/lib/i18n'

interface Props {
  children: ReactNode
}

/**
 * Catches a crash in the screen below it, so one bad link or one odd record
 * shows a way out instead of a blank page. Keyed by route where it is used,
 * so moving to another page tries again.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app]', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-soft text-warn">
          <TriangleAlert className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-head text-xl font-bold">{i18n.t('error.title')}</h2>
          <p className="text-sm text-muted">{i18n.t('error.body')}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-12 rounded-2xl bg-accent px-6 text-sm font-bold text-on-accent"
        >
          {i18n.t('error.reload')}
        </button>
      </div>
    )
  }
}

import type { ReactNode } from 'react'
import { LangToggle } from './LangToggle'
import { ThemeToggle } from './ThemeToggle'

interface AmberHeaderProps {
  eyebrow: string
  title: string
  /** Extra controls under the title row, e.g. search and member chips. */
  children?: ReactNode
  /** Extra controls placed before the language and theme toggles. */
  actions?: ReactNode
}

export function AmberHeader({ eyebrow, title, children, actions }: AmberHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-b-[32px] bg-amber px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text">{eyebrow}</span>
          <h1 className="font-head text-[30px] font-bold leading-tight text-text">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
      {children}
    </header>
  )
}

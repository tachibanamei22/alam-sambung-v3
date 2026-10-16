import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { AccountMenu } from './AccountMenu'
import { LangToggle } from './LangToggle'
import { ThemeToggle } from './ThemeToggle'

interface AmberHeaderProps {
  eyebrow: ReactNode
  title: string
  /** Extra controls under the title row, e.g. search and member chips. */
  children?: ReactNode
  /** Extra controls placed before the toggles and the account menu. */
  actions?: ReactNode
}

export function AmberHeader({ eyebrow, title, children, actions }: AmberHeaderProps) {
  // Staff pages get the account menu (language and theme live there on
  // phones); visitor pages have no account, so they keep the plain toggles.
  const staff = useLocation().pathname.startsWith('/staff')

  return (
    <header className="flex flex-col gap-4 rounded-b-[32px] bg-amber px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] print:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-bold text-text">{eyebrow}</span>
          <h1 className="truncate font-head text-[30px] font-bold leading-tight text-text">{title}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
          {staff ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <LangToggle />
                <ThemeToggle />
              </div>
              <AccountMenu />
            </>
          ) : (
            <>
              <LangToggle />
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
      {children}
    </header>
  )
}

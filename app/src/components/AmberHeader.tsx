import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useCurrentUser } from '@/lib/currentUser'
import { cn } from '@/lib/utils'
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
  // Signed-in staff get the account menu (language and theme live there on
  // phones). Visitors and the sign-in screen have no account, so they keep
  // the plain toggles.
  const isStaffPage = useLocation().pathname.startsWith('/staff')
  const hasAccount = useCurrentUser().status === 'signedIn' && isStaffPage

  return (
    // The band always spans its parent. On tablet column pages the parent sets
    // data-narrow, and the inner wrapper then lines up with the 720px column.
    <header className="rounded-b-[32px] bg-amber px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] print:hidden lg:px-7">
      <div className="mx-auto flex w-full flex-col gap-4 lg:group-data-[narrow=true]/page:max-w-[720px] lg:group-data-[narrow=true]/page:px-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold text-text">{eyebrow}</span>
            <h1 className="truncate font-head text-[30px] font-bold leading-tight text-text">{title}</h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
            <div className={cn('items-center gap-2', hasAccount ? 'hidden sm:flex' : 'flex')}>
              <LangToggle />
              <ThemeToggle />
            </div>
            {hasAccount && <AccountMenu />}
          </div>
        </div>
        {children}
      </div>
    </header>
  )
}

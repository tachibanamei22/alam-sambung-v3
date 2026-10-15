import { ChartColumn, LayoutGrid, Package, Receipt, ShoppingCart, Stamp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router'
import { NavRail } from '@/components/NavRail'
import { TabBar } from '@/components/TabBar'
import type { TabItem } from '@/components/TabBar'
import { LoginPage } from '@/features/auth/LoginPage'
import { useCurrentUser } from '@/lib/currentUser'
import { firebaseEnabled } from '@/lib/firebase'
import { cn } from '@/lib/utils'

interface ShellProps {
  tabs: TabItem[]
  /** Staff pages use a nav rail and the full width on tablets. */
  tablet?: boolean
  /** Constrain content width on tablets (everything except the sell station). */
  narrow?: boolean
}

function Shell({ tabs, tablet, narrow }: ShellProps) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-bg',
        tablet && 'lg:max-w-none lg:flex-row',
      )}
    >
      {tablet && <NavRail items={tabs} />}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          tablet && narrow && 'lg:mx-auto lg:w-full lg:max-w-[720px]',
        )}
      >
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <TabBar items={tabs} className={tablet ? 'lg:hidden' : undefined} />
      </div>
    </div>
  )
}

export function StaffLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const user = useCurrentUser()
  const tabs: TabItem[] = [
    { to: '/staff/sell', label: t('nav.sell'), Icon: ShoppingCart },
    { to: '/staff/stock', label: t('nav.stock'), Icon: Package },
    { to: '/staff/sales', label: t('nav.sales'), Icon: Receipt },
    { to: '/staff/summary', label: t('nav.summary'), Icon: ChartColumn },
  ]
  if (firebaseEnabled && user.status === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">…</div>
  }
  if (firebaseEnabled && user.status === 'signedOut') return <LoginPage />
  return <Shell tabs={tabs} tablet narrow={!pathname.startsWith('/staff/sell')} />
}

export function VisitorLayout() {
  const { t } = useTranslation()
  const tabs: TabItem[] = [
    { to: '/visit', label: t('nav.catalog'), Icon: LayoutGrid },
    { to: '/visit/stamps', label: t('nav.stamps'), Icon: Stamp },
  ]
  return <Shell tabs={tabs} />
}

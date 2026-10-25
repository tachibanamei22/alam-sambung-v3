import { ChartColumn, LayoutGrid, Package, Receipt, ShoppingCart, Stamp } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NavRail } from '@/components/NavRail'
import { TabBar } from '@/components/TabBar'
import type { TabItem } from '@/components/TabBar'
import { LoginPage } from '@/features/auth/LoginPage'
import { useCurrentUser } from '@/lib/currentUser'
import { takeNavOrigin } from '@/lib/navOrigin'
import { cn } from '@/lib/utils'

interface ShellProps {
  tabs: TabItem[]
  /** Staff pages use a nav rail and the full width on tablets. */
  tablet?: boolean
  /** Centre the page content in a readable column on tablets (all but the sell station). */
  narrow?: boolean
}

function Shell({ tabs, tablet, narrow }: ShellProps) {
  const { pathname } = useLocation()
  const column = tablet && narrow
  const page = useRef<HTMLElement>(null)

  // Opening a tab: the new page grows out of the tab that was tapped. Other
  // navigation (back, links inside a page) keeps the plain fade below.
  useLayoutEffect(() => {
    const el = page.current
    const from = takeNavOrigin()
    if (!el || !from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = el.getBoundingClientRect()
    el.style.transformOrigin = `${from.x - box.left}px ${from.y - box.top}px`
    el.animate(
      [
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    )
  }, [pathname])
  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-bg',
        tablet && 'lg:max-w-none lg:flex-row',
      )}
    >
      {tablet && <NavRail items={tabs} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Keyed by route so each screen fades in when you navigate (fade only:
          sliding the page made the whole layout, header included, look like
          it was shaking).

          On tablets the amber header spans the whole area next to the rail on
          every page; the content below it sits in a centred 720px column. The
          header reads `data-narrow` through the `page` group to line its own
          content up with that column.
        */}
        <main
          ref={page}
          key={pathname}
          data-narrow={column ? 'true' : undefined}
          className={cn(
            'group/page flex flex-1 animate-fade-in flex-col',
            column &&
              'lg:[&>*:not(header)]:mx-auto lg:[&>*:not(header)]:w-full lg:[&>*:not(header)]:max-w-[720px]',
          )}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
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
  if (user.status === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">…</div>
  }
  if (user.status === 'signedOut') return <LoginPage />
  return <Shell tabs={tabs} tablet narrow={!pathname.startsWith('/staff/sell')} />
}

export function VisitorLayout() {
  const { t } = useTranslation()
  const tabs: TabItem[] = [
    { to: '/visit', label: t('nav.catalog'), Icon: LayoutGrid },
    { to: '/visit/stamps', label: t('nav.stamps'), Icon: Stamp, also: ['/visit/stamp'] },
  ]
  return <Shell tabs={tabs} />
}

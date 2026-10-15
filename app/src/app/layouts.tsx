import { LayoutGrid, Package, Receipt, ShoppingCart, Stamp, ChartColumn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { TabBar } from '@/components/TabBar'
import type { TabItem } from '@/components/TabBar'

function Shell({ tabs }: { tabs: TabItem[] }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-bg">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <TabBar items={tabs} />
    </div>
  )
}

export function StaffLayout() {
  const { t } = useTranslation()
  const tabs: TabItem[] = [
    { to: '/staff/sell', label: t('nav.sell'), Icon: ShoppingCart },
    { to: '/staff/stock', label: t('nav.stock'), Icon: Package },
    { to: '/staff/sales', label: t('nav.sales'), Icon: Receipt },
    { to: '/staff/summary', label: t('nav.summary'), Icon: ChartColumn },
  ]
  return <Shell tabs={tabs} />
}

export function VisitorLayout() {
  const { t } = useTranslation()
  const tabs: TabItem[] = [
    { to: '/visit', label: t('nav.catalog'), Icon: LayoutGrid },
    { to: '/visit/stamps', label: t('nav.stamps'), Icon: Stamp },
  ]
  return <Shell tabs={tabs} />
}

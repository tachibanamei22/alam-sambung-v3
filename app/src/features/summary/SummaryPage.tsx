import { Banknote, ChevronRight, FileDown, Landmark, QrCode, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { MemberMark } from '@/components/MemberMark'
import { Segmented } from '@/components/ui/segmented'
import { MEMBER_BAR, MEMBER_KEYS, MEMBER_NAMES } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { cn } from '@/lib/utils'
import { useNow } from '@/lib/useNow'
import { useProducts } from '../products/productsStore'
import { downloadCsv, memberTotalsCsv, salesLinesCsv } from '../sales/csv'
import { useSales } from '../sales/salesStore'
import { dateStamp, isSameDay, summarize } from '../sales/stats'

type Scope = 'today' | 'all'

export function SummaryPage() {
  const { t } = useTranslation()
  const allSales = useSales()
  const products = useProducts()
  const [scope, setScope] = useState<Scope>('today')

  const now = useNow()

  const sales = useMemo(
    () => (scope === 'today' ? allSales.filter((s) => isSameDay(s.createdAt, now)) : allSales),
    [allSales, scope, now],
  )

  const summary = useMemo(() => summarize(sales), [sales])
  const lowStock = products.filter((p) => p.stock <= 3).length
  const maxMember = Math.max(1, ...MEMBER_KEYS.map((k) => summary.byMember[k]))
  const digital = summary.byPayment.qris + summary.byPayment.transfer

  const attention: string[] = []
  if (lowStock > 0) attention.push(t('summary.attention.lowStock', { count: lowStock }))
  if (summary.pendingCount > 0) attention.push(t('summary.attention.pending', { count: summary.pendingCount }))
  if (summary.voidedCount > 0) attention.push(t('summary.attention.voided', { count: summary.voidedCount }))

  const stamp = dateStamp(now)
  const suffix = scope === 'today' ? stamp : `all-${stamp}`

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('summary.title')}>
        <div className="flex flex-col gap-3">
          <Segmented
            variant="tabs"
            aria-label={t('summary.title')}
            value={scope}
            onValueChange={setScope}
            options={(['today', 'all'] as const).map((s) => ({ value: s, label: t(`summary.scope.${s}`) }))}
          />
          <div className="flex flex-col">
            <span className="text-[13px] text-text">{t('summary.totalSales')}</span>
            <span className="font-head text-[38px] font-extrabold leading-tight text-text">
              {formatRupiah(summary.total)}
            </span>
            <span className="text-[13px] text-text">
              {t('summary.counts', { sales: summary.salesCount, items: summary.itemsSold })}
            </span>
          </div>
        </div>
      </AmberHeader>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-6 pt-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('checkout.method.cash'), value: summary.byPayment.cash, Icon: Banknote },
            { label: t('summary.digital'), value: digital, Icon: QrCode },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex flex-col gap-1.5 rounded-card border border-border bg-surface p-3.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Icon className="size-4 text-accent-text" />
                {label}
              </span>
              <span className="font-head text-[17px] font-bold">{formatRupiah(value)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <QrCode className="size-3.5" /> QRIS {formatRupiah(summary.byPayment.qris)}
          </span>
          <span className="flex items-center gap-1.5">
            <Landmark className="size-3.5" /> {t('checkout.method.transfer')}{' '}
            {formatRupiah(summary.byPayment.transfer)}
          </span>
        </div>

        <section className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-4">
          <h2 className="text-[15px] font-bold">{t('summary.byMember')}</h2>
          {MEMBER_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2.5">
              <MemberMark member={key} className="size-8 text-sm" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold">{MEMBER_NAMES[key]}</span>
                  <span className="text-muted">{formatRupiah(summary.byMember[key])}</span>
                </div>
                <div className="h-1.5 rounded-full bg-soft">
                  <div
                    className={cn('h-1.5 rounded-full', MEMBER_BAR[key])}
                    style={{ width: `${Math.round((summary.byMember[key] / maxMember) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {attention.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-[20px] bg-soft p-3.5 text-[13px] font-semibold text-warn">
            <TriangleAlert className="mt-0.5 size-[18px] shrink-0" />
            <span>{attention.join(' · ')}</span>
          </div>
        )}

        <Link
          to="/staff/stamp-codes"
          className="flex items-center justify-between rounded-card border border-border bg-surface p-4 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <QrCode className="size-[18px] text-accent-text" />
            {t('summary.stampCodes')}
          </span>
          <ChevronRight className="size-4 text-muted" />
        </Link>

        <section className="flex flex-col gap-2.5 rounded-card border border-border bg-surface p-4">
          <h2 className="text-[15px] font-bold">{t('summary.closeDay')}</h2>
          <p className="text-xs text-muted">{t('summary.exportHint')}</p>
          <button
            type="button"
            disabled={sales.length === 0}
            onClick={() => downloadCsv(`alam-sambung-sales-${suffix}.csv`, salesLinesCsv(sales))}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-on-accent disabled:opacity-40"
          >
            <FileDown className="size-[18px]" />
            {t('summary.exportSales')}
          </button>
          <button
            type="button"
            disabled={sales.length === 0}
            onClick={() => downloadCsv(`alam-sambung-members-${suffix}.csv`, memberTotalsCsv(sales))}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border text-sm font-semibold disabled:opacity-40"
          >
            <FileDown className="size-[18px]" />
            {t('summary.exportMembers')}
          </button>
        </section>
      </div>
    </>
  )
}

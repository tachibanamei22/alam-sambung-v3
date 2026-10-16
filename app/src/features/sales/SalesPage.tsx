import { Ban, ChevronDown, CloudOff, Paperclip } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'
import { SyncPill } from '@/components/SyncPill'
import { useCurrentUser } from '@/lib/currentUser'
import { MEMBER_NAMES } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import type { MemberKey, Sale } from '@/lib/types'
import { useNow } from '@/lib/useNow'
import { cn } from '@/lib/utils'
import { loadProof, useSales, voidSale } from './salesStore'
import { isSameDay } from './stats'

/** Loads the proof photo on demand so the sales list stays light. */
function ProofImage({ sale, alt }: { sale: Sale; alt: string }) {
  const [src, setSrc] = useState<string | null>(sale.proofDataUrl ?? null)

  useEffect(() => {
    let cancelled = false
    loadProof(sale)
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        // offline and not cached: the photo shows once a connection is back
      })
    return () => {
      cancelled = true
    }
  }, [sale])

  if (!src) return <div className="h-24 animate-pulse rounded-2xl bg-soft" />
  return <img src={src} alt={alt} className="max-h-56 w-full rounded-2xl border border-border object-contain" />
}

type Filter = 'all' | 'cash' | 'qris' | 'transfer' | 'voided'
const FILTERS: Filter[] = ['all', 'cash', 'qris', 'transfer', 'voided']

function matches(sale: Sale, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'voided') return Boolean(sale.voided)
  return sale.payment === filter
}

export function SalesPage() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  const sales = useSales()
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = sales.filter((s) => matches(s, filter))
  const now = useNow()

  function confirmVoid(sale: Sale) {
    if (window.confirm(t('sales.confirmVoid')) && voidSale(sale.id)) toast(t('toast.saleVoided'))
  }

  return (
    <>
      <AmberHeader
        eyebrow={
          <span className="flex items-center gap-2">
            {t('app.name')}
            <SyncPill inline />
          </span>
        }
        title={t('sales.title')}
      >
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('sales.filter')}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3.5 py-2 text-[13px] font-semibold',
                filter === f ? 'bg-text text-bg' : 'bg-surface text-text',
              )}
            >
              {t(`sales.filters.${f}`)}
            </button>
          ))}
        </div>
      </AmberHeader>

      <section className="flex flex-1 flex-col gap-3 px-5 pb-6 pt-5">
        {visible.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
            {t('sales.empty')}
          </div>
        )}
        {visible.map((sale) => {
          const date = new Date(sale.createdAt)
          const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const day = isSameDay(sale.createdAt, now)
            ? ''
            : `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} `
          const staff = MEMBER_NAMES[sale.staffId as MemberKey] ?? sale.staffId
          const open = openId === sale.id
          const canVoid = !sale.voided && (user.role === 'admin' || sale.staffId === user.memberKey)

          return (
            <article
              key={sale.id}
              className={cn(
                'flex flex-col gap-2 rounded-card border bg-surface p-3.5',
                sale.voided ? 'border-border opacity-60' : 'border-border',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : sale.id)}
                aria-expanded={open}
                className="flex flex-col gap-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">
                    {day}
                    {time} · {staff} · {t(`checkout.method.${sale.payment}`)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'font-head text-base font-bold',
                        sale.voided && 'line-through',
                      )}
                    >
                      {formatRupiah(sale.total)}
                    </span>
                    <ChevronDown className={cn('size-4 text-muted transition-transform', open && 'rotate-180')} />
                  </span>
                </div>
                <p className="text-sm font-semibold">
                  {sale.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sale.voided && (
                    <span className="flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-semibold text-danger">
                      <Ban className="size-3" />
                      {t('sales.voided')}
                    </span>
                  )}
                  {(sale.hasProof || sale.proofDataUrl) && (
                    <span className="flex items-center gap-1 rounded-full bg-sticker px-2 py-0.5 text-[11px] font-semibold text-on-sticker">
                      <Paperclip className="size-3" />
                      {t('sales.proofAttached')}
                    </span>
                  )}
                  {sale.pending && (
                    <span className="flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-warn">
                      <CloudOff className="size-3" />
                      {t('sales.waitingToSync')}
                    </span>
                  )}
                </div>
              </button>

              {open && (
                <div className="mt-1 flex flex-col gap-3 border-t border-border pt-3">
                  <ul className="flex flex-col gap-1.5 text-[13px]">
                    {sale.items.map((i) => (
                      <li key={i.productId} className="flex justify-between gap-3">
                        <span>
                          {i.name} x{i.qty}
                          <span className="text-muted">
                            {' '}
                            · {MEMBER_NAMES[i.ownerId as MemberKey] ?? i.ownerId}
                          </span>
                        </span>
                        <span className="font-semibold">{formatRupiah(i.qty * i.unitPrice)}</span>
                      </li>
                    ))}
                  </ul>
                  {sale.payment === 'cash' && sale.cashReceived !== undefined && (
                    <p className="text-xs text-muted">
                      {t('checkout.cashReceived')}: {formatRupiah(sale.cashReceived)} ·{' '}
                      {t('checkout.change')}: {formatRupiah(Math.max(0, sale.cashReceived - sale.total))}
                    </p>
                  )}
                  {(sale.hasProof || sale.proofDataUrl) && (
                    <ProofImage sale={sale} alt={t('checkout.proof.title')} />
                  )}
                  {canVoid && (
                    <button
                      type="button"
                      onClick={() => confirmVoid(sale)}
                      className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-danger text-sm font-semibold text-danger"
                    >
                      <Ban className="size-4" />
                      {t('sales.voidSale')}
                    </button>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </section>
    </>
  )
}

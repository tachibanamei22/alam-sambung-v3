import { Lock, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { CATEGORY_ICONS } from '@/lib/categories'
import { canEditProduct, useCurrentUser } from '@/lib/currentUser'
import { MEMBER_NAMES, MEMBER_TINT } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { useProductName } from '@/lib/productName'
import { cn } from '@/lib/utils'
import { adjustStock, useProducts } from '../products/productsStore'
import { DevUserSwitcher } from './DevUserSwitcher'

type Scope = 'mine' | 'all'

export function StockPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const products = useProducts()
  const nameOf = useProductName()
  const [scope, setScope] = useState<Scope>('mine')

  // Admin sees everything by default; members start on their own products.
  const effectiveScope: Scope = user.role === 'admin' ? 'all' : scope
  const visible =
    effectiveScope === 'all' ? products : products.filter((p) => p.owner === user.memberKey)

  const low = visible.filter((p) => p.stock > 0 && p.stock <= 3).length
  const soldOut = visible.filter((p) => p.stock <= 0).length

  const roleLabel =
    user.role === 'admin' ? t('stock.roleAdmin') : `${MEMBER_NAMES[user.memberKey]} · ${t('stock.roleMember')}`

  return (
    <>
      <AmberHeader eyebrow={roleLabel} title={t('stock.title')}>
        <div className="flex gap-1 rounded-[20px] bg-glass p-1">
          {(['mine', 'all'] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={user.role === 'admin'}
              onClick={() => setScope(s)}
              className={cn(
                'h-10 flex-1 rounded-2xl text-[13px] font-semibold',
                effectiveScope === s ? 'bg-surface text-text' : 'text-text/70',
              )}
            >
              {t(`stock.scope.${s}`)}
            </button>
          ))}
        </div>
      </AmberHeader>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-28 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: t('stock.tiles.products'), value: visible.length, tone: 'text-text' },
            { label: t('stock.tiles.low'), value: low, tone: 'text-warn' },
            { label: t('stock.tiles.soldOut'), value: soldOut, tone: 'text-text' },
          ].map((tile) => (
            <div key={tile.label} className="flex flex-col rounded-[20px] border border-border bg-surface p-3">
              <span className="text-xs text-muted">{tile.label}</span>
              <span className={cn('font-head text-[22px] font-bold', tile.tone)}>{tile.value}</span>
            </div>
          ))}
        </div>

        <section className="flex flex-col rounded-card border border-border bg-surface px-4 py-1">
          {visible.length === 0 && <p className="py-4 text-sm text-muted">{t('stock.empty')}</p>}
          {visible.map((p, i) => {
            const editable = canEditProduct(user, p)
            const isLow = p.stock <= 3
            const Icon = CATEGORY_ICONS[p.category]
            return (
              <div
                key={p.id}
                className={cn('flex items-center gap-3 py-3', i < visible.length - 1 && 'border-b border-border')}
              >
                <button
                  type="button"
                  disabled={!editable}
                  onClick={() => void navigate(`/staff/stock/${p.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt="" className="size-11 shrink-0 rounded-[14px] object-cover" />
                  ) : (
                    <span
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-[14px]',
                        MEMBER_TINT[p.owner],
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">{nameOf(p)}</span>
                    <span className={cn('text-xs', isLow ? 'text-warn' : 'text-muted')}>
                      {effectiveScope === 'all' ? `${MEMBER_NAMES[p.owner]} · ` : ''}
                      {formatRupiah(p.price)}
                      {isLow ? ` · ${t('stock.lowStock')}` : ''}
                    </span>
                  </span>
                </button>

                {editable ? (
                  <div
                    className={cn(
                      'flex items-center gap-2.5 rounded-full p-1',
                      isLow ? 'bg-warn/15' : 'bg-soft',
                    )}
                  >
                    <button
                      type="button"
                      aria-label="-"
                      onClick={() => adjustStock(p.id, -1)}
                      className="flex size-7 items-center justify-center rounded-full"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className={cn('min-w-5 text-center text-[13px] font-bold', isLow && 'text-warn')}>
                      {p.stock}
                    </span>
                    <button
                      type="button"
                      aria-label="+"
                      onClick={() => adjustStock(p.id, 1)}
                      className="flex size-7 items-center justify-center rounded-full"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-1.5 text-[13px] font-bold">
                    <Lock className="size-3 text-muted" />
                    {p.stock}
                  </span>
                )}
              </div>
            )
          })}
        </section>

        {import.meta.env.DEV && <DevUserSwitcher />}
      </div>

      <div className="sticky bottom-[84px] px-4 pb-2 pt-2">
        <button
          type="button"
          onClick={() => void navigate('/staff/stock/new')}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-accent text-[15px] font-bold text-on-accent"
        >
          <Plus className="size-[18px]" />
          {t('stock.addProduct')}
        </button>
      </div>
    </>
  )
}

import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { ProductCard } from '@/components/ProductCard'
import { SyncPill } from '@/components/SyncPill'
import { Segmented } from '@/components/ui/segmented'
import { MEMBER_NAMES, memberFilterOptions } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { useProductName } from '@/lib/productName'
import type { MemberKey } from '@/lib/types'
import { useProducts } from '../products/productsStore'
import { CartPanel } from './CartPanel'
import { useCart } from './cart-context'

type MemberFilter = 'all' | MemberKey

export function SellPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cart = useCart()
  const products = useProducts()
  const nameOf = useProductName()
  const [query, setQuery] = useState('')
  const [member, setMember] = useState<MemberFilter>('all')

  const total = useMemo(
    () =>
      cart.lines.reduce(
        (sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.qty,
        0,
      ),
    [cart.lines, products],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (member === 'all' || p.owner === member) &&
        (q === '' || `${p.nameId} ${p.nameEn}`.toLowerCase().includes(q)),
    )
  }, [products, member, query])

  return (
    <div className="flex flex-1 lg:h-dvh">
      <div className="scrollbar-stable flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <AmberHeader
          // On a phone the sync state sits in the label above the title;
          // tablets have room for the full pill.
          eyebrow={
            <span className="flex items-center gap-2">
              {t('app.name')}
              <SyncPill inline className="flex lg:hidden" />
            </span>
          }
          title={t('sell.title')}
          actions={<SyncPill className="hidden lg:flex" />}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <label className="flex h-[46px] items-center gap-2.5 rounded-3xl bg-surface px-3.5 lg:w-72">
              <Search className="size-[18px] text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('sell.search')}
                className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
              />
            </label>
            <Segmented
              aria-label={t('stock.title')}
              value={member}
              onValueChange={setMember}
              options={memberFilterOptions(t('sales.filters.all'))}
            />
          </div>
        </AmberHeader>

        {/* Keyed by the member filter so switching tabs replays the entrance. */}
        <section
          key={member}
          className="grid flex-1 grid-cols-2 content-start gap-3 px-5 pb-6 pt-5 lg:grid-cols-3 lg:gap-3.5 lg:px-7 wide:grid-cols-4"
        >
          {visible.length === 0 && (
            <p className="col-span-full animate-enter rounded-card border border-border bg-surface p-4 text-sm text-muted">
              {t('catalog.empty')}
            </p>
          )}
          {visible.map((p, i) => (
            <div
              key={p.id}
              className="animate-enter"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <ProductCard
                name={nameOf(p)}
                owner={p.owner}
                ownerName={MEMBER_NAMES[p.owner]}
                category={p.category}
                photoUrl={p.photoUrl}
                price={p.price}
                stock={p.stock}
                qty={cart.qty[p.id] ?? 0}
                onAdd={() => cart.add(p.id, p.stock)}
                onRemove={() => cart.decrement(p.id)}
                addLabel={t('sell.addOne')}
                removeLabel={t('sell.removeOne')}
              />
            </div>
          ))}
        </section>

        {cart.count > 0 && (
          <div className="sticky bottom-[84px] animate-enter px-4 pb-2 pt-2 lg:hidden">
            <div className="flex items-center justify-between rounded-[28px] bg-cart py-3 pl-5 pr-3 shadow-lg shadow-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-cart-sub">{t('sell.items', { count: cart.count })}</span>
                <span key={total} className="animate-fade-in font-head text-xl font-bold text-cart-text">
                  {formatRupiah(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void navigate('/staff/checkout')}
                className="flex items-center gap-2 rounded-2xl bg-cart-btn px-4 py-3 text-sm font-bold text-cart-btn-text"
              >
                {t('sell.reviewSale')}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="hidden w-[360px] shrink-0 border-l border-border bg-surface lg:block lg:h-dvh">
        <CartPanel />
      </aside>
    </div>
  )
}

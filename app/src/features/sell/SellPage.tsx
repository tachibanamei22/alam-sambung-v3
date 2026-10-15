import { ArrowRight, Search } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { ProductCard } from '@/components/ProductCard'
import { formatRupiah } from '@/lib/money'
import { useCart } from './cart-context'
import { SAMPLE_PRODUCTS, findProduct } from './products'

export function SellPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cart = useCart()

  const total = useMemo(
    () =>
      cart.lines.reduce((sum, line) => sum + (findProduct(line.productId)?.price ?? 0) * line.qty, 0),
    [cart.lines],
  )

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('sell.title')}>
        <div className="flex h-[46px] items-center gap-2.5 rounded-3xl bg-surface px-3.5 text-sm text-muted">
          <Search className="size-[18px]" />
          {t('sell.search')}
        </div>
      </AmberHeader>

      <section className="grid flex-1 grid-cols-2 content-start gap-3 px-5 pt-5">
        {SAMPLE_PRODUCTS.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            owner={p.owner}
            ownerName={p.ownerName}
            price={p.price}
            stock={p.stock}
            qty={cart.qty[p.id] ?? 0}
            onAdd={() => cart.add(p.id, p.stock)}
          />
        ))}
      </section>

      {cart.count > 0 && (
        <div className="sticky bottom-[84px] px-4 pb-2 pt-2">
          <div className="flex items-center justify-between rounded-[28px] bg-cart py-3 pl-5 pr-3">
            <div className="flex flex-col">
              <span className="text-xs text-cart-sub">{t('sell.items', { count: cart.count })}</span>
              <span className="font-head text-xl font-bold text-cart-text">{formatRupiah(total)}</span>
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
    </>
  )
}

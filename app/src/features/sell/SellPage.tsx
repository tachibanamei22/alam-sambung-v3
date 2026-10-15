import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'
import { ProductCard } from '@/components/ProductCard'
import type { MemberKey } from '@/components/ProductCard'
import { formatRupiah } from '@/lib/money'

interface SampleProduct {
  id: string
  name: string
  owner: MemberKey
  ownerName: string
  price: number
  stock: number
}

// Placeholder data so the screen can be reviewed before Firestore is wired in.
const SAMPLE: SampleProduct[] = [
  { id: '1', name: 'Zine Vol.1', owner: 'rina', ownerName: 'Rina', price: 45000, stock: 12 },
  { id: '2', name: 'Sticker Pack', owner: 'rina', ownerName: 'Rina', price: 15000, stock: 40 },
  { id: '3', name: 'Acrylic Keychain', owner: 'dika', ownerName: 'Dika', price: 30000, stock: 3 },
  { id: '4', name: 'Postcard Set', owner: 'dika', ownerName: 'Dika', price: 25000, stock: 18 },
  { id: '5', name: 'Art Print A4', owner: 'sari', ownerName: 'Sari', price: 50000, stock: 9 },
  { id: '6', name: 'Enamel Pin', owner: 'sari', ownerName: 'Sari', price: 35000, stock: 0 },
]

export function SellPage() {
  const { t } = useTranslation()
  const [cart, setCart] = useState<Record<string, number>>({})

  const { count, total } = useMemo(() => {
    let count = 0
    let total = 0
    for (const p of SAMPLE) {
      const q = cart[p.id] ?? 0
      count += q
      total += q * p.price
    }
    return { count, total }
  }, [cart])

  const add = (p: SampleProduct) =>
    setCart((c) => ({ ...c, [p.id]: Math.min((c[p.id] ?? 0) + 1, p.stock) }))

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('sell.title')}>
        <div className="flex h-[46px] items-center gap-2.5 rounded-3xl bg-surface px-3.5 text-sm text-muted">
          <Search className="size-[18px]" />
          {t('sell.search')}
        </div>
      </AmberHeader>

      <section className="grid flex-1 grid-cols-2 content-start gap-3 px-5 pt-5">
        {SAMPLE.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            owner={p.owner}
            ownerName={p.ownerName}
            price={p.price}
            stock={p.stock}
            qty={cart[p.id] ?? 0}
            onAdd={() => add(p)}
          />
        ))}
      </section>

      {count > 0 && (
        <div className="sticky bottom-[84px] px-4 pb-2 pt-2">
          <div className="flex items-center justify-between rounded-[28px] bg-cart py-3 pl-5 pr-3">
            <div className="flex flex-col">
              <span className="text-xs text-cart-sub">{count} items</span>
              <span className="font-head text-xl font-bold text-cart-text">{formatRupiah(total)}</span>
            </div>
            <button
              type="button"
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

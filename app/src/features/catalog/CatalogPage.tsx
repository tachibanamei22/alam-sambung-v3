import { ArrowRight, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { CATEGORY_ICONS } from '@/lib/categories'
import { MEMBER_KEYS, MEMBER_NAMES, MEMBER_TINT } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { useProductName } from '@/lib/productName'
import type { MemberKey, Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useProducts } from '../products/productsStore'
import { STAMP_BOOTHS } from '../stamps/booths'
import { useStamps } from '../stamps/stampsStore'

type MemberFilter = 'all' | MemberKey

function availability(stock: number): 'soldOut' | 'almostGone' | 'available' {
  if (stock <= 0) return 'soldOut'
  return stock <= 3 ? 'almostGone' : 'available'
}

function Thumb({ product, className }: { product: Product; className?: string }) {
  const Icon = CATEGORY_ICONS[product.category]
  return product.photoUrl ? (
    <img src={product.photoUrl} alt="" className={cn('object-cover', className)} />
  ) : (
    <div className={cn('flex items-center justify-center', MEMBER_TINT[product.owner], className)}>
      <Icon className="size-[30px]" />
    </div>
  )
}

export function CatalogPage() {
  const { t } = useTranslation()
  const products = useProducts()
  const stamps = useStamps()
  const nameOf = useProductName()
  const [query, setQuery] = useState('')
  const [member, setMember] = useState<MemberFilter>('all')
  const [selected, setSelected] = useState<Product | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (member === 'all' || p.owner === member) &&
        (q === '' || `${p.nameId} ${p.nameEn}`.toLowerCase().includes(q)),
    )
  }, [products, member, query])

  return (
    <>
      <AmberHeader eyebrow={t('app.tagline')} title={t('catalog.title')}>
        <label className="flex h-[46px] items-center gap-2.5 rounded-3xl bg-surface px-3.5">
          <Search className="size-[18px] text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sell.search')}
            className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', ...MEMBER_KEYS] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={member === m}
              onClick={() => setMember(m)}
              className={cn(
                'rounded-full px-3.5 py-2 text-[13px] font-semibold',
                member === m ? 'bg-text text-bg' : 'bg-surface text-text',
              )}
            >
              {m === 'all' ? t('sales.filters.all') : MEMBER_NAMES[m]}
            </button>
          ))}
        </div>
      </AmberHeader>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-28 pt-5">
        <Link
          to="/visit/stamps"
          className="flex items-center justify-between gap-3 rounded-[24px] bg-cart px-[18px] py-3.5"
        >
          <span className="flex flex-col">
            <span className="text-xs font-semibold text-cart-sub">{t('stamps.title')}</span>
            <span className="font-head text-[15px] font-bold text-cart-text">{t('catalog.stampBanner')}</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-2xl bg-cart-btn px-3.5 py-2.5 text-[13px] font-bold text-cart-btn-text">
            {stamps.length}/{STAMP_BOOTHS.length}
            <ArrowRight className="size-3.5" />
          </span>
        </Link>

        {visible.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
            {t('catalog.empty')}
          </p>
        ) : (
          <section className="grid grid-cols-2 gap-3">
            {visible.map((p) => {
              const state = availability(p.stock)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)}
                  className={cn(
                    'flex flex-col gap-2.5 rounded-card border border-border bg-surface p-2.5 text-left',
                    state === 'soldOut' && 'opacity-50',
                  )}
                >
                  <Thumb product={p} className="h-24 w-full rounded-[18px]" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{nameOf(p)}</span>
                    <span className="text-xs text-muted">
                      {t('catalog.by', { name: MEMBER_NAMES[p.owner] })}
                      {state !== 'available' && (
                        <span className={state === 'almostGone' ? 'text-warn' : ''}>
                          {' · '}
                          {t(`catalog.availability.${state}`)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="w-fit rounded-full bg-sticker px-2.5 py-1 font-head text-[13px] font-bold text-on-sticker">
                    {formatRupiah(p.price)}
                  </span>
                </button>
              )
            })}
          </section>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="flex w-full max-w-[520px] flex-col gap-4 rounded-t-[32px] bg-bg p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label={t('common.close')}
                onClick={() => setSelected(null)}
                className="flex size-9 items-center justify-center rounded-full bg-soft"
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <Thumb product={selected} className="h-48 w-full rounded-[24px]" />
            <div className="flex flex-col gap-1">
              <h2 className="font-head text-2xl font-bold">{nameOf(selected)}</h2>
              <p className="text-sm text-muted">
                {t('catalog.by', { name: MEMBER_NAMES[selected.owner] })} ·{' '}
                {t(`categories.${selected.category}`)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-sticker px-3.5 py-1.5 font-head text-lg font-bold text-on-sticker">
                {formatRupiah(selected.price)}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  availability(selected.stock) === 'available' ? 'text-accent-text' : 'text-warn',
                )}
              >
                {t(`catalog.availability.${availability(selected.stock)}`)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

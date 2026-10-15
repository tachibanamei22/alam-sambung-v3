import { ArrowLeft, Camera, CircleCheck, Minus, Plus, WifiOff } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { compressImage } from '@/lib/image'
import { MEMBER_NAMES } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { useProductName } from '@/lib/productName'
import type { PaymentMethod, Sale, SaleItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { applySale, useProducts } from '../products/productsStore'
import { addSale } from '../sales/salesStore'
import { useCart } from './cart-context'

const METHODS: PaymentMethod[] = ['cash', 'qris', 'transfer']

function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step
}

export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cart = useCart()
  const products = useProducts()
  const nameOf = useProductName()
  const fileRef = useRef<HTMLInputElement>(null)

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [received, setReceived] = useState<number | null>(null)
  const [proof, setProof] = useState<string | null>(null)
  const [proofError, setProofError] = useState(false)

  const items = useMemo(
    () =>
      cart.lines.flatMap((line) => {
        const product = products.find((p) => p.id === line.productId)
        return product ? [{ product, qty: line.qty }] : []
      }),
    [cart.lines, products],
  )
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  const quickAmounts = useMemo(() => {
    const options = [total, roundUp(total, 5000), roundUp(total, 50000), roundUp(total, 100000)]
    return [...new Set(options)].filter((n) => n >= total && n > 0).slice(0, 3)
  }, [total])

  const cashReceived = received ?? total
  const change = Math.max(0, cashReceived - total)
  const needsProof = method !== 'cash'

  const canConfirm =
    items.length > 0 && (method === 'cash' ? cashReceived >= total : proof !== null)

  async function onProofPicked(file: File | undefined) {
    if (!file) return
    setProofError(false)
    try {
      setProof(await compressImage(file))
    } catch {
      setProofError(true)
    }
  }

  function confirm() {
    if (!canConfirm) return
    const saleItems: SaleItem[] = items.map(({ product, qty }) => ({
      productId: product.id,
      ownerId: product.owner,
      name: nameOf(product),
      qty,
      unitPrice: product.price,
    }))
    const sale: Sale = {
      id: crypto.randomUUID(),
      staffId: 'local-staff',
      items: saleItems,
      total,
      payment: method,
      cashReceived: method === 'cash' ? cashReceived : undefined,
      proofDataUrl: needsProof && proof ? proof : undefined,
      createdAt: Date.now(),
      pending: true,
    }
    addSale(sale)
    applySale(saleItems)
    cart.clear()
    void navigate('/staff/sales')
  }

  return (
    <>
      <AmberHeader
        eyebrow={t('app.name')}
        title={t('checkout.title')}
        actions={
          <button
            type="button"
            aria-label={t('common.back')}
            onClick={() => void navigate('/staff/sell')}
            className="flex size-10 items-center justify-center rounded-full bg-glass text-text"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-5">
        {items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
            {t('checkout.empty')}
          </div>
        ) : (
          <section className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-4">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{nameOf(product)}</span>
                  <span className="text-xs text-muted">
                    {MEMBER_NAMES[product.owner]} ·{formatRupiah(product.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-full bg-soft p-1">
                  <button
                    type="button"
                    aria-label="-"
                    onClick={() => cart.decrement(product.id)}
                    className="flex size-7 items-center justify-center rounded-full"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="min-w-4 text-center text-[13px] font-bold">{qty}</span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => cart.add(product.id, product.stock)}
                    className="flex size-7 items-center justify-center rounded-full"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3.5">
              <span className="text-sm text-muted">{t('checkout.total')}</span>
              <span className="font-head text-2xl font-bold">{formatRupiah(total)}</span>
            </div>
          </section>
        )}

        <div className="flex gap-1 rounded-[20px] bg-soft p-1" role="radiogroup" aria-label={t('checkout.payment')}>
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={method === m}
              onClick={() => setMethod(m)}
              className={cn(
                'h-10 flex-1 rounded-2xl text-[13px] font-semibold transition-colors',
                method === m ? 'bg-surface text-text' : 'text-muted',
              )}
            >
              {t(`checkout.method.${m}`)}
            </button>
          ))}
        </div>

        {method === 'cash' ? (
          <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
            <span className="text-[15px] font-bold">{t('checkout.cashReceived')}</span>
            <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setReceived(amount)}
                  className={cn(
                    'h-10 flex-1 rounded-2xl border text-[13px] font-semibold',
                    cashReceived === amount
                      ? 'border-accent bg-soft text-accent-text'
                      : 'border-border bg-surface text-text',
                  )}
                >
                  {amount === total ? t('checkout.exact') : amount.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-soft px-3.5 py-2.5">
              <span className="text-[13px] font-semibold text-accent-text">{t('checkout.change')}</span>
              <span className="font-head text-base font-bold text-accent-text">{formatRupiah(change)}</span>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold">{t('checkout.proof.title')}</span>
              <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-accent-text">
                {t('checkout.proof.required', { method: t(`checkout.method.${method}`) })}
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => void onProofPicked(e.target.files?.[0])}
            />
            {proof ? (
              <div className="flex items-center gap-3">
                <img src={proof} alt="" className="size-14 rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <span className="flex items-center gap-1 text-[13px] font-semibold text-accent-text">
                    <CircleCheck className="size-3.5" />
                    {t('checkout.proof.attached')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-[13px] font-bold text-accent-text"
                >
                  {t('checkout.proof.retake')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-card border border-accent bg-soft text-accent-text"
              >
                <Camera className="size-6" />
                <span className="text-sm font-semibold">{t('checkout.proof.attach')}</span>
              </button>
            )}
            {proofError && <span className="text-xs text-danger">{t('checkout.proof.error')}</span>}
          </section>
        )}

        <p className="flex items-center gap-2 px-1 text-xs text-muted">
          <WifiOff className="size-3.5 shrink-0" />
          {t('checkout.offlineNote')}
        </p>
      </div>

      <div className="sticky bottom-[84px] px-4 pb-2 pt-3">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={confirm}
          className="h-14 w-full rounded-[20px] bg-accent text-base font-bold text-on-accent disabled:opacity-40"
        >
          {t('checkout.confirm', { total: formatRupiah(total) })}
        </button>
      </div>
    </>
  )
}

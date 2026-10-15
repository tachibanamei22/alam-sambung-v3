import { ArrowLeft, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { MEMBER_NAMES } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { CashPanel, PaymentSwitch, ProofPanel, QtyStepper } from './CheckoutParts'
import { useCheckout } from './useCheckout'

export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const c = useCheckout()

  function confirm() {
    if (c.confirm()) void navigate('/staff/sales')
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
        {c.items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
            {t('checkout.empty')}
          </div>
        ) : (
          <section className="flex flex-col gap-3.5 rounded-card border border-border bg-surface p-4">
            {c.items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{c.nameOf(product)}</span>
                  <span className="text-xs text-muted">
                    {MEMBER_NAMES[product.owner]} · {formatRupiah(product.price)}
                  </span>
                </div>
                <QtyStepper
                  qty={qty}
                  onMinus={() => c.cart.decrement(product.id)}
                  onPlus={() => c.cart.add(product.id, product.stock)}
                />
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3.5">
              <span className="text-sm text-muted">{t('checkout.total')}</span>
              <span className="font-head text-2xl font-bold">{formatRupiah(c.total)}</span>
            </div>
          </section>
        )}

        <PaymentSwitch c={c} />
        {c.method === 'cash' ? <CashPanel c={c} /> : <ProofPanel c={c} />}

        <p className="flex items-center gap-2 px-1 text-xs text-muted">
          <WifiOff className="size-3.5 shrink-0" />
          {t('checkout.offlineNote')}
        </p>
      </div>

      <div className="sticky bottom-[84px] px-4 pb-2 pt-3">
        <button
          type="button"
          disabled={!c.canConfirm}
          onClick={confirm}
          className="h-14 w-full rounded-[20px] bg-accent text-base font-bold text-on-accent disabled:opacity-40"
        >
          {t('checkout.confirm', { total: formatRupiah(c.total) })}
        </button>
      </div>
    </>
  )
}

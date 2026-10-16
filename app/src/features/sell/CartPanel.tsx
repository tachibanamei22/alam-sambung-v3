import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CATEGORY_ICONS } from '@/lib/categories'
import { useCurrentUser } from '@/lib/currentUser'
import { MEMBER_NAMES, MEMBER_TINT, memberInitial } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import { cn } from '@/lib/utils'
import { CashPanel, PaymentSwitch, ProofPanel, QtyStepper } from './CheckoutParts'
import { useCheckout } from './useCheckout'

/** Always-visible cart for the tablet sell station. */
export function CartPanel() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  const c = useCheckout()

  function confirm() {
    const total = c.total
    if (c.confirm()) toast.success(t('toast.saleSaved', { total: formatRupiah(total) }))
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-xl font-bold">{t('sell.cart.title')}</h2>
        {c.items.length > 0 && (
          <button
            type="button"
            onClick={c.cart.clear}
            className="text-[13px] font-semibold text-danger"
          >
            {t('sell.cart.clear')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 rounded-3xl bg-bg py-2 pl-2 pr-3">
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-xs font-bold',
            MEMBER_TINT[user.memberKey],
          )}
        >
          {memberInitial(user.memberKey)}
        </span>
        <span className="text-[13px] font-semibold">
          {t('sell.cart.sellingAs', { name: MEMBER_NAMES[user.memberKey] })}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto">
        {c.items.length === 0 && <p className="text-sm text-muted">{t('sell.cart.empty')}</p>}
        {c.items.map(({ product, qty }) => {
          const Icon = CATEGORY_ICONS[product.category]
          return (
            <div key={product.id} className="flex animate-enter items-center gap-2.5">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-[14px]',
                  MEMBER_TINT[product.owner],
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold">{c.nameOf(product)}</span>
                <QtyStepper
                  small
                  qty={qty}
                  onMinus={() => c.cart.decrement(product.id)}
                  onPlus={() => c.cart.add(product.id, product.stock)}
                />
              </div>
              <span className="text-sm font-bold">{formatRupiah(product.price * qty)}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3.5">
        <span className="text-sm text-muted">{t('checkout.total')}</span>
        <span key={c.total} className="animate-fade-in font-head text-[28px] font-bold">
          {formatRupiah(c.total)}
        </span>
      </div>

      <PaymentSwitch c={c} />
      {c.method === 'cash' ? <CashPanel c={c} bare /> : <ProofPanel c={c} bare />}

      <button
        type="button"
        disabled={!c.canConfirm}
        onClick={confirm}
        className="h-14 w-full rounded-[20px] bg-accent text-base font-bold text-on-accent disabled:opacity-40"
      >
        {t('sell.cart.confirm')}
      </button>
    </div>
  )
}

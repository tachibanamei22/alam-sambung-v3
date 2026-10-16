import { Camera, CircleCheck, Minus, Plus } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatRupiah } from '@/lib/money'
import type { PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { Checkout } from './useCheckout'

const METHODS: PaymentMethod[] = ['cash', 'qris', 'transfer']

export function QtyStepper({
  qty,
  onMinus,
  onPlus,
  small,
}: {
  qty: number
  onMinus: () => void
  onPlus: () => void
  small?: boolean
}) {
  const btn = cn('flex items-center justify-center rounded-full', small ? 'size-6' : 'size-7')
  const icon = small ? 'size-3' : 'size-3.5'
  return (
    <div className={cn('flex items-center rounded-full bg-soft p-1', small ? 'gap-2' : 'gap-2.5')}>
      <button type="button" aria-label="-" onClick={onMinus} className={btn}>
        <Minus className={icon} />
      </button>
      <span className="min-w-4 text-center text-[13px] font-bold">{qty}</span>
      <button type="button" aria-label="+" onClick={onPlus} className={btn}>
        <Plus className={icon} />
      </button>
    </div>
  )
}

export function PaymentSwitch({ c }: { c: Checkout }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-1 rounded-[20px] bg-soft p-1" role="radiogroup" aria-label={t('checkout.payment')}>
      {METHODS.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={c.method === m}
          onClick={() => c.setMethod(m)}
          className={cn(
            'h-10 flex-1 rounded-2xl text-[13px] font-semibold transition-colors',
            c.method === m ? 'bg-surface text-text' : 'text-muted',
          )}
        >
          {t(`checkout.method.${m}`)}
        </button>
      ))}
    </div>
  )
}

export function CashPanel({ c, bare }: { c: Checkout; bare?: boolean }) {
  const { t } = useTranslation()
  return (
    <section
      className={cn(
        'flex flex-col gap-3',
        !bare && 'rounded-card border border-border bg-surface p-4',
      )}
    >
      {!bare && <span className="text-[15px] font-bold">{t('checkout.cashReceived')}</span>}

      {/* Exact, then the nearest amounts a customer can pay with real notes. */}
      <div className="flex gap-2" role="group" aria-label={t('checkout.cashReceived')}>
        {c.quickAmounts.map((amount) => {
          const active = !c.customActive && c.cashReceived === amount
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={active}
              onClick={() => c.selectChip(amount)}
              className={cn(
                'h-10 min-w-0 flex-1 rounded-2xl border text-[13px] font-semibold',
                active ? 'border-accent bg-soft text-accent-text' : 'border-border bg-surface text-text',
              )}
            >
              {amount === c.total ? t('checkout.exact') : amount.toLocaleString('id-ID')}
            </button>
          )
        })}
      </div>

      <label
        className={cn(
          'flex h-11 items-center gap-2 rounded-2xl border bg-surface px-3.5 transition-colors focus-within:border-accent',
          c.customActive ? 'border-accent' : 'border-border',
        )}
      >
        <span className="text-sm font-semibold text-muted">Rp</span>
        <input
          inputMode="numeric"
          aria-label={t('checkout.customAmount')}
          placeholder={t('checkout.customAmount')}
          value={c.customText ? Number(c.customText).toLocaleString('id-ID') : ''}
          onChange={(e) => c.setCustom(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
      </label>

      {c.short > 0 ? (
        <div
          role="alert"
          className="flex animate-enter items-center justify-between rounded-2xl bg-warn/15 px-3.5 py-2.5"
        >
          <span className="text-[13px] font-semibold text-warn">{t('checkout.short')}</span>
          <span className="font-head text-base font-bold text-warn">{formatRupiah(c.short)}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl bg-soft px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-accent-text">{t('checkout.change')}</span>
          <span key={c.change} className="animate-fade-in font-head text-base font-bold text-accent-text">
            {formatRupiah(c.change)}
          </span>
        </div>
      )}
    </section>
  )
}

export function ProofPanel({ c, bare }: { c: Checkout; bare?: boolean }) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <section
      className={cn(
        'flex flex-col gap-3',
        !bare && 'rounded-card border border-border bg-surface p-4',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold">{t('checkout.proof.title')}</span>
        <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-accent-text">
          {t('checkout.proof.required', { method: t(`checkout.method.${c.method}`) })}
        </span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void c.pickProof(e.target.files?.[0])}
      />
      {c.proof ? (
        <div className="flex items-center gap-3">
          <img src={c.proof} alt="" className="size-14 rounded-2xl object-cover" />
          <span className="flex flex-1 items-center gap-1 text-[13px] font-semibold text-accent-text">
            <CircleCheck className="size-3.5" />
            {t('checkout.proof.attached')}
          </span>
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
      {c.proofError && <span className="text-xs text-danger">{t('checkout.proof.error')}</span>}
    </section>
  )
}

import { CloudOff, Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'
import { formatRupiah } from '@/lib/money'
import { useSales } from './salesStore'

export function SalesPage() {
  const { t } = useTranslation()
  const sales = useSales()

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('sales.title')} />
      <section className="flex flex-1 flex-col gap-3 px-5 pt-5">
        {sales.length === 0 && (
          <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
            {t('sales.empty')}
          </div>
        )}
        {sales.map((sale) => {
          const time = new Date(sale.createdAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <article
              key={sale.id}
              className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  {time} · {t(`checkout.method.${sale.payment}`)}
                </span>
                <span className="font-head text-base font-bold">{formatRupiah(sale.total)}</span>
              </div>
              <p className="text-sm font-semibold">
                {sale.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sale.proofDataUrl && (
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
            </article>
          )
        })}
      </section>
    </>
  )
}

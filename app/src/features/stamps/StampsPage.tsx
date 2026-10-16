import { Check, Gift, ScanLine } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { cn } from '@/lib/utils'
import { STAMP_BOOTHS } from './booths'
import { ScanSheet } from './ScanSheet'
import { getCardCode, useStamps } from './stampsStore'

export function StampsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const stamps = useStamps()
  const [scanning, setScanning] = useState(false)

  const total = STAMP_BOOTHS.length
  const collected = new Set(stamps.map((s) => s.token))
  const done = collected.size >= total

  const onToken = useCallback(
    (token: string) => {
      setScanning(false)
      void navigate(`/visit/stamp/${encodeURIComponent(token)}`)
    },
    [navigate],
  )

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('stamps.title')}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-end justify-between">
            <span className="flex items-end gap-1.5">
              <span className="font-head text-[52px] font-extrabold leading-none">{collected.size}</span>
              <span className="pb-1 text-[15px] font-semibold">{t('stamps.ofTotal', { total })}</span>
            </span>
            <span className="text-[13px] font-semibold">
              {done ? t('stamps.complete') : t('stamps.toGo', { count: total - collected.size })}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-glass">
            <div
              className="h-2.5 rounded-full bg-text"
              style={{ width: `${Math.round((collected.size / total) * 100)}%` }}
            />
          </div>
        </div>
      </AmberHeader>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-40 pt-5">
        <section className="grid grid-cols-4 gap-x-2 gap-y-4 rounded-card border border-border bg-surface p-4">
          {STAMP_BOOTHS.map((booth, i) => {
            const got = collected.has(booth.token)
            return (
              <div key={booth.id} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'flex size-16 items-center justify-center rounded-full text-[17px] font-bold',
                    got ? 'bg-sticker text-on-sticker' : 'bg-soft text-muted',
                  )}
                >
                  {got ? <Check className="size-7" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-center text-[11px] leading-tight',
                    got ? 'font-semibold text-text' : 'text-muted',
                  )}
                >
                  {booth.name}
                </span>
              </div>
            )
          })}
        </section>

        <section
          className={cn(
            'flex items-center gap-3.5 rounded-card p-4',
            done ? 'bg-sticker text-on-sticker' : 'bg-soft',
          )}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-accent-text">
            <Gift className="size-6" />
          </span>
          <span className="flex flex-col">
            <span className="font-head text-[15px] font-bold">
              {done ? t('stamps.rewardReady') : t('stamps.reward')}
            </span>
            <span className={cn('text-xs', done ? 'text-on-sticker' : 'text-muted')}>
              {done ? t('stamps.showStaff', { code: getCardCode() }) : t('stamps.unlocksAt', { total })}
            </span>
          </span>
        </section>
      </div>

      <div className="sticky bottom-[84px] px-4 pb-2 pt-2">
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-accent text-[15px] font-bold text-on-accent"
        >
          <ScanLine className="size-[18px]" />
          {t('stamps.scan')}
        </button>
      </div>

      <ScanSheet open={scanning} onToken={onToken} onClose={() => setScanning(false)} />
    </>
  )
}

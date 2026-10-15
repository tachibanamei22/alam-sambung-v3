import { Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'
import { STAMP_BOOTHS, stampLink } from './booths'

/** Staff page: one QR per booth, ready to print on the stamp rally sheet. */
export function StampCodesPage() {
  const { t } = useTranslation()
  const origin = window.location.origin
  const [images, setImages] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    void Promise.all(
      STAMP_BOOTHS.map(async (b) => [
        b.token,
        await QRCode.toDataURL(stampLink(origin, b.token), { width: 360, margin: 1 }),
      ] as const),
    ).then((entries) => {
      if (!cancelled) setImages(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [origin])

  const isLocal = /localhost|127\.0\.0\.1/.test(origin)

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('stamps.codes.title')} />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-28 pt-5">
        {isLocal && (
          <p className="rounded-2xl bg-soft p-3.5 text-[13px] font-semibold text-warn print:hidden">
            {t('stamps.codes.localWarning', { origin })}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-on-accent print:hidden"
        >
          <Printer className="size-[18px]" />
          {t('stamps.codes.print')}
        </button>
        <section className="grid grid-cols-2 gap-3 print:grid-cols-3">
          {STAMP_BOOTHS.map((b) => (
            <figure
              key={b.id}
              className="flex break-inside-avoid flex-col items-center gap-2 rounded-card border border-border bg-surface p-3"
            >
              {images[b.token] ? (
                <img src={images[b.token]} alt={`QR ${b.name}`} className="size-36 rounded-xl" />
              ) : (
                <div className="size-36 rounded-xl bg-soft" />
              )}
              <figcaption className="flex flex-col items-center">
                <span className="text-sm font-bold">{b.name}</span>
                <span className="font-mono text-[11px] text-muted">{b.token}</span>
              </figcaption>
            </figure>
          ))}
        </section>
      </div>
    </>
  )
}

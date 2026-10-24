import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { STAMP_BOOTHS } from './booths'
import { claimStamp } from './stampsStore'
import type { ClaimResult } from './stampsStore'

/** Opened by a booth's QR code: /visit/stamp/<token>. */
export function StampClaimPage() {
  const { t } = useTranslation()
  const { token = '' } = useParams()
  const [result, setResult] = useState<ClaimResult | null>(null)
  const claimed = useRef(false)

  useEffect(() => {
    // Strict Mode runs effects twice in development; claim only once.
    if (claimed.current) return
    claimed.current = true
    setResult(claimStamp(decodeURIComponent(token)))
  }, [token])

  const booth = STAMP_BOOTHS.find((b) => b.token.toLowerCase() === decodeURIComponent(token).toLowerCase())

  const view = {
    ok: { Icon: CircleCheck, tone: 'text-accent-text', title: t('stamps.claim.ok', { booth: booth?.name }) },
    duplicate: { Icon: Info, tone: 'text-muted', title: t('stamps.claim.duplicate', { booth: booth?.name }) },
    unknown: { Icon: CircleAlert, tone: 'text-danger', title: t('stamps.claim.unknown') },
  }

  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t('stamps.title')} />
      <div className="flex flex-1 flex-col gap-4 px-5 pt-6">
        {result && (
          <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center">
            {(() => {
              const { Icon, tone, title } = view[result]
              return (
                <>
                  <Icon className={`size-12 ${tone}`} />
                  <h2 className="font-head text-xl font-bold">{title}</h2>
                </>
              )
            })()}
            <Link
              to="/visit/stamps"
              className="mt-1 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-on-accent"
            >
              {t('stamps.claim.viewCard')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

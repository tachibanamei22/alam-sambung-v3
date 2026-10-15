import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'

export function ComingSoonPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()
  return (
    <>
      <AmberHeader eyebrow={t('app.name')} title={t(titleKey)} />
      <div className="px-5 pt-6">
        <div className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
          {t('common.soon')}
        </div>
      </div>
    </>
  )
}

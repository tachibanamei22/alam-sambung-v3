import { CloudCheck, CloudOff, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSales } from '@/features/sales/salesStore'
import { useOnline } from '@/lib/useOnline'
import { cn } from '@/lib/utils'

/** Connection and sync state: offline, sales waiting to sync, or all synced. */
export function SyncPill({ className }: { className?: string }) {
  const { t } = useTranslation()
  const online = useOnline()
  const pending = useSales().filter((s) => s.pending).length

  const { Icon, label } = !online
    ? { Icon: WifiOff, label: t('sync.offline') }
    : pending > 0
      ? { Icon: CloudOff, label: t('sync.pending', { count: pending }) }
      : { Icon: CloudCheck, label: t('sync.synced') }

  return (
    <span
      className={cn(
        'items-center gap-1.5 rounded-full bg-glass px-3 py-2 text-xs font-semibold text-text',
        className ?? 'flex',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

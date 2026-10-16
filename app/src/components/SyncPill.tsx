import { CloudCheck, CloudOff, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSales } from '@/features/sales/salesStore'
import { useOnline } from '@/lib/useOnline'
import { cn } from '@/lib/utils'

interface SyncPillProps {
  className?: string
  /** Plain icon and text with no background, for tight spots such as a header label. */
  inline?: boolean
}

/** Connection and sync state: offline, sales waiting to sync, or all synced. */
export function SyncPill({ className, inline }: SyncPillProps) {
  const { t } = useTranslation()
  const online = useOnline()
  const pending = useSales().filter((s) => s.pending).length

  const { Icon, label, tone } = !online
    ? { Icon: WifiOff, label: t('sync.offline'), tone: 'text-warn' }
    : pending > 0
      ? { Icon: CloudOff, label: t('sync.pending', { count: pending }), tone: 'text-warn' }
      : { Icon: CloudCheck, label: t('sync.synced'), tone: 'text-text' }

  return (
    <span
      role="status"
      className={cn(
        'shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold',
        inline ? 'font-bold' : 'rounded-full bg-glass px-3 py-2',
        tone,
        className ?? 'flex',
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </span>
  )
}

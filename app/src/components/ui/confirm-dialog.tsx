import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  /** Red confirm button for actions that cannot be undone. */
  destructive?: boolean
  icon?: ReactNode
}

/** Replaces the browser's native confirm(), so it matches the rest of the app. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive,
  icon,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
          <Dialog.Content className="pointer-events-auto flex w-full max-w-[400px] flex-col gap-4 rounded-[28px] bg-bg p-5 outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-fade-out">
            <div className="flex flex-col gap-2">
              {icon && (
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl',
                    destructive ? 'bg-danger/15 text-danger' : 'bg-soft text-accent-text',
                  )}
                >
                  {icon}
                </span>
              )}
              <Dialog.Title className="font-head text-xl font-bold">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted">{description}</Dialog.Description>
            </div>
            <div className="flex gap-2.5">
              <Dialog.Close className="h-12 flex-1 rounded-2xl border border-border bg-surface text-sm font-semibold">
                {t('common.cancel')}
              </Dialog.Close>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onConfirm()
                }}
                className={cn(
                  'h-12 flex-1 rounded-2xl text-sm font-bold',
                  destructive ? 'bg-danger text-bg' : 'bg-accent text-on-accent',
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

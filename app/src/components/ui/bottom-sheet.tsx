import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

/**
 * Bottom sheet built on Radix Dialog: focus is trapped, Escape and the
 * backdrop close it, and it slides up and down instead of popping in.
 */
export function BottomSheet({ open, onOpenChange, title, children }: BottomSheetProps) {
  const { t } = useTranslation()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[520px] flex-col gap-4 rounded-t-[32px] bg-bg p-5 pb-8 outline-none data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out"
        >
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-head text-xl font-bold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label={t('common.close')}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft"
            >
              <X className="size-[18px]" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

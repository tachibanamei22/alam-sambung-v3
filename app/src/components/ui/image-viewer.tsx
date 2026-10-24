import * as Dialog from '@radix-ui/react-dialog'
import { Expand, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ImageViewerProps {
  src: string
  title: string
  /**
   * A thumbnail that opens the viewer when tapped. Leave it out to render just
   * a small expand button, for photos that already do something when tapped.
   */
  children?: ReactNode
  className?: string
  /** Show the small expand badge on a thumbnail (default). */
  badge?: boolean
}

/**
 * Full-screen photo viewer. Tap the photo (or the zoom button) to toggle 2x
 * and scroll to pan. Works with a mouse, touch and keyboard (Esc closes).
 */
export function ImageViewer({ src, title, children, className, badge = true }: ImageViewerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setZoomed(false)
      }}
    >
      <Dialog.Trigger
        aria-label={`${t('common.viewPhoto')}: ${title}`}
        className={cn(
          children
            ? 'relative block'
            : 'flex size-8 items-center justify-center rounded-full bg-black/55 text-white',
          className,
        )}
      >
        {children}
        {children ? (
          badge && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/55 text-white"
          >
            <Expand className="size-4" />
          </span>
          )
        ) : (
          <Expand className="size-4" />
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        >
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
            <Dialog.Title className="min-w-0 truncate font-head text-base font-bold text-white">
              {title}
            </Dialog.Title>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label={zoomed ? t('common.zoomOut') : t('common.zoomIn')}
                onClick={() => setZoomed((z) => !z)}
                className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white"
              >
                {zoomed ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
              </button>
              <Dialog.Close
                aria-label={t('common.close')}
                className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
          </div>

          {/* Closing by tapping the dark area, like the other overlays. */}
          <div
            className={cn(
              'min-h-0 flex-1 overflow-auto',
              zoomed ? 'cursor-zoom-out' : 'flex items-center justify-center p-4',
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <img
              src={src}
              alt={title}
              onClick={() => setZoomed((z) => !z)}
              className={cn(
                'select-none rounded-2xl object-contain transition-[width,max-width,max-height] duration-300',
                zoomed
                  ? 'm-auto max-h-none w-[200%] max-w-none cursor-zoom-out'
                  : 'max-h-full max-w-full cursor-zoom-in',
              )}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

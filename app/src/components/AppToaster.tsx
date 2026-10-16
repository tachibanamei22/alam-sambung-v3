import { Toaster } from 'sonner'
import { useTheme } from '@/lib/theme-context'

/** App-wide toasts, themed to match light and dark mode. */
export function AppToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme}
      position="top-center"
      offset={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-2xl !border !border-border !bg-surface !text-text !shadow-lg !font-body !text-sm',
          description: '!text-muted',
        },
      }}
    />
  )
}

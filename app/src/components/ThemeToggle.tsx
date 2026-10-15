import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const options = [
    { value: 'light', Icon: Sun, label: 'Light mode' },
    { value: 'dark', Icon: Moon, label: 'Dark mode' },
  ] as const

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-glass p-[3px]" role="group" aria-label="Theme">
      {options.map(({ value, Icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              'flex size-[30px] items-center justify-center rounded-full transition-colors',
              active ? 'bg-text text-bg' : 'text-text',
            )}
          >
            <Icon className="size-[15px]" />
          </button>
        )
      })}
    </div>
  )
}

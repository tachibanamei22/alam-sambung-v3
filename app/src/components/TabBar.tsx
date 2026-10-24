import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { useActiveIndex } from './useActiveIndex'

export interface TabItem {
  to: string
  label: string
  Icon: LucideIcon
  /** Other path prefixes that belong to this tab (e.g. a QR claim page). */
  also?: string[]
}

export function TabBar({ items, className }: { items: TabItem[]; className?: string }) {
  const active = useActiveIndex(items)
  return (
    <nav
      className={cn(
        'sticky bottom-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 print:hidden',
        className,
      )}
    >
      <ul className="relative flex h-[60px] items-stretch gap-1 rounded-full border border-border bg-surface p-1.5 shadow-lg shadow-black/10">
        {active >= 0 && (
          // Slides between tabs. Tabs are equal width, so its offset is a
          // multiple of its own width plus the 4px gap.
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 rounded-full bg-text transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              width: `calc((100% - 12px - ${(items.length - 1) * 4}px) / ${items.length})`,
              transform: `translateX(calc(${active} * (100% + 4px)))`,
            }}
          />
        )}
        {items.map(({ to, label, Icon }, i) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={cn(
                'relative flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200',
                i === active ? 'text-bg' : 'text-muted',
              )}
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

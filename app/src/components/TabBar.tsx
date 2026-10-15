import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

export interface TabItem {
  to: string
  label: string
  Icon: LucideIcon
}

export function TabBar({ items }: { items: TabItem[] }) {
  return (
    <nav className="sticky bottom-0 print:hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <ul className="flex h-[60px] items-stretch gap-1 rounded-full border border-border bg-surface p-1.5 shadow-lg shadow-black/10">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors',
                  isActive ? 'bg-text text-bg' : 'text-muted',
                )
              }
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

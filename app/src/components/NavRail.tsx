import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import type { TabItem } from './TabBar'

/** Left navigation for tablet widths; phones use the bottom tab bar. */
export function NavRail({ items }: { items: TabItem[] }) {
  return (
    <nav className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-3 bg-rail px-3 py-5 print:hidden lg:flex">
      <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-sticker font-head text-base font-extrabold text-on-sticker">
        AS
      </span>
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={label}
          title={label}
          className={({ isActive }) =>
            cn(
              'flex size-12 items-center justify-center rounded-2xl transition-colors',
              isActive ? 'bg-accent text-on-accent' : 'text-rail-muted hover:text-cart-text',
            )
          }
        >
          <Icon className="size-[22px]" />
        </NavLink>
      ))}
    </nav>
  )
}

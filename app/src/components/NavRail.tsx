import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import type { TabItem } from './TabBar'
import { useActiveIndex } from './useActiveIndex'

/** Left navigation for tablet widths; phones use the bottom tab bar. */
export function NavRail({ items }: { items: TabItem[] }) {
  const active = useActiveIndex(items)
  return (
    <nav className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-3 bg-rail px-3 py-5 print:hidden lg:flex">
      <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-sticker font-head text-base font-extrabold text-on-sticker">
        AS
      </span>
      <div className="relative flex flex-col gap-3">
        {active >= 0 && (
          // Each link is 48px tall with a 12px gap.
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 size-12 rounded-2xl bg-accent transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `translateY(${active * 60}px)` }}
          />
        )}
        {items.map(({ to, label, Icon }, i) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            title={label}
            className={cn(
              'relative flex size-12 items-center justify-center rounded-2xl transition-colors duration-200',
              i === active ? 'text-on-accent' : 'text-rail-muted hover:text-cart-text',
            )}
          >
            <Icon className="size-[22px]" />
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

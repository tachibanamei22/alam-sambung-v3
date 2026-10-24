import type { LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { NavLink } from 'react-router'
import { useSlidingHighlight } from '@/lib/useSlidingHighlight'
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
  const list = useRef<HTMLUListElement>(null)
  const cells = useRef<(HTMLLIElement | null)[]>([])

  const highlight = useSlidingHighlight({
    active: active >= 0 ? active : null,
    container: list,
    measure: (key) => {
      const el = cells.current[Number(key)]
      return el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null
    },
  })

  return (
    <nav
      className={cn(
        'sticky bottom-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 print:hidden',
        className,
      )}
    >
      <ul
        ref={list}
        className="relative flex h-[60px] items-stretch gap-1 rounded-full border border-border bg-surface p-1.5 shadow-lg shadow-black/10"
      >
        <span
          ref={highlight}
          aria-hidden
          style={{ opacity: 0 }}
          className="pointer-events-none absolute left-0 top-0 rounded-full bg-text"
        />
        {items.map(({ to, label, Icon }, i) => (
          <li
            key={to}
            ref={(el) => {
              cells.current[i] = el
            }}
            className="flex-1"
          >
            <NavLink
              to={to}
              className={cn(
                'relative flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors duration-300',
                i === active ? 'text-bg' : 'text-muted',
              )}
            >
              <Icon className={cn('size-5 transition-transform duration-300', i === active && 'scale-110')} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

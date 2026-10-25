import { useRef } from 'react'
import { NavLink } from 'react-router'
import { rememberNavOrigin } from '@/lib/navOrigin'
import { useSlidingHighlight } from '@/lib/useSlidingHighlight'
import { cn } from '@/lib/utils'
import type { TabItem } from './TabBar'
import { useActiveIndex } from './useActiveIndex'

/** Left navigation for tablet widths; phones use the bottom tab bar. */
export function NavRail({ items }: { items: TabItem[] }) {
  const active = useActiveIndex(items)
  const group = useRef<HTMLDivElement>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])

  const highlight = useSlidingHighlight({
    active: active >= 0 ? active : null,
    container: group,
    axis: 'y',
    measure: (key) => {
      const el = links.current[Number(key)]
      return el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null
    },
  })

  return (
    <nav className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-3 bg-rail px-3 py-5 print:hidden lg:flex">
      <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-sticker font-head text-base font-extrabold text-on-sticker">
        AS
      </span>
      <div ref={group} className="relative flex flex-col gap-3">
        <span
          ref={highlight}
          aria-hidden
          style={{ opacity: 0 }}
          className="pointer-events-none absolute left-0 top-0 rounded-2xl bg-accent"
        />
        {items.map(({ to, label, Icon }, i) => (
          <NavLink
            key={to}
            to={to}
            onClick={(e) => rememberNavOrigin(e.currentTarget)}
            ref={(el) => {
              links.current[i] = el
            }}
            aria-label={label}
            title={label}
            className={cn(
              'relative flex size-12 items-center justify-center rounded-2xl transition-colors duration-300',
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

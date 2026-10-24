import { useLocation } from 'react-router'
import type { TabItem } from './TabBar'

/**
 * Index of the tab for the current page, or -1. A tab owns its sub-pages
 * (/staff/stock/new is still Stock); the longest matching path wins so the
 * catalog at /visit does not also claim /visit/stamps.
 */
export function useActiveIndex(items: TabItem[]): number {
  const { pathname } = useLocation()
  let best = -1
  let bestLen = -1
  items.forEach(({ to }, i) => {
    if ((pathname === to || pathname.startsWith(`${to}/`)) && to.length > bestLen) {
      best = i
      bestLen = to.length
    }
  })
  return best
}

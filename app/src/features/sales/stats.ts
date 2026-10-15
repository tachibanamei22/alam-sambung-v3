import { MEMBER_KEYS } from '@/lib/members'
import type { MemberKey, PaymentMethod, Sale } from '@/lib/types'

export interface SalesSummary {
  /** Sum of non-voided sale totals. */
  total: number
  salesCount: number
  itemsSold: number
  byPayment: Record<PaymentMethod, number>
  byMember: Record<MemberKey, number>
  voidedCount: number
  pendingCount: number
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

/** Local date as YYYY-MM-DD, used in export file names. */
export function dateStamp(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function summarize(sales: Sale[]): SalesSummary {
  const summary: SalesSummary = {
    total: 0,
    salesCount: 0,
    itemsSold: 0,
    byPayment: { cash: 0, qris: 0, transfer: 0 },
    byMember: Object.fromEntries(MEMBER_KEYS.map((k) => [k, 0])) as Record<MemberKey, number>,
    voidedCount: 0,
    pendingCount: 0,
  }

  for (const sale of sales) {
    if (sale.voided) {
      summary.voidedCount += 1
      continue
    }
    if (sale.pending) summary.pendingCount += 1
    summary.total += sale.total
    summary.salesCount += 1
    summary.byPayment[sale.payment] += sale.total
    for (const item of sale.items) {
      summary.itemsSold += item.qty
      const owner = item.ownerId as MemberKey
      if (owner in summary.byMember) summary.byMember[owner] += item.qty * item.unitPrice
    }
  }
  return summary
}

import { describe, expect, it } from 'vitest'
import type { Sale } from '@/lib/types'
import { memberTotalsCsv, salesLinesCsv, toCsv } from './csv'
import { dateStamp, isSameDay, summarize } from './stats'

const base: Sale = {
  id: 's1',
  staffId: 'rina',
  items: [
    { productId: 'p1', ownerId: 'rina', name: 'Zine Vol.1', qty: 2, unitPrice: 45000 },
    { productId: 'p3', ownerId: 'dika', name: 'Acrylic Keychain', qty: 1, unitPrice: 30000 },
  ],
  total: 120000,
  payment: 'cash',
  createdAt: new Date(2026, 9, 17, 14, 5).getTime(),
}

describe('summarize', () => {
  it('totals sales, items, payment split and per-member earnings', () => {
    const qris: Sale = {
      ...base,
      id: 's2',
      payment: 'qris',
      pending: true,
      total: 15000,
      items: [{ productId: 'p2', ownerId: 'rina', name: 'Sticker Pack', qty: 1, unitPrice: 15000 }],
    }
    const s = summarize([base, qris])
    expect(s.total).toBe(135000)
    expect(s.salesCount).toBe(2)
    expect(s.itemsSold).toBe(4)
    expect(s.byPayment).toEqual({ cash: 120000, qris: 15000, transfer: 0 })
    expect(s.byMember.rina).toBe(105000)
    expect(s.byMember.dika).toBe(30000)
    expect(s.pendingCount).toBe(1)
  })

  it('leaves voided sales out of every total but counts them', () => {
    const s = summarize([base, { ...base, id: 's2', voided: true }])
    expect(s.total).toBe(120000)
    expect(s.salesCount).toBe(1)
    expect(s.voidedCount).toBe(1)
  })
})

describe('dates', () => {
  it('detects the same local day', () => {
    const a = new Date(2026, 9, 17, 1, 0).getTime()
    const b = new Date(2026, 9, 17, 23, 59).getTime()
    const c = new Date(2026, 9, 18, 0, 1).getTime()
    expect(isSameDay(a, b)).toBe(true)
    expect(isSameDay(a, c)).toBe(false)
  })

  it('formats a file name stamp', () => {
    expect(dateStamp(new Date(2026, 0, 5, 10).getTime())).toBe('2026-01-05')
  })
})

describe('csv', () => {
  it('quotes cells that contain commas or quotes', () => {
    expect(toCsv([['a,b', 'say "hi"', 3]])).toBe('"a,b","say ""hi""",3')
  })

  it('writes one line per sold item', () => {
    const lines = salesLinesCsv([base]).split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toContain('Zine Vol.1')
    expect(lines[1]).toContain('Rina')
    expect(lines[1]).toContain('90000')
  })

  it('writes member totals with a grand total', () => {
    const lines = memberTotalsCsv([base]).split('\r\n')
    expect(lines[0]).toBe('member,total_rp')
    expect(lines).toContain('Rina,90000')
    expect(lines).toContain('Dika,30000')
    expect(lines.at(-1)).toBe('TOTAL,120000')
  })
})

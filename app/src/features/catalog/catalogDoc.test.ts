import { describe, expect, it } from 'vitest'
import type { Product } from '@/lib/types'
import { availabilityOf, buildCatalog, fingerprint } from './catalogDoc'

const base: Product[] = [
  { id: 'b', owner: 'dika', nameId: 'Kartu Pos', nameEn: 'Postcard', category: 'print', price: 25000, stock: 18 },
  { id: 'a', owner: 'rina', nameId: 'Zine', nameEn: 'Zine', category: 'zine', price: 45000, stock: 12, photoUrl: 'data:x' },
  { id: 'c', owner: 'rina', nameId: 'Stiker', nameEn: 'Sticker', category: 'sticker', price: 15000, stock: 0 },
]

describe('availabilityOf', () => {
  it('maps stock to a visitor-facing status', () => {
    expect(availabilityOf(0)).toBe('soldOut')
    expect(availabilityOf(-2)).toBe('soldOut')
    expect(availabilityOf(1)).toBe('almostGone')
    expect(availabilityOf(3)).toBe('almostGone')
    expect(availabilityOf(4)).toBe('available')
  })
})

describe('buildCatalog', () => {
  it('keeps only what visitors need: no stock counts and no photos', () => {
    const { items } = buildCatalog(base)
    for (const item of items) {
      expect(Object.keys(item).sort()).toEqual(
        ['category', 'id', 'nameEn', 'nameId', 'owner', 'price', 'status'].sort(),
      )
    }
  })

  it('orders by member, then name, so every device builds the same document', () => {
    const forward = buildCatalog(base)
    const reversed = buildCatalog([...base].reverse())
    expect(forward.items.map((i) => i.id)).toEqual(['c', 'a', 'b'])
    expect(reversed.hash).toBe(forward.hash)
  })

  it('does not change the fingerprint when stock moves within a status', () => {
    const before = buildCatalog(base).hash
    const after = buildCatalog(base.map((p) => (p.id === 'a' ? { ...p, stock: 9 } : p))).hash
    expect(after).toBe(before)
  })

  it('changes the fingerprint when status, price or name changes', () => {
    const before = buildCatalog(base).hash
    const toAlmostGone = buildCatalog(base.map((p) => (p.id === 'a' ? { ...p, stock: 2 } : p))).hash
    const priceChange = buildCatalog(base.map((p) => (p.id === 'a' ? { ...p, price: 50000 } : p))).hash
    expect(toAlmostGone).not.toBe(before)
    expect(priceChange).not.toBe(before)
    expect(new Set([before, toAlmostGone, priceChange]).size).toBe(3)
  })

  it('stays far below the 1 MiB document limit for a few hundred products', () => {
    const many: Product[] = Array.from({ length: 400 }, (_, i) => ({
      id: `p${i}`,
      owner: 'rina',
      nameId: `Produk nomor ${i} dengan nama agak panjang`,
      nameEn: `Product number ${i} with a fairly long name`,
      category: 'print',
      price: 25000,
      stock: 10,
    }))
    const bytes = JSON.stringify(buildCatalog(many).items).length
    expect(bytes).toBeLessThan(150_000)
  })
})

describe('fingerprint', () => {
  it('is stable and sensitive to changes', () => {
    expect(fingerprint('hello')).toBe(fingerprint('hello'))
    expect(fingerprint('hello')).not.toBe(fingerprint('hellp'))
    expect(fingerprint('')).toHaveLength(8)
  })
})

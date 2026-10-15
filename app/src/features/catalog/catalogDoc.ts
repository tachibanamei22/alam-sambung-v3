import { MEMBER_KEYS } from '@/lib/members'
import type { CategoryId, MemberKey, Product } from '@/lib/types'

export type Availability = 'available' | 'almostGone' | 'soldOut'

/** What a visitor needs to browse: no stock counts, no photos. */
export interface CatalogItem {
  id: string
  owner: MemberKey
  nameId: string
  nameEn: string
  category: CategoryId
  price: number
  status: Availability
}

export function availabilityOf(stock: number): Availability {
  if (stock <= 0) return 'soldOut'
  return stock <= 3 ? 'almostGone' : 'available'
}

/** FNV-1a, 32 bit. Only used to notice that the public catalog changed. */
export function fingerprint(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/**
 * Build the compact public catalog. The order is deterministic (member, then
 * name, then id) so every staff device derives the same document and the
 * fingerprint only changes when something a visitor can see changes.
 */
export function buildCatalog(products: Product[]): { items: CatalogItem[]; hash: string } {
  const memberOrder = (k: MemberKey) => MEMBER_KEYS.indexOf(k)
  const items = products
    .map<CatalogItem>((p) => ({
      id: p.id,
      owner: p.owner,
      nameId: p.nameId,
      nameEn: p.nameEn,
      category: p.category,
      price: p.price,
      status: availabilityOf(p.stock),
    }))
    .sort(
      (a, b) =>
        memberOrder(a.owner) - memberOrder(b.owner) ||
        (a.nameEn || a.nameId).localeCompare(b.nameEn || b.nameId, 'en') ||
        a.id.localeCompare(b.id),
    )
  return { items, hash: fingerprint(JSON.stringify(items)) }
}

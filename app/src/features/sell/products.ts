import type { MemberKey } from '@/components/ProductCard'

export interface SampleProduct {
  id: string
  name: string
  owner: MemberKey
  ownerName: string
  price: number
  stock: number
}

// Placeholder data until products come from Firestore.
export const SAMPLE_PRODUCTS: SampleProduct[] = [
  { id: '1', name: 'Zine Vol.1', owner: 'rina', ownerName: 'Rina', price: 45000, stock: 12 },
  { id: '2', name: 'Sticker Pack', owner: 'rina', ownerName: 'Rina', price: 15000, stock: 40 },
  { id: '3', name: 'Acrylic Keychain', owner: 'dika', ownerName: 'Dika', price: 30000, stock: 3 },
  { id: '4', name: 'Postcard Set', owner: 'dika', ownerName: 'Dika', price: 25000, stock: 18 },
  { id: '5', name: 'Art Print A4', owner: 'sari', ownerName: 'Sari', price: 50000, stock: 9 },
  { id: '6', name: 'Enamel Pin', owner: 'sari', ownerName: 'Sari', price: 35000, stock: 0 },
]

export function findProduct(id: string) {
  return SAMPLE_PRODUCTS.find((p) => p.id === id)
}

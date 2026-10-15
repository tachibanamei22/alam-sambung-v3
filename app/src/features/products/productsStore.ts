import { useSyncExternalStore } from 'react'
import type { Product } from '@/lib/types'

// Local-first product catalog. This is replaced by Firestore (with its own
// offline cache) once the Firebase project is connected.
const KEY = 'as-products'

const SEED: Product[] = [
  { id: 'p1', owner: 'rina', nameId: 'Zine Vol.1', nameEn: 'Zine Vol.1', category: 'zine', price: 45000, stock: 12 },
  { id: 'p2', owner: 'rina', nameId: 'Paket Stiker', nameEn: 'Sticker Pack', category: 'sticker', price: 15000, stock: 40 },
  { id: 'p3', owner: 'dika', nameId: 'Gantungan Akrilik', nameEn: 'Acrylic Keychain', category: 'accessory', price: 30000, stock: 3 },
  { id: 'p4', owner: 'dika', nameId: 'Set Kartu Pos', nameEn: 'Postcard Set', category: 'print', price: 25000, stock: 18 },
  { id: 'p5', owner: 'sari', nameId: 'Art Print A4', nameEn: 'Art Print A4', category: 'print', price: 50000, stock: 9 },
  { id: 'p6', owner: 'sari', nameId: 'Pin Enamel', nameEn: 'Enamel Pin', category: 'accessory', price: 35000, stock: 0 },
  { id: 'p7', owner: 'bima', nameId: 'Tote Bag', nameEn: 'Tote Bag', category: 'merch', price: 85000, stock: 6 },
  { id: 'p8', owner: 'bima', nameId: 'Poster A3', nameEn: 'Poster A3', category: 'print', price: 40000, stock: 14 },
]

function load(): Product[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Product[]
  } catch {
    // fall through to seed data
  }
  return SEED
}

let products: Product[] = load()
const listeners = new Set<() => void>()

function commit(next: Product[]) {
  products = next
  try {
    localStorage.setItem(KEY, JSON.stringify(products))
  } catch {
    // Storage full or unavailable: keep the in-memory copy for this session.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, () => products)
}

export function useProduct(id: string | undefined): Product | undefined {
  const all = useProducts()
  return all.find((p) => p.id === id)
}

/** Insert or replace a product. */
export function saveProduct(product: Product) {
  const exists = products.some((p) => p.id === product.id)
  commit(exists ? products.map((p) => (p.id === product.id ? product : p)) : [...products, product])
}

export function removeProduct(id: string) {
  commit(products.filter((p) => p.id !== id))
}

export function adjustStock(id: string, delta: number) {
  commit(products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)))
}

/** Put items from a voided sale back into stock. */
export function returnStock(items: { productId: string; qty: number }[]) {
  const back = new Map(items.map((i) => [i.productId, i.qty]))
  commit(products.map((p) => (back.has(p.id) ? { ...p, stock: p.stock + (back.get(p.id) ?? 0) } : p)))
}

/** Reduce stock for a confirmed sale. Selling never needs edit rights. */
export function applySale(items: { productId: string; qty: number }[]) {
  const sold = new Map(items.map((i) => [i.productId, i.qty]))
  commit(products.map((p) => (sold.has(p.id) ? { ...p, stock: Math.max(0, p.stock - (sold.get(p.id) ?? 0)) } : p)))
}

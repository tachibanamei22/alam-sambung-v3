import {
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { useSyncExternalStore } from 'react'
import { db, firebaseEnabled } from '@/lib/firebase'
import { isMemberKey } from '@/lib/members'
import type { Product } from '@/lib/types'

// With Firebase configured, Firestore is the source of truth and its offline
// cache queues writes made without a connection. Without it, products live in
// localStorage so the app still works for development and demos.
const KEY = 'as-products'

export const SEED_PRODUCTS: Product[] = [
  { id: 'p1', owner: 'tuesday', nameId: 'Zine Vol.1', nameEn: 'Zine Vol.1', category: 'zine', price: 45000, stock: 12 },
  { id: 'p2', owner: 'tuesday', nameId: 'Paket Stiker', nameEn: 'Sticker Pack', category: 'sticker', price: 15000, stock: 40 },
  { id: 'p3', owner: 'skye', nameId: 'Gantungan Akrilik', nameEn: 'Acrylic Keychain', category: 'accessory', price: 30000, stock: 3 },
  { id: 'p4', owner: 'skye', nameId: 'Set Kartu Pos', nameEn: 'Postcard Set', category: 'print', price: 25000, stock: 18 },
  { id: 'p5', owner: 'llymochi', nameId: 'Art Print A4', nameEn: 'Art Print A4', category: 'print', price: 50000, stock: 9 },
  { id: 'p6', owner: 'llymochi', nameId: 'Pin Enamel', nameEn: 'Enamel Pin', category: 'accessory', price: 35000, stock: 0 },
  { id: 'p7', owner: 'llymochi', nameId: 'Tote Bag', nameEn: 'Tote Bag', category: 'merch', price: 85000, stock: 6 },
  { id: 'p8', owner: 'llymochi', nameId: 'Poster A3', nameEn: 'Poster A3', category: 'print', price: 40000, stock: 14 },
]

function loadLocal(): Product[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Product[]
      // Drop data saved for members that no longer exist (the list can change).
      if (saved.every((p) => isMemberKey(p.owner))) return saved
    }
  } catch {
    // fall through to seed data
  }
  return SEED_PRODUCTS
}

let products: Product[] = firebaseEnabled ? [] : loadLocal()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function commitLocal(next: Product[]) {
  products = next
  try {
    localStorage.setItem(KEY, JSON.stringify(products))
  } catch {
    // Storage full or unavailable: keep the in-memory copy for this session.
  }
  emit()
}

function report(error: unknown) {
  console.error('[products]', error)
}

/** Firestore rejects undefined values, so drop them before writing. */
function clean<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// True once the server has confirmed the product list at least once, so we
// never publish a half-loaded (cache-only) catalog.
let serverSynced = false

/** Live-subscribe to all products. Staff only (visitors use the public catalog). */
export function startProductsSync(): () => void {
  if (!db) return () => {}
  return onSnapshot(
    collection(db, 'products'),
    { includeMetadataChanges: true },
    (snap) => {
      products = snap.docs.map((d) => ({ ...(d.data() as Omit<Product, 'id'>), id: d.id }))
      if (!snap.metadata.fromCache) serverSynced = true
      emit()
    },
    report,
  )
}

/** Forget cached products, e.g. after signing out. */
export function clearProducts() {
  if (!db) return
  products = []
  serverSynced = false
  emit()
}

export function getProducts(): Product[] {
  return products
}

export function isProductsServerSynced(): boolean {
  return serverSynced
}

export function subscribeProducts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const subscribe = subscribeProducts

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, () => products)
}

export function useProduct(id: string | undefined): Product | undefined {
  const all = useProducts()
  return all.find((p) => p.id === id)
}

/** Insert or replace a product. */
export function saveProduct(product: Product) {
  if (db) {
    const { id, ...data } = product
    setDoc(doc(db, 'products', id), clean(data)).catch(report)
    return
  }
  const exists = products.some((p) => p.id === product.id)
  commitLocal(exists ? products.map((p) => (p.id === product.id ? product : p)) : [...products, product])
}

export function removeProduct(id: string) {
  if (db) {
    deleteDoc(doc(db, 'products', id)).catch(report)
    return
  }
  commitLocal(products.filter((p) => p.id !== id))
}

export function adjustStock(id: string, delta: number) {
  if (db) {
    updateDoc(doc(db, 'products', id), { stock: increment(delta) }).catch(report)
    return
  }
  commitLocal(products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)))
}

function changeStock(items: { productId: string; qty: number }[], sign: 1 | -1) {
  if (db) {
    const batch = writeBatch(db)
    for (const { productId, qty } of items) {
      batch.update(doc(db, 'products', productId), { stock: increment(sign * qty) })
    }
    batch.commit().catch(report)
    return
  }
  const delta = new Map(items.map((i) => [i.productId, sign * i.qty]))
  commitLocal(
    products.map((p) => {
      const d = delta.get(p.id)
      return d === undefined ? p : { ...p, stock: Math.max(0, p.stock + d) }
    }),
  )
}

/** Put items from a voided sale back into stock. */
export function returnStock(items: { productId: string; qty: number }[]) {
  changeStock(items, 1)
}

/**
 * Reduce stock for a confirmed sale. Selling never needs edit rights, and
 * increments merge safely when two phones sell the same item offline.
 */
export function applySale(items: { productId: string; qty: number }[]) {
  changeStock(items, -1)
}

/** Load the sample catalog (used from the empty stock screen by the admin). */
export function seedSampleProducts() {
  for (const p of SEED_PRODUCTS) saveProduct(p)
}

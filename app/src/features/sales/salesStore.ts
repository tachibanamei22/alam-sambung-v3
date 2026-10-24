import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useSyncExternalStore } from 'react'
import { db, firebaseEnabled } from '@/lib/firebase'
import type { Sale } from '@/lib/types'
import { returnStock } from '../products/productsStore'

// With Firebase configured, sales are written to Firestore (queued offline by
// its cache) and `pending` reflects writes that have not reached the server.
// The proof photo lives in its own `proofs/{saleId}` document so the sales
// list stays light. Without Firebase everything stays in localStorage.
const KEY = 'as-sales'

/** Minimum shape the screens rely on; guards against old or hand-edited data. */
function isSale(value: unknown): value is Sale {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.staffId === 'string' &&
    typeof s.total === 'number' &&
    typeof s.createdAt === 'number' &&
    typeof s.payment === 'string' &&
    Array.isArray(s.items)
  )
}

function loadLocal(): Sale[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isSale) : []
  } catch {
    return []
  }
}

let sales: Sale[] = firebaseEnabled ? [] : loadLocal()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function persistLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(sales))
  } catch {
    // Storage full or unavailable: keep the in-memory copy for this session.
  }
}

function report(error: unknown) {
  console.error('[sales]', error)
}

/** Live-subscribe to sales. Requires a signed-in staff account. */
export function startSalesSync(): () => void {
  if (!db) return () => {}
  const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      sales = snap.docs.map((d) => ({
        ...(d.data() as Omit<Sale, 'id' | 'pending'>),
        id: d.id,
        pending: d.metadata.hasPendingWrites,
      }))
      emit()
    },
    report,
  )
}

/** Forget cached sales, e.g. after signing out. */
export function clearSales() {
  if (!db) return
  sales = []
  emit()
}

export function addSale(sale: Sale) {
  if (db) {
    const { id, proofDataUrl, pending: _pending, ...data } = sale
    void _pending
    if (proofDataUrl) setDoc(doc(db, 'proofs', id), { dataUrl: proofDataUrl }).catch(report)
    setDoc(doc(db, 'sales', id), JSON.parse(JSON.stringify({ ...data, hasProof: Boolean(proofDataUrl) }))).catch(
      report,
    )
    return
  }
  sales = [{ ...sale, hasProof: Boolean(sale.proofDataUrl) }, ...sales]
  persistLocal()
  emit()
}

/** Void a sale and put its items back into stock. Returns false if nothing changed. */
export function voidSale(id: string): boolean {
  const sale = sales.find((s) => s.id === id)
  if (!sale || sale.voided) return false
  const voidedAt = Date.now()
  if (db) {
    updateDoc(doc(db, 'sales', id), { voided: true, voidedAt }).catch(report)
  } else {
    sales = sales.map((s) => (s.id === id ? { ...s, voided: true, voidedAt, pending: true } : s))
    persistLocal()
    emit()
  }
  returnStock(sale.items)
  return true
}

/** The proof photo for a sale, from the device or from its proof document. */
export async function loadProof(sale: Sale): Promise<string | null> {
  if (sale.proofDataUrl) return sale.proofDataUrl
  if (!db || !sale.hasProof) return null
  const snap = await getDoc(doc(db, 'proofs', sale.id))
  return snap.exists() ? (snap.data().dataUrl as string) : null
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSales(): Sale[] {
  return useSyncExternalStore(subscribe, () => sales)
}

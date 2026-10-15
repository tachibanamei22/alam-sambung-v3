import { useSyncExternalStore } from 'react'
import type { Sale } from '@/lib/types'

// Local-first sales log. Sales are saved on the device immediately and marked
// pending; the Firestore sync step will flip `pending` once uploaded.
const KEY = 'as-sales'

function load(): Sale[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Sale[]) : []
  } catch {
    return []
  }
}

let sales: Sale[] = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(sales))
  } catch {
    // Storage full or unavailable: keep the in-memory copy for this session.
  }
}

function emit() {
  for (const listener of listeners) listener()
}

export function addSale(sale: Sale) {
  sales = [sale, ...sales]
  persist()
  emit()
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

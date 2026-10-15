import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  getProducts,
  isProductsServerSynced,
  subscribeProducts,
  useProducts,
} from '../products/productsStore'
import { buildCatalog } from './catalogDoc'
import type { CatalogItem } from './catalogDoc'

// Visitors read ONE small document (`catalog/public`) instead of every
// product, which keeps a busy event day inside the free Firestore quota.
// Signed-in staff devices keep that document up to date.
const PATH = ['catalog', 'public'] as const
const PUBLISH_DELAY_MS = 3000
const REFRESH_MS = 60_000

function report(error: unknown) {
  console.error('[catalog]', error)
}

let serverHash: string | null = null
let timer: number | undefined

/**
 * Write the public catalog if what visitors can see has changed. Skipped until
 * the server has confirmed the product list, so a half-loaded cache can never
 * overwrite the real catalog. Returns true when a write was issued.
 */
export function publishCatalogIfNeeded(): boolean {
  if (!db || !isProductsServerSynced()) return false
  const { items, hash } = buildCatalog(getProducts())
  if (hash === serverHash) return false
  serverHash = hash // avoid a second write before the snapshot comes back
  setDoc(doc(db, ...PATH), { items, hash, updatedAt: Date.now() }).catch(report)
  return true
}

function schedule() {
  window.clearTimeout(timer)
  timer = window.setTimeout(publishCatalogIfNeeded, PUBLISH_DELAY_MS)
}

/** Keep the public catalog current while this staff device is signed in. */
export function startCatalogPublisher(): () => void {
  if (!db) return () => {}
  const stopDoc = onSnapshot(
    doc(db, ...PATH),
    (snap) => {
      serverHash = snap.exists() ? (snap.data().hash as string) : null
      schedule()
    },
    report,
  )
  const stopProducts = subscribeProducts(schedule)
  schedule()
  return () => {
    stopDoc()
    stopProducts()
    window.clearTimeout(timer)
  }
}

let cache: { items: CatalogItem[]; at: number } | null = null

async function fetchCatalog(): Promise<CatalogItem[]> {
  if (!db) return []
  const snap = await getDoc(doc(db, ...PATH))
  const items = snap.exists() ? (snap.data().items as CatalogItem[]) : []
  cache = { items, at: Date.now() }
  return items
}

/** The visitor catalog: from the public document, or local products in local mode. */
export function useCatalog(): { items: CatalogItem[]; loading: boolean } {
  const products = useProducts()
  const [remote, setRemote] = useState<CatalogItem[] | null>(cache?.items ?? null)

  useEffect(() => {
    if (!db) return
    let cancelled = false
    const load = () => {
      fetchCatalog()
        .then((items) => {
          if (!cancelled) setRemote(items)
        })
        .catch(report)
    }
    if (!cache || Date.now() - cache.at > REFRESH_MS) load()
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (!cache || Date.now() - cache.at > REFRESH_MS)) load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const local = useMemo(() => buildCatalog(products).items, [products])
  if (!db) return { items: local, loading: false }
  return { items: remote ?? [], loading: remote === null }
}

/** One product's photo, loaded only when a visitor opens that product. */
export async function loadProductPhoto(id: string): Promise<string | null> {
  if (!db) return getProducts().find((p) => p.id === id)?.photoUrl ?? null
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? ((snap.data().photoUrl as string | undefined) ?? null) : null
}

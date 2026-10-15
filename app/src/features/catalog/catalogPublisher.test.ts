import { beforeEach, describe, expect, it, vi } from 'vitest'

// Runs the stores in "Firebase mode" against a mocked Firestore to check when
// the public catalog is (and is not) written.
const h = vi.hoisted(() => ({
  handlers: {} as Record<string, (snap: unknown) => void>,
  sets: [] as { path: string; data: Record<string, unknown> }[],
}))

vi.mock('@/lib/firebase', () => ({ db: { mock: true }, auth: null, firebaseEnabled: true }))

vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ path: name }),
  doc: (_db: unknown, ...segs: string[]) => ({ path: segs.join('/') }),
  query: (c: unknown) => c,
  orderBy: () => ({}),
  increment: (n: number) => ({ __increment: n }),
  setDoc: (ref: { path: string }, data: Record<string, unknown>) => {
    h.sets.push({ path: ref.path, data })
    return Promise.resolve()
  },
  updateDoc: () => Promise.resolve(),
  deleteDoc: () => Promise.resolve(),
  getDoc: () => Promise.resolve({ exists: () => false }),
  writeBatch: () => ({ update: () => {}, commit: () => Promise.resolve() }),
  onSnapshot: (ref: { path: string }, a: unknown, b: unknown) => {
    h.handlers[ref.path] = (typeof a === 'function' ? a : b) as (snap: unknown) => void
    return () => {}
  },
}))

type Stock = Record<string, number>

function productsSnapshot(stock: Stock, fromCache: boolean, price = 45000) {
  return {
    docs: Object.entries(stock).map(([id, s]) => ({
      id,
      data: () => ({
        owner: 'rina',
        nameId: `Produk ${id}`,
        nameEn: `Product ${id}`,
        category: 'zine',
        price,
        stock: s,
        photoUrl: 'data:image/jpeg;base64,PHOTO',
      }),
    })),
    metadata: { fromCache },
  }
}

async function load() {
  vi.resetModules()
  h.sets.length = 0
  h.handlers = {}
  const products = await import('../products/productsStore')
  const catalog = await import('./catalogStore')
  products.startProductsSync()
  return { products, catalog }
}

describe('public catalog publisher', () => {
  beforeEach(() => {
    h.sets.length = 0
  })

  it('does not publish from a cache-only product list', async () => {
    const { catalog } = await load()
    h.handlers.products(productsSnapshot({ a: 12 }, true))
    expect(catalog.publishCatalogIfNeeded()).toBe(false)
    expect(h.sets).toHaveLength(0)
  })

  it('publishes once the server confirms products, without stock or photos', async () => {
    const { catalog } = await load()
    h.handlers.products(productsSnapshot({ a: 12, b: 0 }, false))
    expect(catalog.publishCatalogIfNeeded()).toBe(true)
    expect(h.sets).toHaveLength(1)
    const doc = h.sets[0]
    expect(doc.path).toBe('catalog/public')
    expect(Object.keys(doc.data).sort()).toEqual(['hash', 'items', 'updatedAt'])
    const items = doc.data.items as Record<string, unknown>[]
    expect(items.map((i) => i.status)).toEqual(['available', 'soldOut'])
    expect(JSON.stringify(items)).not.toContain('PHOTO')
    expect(JSON.stringify(items)).not.toContain('stock')
  })

  it('skips the write when nothing visitors can see has changed', async () => {
    const { catalog } = await load()
    h.handlers.products(productsSnapshot({ a: 12 }, false))
    expect(catalog.publishCatalogIfNeeded()).toBe(true)
    h.handlers.products(productsSnapshot({ a: 9 }, false)) // still "available"
    expect(catalog.publishCatalogIfNeeded()).toBe(false)
    expect(h.sets).toHaveLength(1)
  })

  it('writes again when availability or price changes', async () => {
    const { catalog } = await load()
    h.handlers.products(productsSnapshot({ a: 12 }, false))
    catalog.publishCatalogIfNeeded()
    h.handlers.products(productsSnapshot({ a: 2 }, false)) // almost gone
    expect(catalog.publishCatalogIfNeeded()).toBe(true)
    h.handlers.products(productsSnapshot({ a: 2 }, false, 50000)) // price change
    expect(catalog.publishCatalogIfNeeded()).toBe(true)
    expect(h.sets).toHaveLength(3)
  })
})

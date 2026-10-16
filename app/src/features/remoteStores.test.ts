import { beforeEach, describe, expect, it, vi } from 'vitest'

// These tests run the stores in "Firebase mode" against a mocked Firestore to
// check which documents are written, without needing a backend.
const calls = vi.hoisted(() => ({
  setDoc: [] as { path: string; data: Record<string, unknown> }[],
  update: [] as { path: string; data: Record<string, unknown> }[],
  batchUpdate: [] as { path: string; data: Record<string, unknown> }[],
  commits: 0,
  snapshotHandler: null as null | ((snap: unknown) => void),
}))

vi.mock('@/lib/firebase', () => ({ db: { mock: true }, auth: null, firebaseEnabled: true }))

vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ path: name }),
  doc: (_db: unknown, col: string, id: string) => ({ path: `${col}/${id}` }),
  query: (c: unknown) => c,
  orderBy: () => ({}),
  increment: (n: number) => ({ __increment: n }),
  setDoc: (ref: { path: string }, data: Record<string, unknown>) => {
    calls.setDoc.push({ path: ref.path, data })
    return Promise.resolve()
  },
  updateDoc: (ref: { path: string }, data: Record<string, unknown>) => {
    calls.update.push({ path: ref.path, data })
    return Promise.resolve()
  },
  deleteDoc: () => Promise.resolve(),
  getDoc: () => Promise.resolve({ exists: () => false }),
  onSnapshot: (_q: unknown, handler: (snap: unknown) => void) => {
    calls.snapshotHandler = handler
    return () => {}
  },
  writeBatch: () => ({
    update: (ref: { path: string }, data: Record<string, unknown>) => {
      calls.batchUpdate.push({ path: ref.path, data })
    },
    commit: () => {
      calls.commits += 1
      return Promise.resolve()
    },
  }),
}))

import { applySale, returnStock, saveProduct } from './products/productsStore'
import { addSale, startSalesSync, voidSale } from './sales/salesStore'

beforeEach(() => {
  calls.setDoc.length = 0
  calls.update.length = 0
  calls.batchUpdate.length = 0
  calls.commits = 0
})

describe('products in Firebase mode', () => {
  it('writes a product document without the id field or undefined values', () => {
    saveProduct({
      id: 'p9',
      owner: 'tuesday',
      nameId: 'Pin',
      nameEn: 'Pin',
      category: 'accessory',
      price: 20000,
      stock: 5,
      photoUrl: undefined,
    })
    expect(calls.setDoc).toHaveLength(1)
    expect(calls.setDoc[0].path).toBe('products/p9')
    expect(calls.setDoc[0].data).not.toHaveProperty('id')
    expect(calls.setDoc[0].data).not.toHaveProperty('photoUrl')
  })

  it('reduces stock with increments in one batch when selling', () => {
    applySale([
      { productId: 'a', qty: 2 },
      { productId: 'b', qty: 1 },
    ])
    expect(calls.commits).toBe(1)
    expect(calls.batchUpdate).toEqual([
      { path: 'products/a', data: { stock: { __increment: -2 } } },
      { path: 'products/b', data: { stock: { __increment: -1 } } },
    ])
  })

  it('returns stock with positive increments', () => {
    returnStock([{ productId: 'a', qty: 3 }])
    expect(calls.batchUpdate[0].data).toEqual({ stock: { __increment: 3 } })
  })
})

describe('sales in Firebase mode', () => {
  const sale = {
    id: 's1',
    staffId: 'tuesday',
    items: [{ productId: 'a', ownerId: 'tuesday', name: 'Zine', qty: 1, unitPrice: 45000 }],
    total: 45000,
    payment: 'qris' as const,
    proofDataUrl: 'data:image/jpeg;base64,AAAA',
    createdAt: 1,
    pending: true,
  }

  it('stores the proof photo in its own document and keeps the sale light', () => {
    addSale(sale)
    const proof = calls.setDoc.find((c) => c.path === 'proofs/s1')
    const saleDoc = calls.setDoc.find((c) => c.path === 'sales/s1')
    expect(proof?.data).toEqual({ dataUrl: 'data:image/jpeg;base64,AAAA' })
    expect(saleDoc?.data).toMatchObject({ hasProof: true, total: 45000, staffId: 'tuesday' })
    expect(saleDoc?.data).not.toHaveProperty('proofDataUrl')
    expect(saleDoc?.data).not.toHaveProperty('pending')
    expect(saleDoc?.data).not.toHaveProperty('id')
  })

  it('marks sales pending while Firestore still has unsent writes', () => {
    startSalesSync()
    calls.snapshotHandler?.({
      docs: [
        { id: 's1', data: () => ({ ...sale, id: undefined }), metadata: { hasPendingWrites: true } },
      ],
    })
    // voidSale only works on sales it knows about
    expect(voidSale('s1')).toBe(true)
    expect(calls.update[0]).toMatchObject({ path: 'sales/s1', data: { voided: true } })
    expect(calls.batchUpdate[0].data).toEqual({ stock: { __increment: 1 } })
  })
})

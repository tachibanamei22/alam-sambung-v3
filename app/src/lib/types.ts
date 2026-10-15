export type Role = 'member' | 'admin'

export type PaymentMethod = 'cash' | 'qris' | 'transfer'

export interface AppUser {
  uid: string
  name: string
  role: Role
  /** Display initial and tint key, e.g. "rina". */
  memberKey: string
}

export interface Product {
  id: string
  ownerId: string
  nameId: string
  nameEn: string
  category: string
  price: number
  stock: number
  photoUrl?: string
  active: boolean
}

export interface SaleItem {
  productId: string
  ownerId: string
  name: string
  qty: number
  unitPrice: number
}

export interface Sale {
  id: string
  staffId: string
  items: SaleItem[]
  total: number
  payment: PaymentMethod
  /** Storage path of the proof photo, required for qris/transfer. */
  proofPath?: string
  /** Compressed proof photo kept on the device until it is uploaded. */
  proofDataUrl?: string
  cashReceived?: number
  createdAt: number
  voided?: boolean
  /** True until the sale has been synced to the backend. */
  pending?: boolean
}

export interface StampBooth {
  id: string
  name: string
  token: string
}

export type Role = 'member' | 'admin'

export type MemberKey = 'rina' | 'dika' | 'sari' | 'bima'

export type PaymentMethod = 'cash' | 'qris' | 'transfer'

export type CategoryId = 'zine' | 'sticker' | 'accessory' | 'print' | 'merch' | 'other'

export interface AppUser {
  uid: string
  name: string
  role: Role
  memberKey: MemberKey
}

export interface Product {
  id: string
  owner: MemberKey
  nameId: string
  nameEn: string
  category: CategoryId
  price: number
  stock: number
  /** Compressed photo kept on the device until it is uploaded. */
  photoUrl?: string
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
  voidedAt?: number
  /** True until the sale has been synced to the backend. */
  pending?: boolean
}

export interface StampBooth {
  id: string
  name: string
  token: string
}

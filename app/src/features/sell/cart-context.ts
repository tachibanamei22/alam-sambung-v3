import { createContext, useContext } from 'react'

export interface CartLine {
  productId: string
  qty: number
}

export interface CartContextValue {
  /** Quantity per product id. */
  qty: Record<string, number>
  lines: CartLine[]
  count: number
  add: (productId: string, max: number) => void
  decrement: (productId: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

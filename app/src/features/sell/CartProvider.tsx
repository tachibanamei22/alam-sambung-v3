import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from './cart-context'
import type { CartLine } from './cart-context'

export function CartProvider({ children }: { children: ReactNode }) {
  const [qty, setQty] = useState<Record<string, number>>({})

  const add = useCallback((productId: string, max: number) => {
    setQty((q) => ({ ...q, [productId]: Math.min((q[productId] ?? 0) + 1, max) }))
  }, [])

  const decrement = useCallback((productId: string) => {
    setQty((q) => {
      const next = (q[productId] ?? 0) - 1
      const { [productId]: _removed, ...rest } = q
      return next > 0 ? { ...rest, [productId]: next } : rest
    })
  }, [])

  const clear = useCallback(() => setQty({}), [])

  const value = useMemo(() => {
    const lines: CartLine[] = Object.entries(qty).map(([productId, q]) => ({ productId, qty: q }))
    const count = lines.reduce((sum, l) => sum + l.qty, 0)
    return { qty, lines, count, add, decrement, clear }
  }, [qty, add, decrement, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

import { useMemo, useState } from 'react'
import { useCurrentUser } from '@/lib/currentUser'
import { compressImage } from '@/lib/image'
import { useProductName } from '@/lib/productName'
import type { PaymentMethod, Product, Sale, SaleItem } from '@/lib/types'
import { applySale, useProducts } from '../products/productsStore'
import { addSale } from '../sales/salesStore'
import { useCart } from './cart-context'

export interface CheckoutItem {
  product: Product
  qty: number
}

function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step
}

/** Everything the phone checkout page and the tablet cart panel share. */
export function useCheckout() {
  const cart = useCart()
  const products = useProducts()
  const user = useCurrentUser()
  const nameOf = useProductName()

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [received, setReceived] = useState<number | null>(null)
  const [proof, setProof] = useState<string | null>(null)
  const [proofError, setProofError] = useState(false)

  const items = useMemo<CheckoutItem[]>(
    () =>
      cart.lines.flatMap((line) => {
        const product = products.find((p) => p.id === line.productId)
        return product ? [{ product, qty: line.qty }] : []
      }),
    [cart.lines, products],
  )
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  const quickAmounts = useMemo(() => {
    const options = [total, roundUp(total, 5000), roundUp(total, 50000), roundUp(total, 100000)]
    return [...new Set(options)].filter((n) => n >= total && n > 0).slice(0, 3)
  }, [total])

  const cashReceived = received ?? total
  const change = Math.max(0, cashReceived - total)
  const needsProof = method !== 'cash'
  const canConfirm = items.length > 0 && (method === 'cash' ? cashReceived >= total : proof !== null)

  async function pickProof(file: File | undefined) {
    if (!file) return
    setProofError(false)
    try {
      setProof(await compressImage(file))
    } catch {
      setProofError(true)
    }
  }

  function reset() {
    setMethod('cash')
    setReceived(null)
    setProof(null)
    setProofError(false)
  }

  /** Save the sale locally, reduce stock and empty the cart. */
  function confirm(): boolean {
    if (!canConfirm) return false
    const saleItems: SaleItem[] = items.map(({ product, qty }) => ({
      productId: product.id,
      ownerId: product.owner,
      name: nameOf(product),
      qty,
      unitPrice: product.price,
    }))
    const sale: Sale = {
      id: crypto.randomUUID(),
      staffId: user.memberKey,
      items: saleItems,
      total,
      payment: method,
      cashReceived: method === 'cash' ? cashReceived : undefined,
      proofDataUrl: needsProof && proof ? proof : undefined,
      createdAt: Date.now(),
      pending: true,
    }
    addSale(sale)
    applySale(saleItems)
    cart.clear()
    reset()
    return true
  }

  return {
    cart,
    items,
    total,
    method,
    setMethod,
    quickAmounts,
    cashReceived,
    setReceived,
    change,
    needsProof,
    proof,
    proofError,
    pickProof,
    canConfirm,
    confirm,
    nameOf,
  }
}

export type Checkout = ReturnType<typeof useCheckout>

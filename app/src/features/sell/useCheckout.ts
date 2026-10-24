import { useMemo, useRef, useState } from 'react'
import { useCurrentUser } from '@/lib/currentUser'
import { compressImage } from '@/lib/image'
import { parseAmount, suggestCashAmounts } from '@/lib/money'
import { useProductName } from '@/lib/productName'
import type { PaymentMethod, Product, Sale, SaleItem } from '@/lib/types'
import { applySale, useProducts } from '../products/productsStore'
import { addSale } from '../sales/salesStore'
import { useCart } from './cart-context'

export interface CheckoutItem {
  product: Product
  qty: number
}

/** Everything the phone checkout page and the tablet cart panel share. */
export function useCheckout() {
  const cart = useCart()
  const products = useProducts()
  const user = useCurrentUser()
  const nameOf = useProductName()

  const [method, setMethod] = useState<PaymentMethod>('cash')
  // A note chip only applies to the total it was picked for, so changing the
  // cart afterwards never leaves a stale "received" amount behind.
  const [chip, setChip] = useState<{ amount: number; forTotal: number } | null>(null)
  const [customText, setCustomText] = useState('')
  const [proof, setProof] = useState<string | null>(null)
  const [proofError, setProofError] = useState(false)
  // Two taps in the same instant must not record the same cart twice.
  const confirming = useRef(false)

  const items = useMemo<CheckoutItem[]>(
    () =>
      cart.lines.flatMap((line) => {
        const product = products.find((p) => p.id === line.productId)
        return product ? [{ product, qty: line.qty }] : []
      }),
    [cart.lines, products],
  )
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  const quickAmounts = useMemo(() => suggestCashAmounts(total), [total])

  // Priority: a typed amount, then a picked chip, otherwise exact change.
  const customAmount = parseAmount(customText)
  const cashReceived = customAmount ?? (chip && chip.forTotal === total ? chip.amount : total)
  const customActive = customAmount !== null
  const change = Math.max(0, cashReceived - total)
  const short = Math.max(0, total - cashReceived)
  const needsProof = method !== 'cash'
  const canConfirm = items.length > 0 && (method === 'cash' ? cashReceived >= total : proof !== null)

  function selectChip(amount: number) {
    setChip({ amount, forTotal: total })
    setCustomText('')
  }

  /** Accepts typed text such as "50.000"; keeps only the digits. */
  function setCustom(text: string) {
    const amount = parseAmount(text)
    setCustomText(amount === null ? '' : String(amount))
    if (amount !== null) setChip(null)
  }

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
    setChip(null)
    setCustomText('')
    setProof(null)
    setProofError(false)
  }

  /** Save the sale locally, reduce stock and empty the cart. */
  function confirm(): boolean {
    if (!canConfirm || confirming.current) return false
    confirming.current = true
    window.setTimeout(() => {
      confirming.current = false
    }, 500)
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
      hasProof: needsProof && proof ? true : undefined,
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
    selectChip,
    customText,
    customActive,
    setCustom,
    change,
    short,
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

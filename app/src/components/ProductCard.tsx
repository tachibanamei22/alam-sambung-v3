import { Package, Plus } from 'lucide-react'
import { formatRupiah } from '@/lib/money'
import { cn } from '@/lib/utils'

export type MemberKey = 'rina' | 'dika' | 'sari' | 'bima'

const TINT: Record<MemberKey, string> = {
  rina: 'bg-m-rina-bg text-m-rina-fg',
  dika: 'bg-m-dika-bg text-m-dika-fg',
  sari: 'bg-m-sari-bg text-m-sari-fg',
  bima: 'bg-m-bima-bg text-m-bima-fg',
}

interface ProductCardProps {
  name: string
  owner: MemberKey
  ownerName: string
  price: number
  stock: number
  /** Quantity currently in the cart. */
  qty?: number
  onAdd?: () => void
}

export function ProductCard({ name, owner, ownerName, price, stock, qty = 0, onAdd }: ProductCardProps) {
  const soldOut = stock <= 0
  const low = stock > 0 && stock <= 3
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={onAdd}
      className={cn(
        'flex flex-col gap-2.5 rounded-card border bg-surface p-2.5 text-left transition-colors',
        qty > 0 ? 'border-2 border-text' : 'border-border',
        soldOut && 'opacity-50',
      )}
    >
      <div className={cn('flex h-[104px] items-center justify-center rounded-[18px]', TINT[owner])}>
        <Package className="size-[30px]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-text">{name}</span>
        <span className={cn('text-xs', low ? 'text-warn' : 'text-muted')}>
          {ownerName} · {soldOut ? 'Sold out' : `${stock} left`}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-sticker px-2.5 py-1 font-head text-[13px] font-bold text-on-sticker">
          {formatRupiah(price)}
        </span>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-sm font-bold',
            qty > 0 ? 'bg-text text-bg' : 'bg-soft text-accent-text',
          )}
        >
          {qty > 0 ? qty : <Plus className="size-4" />}
        </span>
      </div>
    </button>
  )
}

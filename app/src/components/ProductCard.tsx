import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ImageViewer } from '@/components/ui/image-viewer'
import { CATEGORY_ICONS } from '@/lib/categories'
import { MEMBER_TINT } from '@/lib/members'
import { formatRupiah } from '@/lib/money'
import type { CategoryId, MemberKey } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  name: string
  owner: MemberKey
  ownerName: string
  category: CategoryId
  photoUrl?: string
  price: number
  stock: number
  /** Quantity currently in the cart. */
  qty?: number
  onAdd?: () => void
  onRemove?: () => void
  addLabel: string
  removeLabel: string
}

/**
 * Tap the picture or name to add one. Once it is in the cart a - and + stepper
 * replaces the add button, so a mistake is one tap to undo. The small expand
 * button on a photo opens it full screen without adding anything.
 */
export function ProductCard({
  name,
  owner,
  ownerName,
  category,
  photoUrl,
  price,
  stock,
  qty = 0,
  onAdd,
  onRemove,
  addLabel,
  removeLabel,
}: ProductCardProps) {
  const { t } = useTranslation()
  const soldOut = stock <= 0
  const low = stock > 0 && stock <= 3
  const atMax = qty >= stock
  const Icon = CATEGORY_ICONS[category]

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-card border bg-surface p-2.5 transition-[border-color,box-shadow,opacity] duration-200',
        qty > 0 ? 'border-2 border-text shadow-md shadow-black/10' : 'border-border',
        soldOut && 'opacity-50',
      )}
    >
      <div className="relative">
        <button
          type="button"
          disabled={soldOut || atMax}
          onClick={onAdd}
          aria-label={`${addLabel}: ${name}`}
          className="flex w-full flex-col gap-2.5 text-left disabled:cursor-not-allowed"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-[104px] w-full rounded-[18px] object-cover" />
          ) : (
            <div className={cn('flex h-[104px] items-center justify-center rounded-[18px]', MEMBER_TINT[owner])}>
              <Icon className="size-[30px]" />
            </div>
          )}
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-text">{name}</span>
            <span className={cn('text-xs', low ? 'text-warn' : 'text-muted')}>
              {ownerName} · {soldOut ? t('sell.soldOut') : t('sell.left', { count: stock })}
            </span>
          </span>
        </button>
        {photoUrl && <ImageViewer src={photoUrl} title={name} className="absolute right-1.5 top-1.5" />}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-sticker px-2.5 py-1 font-head text-[13px] font-bold text-on-sticker">
          {formatRupiah(price)}
        </span>
        {qty === 0 && (
          <button
            type="button"
            disabled={soldOut}
            aria-label={`${addLabel}: ${name}`}
            onClick={onAdd}
            className="flex size-8 items-center justify-center rounded-full bg-soft text-accent-text"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {qty > 0 && (
        <div className="flex animate-enter items-center justify-between rounded-full bg-text p-1 text-bg">
          <button
            type="button"
            aria-label={`${removeLabel}: ${name}`}
            onClick={onRemove}
            className="flex size-8 items-center justify-center rounded-full hover:bg-bg/15"
          >
            <Minus className="size-4" />
          </button>
          <span key={qty} className="animate-pop text-sm font-bold">
            {qty}
          </span>
          <button
            type="button"
            aria-label={`${addLabel}: ${name}`}
            disabled={atMax}
            onClick={onAdd}
            className="flex size-8 items-center justify-center rounded-full hover:bg-bg/15 disabled:opacity-30"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

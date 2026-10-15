import { BookOpen, KeyRound, Image, Package, ShoppingBag, Sticker } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CategoryId } from './types'

export const CATEGORY_IDS: CategoryId[] = ['zine', 'sticker', 'accessory', 'print', 'merch', 'other']

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  zine: BookOpen,
  sticker: Sticker,
  accessory: KeyRound,
  print: Image,
  merch: ShoppingBag,
  other: Package,
}

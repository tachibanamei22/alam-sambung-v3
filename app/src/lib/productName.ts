import { useTranslation } from 'react-i18next'
import type { Product } from './types'

/** Returns a function that picks the product name for the current language. */
export function useProductName() {
  const { i18n } = useTranslation()
  return (p: Pick<Product, 'nameId' | 'nameEn'>) =>
    i18n.language === 'en' ? p.nameEn || p.nameId : p.nameId || p.nameEn
}

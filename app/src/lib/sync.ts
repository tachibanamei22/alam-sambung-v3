import { startCatalogPublisher } from '@/features/catalog/catalogStore'
import { clearProducts, startProductsSync } from '@/features/products/productsStore'
import { clearSales, startSalesSync } from '@/features/sales/salesStore'
import { getCurrentUser, initAuth, subscribeCurrentUser } from './currentUser'
import { firebaseEnabled } from './firebase'

/**
 * Wire Auth and Firestore listeners together at startup. Products, sales and
 * the public-catalog publisher only run while a staff member is signed in;
 * visitors read the small public catalog document instead.
 */
export function startApp() {
  if (!firebaseEnabled) return
  initAuth()

  let stop: (() => void) | null = null
  const apply = () => {
    const signedIn = getCurrentUser().status === 'signedIn'
    if (signedIn && !stop) {
      const stops = [startProductsSync(), startSalesSync(), startCatalogPublisher()]
      stop = () => {
        for (const s of stops) s()
      }
    } else if (!signedIn && stop) {
      stop()
      stop = null
      clearSales()
      clearProducts()
    }
  }
  subscribeCurrentUser(apply)
  apply()
}

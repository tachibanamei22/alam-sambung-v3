import { clearSales, startSalesSync } from '@/features/sales/salesStore'
import { startProductsSync } from '@/features/products/productsStore'
import { getCurrentUser, initAuth, subscribeCurrentUser } from './currentUser'
import { firebaseEnabled } from './firebase'

/**
 * Wire Auth and Firestore listeners together at startup. Products are public
 * so they sync immediately; sales only sync while a staff member is signed in.
 */
export function startApp() {
  if (!firebaseEnabled) return
  initAuth()
  startProductsSync()

  let stopSales: (() => void) | null = null
  const apply = () => {
    const signedIn = getCurrentUser().status === 'signedIn'
    if (signedIn && !stopSales) {
      stopSales = startSalesSync()
    } else if (!signedIn && stopSales) {
      stopSales()
      stopSales = null
      clearSales()
    }
  }
  subscribeCurrentUser(apply)
  apply()
}

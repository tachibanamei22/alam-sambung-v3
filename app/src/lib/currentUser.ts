import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useSyncExternalStore } from 'react'
import { auth, firebaseEnabled } from './firebase'
import { memberEmail, userFromEmail } from './identity'
import type { MemberKey, Product, Role } from './types'

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut'

export interface CurrentUser {
  memberKey: MemberKey
  role: Role
  status: AuthStatus
}

// Local mode (no Firebase): the user is a placeholder kept on the device so
// the ownership rules can be exercised with the dev-only switcher.
const KEY = 'as-user'

function loadLocal(): CurrentUser {
  const fallback: CurrentUser = { memberKey: 'rina', role: 'member', status: 'signedIn' }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<CurrentUser>), status: 'signedIn' }
  } catch {
    // fall through to default
  }
  return fallback
}

let user: CurrentUser = firebaseEnabled
  ? { memberKey: 'rina', role: 'member', status: 'loading' }
  : loadLocal()
const listeners = new Set<() => void>()

function set(next: CurrentUser) {
  user = next
  for (const listener of listeners) listener()
}

export function getCurrentUser(): CurrentUser {
  return user
}

export function subscribeCurrentUser(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useCurrentUser(): CurrentUser {
  return useSyncExternalStore(subscribeCurrentUser, getCurrentUser)
}

/** Local mode only: act as another member or the admin. */
export function setCurrentUser(next: { memberKey: MemberKey; role: Role }) {
  if (firebaseEnabled) return
  set({ ...next, status: 'signedIn' })
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore: the choice just won't persist
  }
}

/** Start listening to Firebase Auth. Safe to call once at startup. */
export function initAuth() {
  const firebaseAuth = auth
  if (!firebaseAuth) return
  onAuthStateChanged(firebaseAuth, (fbUser) => {
    const identity = userFromEmail(fbUser?.email)
    if (fbUser && !identity) {
      // A Firebase account that is not one of our members: sign it out.
      void signOut(firebaseAuth)
      return
    }
    set(identity ? { ...identity, status: 'signedIn' } : { ...user, status: 'signedOut' })
  })
}

export async function signInWithPin(memberKey: MemberKey, pin: string) {
  if (!auth) throw new Error('Firebase is not configured')
  await signInWithEmailAndPassword(auth, memberEmail(memberKey), pin)
}

export async function signOutUser() {
  if (auth) await signOut(auth)
}

/** Members edit their own products; the admin edits everything. */
export function canEditProduct(current: Pick<CurrentUser, 'memberKey' | 'role'>, product: Pick<Product, 'owner'>): boolean {
  return current.role === 'admin' || product.owner === current.memberKey
}

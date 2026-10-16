import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useSyncExternalStore } from 'react'
import { auth, firebaseEnabled } from './firebase'
import { memberEmail, roleOf, userFromEmail } from './identity'
import { MEMBER_KEYS, isMemberKey } from './members'
import type { MemberKey, Product, Role } from './types'

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut'

export interface CurrentUser {
  memberKey: MemberKey
  role: Role
  status: AuthStatus
}

/** True when there is no Firebase config: data stays on the device and sign-in has no PIN. */
export const demoMode = !firebaseEnabled

const DEFAULT_MEMBER = MEMBER_KEYS[0]

// Demo mode keeps who is "signed in" on the device so the sign-in and
// sign-out flow can be tried without a backend. The role always comes from
// the member (see ADMIN_KEYS), exactly as it does with real accounts.
const KEY = 'as-user'

function build(memberKey: MemberKey, status: AuthStatus): CurrentUser {
  return { memberKey, role: roleOf(memberKey), status }
}

function loadDemo(): CurrentUser {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as { memberKey?: unknown; signedOut?: unknown }
      // Ignore a saved member that no longer exists (the list can change).
      const memberKey = isMemberKey(saved.memberKey) ? saved.memberKey : DEFAULT_MEMBER
      return build(memberKey, saved.signedOut === true ? 'signedOut' : 'signedIn')
    }
  } catch {
    // fall through to default
  }
  return build(DEFAULT_MEMBER, 'signedIn')
}

let user: CurrentUser = firebaseEnabled ? build(DEFAULT_MEMBER, 'loading') : loadDemo()
const listeners = new Set<() => void>()

function set(next: CurrentUser) {
  user = next
  for (const listener of listeners) listener()
}

function persistDemo(memberKey: MemberKey, signedOut: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ memberKey, signedOut }))
  } catch {
    // ignore: the choice just won't persist
  }
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
    set(identity ? build(identity.memberKey, 'signedIn') : build(user.memberKey, 'signedOut'))
  })
}

/** Sign in with a member and PIN (Firebase), or just the member in demo mode. */
export async function signIn(memberKey: MemberKey, pin: string) {
  if (!auth) {
    set(build(memberKey, 'signedIn'))
    persistDemo(memberKey, false)
    return
  }
  await signInWithEmailAndPassword(auth, memberEmail(memberKey), pin)
}

export async function signOutUser() {
  if (auth) {
    await signOut(auth)
    return
  }
  set(build(user.memberKey, 'signedOut'))
  persistDemo(user.memberKey, true)
}

/** Members edit their own products; the admin edits everything. */
export function canEditProduct(current: Pick<CurrentUser, 'memberKey' | 'role'>, product: Pick<Product, 'owner'>): boolean {
  return current.role === 'admin' || product.owner === current.memberKey
}

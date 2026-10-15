import { useSyncExternalStore } from 'react'
import type { MemberKey, Product, Role } from './types'

export interface CurrentUser {
  memberKey: MemberKey
  role: Role
}

// Placeholder until PIN login exists. The value is kept on the device so the
// ownership rules can be exercised (a dev-only switcher changes it).
const KEY = 'as-user'
const DEFAULT_USER: CurrentUser = { memberKey: 'rina', role: 'member' }

function load(): CurrentUser {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_USER, ...(JSON.parse(raw) as Partial<CurrentUser>) }
  } catch {
    // fall through to default
  }
  return DEFAULT_USER
}

let user: CurrentUser = load()
const listeners = new Set<() => void>()

export function setCurrentUser(next: CurrentUser) {
  user = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore: the choice just won't persist
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useCurrentUser(): CurrentUser {
  return useSyncExternalStore(subscribe, () => user)
}

/** Members edit their own products; the admin edits everything. */
export function canEditProduct(current: CurrentUser, product: Pick<Product, 'owner'>): boolean {
  return current.role === 'admin' || product.owner === current.memberKey
}

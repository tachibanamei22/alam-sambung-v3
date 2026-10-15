import type { MemberKey, Role } from './types'
import { MEMBER_KEYS } from './members'

/**
 * Staff sign in with a member name and a 6-digit PIN. Behind the scenes each
 * member is a Firebase email/password account `<member>@alamsambung.app`
 * whose password is the PIN. The domain is never used to send mail.
 *
 * Keep ADMIN_KEYS in sync with `isAdmin()` in firestore.rules.
 */
export const EMAIL_DOMAIN = 'alamsambung.app'
export const ADMIN_KEYS: MemberKey[] = ['rina']
export const PIN_LENGTH = 6

export function memberEmail(key: MemberKey): string {
  return `${key}@${EMAIL_DOMAIN}`
}

export function userFromEmail(email: string | null | undefined): { memberKey: MemberKey; role: Role } | null {
  if (!email) return null
  const [local, domain] = email.toLowerCase().split('@')
  if (domain !== EMAIL_DOMAIN) return null
  const memberKey = MEMBER_KEYS.find((k) => k === local)
  if (!memberKey) return null
  return { memberKey, role: ADMIN_KEYS.includes(memberKey) ? 'admin' : 'member' }
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)
}

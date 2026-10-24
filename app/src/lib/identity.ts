import type { MemberKey, Role } from './types'
import { MEMBER_KEYS } from './members'

/**
 * Staff sign in with a member name and a password. Behind the scenes each
 * member is a Firebase email/password account `<member>@alamsambung.app`
 * with that password. The domain is never used to send mail.
 *
 * Keep ADMIN_KEYS in sync with `isAdmin()` in firestore.rules.
 */
export const EMAIL_DOMAIN = 'alamsambung.app'
export const ADMIN_KEYS: MemberKey[] = ['ela']
/** Firebase's own minimum for email/password accounts. */
export const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 128

export function memberEmail(key: MemberKey): string {
  return `${key}@${EMAIL_DOMAIN}`
}

/** Admins edit everything; everyone else edits their own products. */
export function roleOf(key: MemberKey): Role {
  return ADMIN_KEYS.includes(key) ? 'admin' : 'member'
}

export function userFromEmail(email: string | null | undefined): { memberKey: MemberKey; role: Role } | null {
  if (!email) return null
  const [local, domain] = email.toLowerCase().split('@')
  if (domain !== EMAIL_DOMAIN) return null
  const memberKey = MEMBER_KEYS.find((k) => k === local)
  if (!memberKey) return null
  return { memberKey, role: roleOf(memberKey) }
}

/** Any characters, at least 6 long. A numeric PIN still works if that is what the account uses. */
export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH
}

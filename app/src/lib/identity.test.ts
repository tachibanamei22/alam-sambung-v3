import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ADMIN_KEYS, EMAIL_DOMAIN, isValidPin, memberEmail, userFromEmail } from './identity'
import { MEMBER_KEYS, MEMBER_NAMES, MEMBER_TINT, isMemberKey, memberInitial } from './members'

describe('identity', () => {
  it('builds the login email for a member', () => {
    expect(memberEmail('skye')).toBe(`skye@${EMAIL_DOMAIN}`)
  })

  it('maps a member email back to the member and role', () => {
    const admin = ADMIN_KEYS[0]
    expect(userFromEmail(`${admin}@${EMAIL_DOMAIN}`)).toEqual({ memberKey: admin, role: 'admin' })
    const other = MEMBER_KEYS.find((k) => !ADMIN_KEYS.includes(k))!
    expect(userFromEmail(`${other}@${EMAIL_DOMAIN}`)).toEqual({ memberKey: other, role: 'member' })
  })

  it('is case-insensitive about the email', () => {
    expect(userFromEmail(`LLYMOCHI@${EMAIL_DOMAIN.toUpperCase()}`)).toEqual({
      memberKey: 'llymochi',
      role: 'member',
    })
  })

  it('rejects unknown members, other domains and empty values', () => {
    expect(userFromEmail(`stranger@${EMAIL_DOMAIN}`)).toBeNull()
    expect(userFromEmail('tuesday@gmail.com')).toBeNull()
    expect(userFromEmail(null)).toBeNull()
  })

  it('accepts only 6-digit PINs', () => {
    expect(isValidPin('123456')).toBe(true)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('1234567')).toBe(false)
    expect(isValidPin('12a456')).toBe(false)
  })
})

describe('members', () => {
  it('has a display name and colour for every member', () => {
    for (const key of MEMBER_KEYS) {
      expect(MEMBER_NAMES[key]).toBeTruthy()
      expect(MEMBER_TINT[key]).toMatch(/^bg-m-\d-bg text-m-\d-fg$/)
    }
  })

  it('uses an upper-case initial even for lower-case names', () => {
    expect(memberInitial('llymochi')).toBe('L')
    expect(memberInitial('tuesday')).toBe('T')
  })

  it('only accepts known member keys', () => {
    expect(isMemberKey('skye')).toBe(true)
    expect(isMemberKey('rina')).toBe(false)
    expect(isMemberKey(undefined)).toBe(false)
  })

  it('keeps login emails valid: lower-case letters and digits only', () => {
    for (const key of MEMBER_KEYS) expect(key).toMatch(/^[a-z0-9]+$/)
  })

  it('has admins that are real members', () => {
    for (const admin of ADMIN_KEYS) expect(isMemberKey(admin)).toBe(true)
  })
})

describe('firestore.rules', () => {
  // The member and admin lists exist in three places. This catches drift.
  const rules = readFileSync(path.resolve(import.meta.dirname, '../../firestore.rules'), 'utf8')

  const listAfter = (marker: string): string[] => {
    const match = rules.match(new RegExp(`${marker}\\s*in\\s*\\[([^\\]]*)\\]`))
    expect(match, `rules should contain "${marker} in [...]"`).not.toBeNull()
    return [...(match?.[1].matchAll(/'([^']+)'/g) ?? [])].map((m) => m[1])
  }

  it('lists exactly the app members', () => {
    expect(listAfter('&& memberKey\\(\\)')).toEqual([...MEMBER_KEYS])
  })

  it('lists exactly the app admins', () => {
    expect(listAfter('isMember\\(\\) && memberKey\\(\\)')).toEqual([...ADMIN_KEYS])
  })

  it('uses the same email domain as the app', () => {
    expect(rules).toContain(EMAIL_DOMAIN.replace('.', '[.]'))
  })
})

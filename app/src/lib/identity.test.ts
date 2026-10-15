import { describe, expect, it } from 'vitest'
import { ADMIN_KEYS, EMAIL_DOMAIN, isValidPin, memberEmail, userFromEmail } from './identity'

describe('identity', () => {
  it('builds the login email for a member', () => {
    expect(memberEmail('dika')).toBe(`dika@${EMAIL_DOMAIN}`)
  })

  it('maps a member email back to the member and role', () => {
    const admin = ADMIN_KEYS[0]
    expect(userFromEmail(`${admin}@${EMAIL_DOMAIN}`)).toEqual({ memberKey: admin, role: 'admin' })
    expect(userFromEmail(`sari@${EMAIL_DOMAIN}`)).toEqual({ memberKey: 'sari', role: 'member' })
  })

  it('is case-insensitive about the email', () => {
    expect(userFromEmail(`Bima@${EMAIL_DOMAIN.toUpperCase()}`)).toEqual({ memberKey: 'bima', role: 'member' })
  })

  it('rejects unknown members, other domains and empty values', () => {
    expect(userFromEmail(`stranger@${EMAIL_DOMAIN}`)).toBeNull()
    expect(userFromEmail('rina@gmail.com')).toBeNull()
    expect(userFromEmail(null)).toBeNull()
  })

  it('accepts only 6-digit PINs', () => {
    expect(isValidPin('123456')).toBe(true)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('1234567')).toBe(false)
    expect(isValidPin('12a456')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { STAMP_BOOTHS, parseStampToken, stampLink } from './booths'
import { applyStamp } from './stampsStore'

describe('applyStamp', () => {
  it('adds a stamp for a known booth', () => {
    const r = applyStamp([], STAMP_BOOTHS[0].token, STAMP_BOOTHS, 100)
    expect(r.result).toBe('ok')
    expect(r.stamps).toEqual([{ token: STAMP_BOOTHS[0].token, at: 100 }])
  })

  it('ignores a booth that was already stamped', () => {
    const first = applyStamp([], STAMP_BOOTHS[1].token, STAMP_BOOTHS, 100)
    const again = applyStamp(first.stamps, STAMP_BOOTHS[1].token, STAMP_BOOTHS, 200)
    expect(again.result).toBe('duplicate')
    expect(again.stamps).toHaveLength(1)
  })

  it('rejects an unknown token', () => {
    const r = applyStamp([], 'not-a-booth', STAMP_BOOTHS, 100)
    expect(r.result).toBe('unknown')
    expect(r.stamps).toEqual([])
  })
})

describe('parseStampToken', () => {
  it('reads the token from a full link', () => {
    const link = stampLink('https://alam-sambung.web.app', 'as-neko-press')
    expect(parseStampToken(link)).toBe('as-neko-press')
  })

  it('accepts a bare typed code', () => {
    expect(parseStampToken('  as-kopi-tinta ')).toBe('as-kopi-tinta')
  })
})

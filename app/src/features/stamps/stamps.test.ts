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

describe('applyStamp edge cases', () => {
  it('matches a typed code in any case and stores the booth spelling', () => {
    const r = applyStamp([], '  AS-Kopi-Tinta ', STAMP_BOOTHS, 100)
    expect(r.result).toBe('ok')
    expect(r.stamps[0].token).toBe('as-kopi-tinta')
  })

  it('treats the same booth in a different case as a duplicate', () => {
    const first = applyStamp([], 'as-kopi-tinta', STAMP_BOOTHS, 100)
    expect(applyStamp(first.stamps, 'AS-KOPI-TINTA', STAMP_BOOTHS, 200).result).toBe('duplicate')
  })

  it('does not add anything for an empty code', () => {
    expect(applyStamp([], '', STAMP_BOOTHS, 100).result).toBe('unknown')
  })

  it('completes the card after every booth, in any order', () => {
    let stamps: ReturnType<typeof applyStamp>['stamps'] = []
    for (const booth of [...STAMP_BOOTHS].reverse()) {
      const r = applyStamp(stamps, booth.token, STAMP_BOOTHS, 1)
      expect(r.result).toBe('ok')
      stamps = r.stamps
    }
    expect(stamps).toHaveLength(STAMP_BOOTHS.length)
    expect(new Set(stamps.map((x) => x.token)).size).toBe(STAMP_BOOTHS.length)
  })
})

describe('parseStampToken', () => {
  it('reads the token from a full link', () => {
    const link = stampLink('https://alam-sambung.web.app', 'as-neko-press')
    expect(parseStampToken(link)).toBe('as-neko-press')
  })

  it('reads the token from a link with a query string or fragment', () => {
    expect(parseStampToken('https://x.app/visit/stamp/as-neko-press?utm=1#top')).toBe('as-neko-press')
  })

  it('accepts a bare typed code', () => {
    expect(parseStampToken('  as-kopi-tinta ')).toBe('as-kopi-tinta')
  })
})

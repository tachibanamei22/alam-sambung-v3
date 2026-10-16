import { describe, expect, it } from 'vitest'
import { formatRupiah, parseAmount, suggestCashAmounts } from './money'

describe('formatRupiah', () => {
  it('uses dots for thousands', () => {
    expect(formatRupiah(45000)).toBe('Rp 45.000')
    expect(formatRupiah(1245000)).toBe('Rp 1.245.000')
  })
})

describe('suggestCashAmounts', () => {
  it('offers the exact total and the nearest note amounts, like 15.000 -> 20.000, 50.000, 100.000', () => {
    expect(suggestCashAmounts(15000)).toEqual([15000, 20000, 50000, 100000])
  })

  it('suggests what a customer can really pay for a bigger total', () => {
    // 135.000: exact, 100k+20k+20k, 100k+50k, 2 x 100k
    expect(suggestCashAmounts(135000)).toEqual([135000, 140000, 150000, 200000])
  })

  it('keeps the closest first and drops duplicates', () => {
    expect(suggestCashAmounts(45000)).toEqual([45000, 50000, 60000, 100000])
    expect(suggestCashAmounts(100000)).toEqual([100000, 150000, 200000])
  })

  it('never suggests less than the total and respects the limit', () => {
    for (const total of [1000, 2500, 12500, 17000, 36000, 87500, 250000]) {
      const amounts = suggestCashAmounts(total)
      expect(amounts[0]).toBe(total)
      expect(amounts.every((a) => a >= total)).toBe(true)
      expect(new Set(amounts).size).toBe(amounts.length)
      expect(amounts.length).toBeLessThanOrEqual(4)
      expect([...amounts].sort((a, b) => a - b)).toEqual(amounts)
    }
    expect(suggestCashAmounts(15000, 2)).toEqual([15000, 20000])
  })

  it('returns nothing for an empty or invalid total', () => {
    expect(suggestCashAmounts(0)).toEqual([])
    expect(suggestCashAmounts(-5000)).toEqual([])
    expect(suggestCashAmounts(Number.NaN)).toEqual([])
  })
})

describe('parseAmount', () => {
  it('reads digits from typed text', () => {
    expect(parseAmount('50000')).toBe(50000)
    expect(parseAmount('Rp 1.500.000')).toBe(1500000)
    expect(parseAmount(' 20 000 ')).toBe(20000)
  })

  it('returns null when there are no digits and caps absurdly long input', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('1234567890123')).toBe(123456789)
  })
})

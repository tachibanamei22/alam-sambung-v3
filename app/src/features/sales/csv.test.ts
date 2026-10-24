import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('quotes commas, quotes and line breaks', () => {
    expect(toCsv([['a,b', 'say "hi"', 'x\ny']])).toBe('"a,b","say ""hi""","x\ny"')
  })

  it('defuses cells that a spreadsheet would run as formulas', () => {
    const row = toCsv([['=HYPERLINK("http://evil","x")', '+1+1', '-2+3', '@SUM(A1)']])
    expect(row).toBe('"\'=HYPERLINK(""http://evil"",""x"")",\'+1+1,\'-2+3,\'@SUM(A1)')
  })

  it('leaves real numbers, including negatives, alone', () => {
    expect(toCsv([[-5000, 12000, true]])).toBe('-5000,12000,true')
  })

  it('leaves ordinary text alone', () => {
    expect(toCsv([['Zine Vol.1', 'Tuesday']])).toBe('Zine Vol.1,Tuesday')
  })
})

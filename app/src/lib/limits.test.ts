import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MAX_PRICE, MAX_STOCK } from './limits'

// The rules are the real gate, so the app's limits must match them.
describe('limits match firestore.rules', () => {
  const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8')

  it('uses the same price ceiling', () => {
    expect(rules).toContain(`d.price <= ${MAX_PRICE}`)
  })

  it('uses the same stock ceiling', () => {
    expect(rules).toContain(`s <= ${MAX_STOCK}`)
  })
})

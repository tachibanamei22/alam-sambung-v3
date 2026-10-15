import { useSyncExternalStore } from 'react'
import type { StampBooth } from '@/lib/types'
import { STAMP_BOOTHS } from './booths'

export interface Stamp {
  token: string
  at: number
}

export type ClaimResult = 'ok' | 'duplicate' | 'unknown'

/** Pure rule used by the store: a stamp counts once per known booth. */
export function applyStamp(
  stamps: Stamp[],
  token: string,
  booths: StampBooth[],
  now: number,
): { stamps: Stamp[]; result: ClaimResult } {
  if (!booths.some((b) => b.token === token)) return { stamps, result: 'unknown' }
  if (stamps.some((s) => s.token === token)) return { stamps, result: 'duplicate' }
  return { stamps: [...stamps, { token, at: now }], result: 'ok' }
}

// The stamp card lives on the visitor's own phone, so no account is needed.
const KEY = 'as-stamps'

function load(): Stamp[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stamp[]) : []
  } catch {
    return []
  }
}

let stamps: Stamp[] = load()
const listeners = new Set<() => void>()

export function claimStamp(token: string): ClaimResult {
  const next = applyStamp(stamps, token, STAMP_BOOTHS, Date.now())
  if (next.result === 'ok') {
    stamps = next.stamps
    try {
      localStorage.setItem(KEY, JSON.stringify(stamps))
    } catch {
      // keep the in-memory copy for this session
    }
    for (const listener of listeners) listener()
  }
  return next.result
}

/** Short code shown with the finished card so staff can recognise it. */
export function getCardCode(): string {
  const key = 'as-card-id'
  try {
    const saved = localStorage.getItem(key)
    if (saved) return saved
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => alphabet[n % alphabet.length]).join('')
    localStorage.setItem(key, code)
    return code
  } catch {
    return '------'
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStamps(): Stamp[] {
  return useSyncExternalStore(subscribe, () => stamps)
}

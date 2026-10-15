import type { MemberKey } from './types'

export const MEMBER_KEYS: MemberKey[] = ['rina', 'dika', 'sari', 'bima']

export const MEMBER_NAMES: Record<MemberKey, string> = {
  rina: 'Rina',
  dika: 'Dika',
  sari: 'Sari',
  bima: 'Bima',
}

/** Background + foreground tint classes per member (theme aware). */
export const MEMBER_TINT: Record<MemberKey, string> = {
  rina: 'bg-m-rina-bg text-m-rina-fg',
  dika: 'bg-m-dika-bg text-m-dika-fg',
  sari: 'bg-m-sari-bg text-m-sari-fg',
  bima: 'bg-m-bima-bg text-m-bima-fg',
}

/**
 * The circle's members. To add or rename someone, change this list, then
 * ADMIN_KEYS in identity.ts and the two lists at the top of firestore.rules
 * (a unit test fails if they drift apart). The key is lowercase and becomes
 * the login email `<key>@alamsambung.app`.
 */
export const MEMBER_KEYS = ['tuesday', 'skye', 'llymochi', 'ela'] as const

export type MemberKey = (typeof MEMBER_KEYS)[number]

export const MEMBER_NAMES: Record<MemberKey, string> = {
  tuesday: 'Tuesday',
  skye: 'Skye',
  llymochi: 'llymochi',
  ela: 'Ela',
}

/** One letter for avatars. */
export function memberInitial(key: MemberKey): string {
  return MEMBER_NAMES[key].charAt(0).toUpperCase()
}

export function isMemberKey(value: unknown): value is MemberKey {
  return typeof value === 'string' && (MEMBER_KEYS as readonly string[]).includes(value)
}

// Colour slots, assigned to members in order (a 5th member reuses slot 1).
// Class names are written out in full so Tailwind can see them.
const TINT_SLOTS = [
  'bg-m-1-bg text-m-1-fg',
  'bg-m-2-bg text-m-2-fg',
  'bg-m-3-bg text-m-3-fg',
  'bg-m-4-bg text-m-4-fg',
]
const BAR_SLOTS = ['bg-m-1-fg', 'bg-m-2-fg', 'bg-m-3-fg', 'bg-m-4-fg']

function bySlot(slots: string[]): Record<MemberKey, string> {
  return Object.fromEntries(MEMBER_KEYS.map((k, i) => [k, slots[i % slots.length]])) as Record<
    MemberKey,
    string
  >
}

/** Background + foreground tint classes per member (theme aware). */
export const MEMBER_TINT = bySlot(TINT_SLOTS)

/** Solid bar colour per member, for the summary chart. */
export const MEMBER_BAR = bySlot(BAR_SLOTS)

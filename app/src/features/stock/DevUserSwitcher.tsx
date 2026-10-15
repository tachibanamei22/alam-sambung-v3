import { setCurrentUser, useCurrentUser } from '@/lib/currentUser'
import { MEMBER_KEYS, MEMBER_NAMES } from '@/lib/members'
import type { MemberKey } from '@/lib/types'

/** Development-only helper to act as a member or the admin before login exists. */
export function DevUserSwitcher() {
  const user = useCurrentUser()
  const value = user.role === 'admin' ? 'admin' : user.memberKey

  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-3.5 py-2.5 text-xs text-muted">
      Dev: acting as
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (v === 'admin') setCurrentUser({ memberKey: user.memberKey, role: 'admin' })
          else setCurrentUser({ memberKey: v as MemberKey, role: 'member' })
        }}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text"
      >
        {MEMBER_KEYS.map((k) => (
          <option key={k} value={k}>
            {MEMBER_NAMES[k]} (member)
          </option>
        ))}
        <option value="admin">Admin</option>
      </select>
    </label>
  )
}

import { MEMBER_FONT, MEMBER_LOGO, MEMBER_TINT, memberInitial } from '@/lib/members'
import type { MemberKey } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MemberMarkProps {
  member: MemberKey
  /** Sizing and text-size classes, e.g. "size-10 text-base". */
  className?: string
}

/**
 * A member's avatar: their logo if one is set, otherwise their initial in
 * their own display font on their colour. Decorative; put the name next to it
 * or in an aria-label on the control that holds it.
 */
export function MemberMark({ member, className }: MemberMarkProps) {
  const logo = MEMBER_LOGO[member]
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none',
        MEMBER_TINT[member],
        className,
      )}
    >
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        <span className={MEMBER_FONT[member]}>{memberInitial(member)}</span>
      )}
    </span>
  )
}

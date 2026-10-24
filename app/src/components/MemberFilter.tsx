import { LayoutGrid } from 'lucide-react'
import { MEMBER_KEYS, MEMBER_NAMES } from '@/lib/members'
import type { MemberKey } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MemberMark } from './MemberMark'

export type MemberFilterValue = 'all' | MemberKey

interface MemberFilterProps {
  value: MemberFilterValue
  onValueChange: (value: MemberFilterValue) => void
  allLabel: string
  'aria-label': string
}

/**
 * Who's products to show. Each member is an avatar; the chosen one opens up
 * into a pill with their name, and the one before it folds back to a circle.
 * The width animation is plain CSS (a grid column going 0fr to 1fr), so the
 * neighbours slide along with it.
 */
export function MemberFilter({ value, onValueChange, allLabel, ...aria }: MemberFilterProps) {
  const options: { value: MemberFilterValue; label: string }[] = [
    { value: 'all', label: allLabel },
    ...MEMBER_KEYS.map((key) => ({ value: key, label: MEMBER_NAMES[key] })),
  ]

  return (
    <div role="radiogroup" aria-label={aria['aria-label']} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'flex h-10 items-center rounded-full p-[3px] text-[13px] font-semibold',
              'transition-colors duration-300',
              active ? 'bg-text text-bg' : 'bg-surface text-text',
            )}
          >
            {option.value === 'all' ? (
              <span
                aria-hidden
                className={cn(
                  'flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                  active ? 'bg-bg/20' : 'bg-soft',
                )}
              >
                <LayoutGrid className="size-4" />
              </span>
            ) : (
              <MemberMark member={option.value} className="size-[34px] text-xl" />
            )}
            <span
              aria-hidden
              className={cn(
                'grid transition-[grid-template-columns] duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
                active ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]',
              )}
            >
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap pr-1 transition-[opacity,padding] duration-300',
                  active ? 'pl-2.5 pr-3 opacity-100' : 'pl-0 opacity-0',
                )}
              >
                {option.label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

import { useRef } from 'react'
import { useSlidingHighlight } from '@/lib/useSlidingHighlight'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: SegmentedOption<T>[]
  'aria-label': string
  /**
   * `chips`: separate pills that wrap (search filters).
   * `tabs`: one full-width track split into equal parts (scope and payment switches).
   */
  variant?: 'chips' | 'tabs'
  /** Track colour for `tabs`: glass on the amber header, soft on a page. */
  tone?: 'glass' | 'soft'
  disabled?: boolean
  className?: string
}

/**
 * The one control behind every filter, scope and payment switch. A highlight
 * flows to the chosen option (see useSlidingHighlight) instead of the colour
 * just snapping over. Painting order: option backgrounds, then the highlight,
 * then the labels.
 */
export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  variant = 'chips',
  tone = 'glass',
  disabled,
  className,
  ...aria
}: SegmentedProps<T>) {
  const root = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const chips = variant === 'chips'

  const highlight = useSlidingHighlight({
    active: value,
    container: root,
    measure: (key) => {
      const el = refs.current.get(String(key))
      return el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null
    },
  })

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-label={aria['aria-label']}
      className={cn(
        'relative',
        chips
          ? 'flex flex-wrap gap-2'
          : cn('flex gap-1 rounded-[20px] p-1', tone === 'glass' ? 'bg-glass' : 'bg-soft'),
        className,
      )}
    >
      <span
        ref={highlight}
        aria-hidden
        style={{ opacity: 0 }}
        className={cn(
          'pointer-events-none absolute left-0 top-0',
          chips ? 'rounded-full bg-text' : 'rounded-2xl bg-surface shadow-sm shadow-black/5',
        )}
      />
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              if (el) refs.current.set(option.value, el)
              else refs.current.delete(option.value)
            }}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'text-[13px] font-semibold',
              chips ? 'rounded-full bg-surface px-3.5 py-2' : 'h-10 flex-1 rounded-2xl',
              disabled && 'cursor-default',
            )}
          >
            <span
              className={cn(
                'relative inline-block transition-[color,transform] duration-300',
                active ? (chips ? 'text-bg' : 'text-text') : chips ? 'text-text' : 'text-muted',
                active && 'scale-[1.04]',
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

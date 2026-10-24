import { useLayoutEffect, useRef } from 'react'
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
 * slides to the chosen option instead of the colour just snapping over.
 * Painting order: option backgrounds, then the highlight, then the labels.
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
  const highlight = useRef<HTMLSpanElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const placed = useRef(false)
  const chips = variant === 'chips'

  // The highlight is positioned straight on the DOM node: it mirrors layout
  // that React does not own, and this avoids a render per measurement.
  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current.get(value)
      const mark = highlight.current
      if (!el || !mark) return
      mark.style.width = `${el.offsetWidth}px`
      mark.style.height = `${el.offsetHeight}px`
      mark.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`
      mark.style.opacity = '1'
      // Skip the slide for the first placement so it does not fly in.
      if (!placed.current) {
        placed.current = true
        requestAnimationFrame(() => {
          mark.style.transition = ''
        })
      }
    }
    place()
    // Labels change width with the language, and chips re-wrap with the window.
    const observer = new ResizeObserver(place)
    if (root.current) observer.observe(root.current)
    return () => observer.disconnect()
  }, [value, options])

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
        style={{ opacity: 0, transition: 'none' }}
        className={cn(
          'pointer-events-none absolute left-0 top-0 transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
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
                'relative transition-colors duration-200',
                active ? (chips ? 'text-bg' : 'text-text') : chips ? 'text-text' : 'text-muted',
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

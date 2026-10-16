import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

/** Styled replacement for the native <select>: animated, keyboard friendly, themeable. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  ...aria
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        {...aria}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-3.5 text-left text-[15px] text-text outline-none transition-colors',
          'focus-visible:border-accent data-[state=open]:border-accent disabled:opacity-50',
          'data-[placeholder]:text-muted',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/15',
            'data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out',
          )}
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex h-11 cursor-pointer select-none items-center rounded-xl pl-3 pr-9 text-[15px] text-text outline-none data-[highlighted]:bg-soft data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 flex items-center text-accent-text">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

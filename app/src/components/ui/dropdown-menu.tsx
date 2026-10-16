import * as Menu from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger
export const DropdownMenuRadioGroup = Menu.RadioGroup

export function DropdownMenuContent({ className, sideOffset = 8, ...props }: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align="end"
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          'z-50 w-64 origin-[var(--radix-dropdown-menu-content-transform-origin)] rounded-3xl border border-border bg-surface p-2 shadow-xl shadow-black/15',
          'data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out',
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  )
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Menu.Label>) {
  return <Menu.Label className={cn('px-3 pb-1 pt-2 text-xs font-semibold text-muted', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('mx-2 my-1.5 h-px bg-border', className)} {...props} />
}

const itemClass =
  'relative flex h-11 cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-text outline-none data-[highlighted]:bg-soft data-[disabled]:opacity-50'

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn(itemClass, className)} {...props} />
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={cn(itemClass, 'pr-9 data-[state=checked]:font-semibold', className)} {...props}>
      {children}
      <Menu.ItemIndicator className="absolute right-3 flex items-center text-accent-text">
        <Check className="size-4" />
      </Menu.ItemIndicator>
    </Menu.RadioItem>
  )
}

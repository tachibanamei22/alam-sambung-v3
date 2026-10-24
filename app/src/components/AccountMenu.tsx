import { LogOut, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { demoMode, signIn, signOutUser, useCurrentUser } from '@/lib/currentUser'
import { setLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import { MEMBER_KEYS, MEMBER_NAMES, MEMBER_TINT, memberInitial } from '@/lib/members'
import { useTheme } from '@/lib/theme-context'
import type { Theme } from '@/lib/theme-context'
import type { MemberKey } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

/** Keep the menu open so the effect of a language or theme change is visible. */
const stayOpen = (e: Event) => e.preventDefault()

/** Who is signed in, plus language, theme and sign out. Lives in every staff header. */
export function AccountMenu() {
  const { t, i18n } = useTranslation()
  const user = useCurrentUser()
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('account.menu')}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-text font-head text-sm font-bold text-bg outline-none focus-visible:ring-2 focus-visible:ring-text/40 data-[state=open]:ring-2 data-[state=open]:ring-text/40"
      >
        {memberInitial(user.memberKey)}
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-full font-head text-base font-bold',
              MEMBER_TINT[user.memberKey],
            )}
          >
            {memberInitial(user.memberKey)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{MEMBER_NAMES[user.memberKey]}</span>
            <span className="text-xs text-muted">
              {user.role === 'admin' ? t('stock.roleAdmin') : t('stock.roleMember')}
            </span>
          </span>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('account.language')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={i18n.language} onValueChange={(v) => setLang(v as Lang)}>
          <DropdownMenuRadioItem value="id" onSelect={stayOpen}>
            Bahasa Indonesia
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en" onSelect={stayOpen}>
            English
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuLabel>{t('account.theme')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          <DropdownMenuRadioItem value="light" onSelect={stayOpen}>
            <Sun className="size-4" />
            {t('account.light')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" onSelect={stayOpen}>
            <Moon className="size-4" />
            {t('account.dark')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        {demoMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('account.switchMember')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={user.memberKey}
              onValueChange={(v) => void signIn(v as MemberKey, '')}
            >
              {MEMBER_KEYS.map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {MEMBER_NAMES[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOutUser()} className="text-danger">
          <LogOut className="size-4" />
          {t('auth.signOut')}
        </DropdownMenuItem>
        {demoMode && <p className="px-3 pb-2 pt-1 text-xs text-muted">{t('account.demoHint')}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

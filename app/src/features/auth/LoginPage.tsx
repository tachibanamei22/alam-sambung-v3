import { LogIn } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AmberHeader } from '@/components/AmberHeader'
import { demoMode, signIn } from '@/lib/currentUser'
import { PIN_LENGTH, isValidPin } from '@/lib/identity'
import { MEMBER_KEYS, MEMBER_NAMES, MEMBER_TINT, memberInitial } from '@/lib/members'
import type { MemberKey } from '@/lib/types'
import { cn } from '@/lib/utils'

type LoginError = 'wrong' | 'offline' | 'generic' | null

function errorKind(error: unknown): LoginError {
  const code = (error as { code?: string } | null)?.code ?? ''
  if (code === 'auth/network-request-failed') return 'offline'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
    return 'wrong'
  return 'generic'
}

/** Staff sign in: pick your name, enter your 6-digit PIN (demo mode skips the PIN). */
export function LoginPage() {
  const { t } = useTranslation()
  const [member, setMember] = useState<MemberKey | null>(null)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<LoginError>(null)

  const canSubmit = member !== null && (demoMode || isValidPin(pin)) && !busy

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!member || !canSubmit) return
    setBusy(true)
    setError(null)
    try {
      await signIn(member, pin)
    } catch (err) {
      setError(errorKind(err))
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-bg">
      <AmberHeader eyebrow={t('app.name')} title={t('auth.title')} />
      <form onSubmit={(e) => void submit(e)} className="flex flex-1 animate-enter flex-col gap-5 px-5 pt-6">
        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-muted">{t('auth.who')}</legend>
          <div className="grid grid-cols-2 gap-3">
            {MEMBER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={member === key}
                onClick={() => setMember(key)}
                className={cn(
                  'flex items-center gap-3 rounded-card border bg-surface p-3 text-left',
                  member === key ? 'border-2 border-text' : 'border-border',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full font-head text-base font-bold',
                    MEMBER_TINT[key],
                  )}
                >
                  {memberInitial(key)}
                </span>
                <span className="text-[15px] font-semibold">{MEMBER_NAMES[key]}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {demoMode ? (
          <p className="rounded-2xl bg-soft p-3.5 text-[13px] text-accent-text">{t('auth.demoNote')}</p>
        ) : (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{t('auth.pin', { length: PIN_LENGTH })}</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={PIN_LENGTH}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="h-14 w-full rounded-2xl border border-border bg-surface px-4 text-center text-2xl tracking-[0.6em] outline-none transition-colors focus:border-accent"
            />
          </label>
        )}

        {error && (
          <p role="alert" className="animate-enter text-sm font-semibold text-danger">
            {t(`auth.errors.${error}`)}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-14 items-center justify-center gap-2 rounded-[20px] bg-accent text-base font-bold text-on-accent disabled:opacity-40"
        >
          <LogIn className="size-[18px]" />
          {demoMode ? t('auth.continue') : t('auth.signIn')}
        </button>
        {!demoMode && <p className="text-center text-xs text-muted">{t('auth.hint')}</p>}
      </form>
    </div>
  )
}

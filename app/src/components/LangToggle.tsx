import { useTranslation } from 'react-i18next'
import { setLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const LANGS: Lang[] = ['id', 'en']

export function LangToggle() {
  const { i18n } = useTranslation()
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-glass p-[3px]" role="group" aria-label="Language">
      {LANGS.map((lang) => {
        const active = i18n.language === lang
        return (
          <button
            key={lang}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(lang)}
            className={cn(
              'rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase transition-colors',
              active ? 'bg-text text-bg' : 'text-text',
            )}
          >
            {lang}
          </button>
        )
      })}
    </div>
  )
}

import { ArrowLeft, Camera, Lock, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router'
import { AmberHeader } from '@/components/AmberHeader'
import { CATEGORY_IDS } from '@/lib/categories'
import { canEditProduct, useCurrentUser } from '@/lib/currentUser'
import { compressImage } from '@/lib/image'
import { MEMBER_KEYS, MEMBER_NAMES } from '@/lib/members'
import type { CategoryId, MemberKey, Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { removeProduct, saveProduct, useProduct } from '../products/productsStore'

interface FormState {
  nameId: string
  nameEn: string
  owner: MemberKey
  price: string
  stock: string
  category: CategoryId
  photoUrl?: string
}

const inputClass =
  'h-12 w-full rounded-2xl border border-border bg-surface px-3.5 text-[15px] text-text outline-none focus:border-accent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

export function ProductFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const user = useCurrentUser()
  const existing = useProduct(id)
  const isEdit = id !== undefined
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(() => ({
    nameId: existing?.nameId ?? '',
    nameEn: existing?.nameEn ?? '',
    owner: existing?.owner ?? user.memberKey,
    price: existing ? String(existing.price) : '',
    stock: existing ? String(existing.stock) : '',
    category: existing?.category ?? 'zine',
    photoUrl: existing?.photoUrl,
  }))
  const [submitted, setSubmitted] = useState(false)

  // Unknown product, or a member trying to open someone else's product.
  if (isEdit && (!existing || !canEditProduct(user, existing))) {
    return <Navigate to="/staff/stock" replace />
  }

  const price = Number(form.price)
  const stock = Number(form.stock)
  const errors = {
    name: !form.nameId.trim() && !form.nameEn.trim(),
    price: !Number.isFinite(price) || price <= 0,
    stock: !Number.isInteger(stock) || stock < 0,
  }
  const valid = !errors.name && !errors.price && !errors.stock

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function onPhoto(file: File | undefined) {
    if (!file) return
    try {
      set('photoUrl', await compressImage(file, 800, 0.75))
    } catch {
      // ignore unreadable photo; the user can pick another
    }
  }

  function save() {
    setSubmitted(true)
    if (!valid) return
    const product: Product = {
      id: existing?.id ?? crypto.randomUUID(),
      owner: user.role === 'admin' ? form.owner : (existing?.owner ?? user.memberKey),
      nameId: form.nameId.trim(),
      nameEn: form.nameEn.trim(),
      category: form.category,
      price,
      stock,
      photoUrl: form.photoUrl,
    }
    saveProduct(product)
    void navigate('/staff/stock')
  }

  function remove() {
    if (!existing) return
    if (window.confirm(t('form.confirmDelete'))) {
      removeProduct(existing.id)
      void navigate('/staff/stock')
    }
  }

  return (
    <>
      <AmberHeader
        eyebrow={t('app.name')}
        title={isEdit ? t('form.editTitle') : t('form.addTitle')}
        actions={
          <button
            type="button"
            aria-label={t('common.back')}
            onClick={() => void navigate('/staff/stock')}
            className="flex size-10 items-center justify-center rounded-full bg-glass text-text"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-28 pt-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onPhoto(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-card border border-accent bg-soft text-accent-text"
        >
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="" className="size-full object-cover" />
          ) : (
            <>
              <Camera className="size-6" />
              <span className="text-sm font-semibold">{t('form.photo')}</span>
            </>
          )}
        </button>

        <div className="flex gap-3">
          <Field label={t('form.nameId')}>
            <input
              className={inputClass}
              value={form.nameId}
              onChange={(e) => set('nameId', e.target.value)}
            />
          </Field>
          <Field label={t('form.nameEn')}>
            <input
              className={inputClass}
              value={form.nameEn}
              onChange={(e) => set('nameEn', e.target.value)}
            />
          </Field>
        </div>
        {submitted && errors.name && <p className="text-xs text-danger">{t('form.errors.name')}</p>}

        <Field label={t('form.member')}>
          {user.role === 'admin' ? (
            <select
              className={inputClass}
              value={form.owner}
              onChange={(e) => set('owner', e.target.value as MemberKey)}
            >
              {MEMBER_KEYS.map((k) => (
                <option key={k} value={k}>
                  {MEMBER_NAMES[k]}
                </option>
              ))}
            </select>
          ) : (
            <div className={cn(inputClass, 'flex items-center justify-between bg-soft text-muted')}>
              {MEMBER_NAMES[existing?.owner ?? user.memberKey]} ({t('form.you')})
              <Lock className="size-4" />
            </div>
          )}
        </Field>

        <div className="flex gap-3">
          <Field label={t('form.price')}>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="45000"
              value={form.price}
              onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label={t('form.stock')}>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="0"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </div>
        {submitted && errors.price && <p className="text-xs text-danger">{t('form.errors.price')}</p>}
        {submitted && errors.stock && <p className="text-xs text-danger">{t('form.errors.stock')}</p>}

        <Field label={t('form.category')}>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => set('category', e.target.value as CategoryId)}
          >
            {CATEGORY_IDS.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </Field>

        {isEdit && (
          <button
            type="button"
            onClick={remove}
            className="mt-2 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-danger"
          >
            <Trash2 className="size-4" />
            {t('form.delete')}
          </button>
        )}
      </div>

      <div className="sticky bottom-[84px] px-4 pb-2 pt-2">
        <button
          type="button"
          onClick={save}
          className="h-[54px] w-full rounded-[20px] bg-accent text-[15px] font-bold text-on-accent"
        >
          {t('form.save')}
        </button>
      </div>
    </>
  )
}

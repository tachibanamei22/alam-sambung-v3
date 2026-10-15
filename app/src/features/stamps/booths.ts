import type { StampBooth } from '@/lib/types'

// Booths taking part in the stamp rally. Placeholder names until the real
// list is known; the token is the secret in each booth's QR link.
export const STAMP_BOOTHS: StampBooth[] = [
  { id: 'b1', name: 'Alam Sambung', token: 'as-alam-sambung' },
  { id: 'b2', name: 'Mie Aceh Zine', token: 'as-mie-aceh-zine' },
  { id: 'b3', name: 'Neko Press', token: 'as-neko-press' },
  { id: 'b4', name: 'Studio Pagi', token: 'as-studio-pagi' },
  { id: 'b5', name: 'Kopi Tinta', token: 'as-kopi-tinta' },
  { id: 'b6', name: 'Hutan Kecil', token: 'as-hutan-kecil' },
  { id: 'b7', name: 'Senja Art', token: 'as-senja-art' },
  { id: 'b8', name: 'Rumah Komik', token: 'as-rumah-komik' },
]

export function stampLink(origin: string, token: string): string {
  return `${origin}/visit/stamp/${token}`
}

/** Pull a booth token out of a scanned QR value or a typed code. */
export function parseStampToken(raw: string): string {
  const value = raw.trim()
  const match = value.match(/\/visit\/stamp\/([^/?#\s]+)/)
  return match ? match[1] : value
}

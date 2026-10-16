const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** Format a whole-rupiah amount, e.g. 45000 -> "Rp 45.000". */
export function formatRupiah(amount: number): string {
  return rupiah.format(amount).replace(/ /g, ' ')
}

/** Rupiah banknotes customers actually hand over, smallest first. */
export const NOTE_STEPS = [5000, 10000, 20000, 50000, 100000]

/**
 * Cash amounts to offer when a customer pays, closest first: the exact total,
 * then the amounts you reach by paying with whole 5.000, 10.000, 20.000,
 * 50.000 or 100.000 notes, plus the next 50.000 and 100.000 amount above the
 * total. For 15.000 that is 15.000, 20.000, 50.000 and 100.000. Anything else
 * goes through the custom field.
 */
export function suggestCashAmounts(total: number, max = 4): number[] {
  if (!Number.isFinite(total) || total <= 0) return []
  const amounts = new Set<number>([total])
  for (const step of NOTE_STEPS) amounts.add(Math.ceil(total / step) * step)
  // Exactly 100.000? Offer 150.000 and 200.000 too, instead of only the exact amount.
  for (const step of [50000, 100000]) amounts.add((Math.floor(total / step) + 1) * step)
  return [...amounts].sort((x, y) => x - y).slice(0, max)
}

/** Pull the digits out of typed text ("1.500 ", "Rp 20000") as a whole number, or null if empty. */
export function parseAmount(text: string): number | null {
  const digits = text.replace(/\D/g, '').slice(0, 9)
  return digits === '' ? null : Number(digits)
}

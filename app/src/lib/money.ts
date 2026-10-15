const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** Format a whole-rupiah amount, e.g. 45000 -> "Rp 45.000". */
export function formatRupiah(amount: number): string {
  return rupiah.format(amount).replace(/ /g, ' ')
}

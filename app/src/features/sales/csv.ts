import { MEMBER_KEYS, MEMBER_NAMES } from '@/lib/members'
import type { Sale } from '@/lib/types'
import { summarize } from './stats'

/**
 * Spreadsheets run cells that start with = + - @ as formulas. A product named
 * =HYPERLINK(...) would execute when the export is opened, so text cells that
 * look like formulas get a leading apostrophe.
 */
function cell(value: string | number | boolean): string {
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: (string | number | boolean)[][]): string {
  return rows.map((row) => row.map(cell).join(',')).join('\r\n')
}

function stamp(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

/** One row per sold item, so a spreadsheet can pivot by member or payment. */
export function salesLinesCsv(sales: Sale[]): string {
  const rows: (string | number | boolean)[][] = [
    ['date', 'time', 'sale_id', 'staff', 'payment', 'product', 'member', 'qty', 'unit_price', 'line_total', 'voided'],
  ]
  for (const sale of sales) {
    const { date, time } = stamp(sale.createdAt)
    for (const item of sale.items) {
      const member = MEMBER_NAMES[item.ownerId as keyof typeof MEMBER_NAMES] ?? item.ownerId
      rows.push([
        date,
        time,
        sale.id,
        sale.staffId,
        sale.payment,
        item.name,
        member,
        item.qty,
        item.unitPrice,
        item.qty * item.unitPrice,
        Boolean(sale.voided),
      ])
    }
  }
  return toCsv(rows)
}

/** What each member earned, for settling up after the event. */
export function memberTotalsCsv(sales: Sale[]): string {
  const summary = summarize(sales)
  const rows: (string | number)[][] = [['member', 'total_rp']]
  for (const key of MEMBER_KEYS) rows.push([MEMBER_NAMES[key], summary.byMember[key]])
  rows.push(['TOTAL', summary.total])
  return toCsv(rows)
}

export function downloadCsv(filename: string, csv: string) {
  // The BOM makes Excel read the file as UTF-8.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

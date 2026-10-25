// Where the last main-tab tap happened, so the next page can open from it.
// Held only briefly: a tap that does not change page (the tab you are already
// on) must not leak into a later back/forward navigation.
const FRESH_MS = 800

let origin: { x: number; y: number; at: number } | null = null

/** Remember the centre of the tapped tab, in viewport pixels. */
export function rememberNavOrigin(el: Element) {
  const r = el.getBoundingClientRect()
  origin = { x: r.left + r.width / 2, y: r.top + r.height / 2, at: performance.now() }
}

/** The remembered point if it is still fresh. Consumed: it is used once. */
export function takeNavOrigin(): { x: number; y: number } | null {
  const o = origin
  origin = null
  return o && performance.now() - o.at < FRESH_MS ? { x: o.x, y: o.y } : null
}

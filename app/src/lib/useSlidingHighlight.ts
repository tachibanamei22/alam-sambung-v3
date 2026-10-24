import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Options {
  /** Which option is active, or null for none. */
  active: string | number | null
  /** Where an option sits inside the container, in px. */
  measure: (key: string | number) => Box | null
  /** The container; its size changes re-place the highlight. */
  container: RefObject<HTMLElement | null>
  /** Direction the options run in. */
  axis?: 'x' | 'y'
}

const css = (b: Box) => ({ transform: `translate(${b.x}px, ${b.y}px)`, width: `${b.w}px`, height: `${b.h}px` })

/**
 * Drives the highlight behind a row or column of options. Moving to another
 * option stretches the highlight across both, then pulls it together with a
 * small overshoot, like a drop of liquid, instead of sliding at a fixed size.
 * Attach the returned ref to an absolutely positioned element at left/top 0.
 */
export function useSlidingHighlight({ active, measure, container, axis = 'x' }: Options) {
  const mark = useRef<HTMLSpanElement>(null)
  const last = useRef<{ key: string | number; box: Box } | null>(null)
  const running = useRef<Animation | null>(null)
  const measureRef = useRef(measure)

  useLayoutEffect(() => {
    measureRef.current = measure
  })

  useLayoutEffect(() => {
    const el = mark.current
    if (!el) return

    const place = (animate: boolean) => {
      // A resize callback must not cancel a slide that is still playing.
      if (!animate && running.current?.playState === 'running') return
      if (active === null) {
        el.style.opacity = '0'
        last.current = null
        return
      }
      const to = measureRef.current(active)
      if (!to) return
      const from = last.current && last.current.key !== active ? last.current.box : null
      running.current?.cancel()
      running.current = null

      Object.assign(el.style, css(to), { opacity: '1' })

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (animate && from && !reduce) {
        const x = axis === 'x'
        // The stretch only makes sense when both options share a row/column.
        const aligned = x
          ? Math.abs(from.y - to.y) < 2 && Math.abs(from.h - to.h) < 2
          : Math.abs(from.x - to.x) < 2 && Math.abs(from.w - to.w) < 2
        const start = x ? Math.min(from.x, to.x) : Math.min(from.y, to.y)
        const end = x ? Math.max(from.x + from.w, to.x + to.w) : Math.max(from.y + from.h, to.y + to.h)
        const stretched: Box = x
          ? { x: start, y: to.y, w: end - start, h: to.h }
          : { x: to.x, y: start, w: to.w, h: end - start }

        const frames: Keyframe[] = aligned
          ? [
              { ...css(from), easing: 'cubic-bezier(0.25, 0.8, 0.3, 1)' },
              { ...css(stretched), offset: 0.4, easing: 'cubic-bezier(0.3, 1.12, 0.5, 1)' },
              css(to),
            ]
          : [{ ...css(from), easing: 'cubic-bezier(0.3, 1.15, 0.5, 1)' }, css(to)]
        running.current = el.animate(frames, { duration: aligned ? 520 : 380 })
      }
      last.current = { key: active, box: to }
    }

    place(true)
    // Labels change width with the language and chips re-wrap with the window.
    // Those moves are not a user action, so they jump instead of animating.
    const observer = new ResizeObserver(() => place(false))
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [active, axis, container])

  return mark
}

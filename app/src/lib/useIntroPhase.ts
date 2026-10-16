import { useEffect, useState } from 'react'

/**
 * True for a short moment after the screen first mounts. Lists use it to
 * stagger their entrance once, not every time a filter changes what is shown.
 */
export function useIntroPhase(ms = 700): boolean {
  const [intro, setIntro] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setIntro(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])
  return intro
}

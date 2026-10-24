import { beforeEach, describe, expect, it, vi } from 'vitest'

// Demo mode (no Firebase config): sign-in is just picking a member. These
// tests use a tiny in-memory localStorage and reload the module each time so
// the saved state is read fresh, as it would be on a page load.
function installStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  })
  return data
}

async function load() {
  vi.resetModules()
  return import('./currentUser')
}

describe('current user in demo mode', () => {
  beforeEach(() => {
    installStorage()
  })

  it('starts signed in as the first member', async () => {
    const { getCurrentUser, demoMode } = await load()
    expect(demoMode).toBe(true)
    expect(getCurrentUser()).toEqual({ memberKey: 'tuesday', role: 'member', status: 'signedIn' })
  })

  it('derives the role from the member, never from saved data', async () => {
    installStorage({ 'as-user': JSON.stringify({ memberKey: 'skye', role: 'admin' }) })
    const { getCurrentUser } = await load()
    expect(getCurrentUser()).toMatchObject({ memberKey: 'skye', role: 'member' })
  })

  it('signs out and back in as another member, and remembers it', async () => {
    const data = installStorage()
    const first = await load()
    await first.signOutUser()
    expect(first.getCurrentUser().status).toBe('signedOut')

    await first.signIn('llymochi', '')
    expect(first.getCurrentUser()).toEqual({ memberKey: 'llymochi', role: 'member', status: 'signedIn' })

    // a fresh page load keeps the member
    installStorage(Object.fromEntries(data))
    const reloaded = await load()
    expect(reloaded.getCurrentUser()).toMatchObject({ memberKey: 'llymochi', status: 'signedIn' })
  })

  it('stays signed out after a reload until someone signs in', async () => {
    const data = installStorage()
    const first = await load()
    await first.signOutUser()
    installStorage(Object.fromEntries(data))
    const reloaded = await load()
    expect(reloaded.getCurrentUser().status).toBe('signedOut')
  })

  it('ignores a saved member that no longer exists', async () => {
    installStorage({ 'as-user': JSON.stringify({ memberKey: 'rina', signedOut: false }) })
    const { getCurrentUser } = await load()
    expect(getCurrentUser().memberKey).toBe('tuesday')
  })

  it('lets a member edit only their own products; the admin edits all', async () => {
    const { canEditProduct } = await load()
    expect(canEditProduct({ memberKey: 'skye', role: 'member' }, { owner: 'skye' })).toBe(true)
    expect(canEditProduct({ memberKey: 'skye', role: 'member' }, { owner: 'tuesday' })).toBe(false)
    expect(canEditProduct({ memberKey: 'ela', role: 'admin' }, { owner: 'skye' })).toBe(true)
  })

  it('tells subscribers when the user changes', async () => {
    const { signOutUser, subscribeCurrentUser } = await load()
    const listener = vi.fn()
    const stop = subscribeCurrentUser(listener)
    await signOutUser()
    expect(listener).toHaveBeenCalledTimes(1)
    stop()
  })
})

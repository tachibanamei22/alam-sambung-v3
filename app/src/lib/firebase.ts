import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * When the Firebase env vars are missing the app runs in local mode: data
 * stays on the device and there is no login. That keeps development, demos
 * and unit tests working without a backend.
 */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId)

const app = firebaseEnabled ? initializeApp(config) : null

export const auth = app ? getAuth(app) : null

// Offline-first: reads and writes go through a local IndexedDB cache and sync
// automatically when the connection returns.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  : null

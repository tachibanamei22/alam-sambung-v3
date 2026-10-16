// Starts the dev server in demo mode: Firebase config is blanked, so a local
// .env.local is ignored (variables already in process.env win over .env files).
// Data stays on the device and sign-in needs no password. Port: 5175.
import { createServer } from 'vite'

for (const key of [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]) {
  process.env[key] = ''
}

const server = await createServer({ server: { port: 5175 } })
await server.listen()
server.printUrls()

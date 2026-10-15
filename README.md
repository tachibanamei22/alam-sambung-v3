# Alam Sambung booth app

Booth sales, stock and stamp rally app for the Alam Sambung circle at Comifuro.

- **Staff side** (`/staff/*`): sell, stock per member, sales log, daily summary.
- **Visitor side** (`/visit/*`): product catalog and stamp rally.
- Mobile web app (PWA), Indonesian + English, light and dark mode, Rupiah.
- Phone layout (bottom tabs) and tablet layout (nav rail + cart panel).

## Repo layout

```
app/      React + TypeScript + Vite + Tailwind v4 app
design/   Pencil source (alam-sambung.pen) and exported screens
```

## Getting started

```bash
cd app
npm install
npm run dev
```

Useful scripts: `npm run build`, `npm run lint`, `npm test`, `npm run preview`.

With no Firebase config the app runs in **local mode**: no login, data stays
on the device. Add the Firebase values below to switch to the shared backend.

## Firebase setup

1. **Create the project** at <https://console.firebase.google.com> > Add project.
   Google Analytics can be off. The free Spark plan is enough.
2. **Register a web app**: Project settings > General > Your apps > Web (`</>`).
   Copy the config into `app/.env.local` (see `app/.env.example`):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. **Authentication** > Get started > Sign-in method > enable **Email/Password**
   (not "Email link"). Then Users > Add user, one per member, with the PIN as
   the password (6 digits, Firebase's minimum is 6 characters):

   | Email | Password |
   |---|---|
   | `rina@alamsambung.app` | her 6-digit PIN |
   | `dika@alamsambung.app` | his/her 6-digit PIN |
   | `sari@alamsambung.app` | ... |
   | `bima@alamsambung.app` | ... |

   Then Settings > User actions > turn **off** "Enable create (sign-up)" so
   nobody can add accounts from the app.
4. **Firestore Database** > Create database > **production mode**, location
   `asia-southeast2` (Jakarta). Open the Rules tab and paste
   `app/firestore.rules`, then Publish.
5. **Run the app**, sign in as the admin (Rina), open Stock and tap
   "Load sample products" if you want starter data.

Members, the admin and the email domain are defined in
`app/src/lib/members.ts` and `app/src/lib/identity.ts`; the same lists appear in
`app/firestore.rules`. Change all three together.

### How data is stored

| Data | Where | Notes |
|---|---|---|
| Products | `products/{id}` | Public read so visitors can browse |
| Sales | `sales/{id}` | Staff only; `pending` = not yet confirmed by the server |
| Payment proofs | `proofs/{saleId}` | Compressed photo as a data URL, loaded on demand |

Proof photos are stored in Firestore, not Cloud Storage, because Storage needs
the paid Blaze plan on new projects and Firestore queues writes offline for
free. Each photo is compressed to roughly 100-250 KB, under the 1 MiB limit.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, Tailwind v4, shadcn/ui + ReUI components |
| Fonts | Outfit (headings), DM Sans (body) via Fontsource |
| i18n | i18next (`src/locales/id.json`, `en.json`) |
| Offline / PWA | vite-plugin-pwa + Firestore persistent cache |
| Backend | Firebase Auth (PIN login), Firestore, Hosting |

## Design tokens

Colors live as CSS variables in `app/src/styles/index.css` (light in `:root`,
dark in `.dark`) and are exposed to Tailwind through `@theme inline`, so
classes like `bg-amber`, `text-muted` and `bg-sticker` follow the theme.
The chosen design is "Option 2 - amber header" with `#E98C57` as the main orange.

## Roles and data rules

- `member`: edits only their own products, sells any product.
- `admin`: edits everything and can void any sale.
- Selling another member's product only changes its `stock` field, using
  increments so two phones selling offline merge safely. Stock can go below 0
  after syncing; the Stock screen then shows "Check stock".

## Status

Done: sell, checkout with proof, stock, sales log with void, summary + CSV,
visitor catalog and stamp rally, tablet layout, Firebase wiring (needs a
project and the steps above).

Not done: deploy to Firebase Hosting, CI, PWA icons, stamp-rally anti-cheat
beyond static booth tokens.

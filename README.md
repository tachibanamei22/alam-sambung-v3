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

`npm run dev:demo` starts the app on port 5175 in demo mode even when
`.env.local` exists (no login password, data stays on the device), handy for
trying screens without touching the real project.

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
   (not "Email link"). Then Users > Add user, one per member. Any password of
   at least 6 characters works (a 6-digit PIN is fine too):

   | Email | Password |
   |---|---|
   | `tuesday@alamsambung.app` (admin) | Tuesday's password |
   | `skye@alamsambung.app` | Skye's password |
   | `llymochi@alamsambung.app` | llymochi's password |
   | `ela@alamsambung.app` | Ela's password |

   Then Settings > User actions > turn **off** "Enable create (sign-up)" so
   nobody can add accounts from the app.
4. **Firestore Database** > Create database > **production mode**, location
   `asia-southeast2` (Jakarta). Open the Rules tab and paste
   `app/firestore.rules`, then Publish.
5. **Run the app**, sign in as the admin (Tuesday), open Stock and tap
   "Load sample products" if you want starter data.

Members live in `app/src/lib/members.ts`, the admin in
`app/src/lib/identity.ts`, and both lists are repeated at the top of
`app/firestore.rules`. Change all three together; a unit test fails if they
drift apart. To add a member: add the key and name in `members.ts`, add the
key to the rules list, create their Firebase account, and republish the rules.

### How data is stored

| Data | Where | Notes |
|---|---|---|
| Products | `products/{id}` | Staff can list; visitors can only fetch one by id (for its photo) |
| Public catalog | `catalog/public` | One small document (names, prices, availability) that visitors read instead of every product |
| Sales | `sales/{id}` | Staff only; `pending` = not yet confirmed by the server |
| Payment proofs | `proofs/{saleId}` | Compressed photo as a data URL, loaded on demand |

**Public catalog.** Visitors read one document, so a busy day costs about one
read per visitor instead of one per product (the free quota is about 50,000
reads a day). Any signed-in staff device keeps it current: after the server has
confirmed the product list it rebuilds the catalog and writes it only when
something visitors can see changed (availability, price, name). Plain stock
movements inside a status ("12 left" to "11 left") cause no write. If no staff
device is online the catalog simply stays at its last published state.

Proof photos are stored in Firestore, not Cloud Storage, because Storage needs
the paid Blaze plan on new projects and Firestore queues writes offline for
free. Each photo is compressed to roughly 100-250 KB, under the 1 MiB limit.

## CI and deployment

GitHub Actions workflows live in `.github/workflows`:

| Workflow | When | What it does |
|---|---|---|
| `ci.yml` | every pull request, pushes to `main` | `npm ci`, lint, unit tests, build (in `app/`) |
| `preview.yml` | pull requests from this repo | Builds and publishes a temporary preview URL on Firebase Hosting (7 days) |
| `deploy.yml` | pushes to `main`, or run manually | Lint, test, build, then publishes the live site |
| `deploy-rules.yml` | run manually | Publishes `app/firestore.rules` to the project |

`preview.yml`, `deploy.yml` and `deploy-rules.yml` skip themselves until the
repository variable `FIREBASE_PROJECT_ID` exists, so they are safe to merge
before Firebase is set up.

### One-time setup

1. **Service account key.** Firebase console > Project settings > Service
   accounts > Generate new private key. Keep the JSON file out of git.
2. **GitHub secret.** Repo > Settings > Secrets and variables > Actions >
   Secrets > New repository secret. Name `FIREBASE_SERVICE_ACCOUNT`, value is
   the whole JSON file. Then delete the downloaded file.
3. **GitHub variables** (same page, Variables tab). These are the same public
   web-app values as `.env.local`, not secrets:

   | Variable | Value |
   |---|---|
   | `FIREBASE_PROJECT_ID` | project id |
   | `VITE_FIREBASE_API_KEY` | web API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | sender id |
   | `VITE_FIREBASE_APP_ID` | web app id |
4. **Hosting.** Firebase console > Build > Hosting > Get started (just
   create the site, no CLI steps needed).
5. **Publish.** Merge to `main` (or run "Deploy to Firebase Hosting" from the
   Actions tab). The site is at `https://<project>.web.app`.
6. **Rules** (optional automation). Grant the service account the
   "Firebase Rules Admin" role in Google Cloud IAM, then run "Deploy Firestore
   rules" from the Actions tab whenever `firestore.rules` changes. Otherwise
   paste the rules into the console as before.

Recommended: Settings > Branches > protect `main` and require the `CI` check.

### Manual deploy from a laptop

```bash
npm install -g firebase-tools
firebase login
cd app
firebase use <project-id>
npm run build
firebase deploy --only hosting,firestore:rules
```

Print the stamp rally QR codes from the **live** site (`/staff/stamp-codes`), so
they point at the public address and not at `localhost`.

### App icons

The icon is the "App Icon 512" frame in `design/alam-sambung.pen`, exported to
`app/public/icons` (192, 512, maskable 512 and the 180px Apple touch icon).
`favicon.svg` is a hand-written SVG of the same mark.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, Tailwind v4, shadcn/ui + ReUI components |
| Fonts | Outfit (headings), DM Sans (body) via Fontsource |
| i18n | i18next (`src/locales/id.json`, `en.json`) |
| Offline / PWA | vite-plugin-pwa + Firestore persistent cache |
| Backend | Firebase Auth (name + password login), Firestore, Hosting |

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

Also done: CI, Firebase Hosting deploy and PR previews, PWA icons.

Not done: stamp-rally anti-cheat beyond static booth tokens, real member
names, end-to-end test against a live Firebase project.

# Alam Sambung booth app

Booth sales, stock and stamp rally app for the Alam Sambung circle at Comifuro.

- **Staff side** (`/staff/*`): sell, stock per member, sales log, daily summary.
- **Visitor side** (`/visit/*`): product catalog and stamp rally.
- Mobile web app (PWA), Indonesian + English, light and dark mode, Rupiah.

## Repo layout

```
app/      React + TypeScript + Vite + Tailwind v4 app
design/   Pencil source (alam-sambung.pen) and exported screens
```

## Getting started

```bash
cd app
npm install
cp .env.example .env.local   # fill in Firebase project values
npm run dev
```

Useful scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, Tailwind v4, shadcn/ui + ReUI components |
| Fonts | Outfit (headings), DM Sans (body) via Fontsource |
| i18n | i18next (`src/locales/id.json`, `en.json`) |
| Offline / PWA | vite-plugin-pwa + Firestore persistent cache |
| Backend | Firebase Auth, Firestore, Storage, Hosting |

## Design tokens

Colors live as CSS variables in `app/src/styles/index.css` (light in `:root`,
dark in `.dark`) and are exposed to Tailwind through `@theme inline`, so
classes like `bg-amber`, `text-muted` and `bg-sticker` follow the theme.
The chosen design is "Option 2 - amber header" with `#E98C57` as the main orange.

## Roles and data rules

- `member`: edits only their own products, sells any product.
- `admin`: edits everything.
- Selling another member's product only changes its `stock` field.
  See `app/firestore.rules` and `app/storage.rules`.

## Status

Scaffold only: shell, theme, language toggle, tab navigation and a Sell page
with sample data. Firestore wiring, PIN login, checkout with proof, stock,
sales log, summary and visitor features are next.

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Pages / Routes

| Page | URL |
|------|-----|
| Accueil | `/` |
| À propos | `/about-us` |
| Contact | `/contact-us` |
| Guide | `/guide` |
| FAQ | `/faq` |
| Tarifs | `/resources/pricing` |
| Blog | `/resources/blog` |
| Blog Article | `/resources/blog/[slug]` |
| Visa | `/visa` |
| Import-Export | `/import-export` |
| Import-Export Calculator | `/import-export/calculator` |
| Import-Export Tracking | `/import-export/tracking` |
| Personal Shopping | `/personal-shopping` |
| Personal Shopping New | `/personal-shopping/new` |
| Personal Shopping Detail | `/personal-shopping/[id]` |
| Politique de confidentialité | `/privacy-policy` |
| Login | `/login` |
| Register | `/register` |
| Forgot Password | `/forgot-password` |
| Dashboard | `/dashboard` |
| **Admin** | |
| Dashboard | `/admin/dashboard` |
| Profile | `/admin/profile` |
| **Admin - Users** | |
| Users List | `/admin/users` |
| User Detail | `/admin/users/[id]` |
| Roles | `/admin/users/roles` |
| **Admin - Catalog** | |
| Categories | `/admin/categories` |
| Products | `/admin/products` |
| **Admin - Content** | |
| Blog | `/admin/blog` |
| Guides | `/admin/guides` |
| FAQ | `/admin/faq` |
| Pricing | `/admin/pricing` |
| **Admin - Requests** | |
| Requests | `/admin/requests` |
| Request Detail | `/admin/requests/[id]` |
| **Admin - Shipments** | |
| Shipments | `/admin/shipments` |
| Shipment Detail | `/admin/shipments/[id]` |
| **Admin - Support** | |
| Support | `/admin/support` |
| **Admin - Reports** | |
| Reports | `/admin/reports` |
| **Admin - Visas** | |
| Visas | `/admin/visas` |

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

```
npm run build:vercel && vercel --prod
```
Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NADOM is a Nuxt 3-based import-export and personal shopping platform connecting clients with China-based services. The application consists of:
- **Front-Office**: Client interface for ordering services (Personal Shopping, Shipping, Visa, Guides)
- **Back-Office**: Admin dashboard for managing orders, users, and services
- **Data Layer**: Pinia stores with localStorage persistence (no real backend)

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Architecture

### Tech Stack
- **Framework**: Nuxt 3 (with auto-imports)
- **State Management**: Pinia stores (`stores/`)
- **Styling**: Bootstrap 5 + Custom SCSS (`assets/scss/style.scss`)
- **Internationalization**: @nuxtjs/i18n (French default, English available)
- **Components**: Vue 3 Composition API with `<script setup>`

### Core Architectural Patterns

1. **File-Based Routing**: Pages in `pages/` map to routes automatically
   - `pages/index.vue` → `/`
   - `pages/personal-shopping/[id].vue` → `/personal-shopping/:id`
   - `pages/admin/*` → Admin routes (protected by middleware)

2. **State Management Strategy**:
   - All business data lives in Pinia stores (`stores/`)
   - Data persists to localStorage via `saveToLocalStorage()` methods
   - Fake data loaded from `utils/data/fakeData.ts` on first load
   - Stores available: `auth`, `personalShopping`, `shipping`, `guides`, `visas`, `blog`, `cart`

3. **Layout System**:
   - `layouts/default.vue`: Public pages with header/footer
   - `layouts/admin.vue`: Admin pages with sidebar navigation
   - Set layout in page using `definePageMeta({ layout: 'admin' })`

4. **Middleware Protection**:
   - `middleware/auth.ts`: Protects authenticated routes
   - `middleware/admin.ts`: Restricts admin pages to admin users
   - Applied via `definePageMeta({ middleware: ['auth', 'admin'] })`

### Key Directories

```
pages/               # File-based routes (front + admin)
├── admin/          # Admin dashboard and management pages
├── personal-shopping/  # Personal Shopping feature
├── import-export/  # Shipping tracking and calculator
├── visa/           # Visa services
├── guide/          # Guide/interpreter booking
└── resources/      # Blog, FAQ, pricing

components/         # Vue components (auto-imported)
├── Admin/         # Admin-specific components
├── PersonalShopping/  # Personal Shopping components
├── Shipping/      # Shipping-related components
└── Common/        # Shared UI components

stores/            # Pinia stores (auto-imported)
composables/       # Reusable composition functions (auto-imported)
layouts/           # Layout wrappers
middleware/        # Route middleware
utils/             # Helper functions and fake data
i18n/locales/      # Translation files (en.json, fr.json)
assets/scss/       # Global styles
public/            # Static assets
```

## Store Architecture

Each store follows this pattern:

```typescript
// State: reactive data
state: () => ({
  items: [] as Item[],
  loading: false,
  error: null as string | null
})

// Getters: computed values
getters: {
  getItemById: (state) => (id: string) => state.items.find(i => i.id === id)
}

// Actions: async operations + localStorage sync
actions: {
  async fetchItems() { /* load from localStorage or fake data */ },
  async createItem(data) { /* create + save to localStorage */ },
  saveToLocalStorage() { /* persist to localStorage */ }
}
```

**Critical Store Methods**:
- `auth.initializeAuth()`: Must be called on app mount to restore session
- `*Store.saveToLocalStorage()`: Call after any data mutation to persist
- Stores auto-import in components: `const store = useAuthStore()`

## Internationalization (i18n)

- Default locale: French (`fr`)
- Available locales: French (`fr`), English (`en`)
- Translation files: `i18n/locales/{fr,en}.json`
- Usage in templates: `{{ $t('key.path') }}`
- Usage in script: `const { t } = useI18n()`
- Strategy: `no_prefix` (no `/fr/` or `/en/` in URLs, uses cookie)
- Language switcher should update `i18n_redirected` cookie

## Composables

Located in `composables/`, auto-imported:

- **useForm.ts**: Form state management with validation
  - `const { form, errors, validate, reset } = useForm(initialData)`
- **useFormatters.ts**: Currency, date, phone number formatting
  - `const { formatCurrency, formatDate } = useFormatters()`
- **useNotification.ts**: Toast notifications
  - `const { addNotification } = useNotification()`
- **useWhatsApp.ts**: WhatsApp integration helpers
  - `const { openWhatsAppChat } = useWhatsApp()`

## Important Configuration

### Runtime Config (nuxt.config.ts)
```typescript
runtimeConfig: {
  public: {
    whatsapp: "+2250714158172",  // Business WhatsApp number
    logo: "/logo_nadom.png",
    siteName: "NADOM"
  }
}
```
Access in components: `const config = useRuntimeConfig()`

### External Dependencies (CDN)
The app uses CDN links for Bootstrap Icons, Font Awesome, Swiper, Lightgallery, Dropzone, Quill editor. These are loaded via `nuxt.config.ts` head configuration.

## Development Guidelines

### When Adding New Features

1. **Create/Update Store First**: Add business logic to appropriate Pinia store
2. **Create Page**: Add to `pages/` with proper layout and middleware
3. **Build Components**: Create reusable components in `components/`
4. **Add Translations**: Update both `i18n/locales/en.json` and `fr.json`
5. **Persist Data**: Call `store.saveToLocalStorage()` after mutations

### Code Conventions

- Use TypeScript interfaces for type safety
- Use Composition API with `<script setup lang="ts">`
- Prefer composables over mixins
- Keep components small and focused
- Use Bootstrap utility classes for styling
- Follow existing naming patterns (PascalCase for components)

### Fake Data System

Fake data defined in `utils/data/fakeData.ts`:
- `FAKE_USERS`: Test users (includes admin@example.com / admin123)
- `FAKE_PERSONAL_SHOPPING_REQUESTS`: Sample personal shopping requests
- `FAKE_DESTINATIONS`: Shipping destinations with pricing
- `FAKE_SHIPMENTS`: Sample shipments with tracking
- `FAKE_CATEGORIES`: Product categories
- `FAKE_GUIDES`: Available guides/interpreters
- `FAKE_VISAS`: Visa types and requirements
- `FAKE_BLOG_POSTS`: Blog articles
- `FAKE_FAQ`: FAQ items

Data loads from localStorage first, falls back to fake data if not found.

### WhatsApp Integration

The platform uses WhatsApp Web links (no API):
- Opens WhatsApp chat with business number
- Use `useWhatsApp()` composable for consistency
- Format: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

## Admin Dashboard

Admin pages (`/admin/*`) require:
1. User must be logged in
2. User role must be `'admin'`
3. Layout set to `'admin'`
4. Middleware: `['auth', 'admin']`

Admin login credentials (fake data):
- Email: `admin@example.com`
- Password: `admin123`

## Common Development Scenarios

### Adding a New Personal Shopping Request Status
1. Update type in `stores/personalShopping.ts`
2. Add translation keys to i18n files
3. Update status badge component styling
4. Update timeline component to handle new status

### Adding a New Shipping Destination
1. Add to `FAKE_DESTINATIONS` in `utils/data/fakeData.ts`
2. Ensure shipping modes are configured with pricing
3. Update calculator component if needed

### Creating a New Admin Management Page
1. Create page in `pages/admin/`
2. Set layout to `'admin'` and middleware to `['auth', 'admin']`
3. Create table component in `components/Admin/`
4. Add navigation link to `components/Admin/AdminSidebar.vue`

## Git Workflow

- Main branch: `master`
- Current development branch: `dev-ib`
- Always create descriptive commit messages
- Use feature branches for new features

## Notes from Project Requirements

- **No Real Backend**: All data operations use localStorage + Pinia
- **Bootstrap 5**: Primary UI framework (already included)
- **Reuse Template Components**: Extend existing components rather than creating from scratch
- **Mobile First**: Ensure responsive design with Bootstrap grid
- **SEO Optimized**: Use Nuxt's built-in meta tag management

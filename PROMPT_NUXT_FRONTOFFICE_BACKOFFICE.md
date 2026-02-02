# PROMPT POUR CLAUDE CODE
## Projet : Plateforme Web Import-Export Chine | Personal Shopping
### Framework : Nuxt.js | Focus : Front-Office + Back-Office avec Template Existant

---

## 1. CONTEXTE DU PROJET

Tu vas développer une **plateforme web complète en Nuxt.js** en utilisant un **template existant** pour:
- **Front-Office** : Interface client pour commander services
- **Back-Office** : Interface admin pour gérer les commandes
- **Données** : Fake data stockées en Nuxt stores (Pinia) + localStorage (pas de serveur réel)

**Stack Technologique :**
- **Framework** : Nuxt 3 (ou Nuxt 2 selon ton template)
- **State Management** : Pinia (Nuxt 3) ou Vuex (Nuxt 2)
- **Styling** : Tailwind CSS (déjà dans le template)
- **Components** : Componentes Nuxt existants du template
- **Storage** : localStorage pour persistance
- **Intégration** : WhatsApp Web Link

---

## 2. STRUCTURE NUXT EXISTANTE À RESPECTER

### 2.1 Dossier du Projet
```
mon-projet-nuxt/
├── app.vue                    # App principal
├── nuxt.config.ts            # Config Nuxt
├── package.json
├── tsconfig.json
├── pages/                     # Pages automatiques (routing)
├── components/               # Composants réutilisables
├── layouts/                  # Layouts (default, admin, etc)
├── stores/                   # Pinia stores (state management)
├── composables/              # Composables réutilisables
├── public/                   # Assets statiques
├── assets/                   # Assets (CSS, images)
└── server/                   # Serveur Nuxt (API routes - NE PAS UTILISER)
```

### 2.2 Routing Automatique Nuxt
- `pages/index.vue` → `/`
- `pages/personal-shopping/index.vue` → `/personal-shopping`
- `pages/personal-shopping/new.vue` → `/personal-shopping/new`
- `pages/personal-shopping/[id].vue` → `/personal-shopping/:id`
- `pages/admin/dashboard.vue` → `/admin/dashboard`
- `pages/admin/requests/index.vue` → `/admin/requests`

### 2.3 Layouts Existants
```
layouts/
├── default.vue          # Layout principal (Header, Footer)
└── admin.vue            # Layout admin (Header, Sidebar)
```

---

## 3. UTILISER LE TEMPLATE EXISTANT

### 3.1 Instructions d'intégration
1. **Respecte la structure** du template
2. **Réutilise les composants** existants du template
3. **Étend les composants** existants si nécessaire (inheritance)
4. **Ajoute des composants** personnalisés dans `/components`
5. **Utilise le CSS du template** (variables, classes, thème)
6. **Respecte le design system** du template

### 3.2 Composants Template à Réutiliser
Exemple (à adapter à ton template):
```
- Button.vue (existing)
- Input.vue (existing)
- Card.vue (existing)
- Modal.vue (existing)
- Table.vue (existing)
- Navigation.vue (existing)
- Footer.vue (existing)
- Loading.vue (existing)
- Alert.vue (existing)
- Badge.vue (existing)
```

**Pour chaque nouveau composant, demande:**
"Crée ce composant en étendant le style du template existant"

---

## 4. STRUCTURE STORES PINIA (État Global)

### 4.1 Store Auth (`stores/auth.ts`)

```typescript
import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'client' | 'admin' | 'agent'
  phone?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null
  }),

  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isClient: (state) => state.currentUser?.role === 'client',
    userEmail: (state) => state.currentUser?.email || '',
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        // Simule login avec fake data
        const user = FAKE_USERS.find(u => u.email === email)
        if (user && user.password === password) {
          this.currentUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar
          }
          this.token = `token_${Date.now()}`
          this.isAuthenticated = true
          // Sauvegarde localStorage
          localStorage.setItem('auth', JSON.stringify({
            user: this.currentUser,
            token: this.token
          }))
        } else {
          throw new Error('Email ou mot de passe incorrect')
        }
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.currentUser = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('auth')
    },

    initializeAuth() {
      const saved = localStorage.getItem('auth')
      if (saved) {
        const { user, token } = JSON.parse(saved)
        this.currentUser = user
        this.token = token
        this.isAuthenticated = true
      }
    }
  }
})
```

### 4.2 Store Personal Shopping (`stores/personalShopping.ts`)

```typescript
import { defineStore } from 'pinia'

interface PersonalShoppingRequest {
  id: string
  userId: string
  status: 'pending' | 'searching' | 'negotiating' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  category: string
  title: string
  description: string
  images: string[]
  budgetEstimated: number
  quantity: number
  quotedPrice?: number
  assignedAgent?: string
  whatsappMessages: number
  createdAt: string
  updatedAt: string
}

export const usePersonalShoppingStore = defineStore('personalShopping', {
  state: () => ({
    requests: [] as PersonalShoppingRequest[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getRequestById: (state) => (id: string) => {
      return state.requests.find(r => r.id === id)
    },
    
    getRequestsByUser: (state) => (userId: string) => {
      return state.requests.filter(r => r.userId === userId)
    },

    getRequestsByStatus: (state) => (status: string) => {
      return state.requests.filter(r => r.status === status)
    }
  },

  actions: {
    async fetchRequests() {
      this.loading = true
      try {
        // Charge fake data depuis localStorage ou JSON
        const saved = localStorage.getItem('personalShoppingRequests')
        this.requests = saved ? JSON.parse(saved) : FAKE_PERSONAL_SHOPPING_REQUESTS
      } catch (err) {
        this.error = 'Erreur chargement demandes'
      } finally {
        this.loading = false
      }
    },

    async createRequest(requestData: Partial<PersonalShoppingRequest>) {
      const newRequest: PersonalShoppingRequest = {
        id: `req_${Date.now()}`,
        userId: useAuthStore().currentUser?.id || '',
        status: 'pending',
        whatsappMessages: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...requestData
      } as PersonalShoppingRequest
      
      this.requests.push(newRequest)
      this.saveToLocalStorage()
      return newRequest
    },

    async updateRequest(id: string, updates: Partial<PersonalShoppingRequest>) {
      const idx = this.requests.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.requests[idx] = {
          ...this.requests[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveToLocalStorage()
      }
    },

    async deleteRequest(id: string) {
      this.requests = this.requests.filter(r => r.id !== id)
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('personalShoppingRequests', JSON.stringify(this.requests))
    }
  }
})
```

### 4.3 Store Shipping (`stores/shipping.ts`)

```typescript
import { defineStore } from 'pinia'

interface Shipment {
  id: string
  trackingNumber: string
  userId: string
  destinationCountry: string
  shippingMode: 'air_normal' | 'air_express' | 'sea'
  status: 'pending' | 'in_transit' | 'in_customs' | 'delivered'
  timeline: TimelineEvent[]
  currentLocation: string
  estimatedDelivery: string
}

interface TimelineEvent {
  date: string
  status: string
  location: string
  description: string
}

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    shipments: [] as Shipment[],
    destinations: [] as any[],
    loading: false
  }),

  getters: {
    getShipmentByTracking: (state) => (tracking: string) => {
      return state.shipments.find(s => s.trackingNumber === tracking)
    }
  },

  actions: {
    async fetchShipments() {
      this.loading = true
      const saved = localStorage.getItem('shipments')
      this.shipments = saved ? JSON.parse(saved) : FAKE_SHIPMENTS
      this.loading = false
    },

    async fetchDestinations() {
      const saved = localStorage.getItem('destinations')
      this.destinations = saved ? JSON.parse(saved) : FAKE_DESTINATIONS
    },

    calculateShippingCost(destination: string, weight: number, mode: string) {
      const dest = this.destinations.find(d => d.country === destination)
      if (!dest) return 0
      const shippingMode = dest.shippingModes.find(m => m.mode === mode)
      if (!shippingMode) return 0
      return shippingMode.costPerKg * weight
    }
  }
})
```

### 4.4 Autres Stores
- `stores/guides.ts` - Gestion guides/interprètes
- `stores/visas.ts` - Gestion visas
- `stores/blog.ts` - Articles blog
- `stores/admin.ts` - Gestion admin (statuts, filtres)

---

## 5. COMPOSABLES RÉUTILISABLES

### 5.1 `composables/useNotification.ts`

```typescript
export const useNotification = () => {
  const notifications = ref<Notification[]>([])

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now()
    notifications.value.push({ id, message, type })
    
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 3000)
  }

  return { notifications, addNotification }
}
```

### 5.2 `composables/useForm.ts`

```typescript
export const useForm = (initialData = {}) => {
  const form = ref(initialData)
  const errors = ref<Record<string, string>>({})
  const loading = ref(false)

  const validate = (rules: Record<string, Function>) => {
    errors.value = {}
    for (const field in rules) {
      const error = rules[field](form.value[field])
      if (error) errors.value[field] = error
    }
    return Object.keys(errors.value).length === 0
  }

  const reset = () => {
    form.value = { ...initialData }
    errors.value = {}
  }

  return { form, errors, loading, validate, reset }
}
```

### 5.3 `composables/useFetch.ts`

```typescript
export const useFetch = async (url: string, options = {}) => {
  const data = ref(null)
  const pending = ref(false)
  const error = ref(null)

  const fetchData = async () => {
    pending.value = true
    error.value = null
    try {
      // Simule fetch avec fake data
      await new Promise(resolve => setTimeout(resolve, 500))
      // Charge depuis stores ou localStorage
      data.value = {} // À adapter selon besoin
    } catch (err) {
      error.value = err.message
    } finally {
      pending.value = false
    }
  }

  onMounted(() => fetchData())

  return { data, pending, error, refresh: fetchData }
}
```

---

## 6. FAKE DATA (À PLACER DANS `utils/fakeData.ts`)

```typescript
export const FAKE_USERS = [
  {
    id: 'user_1',
    email: 'client@example.com',
    password: 'password123',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+225 01 23 45 67',
    country: 'Côte d\'Ivoire',
    role: 'client',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 'user_2',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'admin'
  }
]

export const FAKE_PERSONAL_SHOPPING_REQUESTS = [
  {
    id: 'req_1',
    userId: 'user_1',
    status: 'negotiating',
    category: 'Électronique & High-Tech',
    title: 'Samsung Galaxy S24',
    description: 'Téléphone dernière génération, couleur noir, 256GB',
    images: [
      'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400',
      'https://images.unsplash.com/photo-1511330815209-c9f69ad5ddd3?w=400'
    ],
    budgetEstimated: 500000,
    quantity: 1,
    quotedPrice: 450000,
    assignedAgent: 'user_3',
    whatsappMessages: 12,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22'
  },
  // ... autres demandes
]

export const FAKE_DESTINATIONS = [
  {
    id: 'dest_ci',
    country: 'Côte d\'Ivoire',
    continent: 'Afrique',
    city: 'Abidjan',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 9000 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 12500 },
      { mode: 'sea', duration: '30-45 jours', costPerKg: 2000 }
    ]
  },
  // ... autres destinations
]

export const FAKE_SHIPMENTS = [
  {
    id: 'ship_1',
    trackingNumber: 'TRK-2024-001234',
    userId: 'user_1',
    destinationCountry: 'Côte d\'Ivoire',
    shippingMode: 'air_express',
    status: 'in_customs',
    timeline: [
      { date: '2024-01-15', status: 'order_placed', location: 'Shenzhen, China', description: 'Commande validée' },
      { date: '2024-01-17', status: 'picked_up', location: 'Shenzhen Airport', description: 'Colis collecté' },
      { date: '2024-01-25', status: 'in_customs', location: 'Douane Dakar', description: 'En dédouanement' }
    ],
    currentLocation: 'Douane Dakar',
    estimatedDelivery: '2024-02-05'
  },
  // ... autres colis
]

export const FAKE_CATEGORIES = [
  { id: 'cat_1', name: 'Électronique & High-Tech', icon: '📱' },
  { id: 'cat_2', name: 'Fashion & Vêtements', icon: '👗' },
  // ... autres catégories
]

export const FAKE_GUIDES = [
  {
    id: 'guide_1',
    name: 'Wang Wei',
    languages: ['Français', 'Mandarin', 'Anglais'],
    specializations: ['Commerce', 'Visites marchés', 'Sourcing'],
    experience: 8,
    rating: 4.8,
    reviews: 45,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    pricePerDay: 150000,
    pricePerHour: 25000
  },
  // ... autres guides
]

export const FAKE_VISAS = [
  {
    id: 'visa_1',
    type: 'Études',
    duration: 'Jusqu\'à 4 ans',
    processingTime: '60-90 jours',
    cost: 350000,
    requirements: [
      'Lettre d\'acceptation université',
      'Passeport valide',
      'Photos d\'identité'
    ]
  },
  // ... autres visas
]

export const FAKE_BLOG_POSTS = [
  {
    id: 'blog_1',
    title: 'Guide complet de l\'import-export vers la Chine',
    slug: 'guide-import-export-chine',
    excerpt: 'Tout ce que vous devez savoir...',
    content: 'Lorem ipsum...',
    category: 'Import-Export',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    publishedAt: '2024-01-20',
    views: 1250
  },
  // ... autres articles
]

export const FAKE_FAQ = [
  {
    id: 'faq_1',
    question: 'Combien de temps pour trouver un produit en Personal Shopping ?',
    answer: 'Généralement 2-7 jours selon disponibilité.',
    category: 'Personal Shopping'
  },
  // ... autres FAQ
]
```

---

## 7. PAGES FRONT-OFFICE À CRÉER

### 7.1 Structure Pages
```
pages/
├── index.vue                          # Accueil /
├── login.vue                          # Login /login
├── register.vue                       # Register /register
├── dashboard.vue                      # Dashboard /dashboard
├── profile.vue                        # Profil /profile
│
├── personal-shopping/
│   ├── index.vue                      # Accueil PS /personal-shopping
│   ├── new.vue                        # Nouvelle demande /personal-shopping/new
│   ├── [id].vue                       # Détail demande /personal-shopping/:id
│   └── category/
│       └── [name].vue                 # Catégorie /personal-shopping/category/:name
│
├── import-export/
│   ├── index.vue                      # Accueil shipping /import-export
│   ├── calculator.vue                 # Calculateur /import-export/calculator
│   └── tracking.vue                   # Tracking /import-export/tracking
│
├── visa/
│   ├── index.vue                      # Accueil visa /visa
│   └── [type].vue                     # Détail type /visa/:type
│
├── guide/
│   ├── index.vue                      # Accueil guides /guide
│   └── booking/
│       └── [id].vue                   # Booking /guide/booking/:id
│
├── services/
│   ├── currency-exchange.vue          # Échange devises
│   ├── supplier-payment.vue           # Paiement fournisseurs
│   └── inspection.vue                 # Inspection
│
├── resources/
│   ├── blog/
│   │   ├── index.vue                  # Liste articles
│   │   └── [slug].vue                 # Article détail
│   ├── faq.vue                        # FAQ
│   ├── pricing.vue                    # Tarifs
│   └── downloads.vue                  # Téléchargements
│
├── about.vue                          # À propos
├── contact.vue                        # Contact
│
└── admin/
    ├── dashboard.vue                  # Dashboard /admin/dashboard
    ├── requests/
    │   ├── index.vue                  # Gestion demandes
    │   └── [id].vue                   # Détail demande
    ├── shipments/
    │   ├── index.vue                  # Gestion colis
    │   └── [id].vue                   # Détail colis
    ├── users.vue                      # Gestion utilisateurs
    ├── pricing.vue                    # Gestion tarifs
    ├── guides.vue                     # Gestion guides
    ├── blog.vue                       # Gestion blog
    ├── faq.vue                        # Gestion FAQ
    ├── support.vue                    # Support client
    └── reports.vue                    # Rapports
```

---

## 8. COMPOSANTS À CRÉER (Spécifiques au projet)

### 8.1 Components Personal Shopping
```
components/
├── PersonalShopping/
│   ├── RequestForm.vue                # Formulaire nouvelle demande
│   ├── RequestCard.vue                # Carte demande (liste)
│   ├── RequestDetail.vue              # Détail demande
│   ├── QuotationCard.vue              # Carte devis
│   ├── CategoryGrid.vue               # Grid catégories
│   ├── CategorySelector.vue           # Sélecteur catégorie
│   ├── ImageUploader.vue              # Upload images
│   └── RequestTimeline.vue            # Timeline statut demande
```

### 8.2 Components Shipping
```
├── Shipping/
│   ├── Calculator.vue                 # Calculateur tarifs
│   ├── TrackingForm.vue               # Formulaire tracking
│   ├── Timeline.vue                   # Timeline colis
│   ├── ShipmentCard.vue               # Carte colis
│   └── DestinationSelector.vue        # Sélecteur destination
```

### 8.3 Components Visa
```
├── Visa/
│   ├── VisaCard.vue                   # Carte visa
│   ├── RequirementsList.vue           # Liste requirements
│   ├── ProcessTimeline.vue            # Timeline processus
│   └── DocumentChecklist.vue          # Checklist documents
```

### 8.4 Components Guide
```
├── Guide/
│   ├── GuideCard.vue                  # Carte guide
│   ├── GuideProfile.vue               # Profil guide
│   ├── BookingForm.vue                # Formulaire booking
│   └── AvailabilityCalendar.vue       # Calendrier disponibilité
```

### 8.5 Components Admin
```
├── Admin/
│   ├── AdminNav.vue                   # Navigation admin
│   ├── AdminSidebar.vue               # Sidebar admin
│   ├── RequestsTable.vue              # Tableau demandes
│   ├── ShipmentsTable.vue             # Tableau colis
│   ├── UsersTable.vue                 # Tableau utilisateurs
│   ├── PricingTable.vue               # Tableau tarifs
│   ├── StatsCard.vue                  # Carte statistique
│   ├── RecentActivityWidget.vue       # Widget activités
│   ├── ChartWidget.vue                # Widget graphique
│   └── QuotationForm.vue              # Formulaire devis (admin)
```

### 8.6 Components Communs (Réutilisés du template)
```
├── Common/
│   ├── Header.vue                     # Header (du template)
│   ├── Footer.vue                     # Footer (du template)
│   ├── Pagination.vue                 # Pagination
│   ├── SearchBar.vue                  # Barre recherche
│   ├── FilterBar.vue                  # Barre filtres
│   ├── EmptyState.vue                 # État vide
│   ├── ConfirmDialog.vue              # Dialog confirmation
│   ├── StatusBadge.vue                # Badge statut
│   └── CurrencyFormatter.vue          # Formatage devises
```

---

## 9. LAYOUTS À PERSONNALISER

### 9.1 `layouts/default.vue`

```vue
<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header (du template) -->
    <Header />
    
    <!-- Navigation principale (du template) -->
    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand">Logo</NuxtLink>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <NuxtLink to="/personal-shopping" class="nav-link">Personal Shopping</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/import-export" class="nav-link">Import-Export</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/visa" class="nav-link">Visa</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/guide" class="nav-link">Guides</NuxtLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              Resources
            </a>
            <ul class="dropdown-menu">
              <li><NuxtLink to="/resources/blog" class="dropdown-item">Blog</NuxtLink></li>
              <li><NuxtLink to="/resources/faq" class="dropdown-item">FAQ</NuxtLink></li>
              <li><NuxtLink to="/resources/pricing" class="dropdown-item">Tarifs</NuxtLink></li>
            </ul>
          </li>
          <li class="nav-item">
            <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <NuxtLink to="/login" class="nav-link btn btn-primary">Connexion</NuxtLink>
          </li>
          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              {{ userEmail }}
            </a>
            <ul class="dropdown-menu">
              <li><NuxtLink to="/dashboard" class="dropdown-item">Dashboard</NuxtLink></li>
              <li><NuxtLink to="/profile" class="dropdown-item">Profil</NuxtLink></li>
              <li v-if="isAdmin"><NuxtLink to="/admin/dashboard" class="dropdown-item">Admin</NuxtLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" @click="handleLogout">Déconnexion</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer (du template) -->
    <Footer />

    <!-- Notifications -->
    <Teleport to="body">
      <div class="notifications fixed bottom-4 right-4">
        <div v-for="notif in notifications" :key="notif.id" :class="['alert', `alert-${notif.type}`]">
          {{ notif.message }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { isAuthenticated, userEmail, isAdmin } = storeToRefs(authStore)

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}
</script>
```

### 9.2 `layouts/admin.vue`

```vue
<template>
  <div class="d-flex min-h-screen">
    <!-- Sidebar Admin -->
    <AdminSidebar />

    <div class="flex-grow d-flex flex-column">
      <!-- Header Admin -->
      <AdminNav />

      <!-- Main content -->
      <main class="flex-grow p-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vérifier que l'utilisateur est admin
const authStore = useAuthStore()

onBeforeMount(() => {
  if (!authStore.isAdmin) {
    navigateTo('/')
  }
})
</script>
```

---

## 10. EXEMPLE PAGE : Personal Shopping Accueil

### `pages/personal-shopping/index.vue`

```vue
<template>
  <div class="personal-shopping-page">
    <!-- Hero Section -->
    <section class="hero bg-gradient py-5">
      <div class="container text-center">
        <h1 class="display-4 mb-3">Trouvez Vos Articles en Chine</h1>
        <p class="lead mb-4">Pas besoin de venir, nous cherchons pour vous</p>
        <NuxtLink to="/personal-shopping/new" class="btn btn-primary btn-lg">
          Commencer une recherche
        </NuxtLink>
      </div>
    </section>

    <!-- Avantages -->
    <section class="advantages py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <Card class="h-100 text-center">
              <div class="display-4">✓</div>
              <h5>Accès illimité</h5>
              <p>Des milliers de produits chinois</p>
            </Card>
          </div>
          <div class="col-md-6 col-lg-3">
            <Card class="h-100 text-center">
              <div class="display-4">💰</div>
              <h5>Prix compétitifs</h5>
              <p>Négociés pour vous</p>
            </Card>
          </div>
          <div class="col-md-6 col-lg-3">
            <Card class="h-100 text-center">
              <div class="display-4">✓</div>
              <h5>Qualité garantie</h5>
              <p>Vérification avant expédition</p>
            </Card>
          </div>
          <div class="col-md-6 col-lg-3">
            <Card class="h-100 text-center">
              <div class="display-4">📦</div>
              <h5>Livraison directe</h5>
              <p>Chez vous rapidement</p>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section class="how-it-works py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-5">Comment ça marche</h2>
        <div class="row text-center">
          <div class="col-md-6 col-lg-2" v-for="step in steps" :key="step">
            <div class="step-number display-6 text-primary mb-3">{{ step }}</div>
            <p class="small">{{ stepDescriptions[step - 1] }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Catégories -->
    <section class="categories py-5">
      <div class="container">
        <h2 class="text-center mb-5">Catégories de produits</h2>
        <CategoryGrid :categories="categories" />
      </div>
    </section>

    <!-- Appel à action final -->
    <section class="cta py-5 bg-primary text-white text-center">
      <div class="container">
        <h2>Prêt à trouver votre produit ?</h2>
        <p class="lead mt-3">Soumettez votre demande maintenant</p>
        <NuxtLink to="/personal-shopping/new" class="btn btn-light btn-lg mt-3">
          Commencer
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const psStore = usePersonalShoppingStore()
const { categories } = await psStore.fetchCategories()

const steps = [1, 2, 3, 4, 5]
const stepDescriptions = [
  'Envoyez les images',
  'Discutez via WhatsApp',
  'Recevez un devis',
  'Confirmez et payez',
  'Livraison'
]
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-number {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f0f0;
  line-height: 60px;
}
</style>
```

---

## 11. EXEMPLE PAGE : Détail Demande Personal Shopping

### `pages/personal-shopping/[id].vue`

```vue
<template>
  <div class="request-detail-page" v-if="request">
    <div class="container py-5">
      <div class="row g-4">
        <!-- Images -->
        <div class="col-lg-6">
          <div class="images-gallery">
            <img :src="request.images[0]" class="img-fluid rounded mb-3" />
            <div class="row g-2" v-if="request.images.length > 1">
              <div class="col-3" v-for="(img, i) in request.images.slice(1)" :key="i">
                <img :src="img" class="img-fluid rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <!-- Détails -->
        <div class="col-lg-6">
          <h1>{{ request.title }}</h1>
          
          <StatusBadge :status="request.status" class="mb-3" />
          
          <div class="details-section mb-4">
            <h5>Description</h5>
            <p>{{ request.description }}</p>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <div class="detail-item">
                <label>Budget initial</label>
                <p class="fs-5 fw-bold">{{ formatCurrency(request.budgetEstimated) }}</p>
              </div>
            </div>
            <div class="col-md-6" v-if="request.quotedPrice">
              <div class="detail-item">
                <label>Prix proposé</label>
                <p class="fs-5 fw-bold text-success">{{ formatCurrency(request.quotedPrice) }}</p>
              </div>
            </div>
          </div>

          <!-- Devis Section -->
          <div v-if="request.quotedDetails" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Devis détaillé</h5>
            </div>
            <div class="card-body">
              <table class="table">
                <tr>
                  <td>Coût produit</td>
                  <td class="text-end fw-bold">{{ formatCurrency(request.quotedDetails.productCost) }}</td>
                </tr>
                <tr>
                  <td>Frais service (5%)</td>
                  <td class="text-end">{{ formatCurrency(request.quotedDetails.serviceFee) }}</td>
                </tr>
                <tr>
                  <td>Inspection & Emballage</td>
                  <td class="text-end">{{ formatCurrency(request.quotedDetails.inspectionFee + request.quotedDetails.packagingFee) }}</td>
                </tr>
                <tr>
                  <td>Expédition</td>
                  <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost) }}</td>
                </tr>
                <tr class="border-top">
                  <td class="fw-bold">TOTAL</td>
                  <td class="text-end fw-bold fs-5">{{ formatCurrency(request.quotedDetails.totalPrice) }}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions d-grid gap-2">
            <button class="btn btn-primary" v-if="request.status === 'negotiating'">
              Accepter le devis
            </button>
            <a href="https://wa.me/225xxxxxxxxx" target="_blank" class="btn btn-success">
              💬 Discuter via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <!-- Chat Section -->
      <div class="row mt-5">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Conversation WhatsApp ({{ request.whatsappMessages }} messages)</h5>
            </div>
            <div class="card-body">
              <p class="text-muted text-center py-4">
                <a href="https://wa.me/225xxxxxxxxx" target="_blank" class="btn btn-success">
                  Ouvrir sur WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="container py-5">
    <div class="alert alert-danger">Demande non trouvée</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const psStore = usePersonalShoppingStore()
const { formatCurrency } = useFormatters()

const requestId = route.params.id as string
const request = computed(() => psStore.getRequestById(requestId))

onMounted(() => {
  psStore.fetchRequests()
})
</script>

<style scoped>
.detail-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}
</style>
```

---

## 12. EXEMPLE PAGE : Admin Dashboard

### `pages/admin/dashboard.vue`

```vue
<template>
  <div>
    <h1>Tableau de bord Admin</h1>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-6 col-lg-3">
        <StatsCard 
          title="Demandes Total"
          :value="totalRequests"
          icon="📋"
          color="primary"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <StatsCard 
          title="En attente"
          :value="pendingRequests"
          icon="⏳"
          color="warning"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <StatsCard 
          title="Colis expédiés"
          :value="shippedCount"
          icon="📦"
          color="info"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <StatsCard 
          title="Revenus"
          :value="formatCurrency(totalRevenue)"
          icon="💰"
          color="success"
        />
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
      <div class="col-lg-6">
        <ChartWidget title="Demandes par mois" type="line" />
      </div>
      <div class="col-lg-6">
        <ChartWidget title="Top catégories" type="bar" />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Activités récentes</h5>
          </div>
          <div class="card-body">
            <RecentActivityWidget />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="row mt-4">
      <div class="col-12">
        <h5>Accès rapide</h5>
        <div class="d-grid gap-2 d-md-flex">
          <NuxtLink to="/admin/requests" class="btn btn-outline-primary">
            Gérer les demandes
          </NuxtLink>
          <NuxtLink to="/admin/shipments" class="btn btn-outline-info">
            Gérer les colis
          </NuxtLink>
          <NuxtLink to="/admin/users" class="btn btn-outline-secondary">
            Gérer les utilisateurs
          </NuxtLink>
          <NuxtLink to="/admin/pricing" class="btn btn-outline-dark">
            Gérer les tarifs
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatCurrency } = useFormatters()

// Charger données
await psStore.fetchRequests()
await shippingStore.fetchShipments()

// Calculer statistiques
const totalRequests = computed(() => psStore.requests.length)
const pendingRequests = computed(() => psStore.getRequestsByStatus('pending').length)
const shippedCount = computed(() => shippingStore.shipments.length)
const totalRevenue = computed(() => {
  return psStore.requests.reduce((total, req) => total + (req.quotedPrice || 0), 0)
})
</script>
```

---

## 13. UTILISATION DES STORES DANS PAGES

### Exemple de composable pour pages

```typescript
// composables/usePersonalShoppingPage.ts
export const usePersonalShoppingPage = () => {
  const psStore = usePersonalShoppingStore()
  const authStore = useAuthStore()
  const { addNotification } = useNotification()

  const userRequests = computed(() => {
    return psStore.getRequestsByUser(authStore.currentUser?.id || '')
  })

  const createNewRequest = async (data) => {
    try {
      await psStore.createRequest(data)
      addNotification('Demande créée avec succès', 'success')
      navigateTo(`/personal-shopping/${data.id}`)
    } catch (err) {
      addNotification('Erreur création demande', 'error')
    }
  }

  return { userRequests, createNewRequest }
}
```

---

## 14. INSTRUCTIONS D'UTILISATION

### Étape 1 : Configuration de base
```bash
# Assure-toi d'avoir Nuxt 3 configuré
cd mon-projet-nuxt
npm install

# Ajouter les dépendances manquantes
npm install pinia
```

### Étape 2 : Ajouter Pinia à nuxt.config.ts
```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  }
})
```

### Étape 3 : Créer stores, composables, pages
```bash
# Créer structure dossiers
mkdir stores composables utils/data
```

### Étape 4 : Copier fake data
Placer `fakeData.ts` dans `utils/data/`

### Étape 5 : Créer pages et composants
Suivre la structure fournie ci-dessus

### Étape 6 : Démarrer le serveur dev
```bash
npm run dev
```

---

## 15. POINTS IMPORTANTS

✅ **Respecte la structure Nuxt** - Routing auto
✅ **Utilise Pinia** - State management centralisé
✅ **Fake data localStorage** - Persistance entre reloads
✅ **Réutilise composants template** - Cohérence design
✅ **Layouts pour front/admin** - Structure claire
✅ **Composables réutilisables** - DRY code
✅ **Responsive design** - Mobile first
✅ **SEO avec Nuxt** - Meta tags auto

---

## 16. CHECKLIST DÉVELOPPEMENT

### Phase 1 - Configuration
- [ ] Nuxt configuré avec Pinia
- [ ] Stores créés (auth, personalShopping, shipping, etc)
- [ ] Fake data en place
- [ ] Composables de base créés
- [ ] Layouts personnalisés

### Phase 2 - Front-Office
- [ ] Pages authentification
- [ ] Page d'accueil
- [ ] Personal Shopping (toutes les pages)
- [ ] Import-Export
- [ ] Visa & Guides
- [ ] Services & Ressources
- [ ] Profil utilisateur

### Phase 3 - Back-Office
- [ ] Login admin
- [ ] Dashboard admin
- [ ] Gestion demandes
- [ ] Gestion colis
- [ ] Gestion utilisateurs
- [ ] Gestion tarifs, guides, blog, FAQ

### Phase 4 - Finitions
- [ ] Tests responsive mobile
- [ ] Optimisations UX
- [ ] Déploiement Vercel/Netlify

---

## 17. PROMPT À DONNER À CLAUDE CODE

```
"Je veux créer une plateforme Nuxt pour Import-Export/Personal Shopping.

J'ai un template Nuxt existant. Je veux que tu:

1. **Crée les stores Pinia** pour:
   - Authentification (login/logout)
   - Personal Shopping (CRUD demandes)
   - Shipping (tracking, calcul tarifs)
   - Autres (guides, visas, blog, admin)

2. **Crée les composables** pour:
   - useNotification (toast messages)
   - useForm (validation)
   - useFetch (appels simulés)

3. **Crée les layouts**:
   - default.vue (avec Header, Nav, Footer du template)
   - admin.vue (avec Sidebar admin)

4. **Crée les pages Front-Office**:
   - Authentification (login, register)
   - Accueil
   - Personal Shopping (index, new, [id], category/[name])
   - Import-Export (calculator, tracking)
   - Visa et Guides
   - Services et Ressources
   - Profil et Dashboard

5. **Crée les pages Back-Office**:
   - Admin Dashboard
   - Gestion demandes avec table CRUD
   - Gestion colis avec tracking
   - Gestion utilisateurs
   - Gestion tarifs, guides, blog, FAQ
   - Support et Rapports

6. **Crée les composants** spécifiques au projet
   - PersonalShopping: RequestForm, RequestCard, RequestDetail, QuotationCard
   - Shipping: Calculator, TrackingForm, Timeline, ShipmentCard
   - Admin: RequestsTable, ShipmentsTable, UsersTable, AdminNav, Sidebar
   - Utils: StatusBadge, CurrencyFormatter, etc.

7. **Utilise les fake data** fournis (users, requests, shipments, etc)

8. **Respecte** le template existant pour le design et composants

Utilise localStorage pour persistance, Pinia pour state global, et routing auto Nuxt.
Pas de backend réel - tout est fake data et localStorage."
```

---

## PRÊT À COMMENCER ! 🚀

Utilise ce prompt avec Claude Code pour générer ton application Nuxt complète avec front-office et back-office.


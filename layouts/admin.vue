<template>
  <div class="admin-wrapper d-flex">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'collapsed': !isMobile && sidebarCollapsed, 'mobile-open': isMobile && mobileOpen }">
      <div class="sidebar-header  d-flex justify-content-center">
        <NuxtLink to="/" class="sidebar-logo">
          <img v-if="showSidebarText" :src="config.public.logo" alt="NADOM" class="img-fluid" />
          <img v-else :src="config.public.logo" alt="NADOM" class="img-fluid logo-small" />
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <!-- Vue d'ensemble -->
          <li v-can="['view', 'dashboard']" class="nav-item">
            <NuxtLink to="/admin/dashboard" class="nav-link" :class="{ 'active': isActive('/admin/dashboard') }">
              <i class="bi bi-speedometer2"></i>
              <span v-if="showSidebarText">Tableau de bord</span>
            </NuxtLink>
          </li>

          <!-- Fret & logistique -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="toggleFretMenu"
              :class="{ 'active': isFretSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-box-seam"></i>
                <span v-if="showSidebarText">Fret &amp; logistique</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="fretMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="fretMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li v-can="['list', 'personal-shopping-requests']" class="nav-item">
                <NuxtLink to="/admin/requests" class="nav-link py-1" :class="{ 'active': isActive('/admin/requests') }">
                  <i class="bi bi-bag-check"></i>
                  <span>Demandes</span>
                  <span v-if="pendingRequestsCount > 0" class="badge bg-danger ms-auto">{{ pendingRequestsCount }}</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'shipments']" class="nav-item">
                <NuxtLink to="/admin/shipments" class="nav-link py-1" :class="{ 'active': isActive('/admin/shipments') }">
                  <i class="bi bi-truck"></i>
                  <span>Expéditions</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'destinations']" class="nav-item">
                <NuxtLink to="/admin/destinations" class="nav-link py-1" :class="{ 'active': isActive('/admin/destinations') }">
                  <i class="bi bi-geo-alt"></i>
                  <span>Destinations fret</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'shipping-modes']" class="nav-item">
                <NuxtLink to="/admin/shipping/modes" class="nav-link py-1" :class="{ 'active': isActive('/admin/shipping/modes') }">
                  <i class="bi bi-speedometer"></i>
                  <span>Tarifs au kg</span>
                </NuxtLink>
              </li>
            </ul>
          </li>

          <!-- Catalogue boutique -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="togglePSMenu"
              :class="{ 'active': isCatalogSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-shop"></i>
                <span v-if="showSidebarText">Catalogue boutique</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="psMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="psMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li v-can="['list', 'categories']" class="nav-item">
                <NuxtLink to="/admin/categories" class="nav-link py-1" :class="{ 'active': isActive('/admin/categories') }">
                  <i class="bi bi-tags"></i>
                  <span>Catégories</span>
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/admin/products" class="nav-link py-1" :class="{ 'active': isActive('/admin/products') }">
                  <i class="bi bi-grid-3x3-gap"></i>
                  <span>Produits</span>
                </NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/admin/personal-shopping" class="nav-link py-1" :class="{ 'active': isActive('/admin/personal-shopping') }">
                  <i class="bi bi-cart4"></i>
                  <span>Personal Shopping</span>
                </NuxtLink>
              </li>
            </ul>
          </li>

          <!-- Voyages & services -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="toggleVoyagesMenu"
              :class="{ 'active': isVoyagesSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-airplane"></i>
                <span v-if="showSidebarText">Voyages &amp; services</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="voyagesMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="voyagesMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li v-can="['list', 'guides']" class="nav-item">
                <NuxtLink to="/admin/guides" class="nav-link py-1" :class="{ 'active': isActive('/admin/guides') }">
                  <i class="bi bi-person-badge"></i>
                  <span>Guides</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'guide-accompaniment-services']" class="nav-item">
                <NuxtLink to="/admin/guide-accompaniment-services" class="nav-link py-1" :class="{ 'active': isActive('/admin/guide-accompaniment-services') }">
                  <i class="bi bi-briefcase"></i>
                  <span>Accompagnement</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'visa-applications']" class="nav-item">
                <NuxtLink to="/admin/visas" class="nav-link py-1" :class="{ 'active': isActive('/admin/visas') }">
                  <i class="bi bi-passport"></i>
                  <span>Visas</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'visa-types']" class="nav-item">
                <NuxtLink to="/admin/pricing" class="nav-link py-1" :class="{ 'active': isActive('/admin/pricing') }">
                  <i class="bi bi-currency-exchange"></i>
                  <span>Grilles &amp; tarifs</span>
                </NuxtLink>
              </li>
            </ul>
          </li>

          <!-- Contenu du site -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="toggleContenuMenu"
              :class="{ 'active': isContenuSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-file-earmark-text"></i>
                <span v-if="showSidebarText">Contenu du site</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="contenuMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="contenuMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li v-can="['list', 'blog-posts']" class="nav-item">
                <NuxtLink to="/admin/blog" class="nav-link py-1" :class="{ 'active': isActive('/admin/blog') }">
                  <i class="bi bi-journal-text"></i>
                  <span>Blog</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'faq']" class="nav-item">
                <NuxtLink to="/admin/faq" class="nav-link py-1" :class="{ 'active': isActive('/admin/faq') }">
                  <i class="bi bi-question-circle"></i>
                  <span>FAQ</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'home-services']" class="nav-item">
                <NuxtLink to="/admin/home-services" class="nav-link py-1" :class="{ 'active': isActive('/admin/home-services') }">
                  <i class="bi bi-grid"></i>
                  <span>Bloc accueil</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'site-static-pages']" class="nav-item">
                <NuxtLink to="/admin/site-pages" class="nav-link py-1" :class="{ 'active': isActive('/admin/site-pages') }">
                  <i class="bi bi-file-earmark-richtext"></i>
                  <span>À propos &amp; Contact</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'site-footer']" class="nav-item">
                <NuxtLink to="/admin/footer" class="nav-link py-1" :class="{ 'active': isActive('/admin/footer') }">
                  <i class="bi bi-layout-text-window-reverse"></i>
                  <span>Pied de page</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'contact-leads']" class="nav-item">
                <NuxtLink to="/admin/contact-leads" class="nav-link py-1" :class="{ 'active': isActive('/admin/contact-leads') }">
                  <i class="bi bi-mailbox"></i>
                  <span>Demandes contact</span>
                </NuxtLink>
              </li>
            </ul>
          </li>

          <!-- Support & système -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="toggleSupportMenu"
              :class="{ 'active': isSupportSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-headset"></i>
                <span v-if="showSidebarText">Support &amp; système</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="supportMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="supportMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li class="nav-item">
                <NuxtLink to="/admin/support" class="nav-link py-1" :class="{ 'active': isActive('/admin/support') }">
                  <i class="bi bi-chat-dots"></i>
                  <span>Support</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'reports']" class="nav-item">
                <NuxtLink to="/admin/reports" class="nav-link py-1" :class="{ 'active': isActive('/admin/reports') }">
                  <i class="bi bi-bar-chart"></i>
                  <span>Rapports</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'global-settings']" class="nav-item">
                <NuxtLink to="/admin/settings" class="nav-link py-1" :class="{ 'active': isActive('/admin/settings') }">
                  <i class="bi bi-gear"></i>
                  <span>Paramètres</span>
                </NuxtLink>
              </li>
            </ul>
          </li>

          <!-- Équipe & accès -->
          <li class="nav-item">
            <div
              class="nav-link d-flex align-items-center justify-content-between"
              @click="toggleUsersMenu"
              :class="{ 'active': isUsersSectionActive }"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-people"></i>
                <span v-if="showSidebarText">Équipe &amp; accès</span>
              </div>
              <i v-if="showSidebarText" class="bi" :class="usersMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="usersMenuOpen && showSidebarText" class="nav flex-column ms-3 small-nav">
              <li v-can="['list', 'users']" class="nav-item">
                <NuxtLink to="/admin/users" class="nav-link py-1" :class="{ 'active': route.path === '/admin/users' }">
                  <i class="bi bi-list-ul"></i>
                  <span>Utilisateurs</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'countries']" class="nav-item">
                <NuxtLink to="/admin/countries" class="nav-link py-1" :class="{ 'active': isActive('/admin/countries') }">
                  <i class="bi bi-globe"></i>
                  <span>Pays</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'roles']" class="nav-item">
                <NuxtLink to="/admin/users/roles" class="nav-link py-1" :class="{ 'active': route.path === '/admin/users/roles' }">
                  <i class="bi bi-shield-lock"></i>
                  <span>Rôles &amp; profils</span>
                </NuxtLink>
              </li>
              <li v-can="['list', 'activity-logs']" class="nav-item">
                <NuxtLink to="/admin/activity-logs" class="nav-link py-1" :class="{ 'active': isActive('/admin/activity-logs') }">
                  <i class="bi bi-journal-check"></i>
                  <span>Journal d'activité</span>
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-link">
          <i class="bi bi-house"></i>
          <span v-if="showSidebarText">Retour au site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Mobile overlay (ferme le sidebar en cliquant hors) -->
    <div v-if="isMobile && mobileOpen" class="sidebar-overlay" @click="mobileOpen = false"></div>

    <!-- Main Content -->
    <div class="admin-main flex-grow-1">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="d-flex align-items-center">
          <button class="btn btn-link sidebar-toggle" @click="toggleSidebar">
            <i class="bi bi-list fs-4"></i>
          </button>
          <h5 class="mb-0 ms-3">{{ pageTitle }}</h5>
        </div>

        <div class="d-flex align-items-center gap-3">
          <!-- Notifications -->
          <div class="dropdown">
            <button class="btn btn-link bell-btn position-relative" data-bs-toggle="dropdown" aria-expanded="false" @click="onBellOpen">
              <i class="bi bi-bell fs-5"></i>
              <span v-if="notifStore.unread > 0" class="notif-badge">
                {{ notifStore.unread > 9 ? '9+' : notifStore.unread }}
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" style="min-width: 320px; max-height: 400px; overflow-y: auto;">
              <li class="d-flex justify-content-between align-items-center px-3 py-2">
                <h6 class="mb-0">Notifications</h6>
                <button
                  v-if="notifStore.unread > 0"
                  class="btn btn-sm btn-link p-0 small"
                  @click.stop="notifStore.markAllRead()"
                >
                  Tout marquer lu
                </button>
              </li>
              <li><hr class="dropdown-divider my-0"></li>
              <li v-if="notifStore.items.filter(n => !n.is_read).length === 0" class="text-center text-muted small py-3">
                Aucune notification non lue
              </li>
              <li v-for="n in notifStore.items.filter(n => !n.is_read).slice(0, 8)" :key="n.id">
                <a
                  class="dropdown-item d-flex flex-column py-2"
                  :class="{ 'fw-medium': !n.is_read }"
                  :href="n.link || '#'"
                  @click.prevent="onNotifClick(n)"
                >
                  <div class="d-flex align-items-start">
                    <span
                      v-if="!n.is_read"
                      class="badge rounded-pill bg-primary me-2 mt-1"
                      style="width:8px; height:8px; padding:0;"
                    ></span>
                    <div class="flex-grow-1">
                      <div class="small">{{ n.title }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ formatRelativeTime(n.created_at) }}
                      </div>
                    </div>
                  </div>
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <NuxtLink class="dropdown-item text-center small" to="/admin/notifications">Voir toutes</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- User Menu -->
          <div class="dropdown">
            <button class="btn btn-link d-flex align-items-center" data-bs-toggle="dropdown">
              <img
                :src="currentUser?.avatar || 'https://ui-avatars.com/api/?name=Admin'"
                class="rounded-circle me-2"
                width="35"
                height="35"
                alt="Avatar"
              />
              <span class="d-none d-md-inline">{{ userFullName }}</span>
              <i class="bi bi-chevron-down ms-1"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><NuxtLink class="dropdown-item" to="/admin/profile"><i class="bi bi-person me-2"></i>Mon profil</NuxtLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>Deconnexion</a></li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="admin-content">
        <slot />
      </main>
    </div>

    <!-- Notifications Toast -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast show"
        :class="{
          'bg-success text-white': notif.type === 'success',
          'bg-danger text-white': notif.type === 'error',
          'bg-warning': notif.type === 'warning',
          'bg-info text-white': notif.type === 'info'
        }"
        role="alert"
      >
        <div class="toast-body d-flex justify-content-between align-items-center">
          {{ notif.message }}
          <button
            type="button"
            class="btn-close btn-close-white ms-2"
            @click="removeNotification(notif.id)"
          ></button>
        </div>
      </div>
    </div>

    <!-- Loading overlay (kept rendered alongside slot so NuxtPage always mounts) -->
    <div
      v-if="loading"
      class="admin-loading position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light"
      style="z-index: 2000;"
    >
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Verification de l'acces...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotificationsStore } from '~/stores/notifications'
import { useNotification } from '~/composables/useNotification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const psStore = usePersonalShoppingStore()
const notifStore = useNotificationsStore()
const { notifications, removeNotification } = useNotification()
const config = useRuntimeConfig()

const formatRelativeTime = (iso: string) => {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

const onBellOpen = () => {
  if (notifStore.items.length === 0) notifStore.fetch(1, 20)
}

const onNotifClick = (n: any) => {
  if (!n.is_read && !String(n.id).startsWith('live-')) notifStore.markRead(n.id)
  if (n.link) router.push(n.link)
}

// Methods
const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const isUsersSectionActive = computed(
  () =>
    route.path.startsWith('/admin/users') ||
    route.path.startsWith('/admin/activity-logs') ||
    route.path.startsWith('/admin/countries')
)

const isCatalogSectionActive = computed(
  () =>
    isActive('/admin/personal-shopping') ||
    isActive('/admin/categories') ||
    isActive('/admin/products')
)

const isFretSectionActive = computed(
  () =>
    isActive('/admin/requests') ||
    isActive('/admin/shipments') ||
    isActive('/admin/destinations') ||
    isActive('/admin/shipping/modes')
)

const isVoyagesSectionActive = computed(
  () =>
    isActive('/admin/guides') ||
    isActive('/admin/guide-accompaniment-services') ||
    isActive('/admin/visas') ||
    isActive('/admin/pricing')
)

const isContenuSectionActive = computed(
  () =>
    isActive('/admin/blog') ||
    isActive('/admin/faq') ||
    isActive('/admin/home-services') ||
    isActive('/admin/site-pages') ||
    isActive('/admin/footer') ||
    isActive('/admin/contact-leads')
)

const isSupportSectionActive = computed(
  () =>
    isActive('/admin/support') ||
    isActive('/admin/reports') ||
    isActive('/admin/settings')
)

// State
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const fretMenuOpen = ref(isFretSectionActive.value)
const psMenuOpen = ref(false)
const voyagesMenuOpen = ref(isVoyagesSectionActive.value)
const contenuMenuOpen = ref(isContenuSectionActive.value)
const supportMenuOpen = ref(isSupportSectionActive.value)
const usersMenuOpen = ref(isUsersSectionActive.value)
const loading = ref(true)

const showSidebarText = computed(() => isMobile.value ? mobileOpen.value : !sidebarCollapsed.value)

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileOpen.value = !mobileOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// Computed
const currentUser = computed(() => authStore.currentUser)
const userFullName = computed(() => authStore.userFullName)
const pendingRequestsCount = computed(() => psStore.getPendingRequests.length)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/requests': 'Gestion des demandes',
    '/admin/shipments': 'Gestion des expeditions',
    '/admin/destinations': 'Destinations fret (calculateur)',
    '/admin/shipping/modes': 'Tarifs au kg (calculateur)',
    '/admin/users': 'Gestion des utilisateurs',
    '/admin/users/roles': 'Gestion des Profils',
    '/admin/guides': 'Gestion des guides',
    '/admin/guide-accompaniment-services': "Services d'accompagnement (Guides)",
    '/admin/visas': 'Gestion des visas',
    '/admin/pricing': 'Gestion des tarifs',
    '/admin/blog': 'Gestion du blog',
    '/admin/faq': 'Gestion des FAQ',
    '/admin/home-services': 'Services (accueil)',
    '/admin/site-pages': 'Pages À propos & Contact',
    '/admin/footer': 'Pied de page (site)',
    '/admin/support': 'Support client',
    '/admin/activity-logs': "Journal d'activité",
    '/admin/countries': 'Pays (référentiel)',
    '/admin/reports': 'Rapports',
    '/admin/notifications': 'Notifications',
    '/admin/settings': 'Paramètres',
    '/admin/categories': 'Catégories',
    '/admin/products': 'Produits',
    '/admin/personal-shopping': 'Personal Shopping'
  }
  return titles[route.path] || 'Administration'
})


const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleFretMenu = () => { fretMenuOpen.value = !fretMenuOpen.value }
const togglePSMenu = () => { psMenuOpen.value = !psMenuOpen.value }
const toggleVoyagesMenu = () => { voyagesMenuOpen.value = !voyagesMenuOpen.value }
const toggleContenuMenu = () => { contenuMenuOpen.value = !contenuMenuOpen.value }
const toggleSupportMenu = () => { supportMenuOpen.value = !supportMenuOpen.value }
const toggleUsersMenu = () => { usersMenuOpen.value = !usersMenuOpen.value }

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/admin/requests') || path.startsWith('/admin/shipments') || path.startsWith('/admin/destinations') || path.startsWith('/admin/shipping')) {
      fretMenuOpen.value = true
    }
    if (path.startsWith('/admin/categories') || path.startsWith('/admin/products') || path.startsWith('/admin/personal-shopping')) {
      psMenuOpen.value = true
    }
    if (path.startsWith('/admin/guides') || path.startsWith('/admin/guide-accompaniment') || path.startsWith('/admin/visas') || path.startsWith('/admin/pricing')) {
      voyagesMenuOpen.value = true
    }
    if (path.startsWith('/admin/blog') || path.startsWith('/admin/faq') || path.startsWith('/admin/home-services') || path.startsWith('/admin/site-pages') || path.startsWith('/admin/footer') || path.startsWith('/admin/contact-leads')) {
      contenuMenuOpen.value = true
    }
    if (path.startsWith('/admin/support') || path.startsWith('/admin/reports') || path.startsWith('/admin/settings')) {
      supportMenuOpen.value = true
    }
    if (path.startsWith('/admin/users') || path.startsWith('/admin/activity-logs') || path.startsWith('/admin/countries')) {
      usersMenuOpen.value = true
    }
  },
  { immediate: true }
)

// Lifecycle & Guards
onMounted(async () => {
  isMobile.value = window.innerWidth < 992
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 992
    if (!isMobile.value) mobileOpen.value = false
  })

  try {
    await authStore.initializeAuth()

    // Check if user has backoffice access (admin or agent)
    if (!authStore.hasBackofficeAccess) {
      router.push('/')
      return
    }

    // Load data
    await psStore.fetchRequests()
    await notifStore.fetch(1, 20)

    // Pusher: ping de connexion + bind realtime
    notifStore.unbindRealtime()
    notifStore.bindRealtime()

    const { $echo } = useNuxtApp() as any
    const pusher: any = $echo?.connector?.pusher
    const { success: notifSuccess, warning: notifWarning } = useNotification()
    if (pusher?.connection) {
      const showPing = (state: string, ok: boolean) => {
        if (ok) notifSuccess(`Pusher connecte (${state})`, 2500)
        else notifWarning(`Pusher: ${state}`, 4000)
      }
      if (pusher.connection.state === 'connected') {
        showPing('connected', true)
      } else {
        pusher.connection.bind('connected', () => showPing('connected', true))
        pusher.connection.bind('failed', () => showPing('failed', false))
        pusher.connection.bind('unavailable', () => showPing('unavailable', false))
      }
    } else {
      notifWarning('Pusher non initialise (verifier la cle dans nuxt.config.ts)', 5000)
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
}

.admin-sidebar {
  width: 260px;
  background: #1e293b;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo img {
  max-height: 40px;
}

.sidebar-logo .logo-small {
  max-width: 40px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.sidebar-nav-heading {
  list-style: none;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  padding: 1rem 1rem 0.35rem;
  margin-bottom: 0;
  pointer-events: none;
  border-left: 3px solid transparent;
}

.sidebar-nav .small-nav .nav-link {
  padding-top: 0.45rem;
  padding-bottom: 0.45rem;
  font-size: 0.9rem;
}

.sidebar-nav .small-nav .nav-link i {
  font-size: 1rem;
  width: 22px;
}

.sidebar-nav .nav-link {
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.sidebar-nav .nav-link:hover,
.sidebar-nav .nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-left-color: var(--bs-primary);
}

.sidebar-nav .nav-link i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 1rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer .nav-link {
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-footer .nav-link:hover {
  color: #fff;
}

.admin-main {
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
}

.admin-sidebar.collapsed + .admin-main {
  margin-left: 70px;
}

.admin-header {
  background: #fff;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.sidebar-toggle {
  color: #333;
  padding: 0;
}

.admin-content {
  padding: 1.5rem;
  flex: 1;
  min-width: 0;
}

.admin-content .table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.toast-container {
  z-index: 9999;
}

/* Notification Bell Badge */
.bell-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.bell-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.bell-btn i {
  font-size: 1.4rem;
  color: #333;
}

.notif-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #dc3545;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  line-height: 1;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

@media (max-width: 991px) {
  .admin-sidebar {
    transform: translateX(-100%);
    width: 260px !important;
  }

  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  /* Sur mobile le mode "collapsed" desktop n'a pas d'effet */
  .admin-sidebar.collapsed {
    width: 260px !important;
  }

  .admin-main {
    margin-left: 0 !important;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    cursor: pointer;
  }
}
</style>

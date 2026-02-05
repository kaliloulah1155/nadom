<template>
  <div class="admin-wrapper d-flex">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header  d-flex justify-content-center">
        <NuxtLink to="/" class="sidebar-logo">
          <img v-if="!sidebarCollapsed" :src="config.public.logo" alt="NADOM" class="img-fluid" />
          <img v-else :src="config.public.logo" alt="NADOM" class="img-fluid logo-small" />
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <!-- Dashboard -->
          <li class="nav-item">
            <NuxtLink to="/admin/dashboard" class="nav-link" :class="{ 'active': isActive('/admin/dashboard') }">
              <i class="bi bi-speedometer2"></i>
              <span v-if="!sidebarCollapsed">Tableau de bord</span>
            </NuxtLink>
          </li>

          <!-- Demandes -->
          <li class="nav-item">
            <NuxtLink to="/admin/requests" class="nav-link" :class="{ 'active': isActive('/admin/requests') }">
              <i class="bi bi-bag-check"></i>
              <span v-if="!sidebarCollapsed">Demandes</span>
              <span v-if="!sidebarCollapsed && pendingRequestsCount > 0" class="badge bg-danger ms-auto">
                {{ pendingRequestsCount }}
              </span>
            </NuxtLink>
          </li>

          <!-- Expeditions -->
          <li class="nav-item">
            <NuxtLink to="/admin/shipments" class="nav-link" :class="{ 'active': isActive('/admin/shipments') }">
              <i class="bi bi-box-seam"></i>
              <span v-if="!sidebarCollapsed">Expeditions</span>
            </NuxtLink>
          </li>

          <!-- Utilisateurs -->
          <li class="nav-item">
            <NuxtLink to="/admin/users" class="nav-link" :class="{ 'active': isActive('/admin/users') }">
              <i class="bi bi-people"></i>
              <span v-if="!sidebarCollapsed">Utilisateurs</span>
            </NuxtLink>
          </li>

          <li class="nav-divider"></li>

          <!-- Guides -->
          <li class="nav-item">
            <NuxtLink to="/admin/guides" class="nav-link" :class="{ 'active': isActive('/admin/guides') }">
              <i class="bi bi-person-badge"></i>
              <span v-if="!sidebarCollapsed">Guides</span>
            </NuxtLink>
          </li>

          <!-- Visas -->
          <li class="nav-item">
            <NuxtLink to="/admin/visas" class="nav-link" :class="{ 'active': isActive('/admin/visas') }">
              <i class="bi bi-passport"></i>
              <span v-if="!sidebarCollapsed">Visas</span>
            </NuxtLink>
          </li>

          <li class="nav-divider"></li>

          <!-- Tarifs -->
          <li class="nav-item">
            <NuxtLink to="/admin/pricing" class="nav-link" :class="{ 'active': isActive('/admin/pricing') }">
              <i class="bi bi-currency-exchange"></i>
              <span v-if="!sidebarCollapsed">Tarifs</span>
            </NuxtLink>
          </li>

          <!-- Blog -->
          <li class="nav-item">
            <NuxtLink to="/admin/blog" class="nav-link" :class="{ 'active': isActive('/admin/blog') }">
              <i class="bi bi-journal-text"></i>
              <span v-if="!sidebarCollapsed">Blog</span>
            </NuxtLink>
          </li>

          <!-- FAQ -->
          <li class="nav-item">
            <NuxtLink to="/admin/faq" class="nav-link" :class="{ 'active': isActive('/admin/faq') }">
              <i class="bi bi-question-circle"></i>
              <span v-if="!sidebarCollapsed">FAQ</span>
            </NuxtLink>
          </li>

          <li class="nav-divider"></li>

          <!-- Support -->
          <li class="nav-item">
            <NuxtLink to="/admin/support" class="nav-link" :class="{ 'active': isActive('/admin/support') }">
              <i class="bi bi-headset"></i>
              <span v-if="!sidebarCollapsed">Support</span>
            </NuxtLink>
          </li>

          <!-- Rapports -->
          <li class="nav-item">
            <NuxtLink to="/admin/reports" class="nav-link" :class="{ 'active': isActive('/admin/reports') }">
              <i class="bi bi-bar-chart"></i>
              <span v-if="!sidebarCollapsed">Rapports</span>
            </NuxtLink>
          </li>

          <li class="nav-divider"></li>

          <!-- Personal Shopping Admin -->
          <li class="nav-item">
            <div class="nav-link d-flex align-items-center justify-content-between" @click="togglePSMenu" :class="{ 'active': isActive('/admin/personal-shopping') }" style="cursor: pointer;">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-cart4"></i>
                <span v-if="!sidebarCollapsed">Personal Shopping</span>
              </div>
              <i v-if="!sidebarCollapsed" class="bi" :class="psMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            <ul v-if="psMenuOpen && !sidebarCollapsed" class="nav flex-column ms-4 small-nav">
              <li class="nav-item">
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
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-link">
          <i class="bi bi-house"></i>
          <span v-if="!sidebarCollapsed">Retour au site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main flex-grow-1">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="d-flex align-items-center">
          <button class="btn btn-link sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
            <i class="bi bi-list fs-4"></i>
          </button>
          <h5 class="mb-0 ms-3">{{ pageTitle }}</h5>
        </div>

        <div class="d-flex align-items-center gap-3">
          <!-- Notifications -->
          <div class="dropdown">
            <button class="btn btn-link position-relative" data-bs-toggle="dropdown">
              <i class="bi bi-bell fs-5"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><h6 class="dropdown-header">Notifications</h6></li>
              <li><a class="dropdown-item" href="#">Nouvelle demande #1234</a></li>
              <li><a class="dropdown-item" href="#">Colis arrive en douane</a></li>
              <li><a class="dropdown-item" href="#">Nouveau message client</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-center" href="#">Voir toutes</a></li>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const psStore = usePersonalShoppingStore()
const { notifications, removeNotification } = useNotification()
const config = useRuntimeConfig()

// State
const sidebarCollapsed = ref(false)
const psMenuOpen = ref(false)

// Computed
const currentUser = computed(() => authStore.currentUser)
const userFullName = computed(() => authStore.userFullName)
const pendingRequestsCount = computed(() => psStore.getPendingRequests.length)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/requests': 'Gestion des demandes',
    '/admin/shipments': 'Gestion des expeditions',
    '/admin/users': 'Gestion des utilisateurs',
    '/admin/guides': 'Gestion des guides',
    '/admin/visas': 'Gestion des visas',
    '/admin/pricing': 'Gestion des tarifs',
    '/admin/blog': 'Gestion du blog',
    '/admin/faq': 'Gestion des FAQ',
    '/admin/support': 'Support client',
    '/admin/reports': 'Rapports'
  }
  return titles[route.path] || 'Administration'
})

// Methods
const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const togglePSMenu = () => {
  psMenuOpen.value = !psMenuOpen.value
}

// Lifecycle & Guards
onMounted(async () => {
  authStore.initializeAuth()

  // Check if user is admin
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  // Load data
  await psStore.fetchRequests()
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
}

.toast-container {
  z-index: 9999;
}

@media (max-width: 991px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.collapsed {
    transform: translateX(0);
    width: 260px;
  }

  .admin-main {
    margin-left: 0;
  }
}
</style>

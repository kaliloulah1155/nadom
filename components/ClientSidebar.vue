<template>
  <div class="client-sidebar card border-0 shadow-sm">
    <div class="card-body">
      <div class="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
        <span class="client-sidebar-avatar">
          <i class="bi bi-person-fill"></i>
        </span>
        <div class="text-truncate">
          <div class="fw-semibold text-truncate">{{ authStore.userFullName || t('nav.myAccount') }}</div>
          <div class="text-muted small text-truncate">{{ authStore.userEmail }}</div>
        </div>
      </div>

      <nav class="nav flex-column client-sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-link" :class="{ active: isActive('/dashboard') }">
          <i class="bi bi-speedometer2 me-2"></i>{{ t('clientArea.dashboard') }}
        </NuxtLink>
        <NuxtLink to="/profile" class="nav-link" :class="{ active: isActive('/profile') }">
          <i class="bi bi-person-gear me-2"></i>{{ t('clientArea.profile') }}
        </NuxtLink>
        <NuxtLink to="/personal-shopping/new" class="nav-link" :class="{ active: isActive('/personal-shopping/new') }">
          <i class="bi bi-plus-circle me-2"></i>{{ t('clientArea.newRequest') }}
        </NuxtLink>
        <NuxtLink to="/import-export/envoi-colis" class="nav-link" :class="{ active: isActive('/import-export/envoi-colis') }">
          <i class="bi bi-box-seam me-2"></i>{{ t('clientArea.newShipment') }}
        </NuxtLink>
        <NuxtLink to="/personal-shopping/my-requests" class="nav-link" :class="{ active: isActive('/personal-shopping/my-requests') }">
          <i class="bi bi-list-check me-2"></i>{{ t('clientArea.myRequests') }}
        </NuxtLink>
        <NuxtLink to="/import-export/tracking" class="nav-link" :class="{ active: isActive('/import-export/tracking') }">
          <i class="bi bi-search me-2"></i>{{ t('clientArea.trackPackage') }}
        </NuxtLink>
        <NuxtLink to="/guide" class="nav-link" :class="{ active: isActive('/guide') }">
          <i class="bi bi-person-badge me-2"></i>{{ t('clientArea.guideBookings') }}
        </NuxtLink>
        <NuxtLink to="/visa" class="nav-link" :class="{ active: isActive('/visa') }">
          <i class="bi bi-passport me-2"></i>{{ t('clientArea.visaApplications') }}
        </NuxtLink>
        <a href="#" class="nav-link text-danger" @click.prevent="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>{{ t('nav.logout') }}
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isActive = (path: string) => route.path === path

const handleLogout = async () => {
  await authStore.logout()
  await router.push('/')
}
</script>

<style scoped>
.client-sidebar {
  position: sticky;
  top: 90px;
}

.client-sidebar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc3545 0%, #a8202f 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-sidebar-nav .nav-link {
  color: #475569;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.15rem;
  font-weight: 500;
}

.client-sidebar-nav .nav-link:hover {
  background: #f8fafc;
  color: #dc3545;
}

.client-sidebar-nav .nav-link.active {
  background: #fdf0f1;
  color: #dc3545;
}
</style>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h4 class="mb-1">Notifications</h4>
        <p class="text-muted mb-0">
          {{ notifStore.total }} notifications
          <span v-if="notifStore.unread > 0" class="badge bg-primary ms-2">{{ notifStore.unread }} non lues</span>
        </p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-md" :disabled="notifStore.loading" @click="refresh">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
        </button>
        <button v-if="notifStore.unread > 0" class="btn btn-primary btn-md" @click="markAllRead">
          <i class="bi bi-check2-all me-2"></i>Tout marquer lu
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body py-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="search"
                type="text"
                class="form-control border-start-0"
                placeholder="Rechercher par titre..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="readFilter" class="form-select">
              <option value="">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>
          <div class="col-md-4 text-muted small text-md-end">
            {{ filteredItems.length }} résultat{{ filteredItems.length > 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="notifStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredItems.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5 text-muted">
        <i class="bi bi-bell-slash fs-1 d-block mb-3 opacity-50"></i>
        <h6>{{ t('admin.notifications.none') }}</h6>
        <p class="small mb-0">Vous êtes à jour !</p>
      </div>
    </div>

    <!-- List -->
    <div v-else class="d-flex flex-column gap-2">
      <div
        v-for="n in filteredItems"
        :key="n.id"
        class="card border-0 shadow-sm notif-card"
        :class="{ 'notif-unread': !n.is_read }"
        style="cursor: pointer;"
        @click="onClick(n)"
      >
        <div class="card-body d-flex align-items-start gap-3 py-3">
          <!-- Icon -->
          <div
            class="notif-icon rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
            :class="iconBg(n.type)"
          >
            <i class="bi fs-5" :class="iconClass(n.type)"></i>
          </div>

          <!-- Content -->
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="fw-semibold" :class="{ 'text-primary': !n.is_read }">
                {{ n.title }}
              </div>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <small class="text-muted">{{ formatRelativeTime(n.created_at) }}</small>
                <span
                  v-if="!n.is_read"
                  class="badge rounded-pill bg-primary"
                  style="width:8px; height:8px; padding:0;"
                ></span>
              </div>
            </div>
            <div v-if="n.message" class="text-muted small mt-1">
              {{ messageText(n.message) }}
            </div>
            <div class="d-flex align-items-center gap-3 mt-2">
              <span
                class="badge"
                :class="typeBadge(n.type)"
                style="font-size: 0.7rem;"
              >
                {{ typeLabel(n.type) }}
              </span>
              <small v-if="n.link" class="text-primary">
                <i class="bi bi-box-arrow-up-right me-1"></i>Voir le détail
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!notifStore.loading && notifStore.total > notifStore.perPage" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          :current-page="notifStore.page"
          :total-items="notifStore.total"
          :limit="notifStore.perPage"
          @update:current-page="onPageChange"
          @update:limit="onLimitChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, computed, onMounted } from 'vue'
import { useNotificationsStore, type AppNotification } from '~/stores/notifications'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const router = useRouter()
const notifStore = useNotificationsStore()

const search = ref('')
const readFilter = ref<'' | 'read' | 'unread'>('')

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  return notifStore.items.filter((n) => {
    if (readFilter.value === 'unread' && n.is_read) return false
    if (readFilter.value === 'read' && !n.is_read) return false
    if (q && !String(n.title || '').toLowerCase().includes(q)) return false
    return true
  })
})

const formatRelativeTime = (iso: string) => {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

const messageText = (msg: any) => {
  if (msg == null) return ''
  if (typeof msg === 'string') return msg
  if (typeof msg === 'object') return msg.text || msg.body || msg.product_title || JSON.stringify(msg)
  return String(msg)
}

const iconClass = (type: string) => {
  const map: Record<string, string> = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    request: 'bi-bag-check-fill',
    shipment: 'bi-box-seam-fill',
  }
  return map[type] || 'bi-info-circle-fill'
}

const iconBg = (type: string) => {
  const map: Record<string, string> = {
    success: 'bg-success-subtle text-success',
    error: 'bg-danger-subtle text-danger',
    danger: 'bg-danger-subtle text-danger',
    warning: 'bg-warning-subtle text-warning',
    request: 'bg-primary-subtle text-primary',
    shipment: 'bg-info-subtle text-info',
  }
  return map[type] || 'bg-secondary-subtle text-secondary'
}

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    success: 'bg-success-subtle text-success',
    error: 'bg-danger-subtle text-danger',
    danger: 'bg-danger-subtle text-danger',
    warning: 'bg-warning-subtle text-warning',
    request: 'bg-primary-subtle text-primary',
    shipment: 'bg-info-subtle text-info',
  }
  return map[type] || 'bg-secondary-subtle text-secondary'
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    success: 'Succès',
    error: 'Erreur',
    danger: 'Alerte',
    warning: 'Avertissement',
    request: 'Demande',
    shipment: 'Expédition',
    info: 'Information',
  }
  return map[type] || type
}

const onClick = async (n: AppNotification) => {
  if (!n.is_read && !String(n.id).startsWith('live-')) {
    await notifStore.markRead(n.id)
  }
  if (n.link) router.push(n.link)
}

const refresh = () => notifStore.fetch(notifStore.page, notifStore.perPage)
const markAllRead = () => notifStore.markAllRead()
const onPageChange = (page: number) => notifStore.fetch(page, notifStore.perPage)
const onLimitChange = (limit: number) => notifStore.fetch(1, limit)

onMounted(() => {
  notifStore.fetch(1, notifStore.perPage)
})
</script>

<style scoped>
.notif-card {
  border-left: 3px solid transparent !important;
  transition: all 0.2s ease;
}

.notif-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.notif-unread {
  border-left-color: var(--bs-primary) !important;
  background: rgba(var(--bs-primary-rgb), 0.02);
}

.notif-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
</style>

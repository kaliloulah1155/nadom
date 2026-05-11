<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div class="flex-grow-1" style="min-width: 0;">
        <h4 class="mb-1">Journal d’activité</h4>
        <p class="text-muted mb-0">
          Historique de toutes les actions menées dans le back-office : qui a fait quoi, depuis quelle adresse IP et avec quel navigateur. Utile pour la sécurité et l’audit.
        </p>
      </div>
      <div class="d-flex gap-2 ms-md-auto flex-shrink-0">
        <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="store.loading" @click="reload(1)">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Action</label>
            <select v-model="filters.action" class="form-select form-select-sm" :disabled="store.loading" @change="reload(1)">
              <option value="">Toutes</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Type d’entité</label>
            <input
              v-model="filters.entity_type"
              type="text"
              class="form-control form-control-sm"
              placeholder="destinations, shipping-modes, users…"
              :disabled="store.loading"
              @change="reload(1)"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Depuis</label>
            <input v-model="filters.from" type="date" class="form-control form-control-sm" :disabled="store.loading" @change="reload(1)" />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Jusqu’à</label>
            <input v-model="filters.to" type="date" class="form-control form-control-sm" :disabled="store.loading" @change="reload(1)" />
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-outline-secondary w-100" :disabled="store.loading" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="store.loading && store.items.length === 0" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th>Quand</th>
              <th>Qui</th>
              <th>Action</th>
              <th>Cible</th>
              <th>IP</th>
              <th>Navigateur</th>
              <th class="text-end">Détails</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.items.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                Aucune activité enregistrée pour le moment.
              </td>
            </tr>
            <tr v-for="log in store.items" :key="log.id">
              <td>
                <div class="small">{{ formatWhen(log.created_at) }}</div>
                <div class="text-muted small">{{ relativeWhen(log.created_at) }}</div>
              </td>
              <td>
                <div v-if="log.user" class="d-flex flex-column">
                  <span class="fw-medium">{{ fullName(log.user) || log.user.email || '—' }}</span>
                  <span v-if="log.user.email" class="text-muted small">{{ log.user.email }}</span>
                </div>
                <span v-else class="text-muted">Anonyme</span>
              </td>
              <td>
                <span :class="actionBadgeClass(log.action)">{{ actionLabel(log.action) }}</span>
              </td>
              <td>
                <div class="fw-medium">{{ log.entity_type || '—' }}</div>
                <div v-if="log.entity_id" class="text-muted small text-truncate" style="max-width: 200px;">{{ log.entity_id }}</div>
              </td>
              <td><code class="small">{{ log.ip_address || '—' }}</code></td>
              <td>
                <span class="small text-truncate d-inline-block" :title="log.user_agent || ''" style="max-width: 220px;">
                  {{ browserName(log.user_agent) }}
                </span>
              </td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-primary" @click="openDetails(log)">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="store.meta.currentPage"
          v-model:limit="store.meta.perPage"
          :total-items="store.meta.total"
          :limit-options="[10, 15, 25, 50, 100]"
          @update:current-page="(p: number) => reload(p)"
          @update:limit="(l: number) => reload(1, l)"
        />
      </div>
    </div>

    <div id="logDetailsModal" ref="modalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détail de l’activité</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
          </div>
          <div v-if="selected" class="modal-body">
            <dl class="row mb-3">
              <dt class="col-sm-3">Date</dt>
              <dd class="col-sm-9">{{ formatWhen(selected.created_at) }}</dd>
              <dt class="col-sm-3">Utilisateur</dt>
              <dd class="col-sm-9">{{ fullName(selected.user) || selected.user?.email || 'Anonyme' }}</dd>
              <dt class="col-sm-3">Action</dt>
              <dd class="col-sm-9"><span :class="actionBadgeClass(selected.action)">{{ actionLabel(selected.action) }}</span></dd>
              <dt class="col-sm-3">Entité</dt>
              <dd class="col-sm-9">{{ selected.entity_type || '—' }} <span v-if="selected.entity_id" class="text-muted">/ {{ selected.entity_id }}</span></dd>
              <dt class="col-sm-3">IP</dt>
              <dd class="col-sm-9"><code>{{ selected.ip_address || '—' }}</code></dd>
              <dt class="col-sm-3">Navigateur</dt>
              <dd class="col-sm-9 small text-muted">{{ selected.user_agent || '—' }}</dd>
            </dl>
            <div v-if="selected.details">
              <h6 class="mb-2">Données associées</h6>
              <pre class="bg-light p-3 rounded small mb-0" style="max-height: 320px; overflow: auto;">{{ JSON.stringify(selected.details, null, 2) }}</pre>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useActivityLogsStore, type ActivityLogRow } from '~/stores/activityLogs'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const store = useActivityLogsStore()
const { formatDate, formatRelativeDate } = useFormatters()

const filters = reactive({
  action: '',
  entity_type: '',
  from: '',
  to: '',
})

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const selected = ref<ActivityLogRow | null>(null)

const reload = async (page = store.meta.currentPage, limit = store.meta.perPage) => {
  await store.fetch({
    page,
    limit,
    action: filters.action || null,
    entity_type: filters.entity_type || null,
    from: filters.from || null,
    to: filters.to || null,
  })
}

const resetFilters = () => {
  filters.action = ''
  filters.entity_type = ''
  filters.from = ''
  filters.to = ''
  reload(1)
}

const fullName = (u?: ActivityLogRow['user']) => {
  if (!u) return ''
  return [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
}

const actionLabel = (a: string | null) => {
  const map: Record<string, string> = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression',
    login: 'Connexion',
    logout: 'Déconnexion',
  }
  return map[a || ''] || a || '—'
}

const actionBadgeClass = (a: string | null) => {
  const base = 'badge'
  const map: Record<string, string> = {
    create: `${base} bg-success-subtle text-success`,
    update: `${base} bg-warning-subtle text-warning`,
    delete: `${base} bg-danger-subtle text-danger`,
  }
  return map[a || ''] || `${base} bg-secondary-subtle text-secondary`
}

const formatWhen = (iso: string | null) => {
  if (!iso) return '—'
  return formatDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const relativeWhen = (iso: string | null) => {
  if (!iso) return ''
  return formatRelativeDate(iso)
}

const browserName = (ua: string | null) => {
  if (!ua) return '—'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) return 'Safari'
  if (/PostmanRuntime/i.test(ua)) return 'Postman'
  if (/curl\//i.test(ua)) return 'curl'
  return ua.slice(0, 40) + (ua.length > 40 ? '…' : '')
}

const openDetails = (log: ActivityLogRow) => {
  selected.value = log
  modalInstance?.show()
}

onMounted(async () => {
  await reload(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})
</script>

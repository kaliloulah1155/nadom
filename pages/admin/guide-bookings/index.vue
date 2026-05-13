<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="mb-1">Réservations guides</h4>
        <p class="text-muted mb-0">
          Demandes de réservation (accompagnement ou documentation). Mettez à jour le statut pour suivre le traitement : en attente → confirmé → terminé.
        </p>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Statut</label>
            <select v-model="filters.status" class="form-select" @change="goToPage(1)">
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Guide</label>
            <select v-model="filters.guide_id" class="form-select" @change="goToPage(1)">
              <option value="">Tous</option>
              <option v-for="g in guidesStore.guides" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              :disabled="!filters.status && !filters.guide_id"
              @click="clearFilters"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="guidesStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Créée le</th>
                <th>Client</th>
                <th>Guide</th>
                <th>Période</th>
                <th>Type</th>
                <th class="text-center">Personnes</th>
                <th class="text-end">Montant</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="guidesStore.bookings.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">Aucune réservation</td>
              </tr>
              <tr v-for="row in guidesStore.bookings" :key="row.id">
                <td><small>{{ formatDate(row.created_at) }}</small></td>
                <td>
                  <div class="small fw-medium">{{ clientLabel(row) }}</div>
                  <div class="small text-muted">{{ row.user?.email || '—' }}</div>
                </td>
                <td>{{ row.guide?.name || '—' }}</td>
                <td>
                  <small>{{ formatDay(row.start_date) }}</small>
                  <span class="text-muted mx-1">→</span>
                  <small>{{ formatDay(row.end_date) }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark">{{ serviceTypeLabel(row.service_type) }}</span>
                  <span v-if="row.service_type === 'hourly' && row.hours" class="small text-muted d-block">{{ row.hours }} h</span>
                  <span v-if="row.service_type === 'daily' && row.days" class="small text-muted d-block">{{ row.days }} j</span>
                </td>
                <td class="text-center small">{{ row.people_count ?? 1 }}</td>
                <td class="text-end small">
                  {{ formatMoney(row.total_price, row.guide?.currency) }}
                </td>
                <td>
                  <select
                    v-if="canChangeStatus"
                    class="form-select form-select-sm"
                    style="max-width: 9rem"
                    :value="row.status"
                    @change="onStatusChange(row, $event)"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <span v-else class="badge" :class="statusBadgeClass(row.status)">{{ statusLabel(row.status) }}</span>
                </td>
                <td class="text-end text-nowrap">
                  <button
                    v-can="['view', 'guide-bookings']"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openDetail(row)"
                  >
                    Détail
                  </button>
                  <button
                    v-can="['delete', 'guide-bookings']"
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="remove(row.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="guidesStore.bookingsMeta.currentPage"
          v-model:limit="guidesStore.bookingsMeta.perPage"
          :total-items="guidesStore.bookingsMeta.total"
          @update:current-page="(p: number) => goToPage(p)"
          @update:limit="(l: number) => goToPage(1, l)"
        />
      </div>
    </div>

    <div id="guideBookingDetailModal" ref="detailModalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Réservation {{ detail?.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div v-if="detail" class="modal-body">
            <dl class="row small mb-0">
              <dt class="col-sm-3">Statut</dt>
              <dd class="col-sm-9"><span class="badge" :class="statusBadgeClass(detail.status)">{{ statusLabel(detail.status) }}</span></dd>
              <dt class="col-sm-3">Client</dt>
              <dd class="col-sm-9">{{ clientLabel(detail) }} — {{ detail.user?.email || '—' }}</dd>
              <dt class="col-sm-3">Guide</dt>
              <dd class="col-sm-9">{{ detail.guide?.name || '—' }}</dd>
              <dt class="col-sm-3">Thématique doc.</dt>
              <dd class="col-sm-9">{{ detail.documentation_category?.label || '—' }}</dd>
              <dt class="col-sm-3">Période</dt>
              <dd class="col-sm-9">{{ formatDay(detail.start_date) }} → {{ formatDay(detail.end_date) }}</dd>
              <dt class="col-sm-3">Type de prestation</dt>
              <dd class="col-sm-9">{{ serviceTypeLabel(detail.service_type) }}</dd>
              <dt class="col-sm-3">Personnes à accompagner</dt>
              <dd class="col-sm-9">{{ detail.people_count ?? 1 }}</dd>
              <dt class="col-sm-3">Montant</dt>
              <dd class="col-sm-9">{{ formatMoney(detail.total_price, detail.guide?.currency) }}</dd>
              <dt class="col-sm-3">Notes</dt>
              <dd class="col-sm-9">
                <div v-if="detail.notes" class="border rounded p-2 bg-light" style="white-space: pre-wrap;">{{ detail.notes }}</div>
                <span v-else class="text-muted">—</span>
              </dd>
            </dl>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAbility } from '@casl/vue'
import { useGuidesStore, type GuideBooking } from '~/stores/guides'
import { useNotification } from '~/composables/useNotification'

definePageMeta({ layout: 'admin' })

const guidesStore = useGuidesStore()
const ability = useAbility()
const { success, error } = useNotification()

const canChangeStatus = computed(() => ability.can('status', 'guide-bookings'))

const filters = reactive({
  status: '',
  guide_id: '',
})

const detail = ref<GuideBooking | null>(null)
const detailModalRef = ref<HTMLElement | null>(null)
let detailModal: { show: () => void; hide: () => void; dispose?: () => void } | null = null

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

const formatDay = (d?: string) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

function clientLabel(row: GuideBooking) {
  const u = row.user
  if (!u) return '—'
  const name = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
  return name || u.email || '—'
}

function serviceTypeLabel(t: GuideBooking['service_type']) {
  return t === 'hourly' ? 'Horaire' : 'Journalier'
}

function statusLabel(s: GuideBooking['status']) {
  const m: Record<GuideBooking['status'], string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  }
  return m[s] || s
}

function statusBadgeClass(s: GuideBooking['status']) {
  const m: Record<GuideBooking['status'], string> = {
    pending: 'bg-warning text-dark',
    confirmed: 'bg-primary',
    completed: 'bg-success',
    cancelled: 'bg-secondary',
  }
  return m[s] || 'bg-secondary'
}

function formatMoney(amount: number, currency?: string | null) {
  const cur = currency || 'XOF'
  const n = Number(amount)
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${cur}`
}

async function load() {
  await guidesStore.fetchBookings({
    page: guidesStore.bookingsMeta.currentPage,
    limit: guidesStore.bookingsMeta.perPage,
    status: filters.status || undefined,
    guide_id: filters.guide_id || undefined,
  })
}

function goToPage(p: number, l?: number) {
  if (typeof l === 'number') guidesStore.bookingsMeta.perPage = l
  guidesStore.bookingsMeta.currentPage = p
  load()
}

function clearFilters() {
  filters.status = ''
  filters.guide_id = ''
  goToPage(1)
}

function openDetail(row: GuideBooking) {
  detail.value = row
  detailModal?.show()
}

async function onStatusChange(row: GuideBooking, e: Event) {
  const sel = e.target as HTMLSelectElement
  const next = sel.value as GuideBooking['status']
  if (next === row.status) return
  const updated = await guidesStore.updateBookingStatus(row.id, next)
  if (updated) {
    success('Statut mis à jour')
  } else {
    sel.value = row.status
    error('Mise à jour impossible')
  }
}

async function remove(id: string) {
  if (!confirm('Supprimer cette réservation ?')) return
  try {
    await guidesStore.deleteBooking(id)
    success('Réservation supprimée')
    if (guidesStore.bookings.length === 0 && guidesStore.bookingsMeta.currentPage > 1) {
      guidesStore.bookingsMeta.currentPage -= 1
    }
    await load()
  } catch (e: any) {
    error(e?.message || 'Suppression impossible')
  }
}

onMounted(async () => {
  await guidesStore.fetchGuides()
  guidesStore.bookingsMeta.currentPage = 1
  await load()
  if (typeof window !== 'undefined' && (window as any).bootstrap && detailModalRef.value) {
    detailModal = new (window as any).bootstrap.Modal(detailModalRef.value, { focus: false })
  }
})

onBeforeUnmount(() => {
  detailModal?.dispose?.()
})
</script>

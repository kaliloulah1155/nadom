<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="mb-1">{{ t('admin.guideBookings.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.guideBookings.subtitle') }}</p>
      </div>
      <button v-if="canCreate" type="button" class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.guideBookings.newBooking') }}
      </button>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">{{ t('admin.dashboard.status') }}</label>
            <select v-model="filters.status" class="form-select" @change="goToPage(1)">
              <option value="">{{ t('admin.common.all') }}</option>
              <option value="pending">{{ t('admin.requests.status.pending') }}</option>
              <option value="confirmed">{{ t('admin.guideBookings.confirmed') }}</option>
              <option value="completed">{{ t('admin.guideBookings.completed') }}</option>
              <option value="cancelled">{{ t('admin.guideBookings.cancelled') }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">{{ t('admin.guideBookings.guideFilter') }}</label>
            <select v-model="filters.guide_id" class="form-select" @change="goToPage(1)">
              <option value="">{{ t('admin.guideBookings.allGuides') }}</option>
              <option v-for="g in guideFilterOptions" :key="g.id" :value="g.id">{{ guideOptionLabel(g) }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              :disabled="!filters.status && !filters.guide_id"
              @click="clearFilters"
            >
              {{ t('admin.guideBookings.resetFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="guidesStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">{{ t('admin.guideBookings.loading') }}</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.guideBookings.createdAt') }}</th>
                <th>{{ t('admin.guideBookings.client') }}</th>
                <th>{{ t('admin.guideBookings.guide') }}</th>
                <th>{{ t('admin.guideBookings.period') }}</th>
                <th>{{ t('admin.guideBookings.serviceType') }}</th>
                <th class="text-center">{{ t('admin.guideBookings.people') }}</th>
                <th class="text-end">{{ t('admin.guideBookings.amount') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="guidesStore.bookings.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">{{ t('admin.guideBookings.noBookings') }}</td>
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
                <td class="text-end small">{{ formatMoney(row.total_price, row.guide?.currency) }}</td>
                <td>
                  <select
                    v-if="canChangeStatus"
                    class="form-select form-select-sm"
                    style="max-width: 9rem"
                    :value="row.status"
                    @change="onStatusChange(row, $event)"
                  >
                    <option value="pending">{{ t('admin.requests.status.pending') }}</option>
                    <option value="confirmed">{{ t('admin.guideBookings.confirmed') }}</option>
                    <option value="completed">{{ t('admin.guideBookings.completed') }}</option>
                    <option value="cancelled">{{ t('admin.guideBookings.cancelled') }}</option>
                  </select>
                  <span v-else class="badge" :class="statusBadgeClass(row.status)">{{ statusLabel(row.status) }}</span>
                </td>
                <td class="text-end text-nowrap">
                  <button
                    v-if="canView"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openDetail(row)"
                  >
                    {{ t('admin.guideBookings.detailBtn') }}
                  </button>
                  <button
                    v-if="canUpdate && Number(row.total_price) > 0 && row.status !== 'cancelled'"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1"
                    title="Générer un lien de paiement"
                    :disabled="payProcessing === String(row.id)"
                    @click="generatePaymentLink(row.id)"
                  >
                    <span v-if="payProcessing === String(row.id)" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-link-45deg"></i>
                  </button>
                  <button
                    v-if="canUpdate"
                    type="button"
                    class="btn btn-sm btn-outline-secondary me-1"
                    @click="openEdit(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-if="canDelete"
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

    <!-- Create / Edit modal (teleport : évite coupure par overflow du layout admin) -->
    <Teleport to="body">
      <div
        id="guideBookingFormModal"
        ref="formModalRef"
        class="modal fade guide-booking-form-modal"
        tabindex="-1"
        data-bs-focus="false"
      >
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header border-bottom">
              <h5 class="modal-title">
                {{ formMode === 'create' ? t('admin.guideBookings.newBooking') : t('admin.guideBookings.editBooking') }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="guideBookingForm" @submit.prevent="saveForm">
                <div class="row g-3">
                  <div v-if="formMode === 'create'" class="col-md-6">
                    <label class="form-label" for="gbClient">{{ t('admin.guideBookings.selectClient') }} *</label>
                    <select id="gbClient" v-model.number="form.user_id" class="form-select" required>
                      <option :value="0" disabled>{{ t('admin.guideBookings.selectClient') }}</option>
                      <option v-for="u in usersStore.users" :key="u.id" :value="Number(u.id)">
                        {{ userOptionLabel(u) }}
                      </option>
                    </select>
                  </div>
                  <div v-else class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.client') }}</label>
                    <input
                      type="text"
                      class="form-control bg-light"
                      readonly
                      :value="editClientLabel"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label" for="gbGuide">{{ t('admin.guideBookings.selectGuide') }} *</label>
                    <select
                      id="gbGuide"
                      v-model="form.guide_id"
                      class="form-select"
                      required
                      :disabled="formGuidesLoading"
                    >
                      <option v-if="!form.guide_id" value="">{{ t('admin.guideBookings.selectGuide') }}</option>
                      <option
                        v-for="g in guideSelectOptions"
                        :key="g.id"
                        :value="g.id"
                        :disabled="isGuideOptionDisabled(g)"
                      >
                        {{ guideOptionLabel(g) }}
                      </option>
                    </select>
                    <div v-if="formGuidesLoading" class="form-text text-muted">
                      <span class="spinner-border spinner-border-sm me-1"></span>
                      {{ t('admin.guideBookings.loadingGuides') }}
                    </div>
                    <div v-else-if="guideSelectOptions.length === 0" class="form-text text-warning">
                      {{ t('admin.guideBookings.noTourGuidesHint') }}
                    </div>
                    <div v-else class="form-text text-muted">
                      {{ t('admin.guideBookings.guidesFromListHint', { count: guideSelectOptions.length }) }}
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="form-label">{{ t('admin.guideBookings.docThemeOptional') }}</label>
                    <select v-model.number="form.documentation_category_id" class="form-select">
                      <option :value="0">{{ t('admin.guideBookings.noTheme') }}</option>
                      <option v-for="c in gdcCategories" :key="c.id" :value="c.id">{{ categoryLabel(c) }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.serviceType') }}</label>
                    <select v-model="form.service_type" class="form-select">
                      <option value="daily">{{ t('admin.guideBookings.daily') }}</option>
                      <option value="hourly">{{ t('admin.guideBookings.hourly') }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.dashboard.status') }}</label>
                    <select v-model="form.status" class="form-select">
                      <option value="pending">{{ t('admin.requests.status.pending') }}</option>
                      <option value="confirmed">{{ t('admin.guideBookings.confirmed') }}</option>
                      <option value="completed">{{ t('admin.guideBookings.completed') }}</option>
                      <option value="cancelled">{{ t('admin.guideBookings.cancelled') }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.startDate') }} *</label>
                    <input v-model="form.start_date" type="date" class="form-control" required />
                  </div>
                  <div v-if="form.service_type === 'daily'" class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.endDate') }} *</label>
                    <input v-model="form.end_date" type="date" class="form-control" required />
                  </div>
                  <div v-if="form.service_type === 'hourly'" class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.hours') }} *</label>
                    <input v-model.number="form.hours" type="number" min="1" max="24" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.guideBookings.peopleToAccompany') }}</label>
                    <input v-model.number="form.people_count" type="number" min="1" max="100" class="form-control" />
                  </div>
                  <div class="col-12">
                    <label class="form-label" for="guideBookingNotes">{{ t('admin.guideBookings.notes') }}</label>
                    <textarea
                      id="guideBookingNotes"
                      v-model="form.notes"
                      class="form-control guide-booking-notes-input"
                      rows="4"
                      :placeholder="t('admin.guideBookings.notesPlaceholder')"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" form="guideBookingForm" class="btn btn-primary" :disabled="formSaving || formGuidesLoading || !form.guide_id">
                <span v-if="formSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ t('admin.guideBookings.saveBooking') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Detail modal -->
    <Teleport to="body">
    <div id="guideBookingDetailModal" ref="detailModalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.guideBookings.bookingDetail', { id: detail?.id }) }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div v-if="detail" class="modal-body">
            <dl class="row small mb-0">
              <dt class="col-sm-3">{{ t('admin.dashboard.status') }}</dt>
              <dd class="col-sm-9"><span class="badge" :class="statusBadgeClass(detail.status)">{{ statusLabel(detail.status) }}</span></dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.client') }}</dt>
              <dd class="col-sm-9">{{ clientLabel(detail) }} — {{ detail.user?.email || '—' }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.guide') }}</dt>
              <dd class="col-sm-9">{{ detail.guide?.name || '—' }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.docTheme') }}</dt>
              <dd class="col-sm-9">{{ detail.documentation_category ? categoryLabel(detail.documentation_category as Record<string, unknown>) : '—' }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.period') }}</dt>
              <dd class="col-sm-9">{{ formatDay(detail.start_date) }} → {{ formatDay(detail.end_date) }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.serviceType') }}</dt>
              <dd class="col-sm-9">{{ serviceTypeLabel(detail.service_type) }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.peopleToAccompany') }}</dt>
              <dd class="col-sm-9">{{ detail.people_count ?? 1 }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.amount') }}</dt>
              <dd class="col-sm-9">{{ formatMoney(detail.total_price, detail.guide?.currency) }}</dd>
              <dt class="col-sm-3">{{ t('admin.guideBookings.notes') }}</dt>
              <dd class="col-sm-9">
                <div v-if="detail.notes" class="border rounded p-2 bg-light" style="white-space: pre-wrap;">{{ detail.notes }}</div>
                <span v-else class="text-muted">—</span>
              </dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button
              v-if="canUpdate"
              type="button"
              class="btn btn-outline-primary me-auto"
              @click="openEditFromDetail"
            >
              {{ t('admin.guideBookings.editBooking') }}
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.close') }}</button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { categoryLabel } = useCategoryLabel()

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGuidesStore, type Guide, type GuideBooking } from '~/stores/guides'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })

const guidesStore = useGuidesStore()
const usersStore = useUsersStore()
const { can } = useAdminAbility()
const api = useApi()
const { success, error } = useNotification()
const { formatDateTime, formatDateShort, formatCurrency } = useFormatters()
const { createPaymentLink, processing: payProcessing } = usePayment()

/** Génère un lien de paiement pour une réservation et ouvre WhatsApp pré-rempli. */
const generatePaymentLink = async (id: string) => {
  const data = await createPaymentLink('guide_booking', String(id))
  if (!data) return
  try { await navigator.clipboard?.writeText(data.checkout_url) } catch {}
  useSwal().success('Lien de paiement généré', 'Lien copié. WhatsApp ouvert pour envoi au client.')
  if (data.whatsapp_url) window.open(data.whatsapp_url, '_blank')
}

const canCreate = computed(() => can('create', 'guide-bookings'))
const canView = computed(() => can('view', 'guide-bookings'))
const canUpdate = computed(() => can('update', 'guide-bookings'))
const canDelete = computed(() => can('delete', 'guide-bookings'))
const canChangeStatus = computed(() => can('status', 'guide-bookings'))

/** Accompagnateurs (kind ≠ documentation) — aligné sur Admin → Guides. */
const formGuides = ref<Array<{ id: string; name: string; available?: boolean; citiesLabel?: string }>>([])
const formGuidesLoading = ref(false)

function isAccompanistGuide(g: { kind?: string | null }) {
  return g.kind !== 'documentation'
}

function guideOptionLabel(g: { name: string; citiesLabel?: string; available?: boolean }) {
  const parts = [g.name]
  if (g.citiesLabel) parts.push(g.citiesLabel)
  if (g.available === false) parts.push(`(${t('guide.unavailable')})`)
  return parts.join(' — ')
}

/** Indisponibles : grisés et non sélectionnables (sauf guide déjà affecté en édition). */
function isGuideOptionDisabled(g: { id: string; available?: boolean }) {
  if (g.available !== false) return false
  return String(form.guide_id) !== String(g.id)
}

function firstAvailableGuideId(): string {
  const found = guideSelectOptions.value.find(g => g.available !== false)
  return found?.id ?? ''
}

function isSelectedGuideUnavailable(): boolean {
  const id = String(form.guide_id || '')
  const g = formGuides.value.find(x => x.id === id)
  return g?.available === false
}

const tourGuides = computed(() => guidesStore.guides.filter(isAccompanistGuide))

const guideFilterOptions = computed(() =>
  formGuides.value.length > 0
    ? formGuides.value
    : tourGuides.value.map(g => ({
        id: String(g.id),
        name: String(g.name || '—'),
        available: g.available,
        citiesLabel: Array.isArray(g.cities) ? g.cities.slice(0, 2).join(', ') : '',
      }))
)

const guideSelectOptions = computed(() => {
  const list = [...formGuides.value]
  const id = String(form.guide_id || '').trim()
  if (id && !list.some(g => g.id === id)) {
    const row = guidesStore.bookings.find(b => String(b.guide_id) === id)
    const name = row?.guide?.name || `Guide #${id.slice(0, 8)}`
    list.unshift({ id, name, available: false })
  }
  return list
})

async function loadFormGuides() {
  formGuidesLoading.value = true
  try {
    formGuides.value = await guidesStore.fetchAccompanistsForBooking()
    if (formGuides.value.length === 0) {
      await loadFormGuidesFallback()
    }
  } catch {
    await loadFormGuidesFallback()
  } finally {
    formGuidesLoading.value = false
  }
}

/** Secours : même filtre « Accompagnateurs » que la page Guides (kind=tour). */
async function loadFormGuidesFallback() {
  const merged = new Map<string, { id: string; name: string; available?: boolean; citiesLabel?: string }>()
  let page = 1
  let lastPage = 1
  do {
    const res = await api.post<{ data?: Guide[]; last_page?: number }>(
      '/guides/all',
      { page, limit: 100, kind: 'tour' }
    )
    if (!res.success || !res.data) break
    const d = res.data as { data?: Guide[]; last_page?: number }
    const items = Array.isArray(d) ? d : (d.data ?? [])
    lastPage = (d as { last_page?: number }).last_page ?? 1
    for (const g of items) {
      if (!isAccompanistGuide(g)) continue
      const id = String(g.id)
      merged.set(id, {
        id,
        name: String(g.name || '—').trim() || '—',
        available: g.available,
        citiesLabel: Array.isArray(g.cities) ? g.cities.slice(0, 2).join(', ') : '',
      })
    }
    page++
  } while (page <= lastPage)

  formGuides.value = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

const editClientLabel = computed(() => {
  if (!editingId.value) return '—'
  const row = guidesStore.bookings.find(b => b.id === editingId.value)
  return row ? clientLabel(row) : '—'
})

const gdcCategories = ref<any[]>([])

const filters = reactive({ status: '', guide_id: '' })

const detail = ref<GuideBooking | null>(null)
const detailModalRef = ref<HTMLElement | null>(null)
const formModalRef = ref<HTMLElement | null>(null)
let detailModal: { show: () => void; hide: () => void; dispose?: () => void } | null = null
let formModal: { show: () => void; hide: () => void; dispose?: () => void } | null = null

const formMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const formSaving = ref(false)

const form = reactive({
  user_id: 0,
  guide_id: '',
  documentation_category_id: 0,
  service_type: 'daily' as 'daily' | 'hourly',
  start_date: '',
  end_date: '',
  hours: 4,
  people_count: 1,
  notes: '',
  status: 'pending' as GuideBooking['status'],
})

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function isoAddDays(iso: string, delta: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

function resetForm() {
  const start = isoToday()
  form.user_id = 0
  form.guide_id = firstAvailableGuideId() || (tourGuides.value[0]?.id ? String(tourGuides.value[0].id) : '')
  form.documentation_category_id = 0
  form.service_type = 'daily'
  form.start_date = start
  form.end_date = isoAddDays(start, 1)
  form.hours = 4
  form.people_count = 1
  form.notes = ''
  form.status = 'pending'
}

function fillFormFromRow(row: GuideBooking) {
  form.guide_id = String(row.guide_id || row.guide?.id || '')
  form.documentation_category_id = row.documentation_category_id || 0
  form.service_type = row.service_type
  form.start_date = String(row.start_date).slice(0, 10)
  form.end_date = String(row.end_date).slice(0, 10)
  form.hours = row.hours || 4
  form.people_count = row.people_count ?? 1
  form.notes = row.notes || ''
  form.status = row.status
  form.user_id = row.user_id
}

function buildPayload(): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    guide_id: form.guide_id,
    start_date: form.start_date,
    service_type: form.service_type,
    people_count: Math.min(100, Math.max(1, Math.floor(Number(form.people_count)) || 1)),
    notes: form.notes?.trim() || null,
    status: form.status,
  }
  if (form.documentation_category_id > 0) {
    payload.documentation_category_id = form.documentation_category_id
  } else if (formMode.value === 'edit') {
    payload.documentation_category_id = 0
  }
  if (form.service_type === 'daily') {
    payload.end_date = form.end_date
    const start = new Date(`${form.start_date}T12:00:00`)
    const end = new Date(`${form.end_date}T12:00:00`)
    payload.days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  } else {
    payload.end_date = form.start_date
    payload.hours = form.hours
  }
  if (formMode.value === 'create') {
    payload.user_id = form.user_id
  }
  return payload
}

const formatDate = (d?: string) => (d ? formatDateTime(d) : '—')
const formatDay = (d?: string) => (d ? formatDateShort(d) : '—')

function userOptionLabel(u: { firstname?: string; lastname?: string; email?: string }) {
  const name = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
  return name ? `${name} (${u.email})` : u.email || '—'
}

function clientLabel(row: GuideBooking) {
  const u = row.user
  if (!u) return '—'
  const name = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
  return name || u.email || '—'
}

function serviceTypeLabel(type: GuideBooking['service_type']) {
  return type === 'hourly' ? t('admin.guideBookings.hourly') : t('admin.guideBookings.daily')
}

function statusLabel(s: GuideBooking['status']) {
  const m: Record<GuideBooking['status'], string> = {
    pending: t('admin.requests.status.pending'),
    confirmed: t('admin.guideBookings.confirmed'),
    completed: t('admin.guideBookings.completed'),
    cancelled: t('admin.guideBookings.cancelled'),
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
  return formatCurrency(amount, currency || 'XOF')
}

async function loadGdcCategories() {
  const res = await api.get<any[]>('/category/slug/GDC')
  if (res.success && Array.isArray(res.data)) {
    gdcCategories.value = [...res.data].sort(
      (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    )
  }
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

async function openCreateModal() {
  formMode.value = 'create'
  editingId.value = null
  resetForm()
  await loadFormGuides()
  form.guide_id = firstAvailableGuideId()
  formModal?.show()
}

async function openEdit(row: GuideBooking) {
  formMode.value = 'edit'
  editingId.value = row.id
  await loadFormGuides()
  fillFormFromRow(row)
  formModal?.show()
}

async function openEditFromDetail() {
  if (!detail.value) return
  detailModal?.hide()
  await openEdit(detail.value)
}

async function saveForm() {
  if (formMode.value === 'create' && !canCreate.value) {
    error(t('admin.messages.updateError'))
    return
  }
  if (formMode.value === 'edit' && !canUpdate.value) {
    error(t('admin.messages.updateError'))
    return
  }
  if (isSelectedGuideUnavailable() && formMode.value === 'create') {
    error(t('admin.guideBookings.unavailableGuideError'))
    return
  }
  if (isSelectedGuideUnavailable() && formMode.value === 'edit') {
    const row = guidesStore.bookings.find(b => b.id === editingId.value)
    if (String(row?.guide_id) !== String(form.guide_id)) {
      error(t('admin.guideBookings.unavailableGuideError'))
      return
    }
  }
  if (form.service_type === 'daily' && form.end_date < form.start_date) {
    error(t('guide.bookingInvalidDates'))
    return
  }
  if (formMode.value === 'create' && !form.user_id) {
    error(t('admin.guideBookings.selectClient'))
    return
  }
  formSaving.value = true
  try {
    const payload = buildPayload()
    if (formMode.value === 'create') {
      await guidesStore.createBookingAdmin(payload)
      success(t('admin.guideBookings.created'))
    } else if (editingId.value) {
      await guidesStore.updateBooking(editingId.value, payload)
      success(t('admin.guideBookings.updated'))
    }
    formModal?.hide()
    await load()
  } catch (e: any) {
    error(e?.message || t('admin.messages.updateError'))
  } finally {
    formSaving.value = false
  }
}

async function onStatusChange(row: GuideBooking, e: Event) {
  const sel = e.target as HTMLSelectElement
  const next = sel.value as GuideBooking['status']
  if (next === row.status) return
  const updated = await guidesStore.updateBookingStatus(row.id, next)
  if (updated) {
    success(t('admin.guideBookings.statusUpdated'))
  } else {
    sel.value = row.status
    error(t('admin.messages.updateError'))
  }
}

async function remove(id: string) {
  if (!confirm(t('admin.confirm.deleteBooking'))) return
  try {
    await guidesStore.deleteBooking(id)
    success(t('admin.guideBookings.deleted'))
    if (guidesStore.bookings.length === 0 && guidesStore.bookingsMeta.currentPage > 1) {
      guidesStore.bookingsMeta.currentPage -= 1
    }
    await load()
  } catch (e: any) {
    error(e?.message || t('admin.messages.deleteImpossible'))
  }
}

onMounted(async () => {
  await Promise.all([
    usersStore.fetchUsers({ page: 1, limit: 200 }),
    loadGdcCategories(),
    loadFormGuides(),
  ])
  guidesStore.bookingsMeta.currentPage = 1
  await load()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    if (detailModalRef.value) {
      detailModal = new (window as any).bootstrap.Modal(detailModalRef.value, { focus: false })
    }
    if (formModalRef.value) {
      formModal = new (window as any).bootstrap.Modal(formModalRef.value, { focus: false })
    }
  }
})

onBeforeUnmount(() => {
  detailModal?.dispose?.()
  formModal?.dispose?.()
})
</script>

<style scoped>
.guide-booking-form-modal .modal-body {
  max-height: min(65vh, calc(100vh - 12rem));
}

.guide-booking-form-modal .form-select,
.guide-booking-form-modal .form-control {
  min-height: 2.5rem;
}

.guide-booking-notes-input {
  min-height: 6rem;
  resize: vertical;
}

#gbGuide option:disabled {
  color: #94a3b8;
  background-color: #f1f5f9;
}
</style>

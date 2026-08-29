<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-2 text-muted">{{ t('admin.shipments.loadingDetail') }}</p>
  </div>

  <div v-else-if="notFound" class="text-center py-5">
    <i class="bi bi-box-seam fs-1 text-muted opacity-25 d-block mb-3"></i>
    <h5 class="text-muted">{{ t('admin.shipments.notFound') }}</h5>
    <p class="text-muted small">{{ t('admin.shipments.notFoundHint', { code: id }) }}</p>
    <NuxtLink to="/admin/shipments" class="btn btn-outline-primary btn-sm mt-2">
      <i class="bi bi-arrow-left me-1"></i>{{ t('admin.shipments.backToList') }}
    </NuxtLink>
  </div>

  <div v-else-if="shipment">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin/shipments">{{ t('admin.nav.shipments') }}</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">{{ t('admin.shipments.trackingTitle', { id }) }}</li>
      </ol>
    </nav>

    <!-- Header Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <h4 class="mb-0 me-3">{{ t('admin.shipments.detailHeading') }} #{{ shipment.tracking_number }}</h4>
        <span
          class="badge"
          :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
        >
          {{ formatShipmentStatus(shipment.status).label }}
        </span>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-dark btn-md"
          :disabled="downloadingLabel"
          :title="t('admin.shipments.labelHint')"
          @click="downloadShipmentLabel"
        >
          <span v-if="downloadingLabel" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-upc-scan me-1"></i>{{ t('admin.shipments.labelTitle') }}
        </button>
        <button
          class="btn btn-outline-secondary btn-md"
          :disabled="downloadingPdf"
          @click="downloadShipmentPdf"
        >
          <span v-if="downloadingPdf" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-file-earmark-pdf me-1"></i>{{ t('admin.shipments.pdfReceipt') }}
        </button>
        <button class="btn btn-outline-primary btn-md" @click="openUpdateModal">
          <i class="bi bi-pencil me-2"></i>{{ t('admin.shipments.update') }}
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Main Content -->
      <div class="col-lg-8">
        <!-- Details Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">{{ t('admin.shipments.logisticsInfo') }}</h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.destination') }}</label>
                <p class="h6 mb-0">{{ shipment.destination_city }}, {{ shipment.destination_country }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.mode') }}</label>
                <span class="badge bg-light text-dark">
                  {{ shippingModeLabel(shipment.shipping_mode) }}
                </span>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.weight') }}</label>
                <p class="mb-0">{{ shipment.weight ? `${shipment.weight} kg` : t('admin.shipments.na') }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.dimensions') }}</label>
                <p class="mb-0">
                  <template v-if="(shipment as any).length || (shipment as any).width || (shipment as any).height">
                    {{ (shipment as any).length || '?' }} × {{ (shipment as any).width || '?' }} × {{ (shipment as any).height || '?' }} cm
                  </template>
                  <template v-else>
                    {{ shipment.dimensions || t('admin.shipments.na') }}
                  </template>
                </p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.declaredValue') }}</label>
                <p class="mb-0">{{ formatCurrency(shipment.declared_value, requestCurrency) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.shippingCost') }}</label>
                <p class="mb-0 text-success fw-bold">{{ formatCurrency(shipment.shipping_cost, requestCurrency) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">{{ t('admin.shipments.currentLocation') }}</label>
                <p class="mb-0"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ shipment.current_location || t('admin.shipments.na') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">{{ t('admin.shipments.timeline') }}</h5>
            <button class="btn btn-sm btn-primary" @click="openUpdateModal">
              <i class="bi bi-plus-lg me-1"></i>{{ t('admin.shipments.addStep') }}
            </button>
          </div>
          <div class="card-body">
            <div v-if="!shipment.timeline?.length" class="text-center text-muted py-3">
              <small>{{ t('admin.shipments.noSteps') }}</small>
            </div>
            <div v-else class="timeline">
              <div
                v-for="(step, idx) in sortedTimeline"
                :key="idx"
                class="timeline-item pb-4 position-relative ps-4 border-start"
              >
                <div class="timeline-marker position-absolute rounded-circle bg-primary" style="left: -7px; top: 0; width: 13px; height: 13px;"></div>
                <div class="d-flex justify-content-between mb-1">
                  <div class="d-flex align-items-center gap-2">
                    <h6 class="mb-0">{{ formatShipmentStatus(step.status).label }}</h6>
                    <div class="timeline-actions">
                      <button class="btn btn-link text-primary p-0 x-small-btn" @click="openEditEventModal(step)" :title="t('admin.shipments.edit')">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link text-danger p-0 x-small-btn" @click="confirmDeleteEvent(step)" :title="t('admin.shipments.remove')">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <small class="text-muted">{{ formatDate((step as any).sdate ?? step.date) }}</small>
                </div>
                <div class="small fw-medium text-primary mb-1">{{ step.location }}</div>
                <div class="small text-muted mb-0 description-container" v-html="step.description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Estimates -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex align-items-start justify-content-between mb-3">
              <div class="d-flex align-items-center">
                <div class="bg-primary-subtle p-3 rounded-circle me-3">
                  <i class="bi bi-calendar-event text-primary fs-4"></i>
                </div>
                <div>
                  <small class="text-muted d-block">{{ t('admin.shipments.estimatedDelivery') }}</small>
                  <div v-if="!editingDelivery">
                    <h5 class="mb-0">{{ shipment.estimated_delivery ? formatDateShort(shipment.estimated_delivery) : t('admin.shipments.na') }}</h5>
                  </div>
                  <div v-else class="d-flex align-items-center gap-2 mt-1">
                    <input
                      v-model="deliveryDateInput"
                      type="date"
                      class="form-control form-control-sm"
                      style="width: 160px;"
                    />
                    <button
                      class="btn btn-sm btn-primary"
                      :disabled="savingDelivery"
                      @click="saveEstimatedDelivery"
                    >
                      <span v-if="savingDelivery" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="editingDelivery = false">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
              <button
                v-if="!editingDelivery"
                class="btn btn-sm btn-outline-secondary"
                :title="t('admin.shipments.editDelivery')"
                @click="openDeliveryEdit"
              >
                <i class="bi bi-pencil"></i>
              </button>
            </div>
            <div v-if="shipment.actual_delivery" class="d-flex align-items-center text-success">
              <i class="bi bi-check-circle-fill me-2"></i>
              <small>{{ t('admin.shipments.shippedOn', { date: formatDateShort(shipment.actual_delivery) }) }}</small>
            </div>
          </div>
        </div>

        <!-- Documents joints (facture, annexes) -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="bi bi-paperclip me-2"></i>{{ t('admin.shipments.documents') }}
            </h5>
            <label class="btn btn-sm btn-outline-primary mb-0">
              <i class="bi bi-upload me-1"></i>{{ t('admin.shipments.addDocument') }}
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" multiple hidden @change="onDocumentsSelected" />
            </label>
          </div>
          <div class="card-body">
            <div v-if="uploadingDocuments" class="text-center py-3">
              <span class="spinner-border spinner-border-sm text-primary me-2"></span>
              <span class="small text-muted">{{ t('admin.shipments.uploading') }}</span>
            </div>

            <div v-else-if="shipmentDocuments.length === 0" class="text-muted small text-center py-3">
              <i class="bi bi-file-earmark d-block mb-1" style="font-size: 1.5rem;"></i>
              {{ t('admin.shipments.noDocument') }}
            </div>

            <ul v-else class="list-group list-group-flush">
              <li
                v-for="(doc, i) in shipmentDocuments"
                :key="i"
                class="list-group-item d-flex justify-content-between align-items-center px-0"
              >
                <div class="text-truncate me-2">
                  <i class="bi me-2" :class="doc.filename?.toLowerCase().endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-secondary'"></i>
                  <a :href="resolveStorageAssetUrl(doc.path || doc.url)" target="_blank" rel="noopener" class="text-decoration-none">
                    {{ doc.filename || t('admin.shipments.document') }}
                  </a>
                  <small v-if="doc.size" class="text-muted ms-2">{{ formatFileSize(doc.size) }}</small>
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  :disabled="uploadingDocuments"
                  :title="t('admin.common.delete')"
                  @click="removeDocument(i)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Client & Request -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">{{ t('admin.shipments.references') }}</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="text-muted small d-block">{{ t('admin.requests.client') }}</label>
              <span class="fw-bold d-block">{{ shipmentClientFullName || t('admin.requests.detail.unknownClient') }}</span>
              <small v-if="shipmentClientEmail" class="text-muted d-block">{{ shipmentClientEmail }}</small>
              <a
                v-if="shipmentClientPhone"
                :href="`tel:${shipmentClientPhone}`"
                class="small text-decoration-none"
              >
                <i class="bi bi-telephone text-primary me-1"></i>{{ shipmentClientPhone }}
              </a>
              <span v-else class="small text-muted fst-italic">{{ t('admin.shipments.noPhone') }}</span>
            </div>
            <div v-if="shipment.request_id">
              <label class="text-muted small d-block">{{ t('admin.shipments.linkToRequest') }}</label>
              <NuxtLink :to="`/admin/requests/${shipment.request_id}`" class="fw-bold">
                {{ t('admin.shipments.requestLink', { id: String(shipment.request_id ?? '').slice(-8) }) }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Traçabilité (Phase 2 — Package / Conteneur) -->
        <div v-if="(shipment as any).package || conteneurDuColis" class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">{{ t('admin.shipments.traceability') }}</h5>
          </div>
          <div class="card-body">
            <div v-if="(shipment as any).package" class="mb-3">
              <label class="text-muted small d-block">{{ t('admin.shipments.package') }}</label>
              <NuxtLink :to="`/admin/packages?package=${(shipment as any).package.id}`">
                <code>{{ (shipment as any).package.code }}</code>
              </NuxtLink>
            </div>
            <div v-if="conteneurDuColis">
              <label class="text-muted small d-block">{{ t('admin.shipments.container') }}</label>
              <NuxtLink :to="`/admin/containers?container=${conteneurDuColis.id}`">
                <code class="fw-bold">{{ conteneurDuColis.code }}</code>
              </NuxtLink>
              <div class="small text-muted mt-1">
                {{ t('admin.shipments.containerLot', {
                  n: conteneurDuColis.container_number,
                  lot: conteneurDuColis.lot_number
                }) }}
              </div>
            </div>
            <div v-else class="small text-muted fst-italic">{{ t('admin.shipments.noContainer') }}</div>
          </div>
        </div>

        <!-- Encaissement (Phase 4) -->
        <AdminPaymentBlock
          payable-type="shipment"
          :payable-id="String(shipment.id)"
          :amount-due="shipment.shipping_cost ? Number(shipment.shipping_cost) : null"
        />
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showUpdateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.shipments.updateShipment') }}</h5>
            <button type="button" class="btn-close" @click="showUpdateModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.newStatus') }}</label>
              <select v-model="statusUpdate.status" class="form-select">
                <option value="order_placed">{{ t('admin.shipments.status.order_placed') }}</option>
                <option value="picked_up">{{ t('admin.shipments.status.picked_up') }}</option>
                <option value="in_transit">{{ t('admin.shipments.status.in_transit') }}</option>
                <option value="in_customs">{{ t('admin.shipments.status.in_customs') }}</option>
                <option value="out_for_delivery">{{ t('admin.shipments.status.out_for_delivery') }}</option>
                <option value="delivered">{{ t('admin.shipments.status.delivered') }}</option>
                <option value="returned">{{ t('admin.shipments.status.returned') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.locationCurrent') }}</label>
              <input v-model="statusUpdate.location" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.comment') }}</label>
              <WysiwygEditor v-model="statusUpdate.description" height="250px" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showUpdateModal = false">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" :disabled="updating" @click="performUpdate">
              <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
              {{ t('admin.shipments.update') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <div v-if="showEditEventModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.shipments.editStep') }}</h5>
            <button type="button" class="btn-close" @click="showEditEventModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ t('admin.dashboard.status') }}</label>
              <select v-model="eventToEdit.status" class="form-select">
                <option value="order_placed">{{ t('admin.shipments.status.order_placed') }}</option>
                <option value="picked_up">{{ t('admin.shipments.status.picked_up') }}</option>
                <option value="in_transit">{{ t('admin.shipments.status.in_transit') }}</option>
                <option value="in_customs">{{ t('admin.shipments.status.in_customs') }}</option>
                <option value="out_for_delivery">{{ t('admin.shipments.status.out_for_delivery') }}</option>
                <option value="delivered">{{ t('admin.shipments.status.delivered') }}</option>
                <option value="returned">{{ t('admin.shipments.status.returned') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.location') }}</label>
              <input v-model="eventToEdit.location" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.date') }}</label>
              <input v-model="eventToEdit.sdate" type="datetime-local" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.shipments.comment') }}</label>
              <WysiwygEditor v-model="eventToEdit.description" height="200px" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEditEventModal = false">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" :disabled="updatingEvent" @click="performEditEvent">
              <span v-if="updatingEvent" class="spinner-border spinner-border-sm me-1"></span>
              {{ t('admin.shipments.saveChanges') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const shippingModeLabel = (mode: string) => {
  if (mode === 'air_express') return t('admin.shipments.airExpress')
  if (mode === 'sea') return t('admin.shipments.sea')
  if (mode === 'air_normal') return t('admin.shipments.airNormal')
  return mode
}

const pdfLangQuery = () => {
  const lang = ['fr', 'en', 'zh'].includes(locale.value) ? locale.value : 'fr'
  return `?lang=${lang}`
}

import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShippingStore } from '~/stores/shipping'
import type { ShipmentStatus } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'
import { getToken } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const shippingStore = useShippingStore()
const { formatCurrency, formatDate, formatDateShort, formatShipmentStatus } = useFormatters()
const { success, error } = useNotification()

const id = route.params.id as string
const loading = ref(true)
const showUpdateModal = ref(false)
const updating = ref(false)
const downloadingPdf = ref(false)
const downloadingLabel = ref(false)

const editingDelivery = ref(false)
const deliveryDateInput = ref('')
const savingDelivery = ref(false)

const openDeliveryEdit = () => {
  deliveryDateInput.value = shipment.value?.estimated_delivery?.slice(0, 10) || ''
  editingDelivery.value = true
}

const saveEstimatedDelivery = async () => {
  if (!deliveryDateInput.value || !shipment.value) return
  savingDelivery.value = true
  try {
    const updated = await shippingStore.updateShipment(String(shipment.value.id), {
      estimated_delivery: deliveryDateInput.value
    } as any)
    if (updated) {
      success(t('admin.shipments.deliveryDateUpdated'))
      editingDelivery.value = false
      await fetchShipment(false)
    } else {
      error(t('admin.shipments.updateError'))
    }
  } catch {
    error(t('admin.shipments.updateError'))
  } finally {
    savingDelivery.value = false
  }
}

const showEditEventModal = ref(false)
const updatingEvent = ref(false)
const eventToEdit = reactive({
  id: '',
  status: '',
  location: '',
  description: '',
  sdate: ''
})

const fetchShipment = async (showLoading = true) => {
  if (showLoading) loading.value = true
  try {
    const existing = shippingStore.shipments.find(s => s.tracking_number === id || String(s.id) === id)
    if (existing) {
      await shippingStore.fetchShipmentById(String(existing.id))
    } else if (id.startsWith('ship_')) {
      // Identifiant technique : récupération directe.
      await shippingStore.fetchShipmentById(id)
    } else {
      // Numéro de suivi (`TRK-…` ou nomenclature `AAAAMMJJ…`) : recherche ciblée
      // côté serveur. On chargeait auparavant TOUTES les expéditions pour en
      // retrouver une seule — coûteux et fragile sur cette base distante, où un
      // appel massif est le premier à expirer (§27.3).
      await shippingStore.fetchShipments({ tracking_number: id, limit: 1 })
    }
  } finally {
    if (showLoading) loading.value = false
  }
}

const openEditEventModal = (event: any) => {
  eventToEdit.id = event.id
  eventToEdit.status = event.status
  eventToEdit.location = event.location
  eventToEdit.description = event.description || ''
  
  // Format date for datetime-local (YYYY-MM-DDTHH:mm)
  try {
    const d = new Date(event.sdate || event.date)
    // Adjust for timezone to avoid shifting time
    const tzoffset = d.getTimezoneOffset() * 60000
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16)
    eventToEdit.sdate = localISOTime
  } catch {
    eventToEdit.sdate = ''
  }
  
  showEditEventModal.value = true
}

const performEditEvent = async () => {
  if (!eventToEdit.id) return
  updatingEvent.value = true
  try {
    const res = await shippingStore.updateTimelineEvent(eventToEdit.id, String(shipment.value?.id), {
      status: eventToEdit.status,
      location: eventToEdit.location,
      description: eventToEdit.description,
      sdate: eventToEdit.sdate
    })
    if (res) {
      success(t('admin.shipments.stepUpdated'))
      showEditEventModal.value = false
      await fetchShipment()
    } else {
      error(t('admin.shipments.updateError'))
    }
  } catch (err: any) {
    error(t('admin.shipments.updateError'))
  } finally {
    updatingEvent.value = false
  }
}

const confirmDeleteEvent = async (event: any) => {
  if (!event.id) return
  if (await useSwal().confirmDelete(t('admin.confirm.deleteStep'))) {
    try {
      const ok = await shippingStore.deleteTimelineEvent(event.id, String(shipment.value?.id))
      if (ok) {
        success(t('admin.shipments.stepDeleted'))
        await fetchShipment()
      } else {
        error(t('admin.shipments.deleteError'))
      }
    } catch (err) {
      error(t('admin.shipments.deleteError'))
    }
  }
}

const shipment = computed(() =>
  shippingStore.shipments.find(s => s.tracking_number === id || String(s.id) === id)
)

// --- Documents joints à l'expédition -------------------------------------------
// Facture PDF, document annexe… L'endpoint d'upload existant (`/upload/file`,
// réservé au back-office, 5 Mo) est réutilisé ; la liste vit dans la colonne JSON
// `documents` de l'expédition.
const uploadingDocuments = ref(false)

const shipmentDocuments = computed<any[]>(() => {
  const d = (shipment.value as any)?.documents
  return Array.isArray(d) ? d : []
})

const formatFileSize = (octets: number) => {
  if (!octets) return ''
  if (octets < 1024) return octets + ' o'
  if (octets < 1024 * 1024) return Math.round(octets / 1024) + ' Ko'
  return (octets / 1024 / 1024).toFixed(1) + ' Mo'
}

/** Enregistre la liste complète : l'API remplace la colonne JSON telle quelle. */
const persistDocuments = async (docs: any[]) => {
  await shippingStore.updateShipment(String(shipment.value?.id), { documents: docs } as any)
  await fetchShipment(false)
}

const onDocumentsSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const fichiers = Array.from(input.files || [])
  if (fichiers.length === 0 || !shipment.value) return

  uploadingDocuments.value = true
  try {
    const api = useApi()
    const ajoutes: any[] = []
    for (const f of fichiers) {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('folder', 'shipments/documents')
      const res = await api.post<any>('/upload/file', fd)
      if (!res.success || !res.data?.path) throw new Error('upload')
      ajoutes.push({
        path: res.data.path,
        url: res.data.url,
        filename: res.data.filename || f.name,
        size: res.data.size ?? f.size,
        uploaded_at: new Date().toISOString(),
      })
    }
    await persistDocuments([...shipmentDocuments.value, ...ajoutes])
    success(t('admin.shipments.documentAdded'))
  } catch {
    error(t('admin.shipments.documentUploadFailed'))
  } finally {
    uploadingDocuments.value = false
    input.value = ''
  }
}

const removeDocument = async (index: number) => {
  const reste = shipmentDocuments.value.filter((_, i) => i !== index)
  uploadingDocuments.value = true
  try {
    await persistDocuments(reste)
    success(t('admin.shipments.documentRemoved'))
  } catch {
    error(t('common.error'))
  } finally {
    uploadingDocuments.value = false
  }
}

const sortedTimeline = computed(() => {
  const list = shipment.value?.timeline || []
  return [...list].sort((a: any, b: any) => {
    const dateA = new Date(a.sdate || a.date).getTime()
    const dateB = new Date(b.sdate || b.date).getTime()
    return dateB - dateA
  })
})

/**
 * Conteneur (BL) du colis. Le rattachement se fait colis par colis : on lit
 * `shipment.container`. Le repli sur `package.container` ne couvre que les
 * affectations historiques faites au niveau du panier journalier — sans lui,
 * la fiche affichait le conteneur du package, donc un BL faux dès que le colis
 * avait été rattaché ailleurs.
 */
const conteneurDuColis = computed<any | null>(() => {
  const s: any = shipment.value
  return s?.container ?? s?.package?.container ?? null
})

const notFound = computed(() => !loading.value && !shipment.value)

const requestCurrency = computed(() => (shipment.value as any)?.request?.currency || 'XOF')

const requestClient = computed(() => {
  const s: any = shipment.value
  if (!s) return null
  // The real client is on the linked request, not on shipment.user (which is the admin who created it)
  return s.request?.user ?? null
})

const shipmentClientFullName = computed(() => {
  const s: any = shipment.value
  if (!s) return ''
  const reqUser = requestClient.value
  if (reqUser) {
    const name = [reqUser.firstname, reqUser.lastname].filter(Boolean).join(' ').trim()
    if (name) return name
  }
  return s.request?.contact_fullname || s.request?.contactFullname || ''
})

const shipmentClientEmail = computed(() => {
  const reqUser = requestClient.value
  if (reqUser?.email) return reqUser.email
  const s: any = shipment.value
  return s?.request?.contact_email || s?.request?.contactEmail || ''
})

const shipmentClientPhone = computed(() => {
  const reqUser = requestClient.value
  if (reqUser?.phone) return reqUser.phone
  const s: any = shipment.value
  return s?.request?.contact_number || s?.request?.contactNumber || ''
})

const statusUpdate = reactive({
  status: 'in_transit' as ShipmentStatus,
  location: '',
  description: ''
})

const openUpdateModal = () => {
  if (shipment.value) {
    statusUpdate.status = shipment.value.status
    statusUpdate.location = shipment.value.current_location || ''
    statusUpdate.description = ''
  }
  showUpdateModal.value = true
}

onMounted(async () => {
  await fetchShipment()
})

const downloadShipmentLabel = async () => {
  const s = shipment.value as any
  if (!s) return
  downloadingLabel.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const url = `${config.public.apiBase}/shipments/${s.id}/label${pdfLangQuery()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } })
    if (!res.ok) throw new Error('Erreur étiquette')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `etiquette-${s.tracking_number}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    error(t('admin.shipments.labelError'))
  } finally {
    downloadingLabel.value = false
  }
}

const downloadShipmentPdf = async () => {
  const s = shipment.value as any
  if (!s) return
  downloadingPdf.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const url = `${config.public.apiBase}/shipments/${s.id}/pdf${pdfLangQuery()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } })
    if (!res.ok) throw new Error('Erreur PDF')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `expedition-${s.tracking_number}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    error(t('admin.shipments.pdfError'))
  } finally {
    downloadingPdf.value = false
  }
}

const performUpdate = async () => {
  const s = shipment.value
  if (!s) return
  updating.value = true
  try {
    const updated = await shippingStore.updateShipmentStatus(
      String(s.id),
      statusUpdate.status,
      statusUpdate.location,
      statusUpdate.description
    )
    if (updated) {
      success(t('admin.shipments.statusUpdatedSuccess'))
      showUpdateModal.value = false
      await fetchShipment(false)
    } else {
      error(t('admin.shipments.updateError'))
    }
  } catch {
    error(t('admin.shipments.updateError'))
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
.timeline-item:last-child {
  border-left: none !important;
}

.timeline-item p :deep(img),
.timeline-item :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

/* Ensure any HTML content in description respects spacing */
.timeline-item :deep(p) {
  margin-bottom: 0.5rem;
}

.timeline-actions {
  display: flex;
  gap: 8px;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.timeline-item:hover .timeline-actions {
  opacity: 1;
}

.x-small-btn {
  font-size: 0.8rem;
  line-height: 1;
}

.description-container :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 12px;
  margin: 15px 0;
  display: block;
}
</style>

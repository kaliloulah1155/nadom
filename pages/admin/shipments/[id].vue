<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <div v-else-if="notFound" class="text-center py-5">
    <i class="bi bi-box-seam fs-1 text-muted opacity-25 d-block mb-3"></i>
    <h5 class="text-muted">Expédition introuvable</h5>
    <p class="text-muted small">Le numéro de suivi <code>{{ id }}</code> ne correspond à aucun colis.</p>
    <NuxtLink to="/admin/shipments" class="btn btn-outline-primary btn-sm mt-2">
      <i class="bi bi-arrow-left me-1"></i>Retour aux expéditions
    </NuxtLink>
  </div>

  <div v-else-if="shipment">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin/shipments">Expéditions</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Suivi #{{ id }}</li>
      </ol>
    </nav>

    <!-- Header Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <h4 class="mb-0 me-3">Expédition #{{ shipment.tracking_number }}</h4>
        <span
          class="badge"
          :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
        >
          {{ formatShipmentStatus(shipment.status).label }}
        </span>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-secondary btn-md"
          :disabled="downloadingPdf"
          @click="downloadShipmentPdf"
        >
          <span v-if="downloadingPdf" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-file-earmark-pdf me-1"></i>PDF Récépissé
        </button>
        <button class="btn btn-outline-primary btn-md" @click="openUpdateModal">
          <i class="bi bi-pencil me-2"></i>Mettre à jour
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Main Content -->
      <div class="col-lg-8">
        <!-- Details Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">Informations logistiques</h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Destination</label>
                <p class="h6 mb-0">{{ shipment.destination_city }}, {{ shipment.destination_country }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Mode d'expédition</label>
                <span class="badge bg-light text-dark">
                  {{ shipment.shipping_mode === 'air_express' ? 'Air Express' : shipment.shipping_mode === 'sea' ? 'Maritime' : 'Air Normal' }}
                </span>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Poids</label>
                <p class="mb-0">{{ shipment.weight ? `${shipment.weight} kg` : 'N/A' }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Dimensions (L × l × h)</label>
                <p class="mb-0">
                  <template v-if="(shipment as any).length || (shipment as any).width || (shipment as any).height">
                    {{ (shipment as any).length || '?' }} × {{ (shipment as any).width || '?' }} × {{ (shipment as any).height || '?' }} cm
                  </template>
                  <template v-else>
                    {{ shipment.dimensions || 'N/A' }}
                  </template>
                </p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Valeur déclarée</label>
                <p class="mb-0">{{ formatCurrency(shipment.declared_value, requestCurrency) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Coût d'expédition</label>
                <p class="mb-0 text-success fw-bold">{{ formatCurrency(shipment.shipping_cost, requestCurrency) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Position actuelle</label>
                <p class="mb-0"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ shipment.current_location || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Historique des étapes</h5>
            <button class="btn btn-sm btn-primary" @click="openUpdateModal">
              <i class="bi bi-plus-lg me-1"></i>Ajouter une étape
            </button>
          </div>
          <div class="card-body">
            <div v-if="!shipment.timeline?.length" class="text-center text-muted py-3">
              <small>Aucune étape enregistrée.</small>
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
                      <button class="btn btn-link text-primary p-0 x-small-btn" @click="openEditEventModal(step)" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-link text-danger p-0 x-small-btn" @click="confirmDeleteEvent(step)" title="Supprimer">
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
                  <small class="text-muted d-block">Livraison estimée</small>
                  <div v-if="!editingDelivery">
                    <h5 class="mb-0">{{ shipment.estimated_delivery ? formatDateShort(shipment.estimated_delivery) : 'N/A' }}</h5>
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
                title="Modifier la date de livraison"
                @click="openDeliveryEdit"
              >
                <i class="bi bi-pencil"></i>
              </button>
            </div>
            <div v-if="shipment.actual_delivery" class="d-flex align-items-center text-success">
              <i class="bi bi-check-circle-fill me-2"></i>
              <small>Livré le {{ formatDateShort(shipment.actual_delivery) }}</small>
            </div>
          </div>
        </div>

        <!-- Client & Request -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">Références</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="text-muted small d-block">Client</label>
              <span class="fw-bold d-block">{{ shipmentClientFullName || 'Client inconnu' }}</span>
              <small v-if="shipmentClientEmail" class="text-muted d-block">{{ shipmentClientEmail }}</small>
              <a
                v-if="shipmentClientPhone"
                :href="`tel:${shipmentClientPhone}`"
                class="small text-decoration-none"
              >
                <i class="bi bi-telephone text-primary me-1"></i>{{ shipmentClientPhone }}
              </a>
              <span v-else class="small text-muted fst-italic">Aucun numéro fourni</span>
            </div>
            <div v-if="shipment.request_id">
              <label class="text-muted small d-block">Lien vers la demande</label>
              <NuxtLink :to="`/admin/requests/${shipment.request_id}`" class="fw-bold">
                Req #{{ String(shipment.request_id ?? '').slice(-8) }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showUpdateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">Mettre à jour l'expédition</h5>
            <button type="button" class="btn-close" @click="showUpdateModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nouveau statut</label>
              <select v-model="statusUpdate.status" class="form-select">
                <option value="order_placed">Commande passée</option>
                <option value="picked_up">Collecté</option>
                <option value="in_transit">En transit</option>
                <option value="in_customs">En douane</option>
                <option value="out_for_delivery">En cours de livraison</option>
                <option value="delivered">Livré</option>
                <option value="returned">Retourné</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Localisation actuelle</label>
              <input v-model="statusUpdate.location" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Commentaire</label>
              <WysiwygEditor v-model="statusUpdate.description" height="250px" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showUpdateModal = false">Annuler</button>
            <button class="btn btn-primary" :disabled="updating" @click="performUpdate">
              <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
              Mettre à jour
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
            <h5 class="modal-title">Modifier l'étape</h5>
            <button type="button" class="btn-close" @click="showEditEventModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Statut</label>
              <select v-model="eventToEdit.status" class="form-select">
                <option value="order_placed">Commande passée</option>
                <option value="picked_up">Collecté</option>
                <option value="in_transit">En transit</option>
                <option value="in_customs">En douane</option>
                <option value="out_for_delivery">En cours de livraison</option>
                <option value="delivered">Livré</option>
                <option value="returned">Retourné</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Localisation</label>
              <input v-model="eventToEdit.location" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input v-model="eventToEdit.sdate" type="datetime-local" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Commentaire</label>
              <WysiwygEditor v-model="eventToEdit.description" height="200px" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showEditEventModal = false">Annuler</button>
            <button class="btn btn-primary" :disabled="updatingEvent" @click="performEditEvent">
              <span v-if="updatingEvent" class="spinner-border spinner-border-sm me-1"></span>
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShippingStore } from '~/stores/shipping'
import type { ShipmentStatus } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
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
      success('Date de livraison mise à jour')
      editingDelivery.value = false
      await fetchShipment(false)
    } else {
      error('Erreur lors de la mise à jour')
    }
  } catch {
    error('Erreur lors de la mise à jour')
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
    } else {
      await shippingStore.fetchShipments()
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
      success('Étape mise à jour')
      showEditEventModal.value = false
      await fetchShipment()
    } else {
      error('Erreur lors de la mise à jour')
    }
  } catch (err: any) {
    error('Erreur lors de la mise à jour')
  } finally {
    updatingEvent.value = false
  }
}

const confirmDeleteEvent = async (event: any) => {
  if (!event.id) return
  if (confirm('Voulez-vous vraiment supprimer cette étape ?')) {
    try {
      const ok = await shippingStore.deleteTimelineEvent(event.id, String(shipment.value?.id))
      if (ok) {
        success('Étape supprimée')
        await fetchShipment()
      } else {
        error('Erreur lors de la suppression')
      }
    } catch (err) {
      error('Erreur lors de la suppression')
    }
  }
}

const shipment = computed(() =>
  shippingStore.shipments.find(s => s.tracking_number === id || String(s.id) === id)
)

const sortedTimeline = computed(() => {
  const list = shipment.value?.timeline || []
  return [...list].sort((a: any, b: any) => {
    const dateA = new Date(a.sdate || a.date).getTime()
    const dateB = new Date(b.sdate || b.date).getTime()
    return dateB - dateA
  })
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

const downloadShipmentPdf = async () => {
  const s = shipment.value as any
  if (!s) return
  downloadingPdf.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const url = `${config.public.apiBase}/shipments/${s.id}/pdf`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } })
    if (!res.ok) throw new Error('Erreur PDF')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `expedition-${s.tracking_number}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    error('Impossible de générer le PDF')
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
      success('Statut mis à jour avec succès')
      showUpdateModal.value = false
      await fetchShipment(false)
    } else {
      error('Erreur lors de la mise à jour')
    }
  } catch {
    error('Erreur lors de la mise à jour')
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

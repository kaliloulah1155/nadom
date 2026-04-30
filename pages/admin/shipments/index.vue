<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des expéditions</h4>
        <p class="text-muted mb-0">{{ shippingStore.shipmentsMeta.total }} expéditions au total</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle expédition
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="Numéro de suivi..."
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-4">
            <select v-model="filters.status" class="form-select" @change="fetchShipments(1)">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="picked_up">Collecté</option>
              <option value="in_transit">En transit</option>
              <option value="in_customs">En douane</option>
              <option value="out_for_delivery">En cours de livraison</option>
              <option value="delivered">Livré</option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="shippingStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Chargement des expéditions...</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Tracking #</th>
                <th>Client</th>
                <th>Demande</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Poids</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="shippingStore.shipments.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">
                  Aucune expédition trouvée
                </td>
              </tr>
              <tr v-for="shipment in shippingStore.shipments" :key="shipment.id">
                <td>
                  <NuxtLink :to="`/admin/shipments/${shipment.tracking_number}`" class="text-decoration-none">
                    <code>{{ shipment.tracking_number }}</code>
                  </NuxtLink>
                </td>
                <td>
                  <div class="small">
                    <div class="fw-medium">{{ getShipmentClientName(shipment) }}</div>
                    <span class="text-muted fst-italic" v-if="!getShipmentClientName(shipment)">—</span>
                  </div>
                </td>
                <td>
                  <NuxtLink
                    v-if="(shipment as any).request_id"
                    :to="`/admin/requests/${(shipment as any).request_id}`"
                    class="badge bg-primary-subtle text-primary text-decoration-none"
                  >
                    <i class="bi bi-bag-check me-1"></i>{{ String((shipment as any).request_id).slice(-6) }}
                  </NuxtLink>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <div>{{ shipment.destination_country }}</div>
                  <small class="text-muted">{{ shipment.destination_city }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ shipment.shipping_mode === 'air_express' ? 'Air Express' : shipment.shipping_mode === 'sea' ? 'Maritime' : 'Air Normal' }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
                  >
                    {{ formatShipmentStatus(shipment.status).label }}
                  </span>
                </td>
                <td>{{ shipment.weight }} kg</td>
                <td><small>{{ formatDateShort(shipment.created_at) }}</small></td>
                <td>
                  <div class="d-flex">
                    <NuxtLink :to="`/admin/shipments/${shipment.tracking_number}`" class="btn btn-outline-primary btn-sm me-2" title="Voir">
                      <i class="bi bi-eye"></i>
                    </NuxtLink>
                    <button class="btn btn-outline-info btn-sm" title="Modifier" @click="openModal(shipment)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="shippingStore.shipmentsMeta.currentPage"
          v-model:limit="shippingStore.shipmentsMeta.perPage"
          :total-items="shippingStore.shipmentsMeta.total"
          @update:current-page="(p: number) => fetchShipments(p)"
          @update:limit="(l: number) => fetchShipments(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="shipmentModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingShipment ? 'Modifier' : 'Nouvelle' }} expédition</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveShipment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Numéro de suivi *</label>
                  <input v-model="form.trackingNumber" type="text" class="form-control input-md" required :disabled="!!editingShipment" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Client</label>
                  <input
                    :value="form.clientName || (form.userId ? `ID: ${form.userId}` : '')"
                    type="text"
                    class="form-control input-md bg-light"
                    placeholder="Auto-rempli à la sélection de la demande"
                    readonly
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">Demande liée *</label>
                  <select v-model="form.requestId" class="form-select input-md" required @change="onRequestChange">
                    <option value="">Sélectionner une demande avec devis</option>
                    <option v-for="req in availableRequests" :key="req.id" :value="req.id">
                      #{{ String(req.id ?? '').slice(-6) }} — {{ truncate(req.title, 40) }} · Devis {{ formatCurrency(req.quotedPrice ?? 0, (req as any).currency || 'XOF') }}
                    </option>
                  </select>
                  <small v-if="availableRequests.length === 0" class="text-warning">
                    Aucune demande avec devis disponible. Créez d'abord un devis sur la fiche demande.
                  </small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Pays de destination *</label>
                  <select
                    v-model="form.destinationCountry"
                    class="form-select input-md"
                    required
                    @change="onCountryChange"
                  >
                    <option value="">Sélectionner un pays</option>
                    <option v-for="c in countriesList" :key="c.uuid" :value="c.label">
                      {{ c.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ville de destination *</label>
                  <select
                    v-if="availableCities.length > 0"
                    v-model="form.destinationCity"
                    class="form-select input-md"
                    required
                  >
                    <option value="">Sélectionner une ville</option>
                    <option v-for="city in availableCities" :key="city.uuid" :value="city.label">
                      {{ city.label }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="form.destinationCity"
                    type="text"
                    class="form-control input-md"
                    placeholder="Saisir la ville"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mode d'expédition *</label>
                  <select v-model="form.shippingMode" class="form-select input-md" required>
                    <option value="air_normal">Aérien Normal</option>
                    <option value="air_express">Aérien Express</option>
                    <option value="sea">Maritime</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Statut *</label>
                  <select v-model="form.status" class="form-select input-md" required>
                    <option value="pending">En attente</option>
                    <option value="picked_up">Collecté</option>
                    <option value="in_transit">En transit</option>
                    <option value="in_customs">En douane</option>
                    <option value="out_for_delivery">En cours de livraison</option>
                    <option value="delivered">Livré</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Poids (kg)</label>
                  <input v-model.number="form.weight" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Longueur (cm)</label>
                  <input v-model.number="form.length" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Largeur (cm)</label>
                  <input v-model.number="form.width" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Hauteur (cm)</label>
                  <input v-model.number="form.height" type="number" step="0.1" min="0" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>{{ editingShipment ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useShippingStore, type Shipment, type ShippingMode, type ShipmentStatus } from '~/stores/shipping'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useCountriesStore } from '~/stores/countries'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const shippingStore = useShippingStore()
const psStore = usePersonalShoppingStore()
const countriesStore = useCountriesStore()
const { formatDateShort, formatShipmentStatus, formatCurrency, truncate } = useFormatters()
const { success, error: notifyError } = useNotification()

const countriesList = computed(() => countriesStore.activeCountries)
const availableCities = computed(() => {
  const country = countriesStore.getByLabel(form.destinationCountry)
  return country?.cities?.filter((c: any) => c.status === undefined || c.status === 1) || []
})

const onCountryChange = () => {
  form.destinationCity = ''
}

const filters = reactive({
  search: '',
  status: ''
})

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingShipment = ref<any>(null)
const saving = ref(false)
const form = reactive<{
  trackingNumber: string
  userId: any
  clientName: string
  requestId: any
  destinationCountry: string
  destinationCity: string
  shippingMode: ShippingMode
  status: ShipmentStatus
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
}>({
  trackingNumber: '',
  userId: '',
  clientName: '',
  requestId: '',
  destinationCountry: '',
  destinationCity: '',
  shippingMode: 'air_normal',
  status: 'pending',
  weight: null,
  length: null,
  width: null,
  height: null
})

const fetchShipments = async (page?: number, limit?: number) => {
  await shippingStore.fetchShipments({
    page: page ?? shippingStore.shipmentsMeta.currentPage,
    limit: limit ?? shippingStore.shipmentsMeta.perPage,
    tracking_number: filters.search || undefined,
    status: filters.status || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchShipments(1), 400)
}

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  fetchShipments(1)
}

onMounted(async () => {
  await Promise.all([
    fetchShipments(1),
    psStore.fetchRequests(),
    countriesStore.fetchAll()
  ])
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const availableRequests = computed(() => {
  // Une demande est eligible si elle a un devis (quoted_price > 0) ET pas encore expediee
  // (sauf si on edite et que c'est la demande deja liee)
  return psStore.requests.filter((r: any) => {
    const editingId = editingShipment.value?.request_id ?? editingShipment.value?.requestId
    if (editingId && r.id === editingId) return true
    const hasQuote = Number(r.quotedPrice ?? r.quoted_price ?? 0) > 0
    const notShipped = !['shipped', 'delivered', 'cancelled'].includes(r.status)
    return hasQuote && notShipped
  })
})

const onRequestChange = () => {
  const req = psStore.requests.find((r: any) => r.id === form.requestId)
  if (req) {
    form.userId = (req as any).user_id ?? (req as any).userId
    const u = (req as any).user
    const fullname = u
      ? [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
      : ''
    form.clientName = fullname || (req as any).contactFullname || (req as any).contact_fullname || (form.userId ? `Client #${form.userId}` : '')
  }
}

const getShipmentClientName = (shipment: any): string => {
  const reqUser = shipment.request?.user
  if (reqUser) {
    return [reqUser.firstname, reqUser.lastname].filter(Boolean).join(' ').trim() || `Client #${reqUser.id}`
  }
  return shipment.request?.contact_fullname || shipment.request?.contactFullname || ''
}

const openModal = (shipment?: any) => {
  if (shipment) {
    editingShipment.value = shipment
    const s = shipment as any
    form.trackingNumber = s.tracking_number ?? s.trackingNumber
    form.userId = s.user_id ?? s.userId
    form.clientName = getShipmentClientName(s)
    form.destinationCountry = s.destination_country ?? s.destinationCountry ?? ''
    form.destinationCity = s.destination_city ?? s.destinationCity ?? ''
    form.shippingMode = s.shipping_mode ?? s.shippingMode
    form.status = s.status
    form.weight = s.weight != null ? Number(s.weight) : null
    form.length = s.length != null ? Number(s.length) : null
    form.width = s.width != null ? Number(s.width) : null
    form.height = s.height != null ? Number(s.height) : null
    form.requestId = s.request_id ?? s.requestId ?? ''
  } else {
    editingShipment.value = null
    form.trackingNumber = `TRK-${Date.now().toString().slice(-6)}`
    form.userId = ''
    form.clientName = ''
    form.requestId = ''
    form.destinationCountry = ''
    form.destinationCity = ''
    form.shippingMode = 'air_normal'
    form.status = 'pending'
    form.weight = null
    form.length = null
    form.width = null
    form.height = null
  }
  modalInstance?.show()
}

const saveShipment = async () => {
  if (saving.value) return
  saving.value = true
  const payload: Record<string, any> = {
    request_id: form.requestId || null,
    destination_country: form.destinationCountry,
    destination_city: form.destinationCity,
    shipping_mode: form.shippingMode,
    status: form.status,
    weight: form.weight,
    length: form.length,
    width: form.width,
    height: form.height
  }

  try {
    if (editingShipment.value) {
      const prevStatus = editingShipment.value.status
      const updated = await shippingStore.updateShipment(String(editingShipment.value.id), payload as Partial<Shipment>)
      if (!updated) throw new Error('La mise à jour a échoué')
      success('Expédition mise à jour')
      if (form.status === 'delivered' && prevStatus !== 'delivered' && form.requestId) {
        await psStore.updateRequestStatus(String(form.requestId), 'delivered' as RequestStatus)
        success('Demande liée marquée comme livrée')
      }
    } else {
      payload.tracking_number = form.trackingNumber
      payload.user_id = form.userId
      const cost = shippingStore.calculateShippingCost(form.destinationCountry, form.weight ?? 0, form.shippingMode)
      payload.shipping_cost = cost
      await shippingStore.createShipment(payload as Partial<Shipment>)
      success('Expédition créée avec succès')
    }
    modalInstance?.hide()
    await fetchShipments(shippingStore.shipmentsMeta.currentPage)
  } catch (err: any) {
    notifyError(err?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}
</script>

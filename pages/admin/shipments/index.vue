<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des expéditions</h4>
        <p class="text-muted mb-0">{{ shippingStore.shipments.length }} expéditions au total</p>
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
              placeholder="Numéro de suivi, client..."
            />
          </div>
          <div class="col-md-4">
            <select v-model="filters.status" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="order_placed">Commande passée</option>
              <option value="picked_up">Collecté</option>
              <option value="in_transit">En transit</option>
              <option value="in_customs">En douane</option>
              <option value="out_for_delivery">En cours de livraison</option>
              <option value="delivered">Livré</option>
              <option value="returned">Retourné</option>
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
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Tracking #</th>
                <th>Client</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Poids</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredShipments.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Aucune expédition trouvée
                </td>
              </tr>
              <tr v-for="shipment in paginatedShipments" :key="shipment.id">
                <td>
                  <NuxtLink :to="`/admin/shipments/${shipment.trackingNumber}`" class="text-decoration-none">
                    <code>{{ shipment.trackingNumber }}</code>
                  </NuxtLink>
                </td>
                <td><small>{{ shipment.userId.slice(-4) }}</small></td>
                <td>
                  <div>{{ shipment.destinationCountry }}</div>
                  <small class="text-muted">{{ shipment.destinationCity }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ shipment.shippingMode === 'air_express' ? 'Air Express' : shipment.shippingMode === 'sea' ? 'Maritime' : 'Air Normal' }}
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
                <td><small>{{ formatDateShort(shipment.createdAt) }}</small></td>
                <td>
                  <div class="d-flex">
                    <NuxtLink :to="`/admin/shipments/${shipment.trackingNumber}`" class="btn btn-outline-primary btn-sm me-2" title="Voir">
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
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="filteredShipments.length"
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
                  <label class="form-label">Client (ID) *</label>
                  <input v-model="form.userId" type="text" class="form-control input-md" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Pays de destination *</label>
                  <input v-model="form.destinationCountry" type="text" class="form-control input-md" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ville de destination *</label>
                  <input v-model="form.destinationCity" type="text" class="form-control input-md" required />
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
                    <option value="order_placed">Commande passée</option>
                    <option value="picked_up">Collecté</option>
                    <option value="in_transit">En transit</option>
                    <option value="in_customs">En douane</option>
                    <option value="out_for_delivery">En cours de livraison</option>
                    <option value="delivered">Livré</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Poids (kg)</label>
                  <input v-model.number="form.weight" type="number" step="0.1" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md">
                <i class="bi bi-check-lg me-2"></i>{{ editingShipment ? 'Enregistrer' : 'Créer' }}
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
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin'
})

const shippingStore = useShippingStore()
const { formatDateShort, formatShipmentStatus } = useFormatters()

const currentPage = ref(1)
const perPage = ref(10)

const filters = reactive({
  search: '',
  status: ''
})


const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingShipment = ref<any>(null)
const form = reactive({
  trackingNumber: '',
  userId: '',
  destinationCountry: '',
  destinationCity: '',
  shippingMode: 'air_normal',
  status: 'order_placed',
  weight: 0
})

onMounted(async () => {
  await shippingStore.fetchShipments()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (shipment?: any) => {
  if (shipment) {
    editingShipment.value = shipment
    const s = shipment as any
    form.trackingNumber = s.trackingNumber
    form.userId = s.userId
    form.destinationCountry = s.destinationCountry
    form.destinationCity = s.destinationCity
    form.shippingMode = s.shippingMode
    form.status = s.status
    form.weight = s.weight
  } else {
    editingShipment.value = null
    form.trackingNumber = `TRK-${Date.now().toString().slice(-6)}`
    form.userId = 'user_demo'
    form.destinationCountry = ''
    form.destinationCity = ''
    form.shippingMode = 'air_normal'
    form.status = 'order_placed'
    form.weight = 0
  }
  modalInstance?.show()
}

const saveShipment = () => {
  if (editingShipment.value) {
    const idx = shippingStore.shipments.findIndex(s => s.id === editingShipment.value.id)
    if (idx !== -1) {
      shippingStore.shipments[idx] = { ...shippingStore.shipments[idx], ...form } as any
    }
  } else {
    shippingStore.shipments.push({
      id: `shp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...form
    } as any)
  }
  modalInstance?.hide()
}

const filteredShipments = computed(() => {
  let shipments = [...shippingStore.shipments]

  if (filters.search) {
    const search = filters.search.toLowerCase()
    shipments = shipments.filter(s => 
      s.trackingNumber.toLowerCase().includes(search) ||
      s.userId.toLowerCase().includes(search) ||
      s.destinationCountry.toLowerCase().includes(search)
    )
  }

  if (filters.status) {
    shipments = shipments.filter(s => s.status === filters.status)
  }

  return shipments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const paginatedShipments = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredShipments.value.slice(start, start + perPage.value)
})

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  currentPage.value = 1
}
</script>

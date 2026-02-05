<template>
  <div v-if="shipment">
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
        <h4 class="mb-0 me-3">Expédition #{{ shipment.trackingNumber }}</h4>
        <span 
          class="badge" 
          :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
        >
          {{ formatShipmentStatus(shipment.status).label }}
        </span>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-primary me-2" @click="showUpdateModal = true">
          <i class="bi bi-pencil me-2"></i>Mettre à jour
        </button>
        <button class="btn btn-primary">
          <i class="bi bi-printer me-2"></i>Étiquette
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
                <p class="h6 mb-0">{{ shipment.destinationCity }}, {{ shipment.destinationCountry }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Mode d'expédition</label>
                <span class="badge bg-light text-dark">
                  {{ shipment.shippingMode === 'air_express' ? 'Air Express' : shipment.shippingMode === 'sea' ? 'Maritime' : 'Air Normal' }}
                </span>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Poids & Dimensions</label>
                <p class="mb-0">{{ shipment.weight }} kg | {{ shipment.dimensions || 'N/A' }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Valeur déclarée</label>
                <p class="mb-0">{{ formatCurrency(shipment.declaredValue) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Coût d'expédition</label>
                <p class="mb-0 text-success fw-bold">{{ formatCurrency(shipment.shippingCost) }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small text-uppercase fw-bold d-block mb-1">Position actuelle</label>
                <p class="mb-0"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ shipment.currentLocation || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">Historique des étapes</h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div v-for="(step, idx) in shipment.timeline" :key="idx" class="timeline-item pb-4 position-relative ps-4 border-start">
                <div class="timeline-marker position-absolute rounded-circle bg-primary" style="left: -7px; top: 0; width: 13px; height: 13px;"></div>
                <div class="d-flex justify-content-between mb-1">
                  <h6 class="mb-0">{{ formatShipmentStatus(step.status).label }}</h6>
                  <small class="text-muted">{{ formatDate(step.date) }}</small>
                </div>
                <div class="small fw-medium text-primary mb-1">{{ step.location }}</div>
                <p class="small text-muted mb-0">{{ step.description }}</p>
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
            <div class="d-flex align-items-center mb-3">
              <div class="bg-primary-subtle p-3 rounded-circle me-3">
                <i class="bi bi-calendar-event text-primary fs-4"></i>
              </div>
              <div>
                <small class="text-muted d-block">Livraison estimée</small>
                <h5 class="mb-0">{{ formatDateShort(shipment.estimatedDelivery) }}</h5>
              </div>
            </div>
            <div v-if="shipment.actualDelivery" class="d-flex align-items-center text-success">
              <i class="bi bi-check-circle-fill me-2"></i>
              <small>Livré le {{ formatDateShort(shipment.actualDelivery) }}</small>
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
              <NuxtLink :to="`/admin/users/${shipment.userId}`" class="fw-bold">
                ID: {{ shipment.userId.slice(-8) }}
              </NuxtLink>
            </div>
            <div v-if="shipment.requestId">
              <label class="text-muted small d-block">Lien vers la demande</label>
              <NuxtLink :to="`/admin/requests/${shipment.requestId}`" class="fw-bold">
                Req #{{ shipment.requestId.slice(-8) }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal (Simplified) -->
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
              <textarea v-model="statusUpdate.description" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showUpdateModal = false">Annuler</button>
            <button class="btn btn-primary" @click="performUpdate">Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const shippingStore = useShippingStore()
const { formatCurrency, formatDate, formatDateShort, formatShipmentStatus } = useFormatters()
const { success, error } = useNotification()

const id = route.params.id as string
const showUpdateModal = ref(false)

const shipment = computed(() => shippingStore.shipments.find(s => s.trackingNumber === id || s.id === id))

const statusUpdate = reactive({
  status: 'in_transit',
  location: '',
  description: ''
})

onMounted(async () => {
  if (shippingStore.shipments.length === 0) {
    await shippingStore.fetchShipments()
  }
})

const performUpdate = async () => {
  try {
    // In a real app: await shippingStore.updateShipmentStatus(...)
    success('Statut mis à jour (Simulation)')
    showUpdateModal.value = false
  } catch (err) {
    error('Erreur lors de la mise à jour')
  }
}
</script>

<style scoped>
.timeline-item:last-child {
  border-left: none !important;
}
</style>

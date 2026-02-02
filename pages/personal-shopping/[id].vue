<template>
  <div class="py-5">
    <div class="container">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else-if="!request" class="text-center py-5">
        <i class="bi bi-exclamation-circle display-1 text-muted"></i>
        <h3 class="mt-3">Demande non trouvee</h3>
        <p class="text-muted">Cette demande n'existe pas ou a ete supprimee.</p>
        <NuxtLink to="/personal-shopping" class="btn btn-primary">
          Retour aux demandes
        </NuxtLink>
      </div>

      <!-- Request Detail -->
      <div v-else>
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Accueil</NuxtLink></li>
            <li class="breadcrumb-item"><NuxtLink to="/personal-shopping">Personal Shopping</NuxtLink></li>
            <li class="breadcrumb-item active">{{ request.title }}</li>
          </ol>
        </nav>

        <div class="row g-4">
          <!-- Main Content -->
          <div class="col-lg-8">
            <!-- Images -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <div v-if="request.images && request.images.length > 0">
                  <img
                    :src="selectedImage || request.images[0]"
                    class="img-fluid rounded mb-3 w-100"
                    style="max-height: 400px; object-fit: contain;"
                    alt="Product"
                  />
                  <div v-if="request.images.length > 1" class="d-flex gap-2 flex-wrap">
                    <img
                      v-for="(img, index) in request.images"
                      :key="index"
                      :src="img"
                      class="rounded cursor-pointer"
                      :class="{ 'border border-primary border-2': selectedImage === img }"
                      style="width: 80px; height: 80px; object-fit: cover;"
                      @click="selectedImage = img"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-5 bg-light rounded">
                  <i class="bi bi-image display-1 text-muted"></i>
                  <p class="text-muted mt-2">Aucune image</p>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-transparent">
                <h5 class="mb-0">Details de la demande</h5>
              </div>
              <div class="card-body">
                <h4 class="fw-bold mb-3">{{ request.title }}</h4>

                <div class="mb-4">
                  <span class="badge bg-secondary me-2">{{ request.category }}</span>
                  <span
                    class="badge"
                    :style="{
                      backgroundColor: formatRequestStatus(request.status).bgColor,
                      color: formatRequestStatus(request.status).color
                    }"
                  >
                    {{ formatRequestStatus(request.status).label }}
                  </span>
                </div>

                <h6 class="fw-medium">Description</h6>
                <p class="text-muted">{{ request.description }}</p>

                <div class="row g-3 mt-3">
                  <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Quantite</small>
                      <strong>{{ request.quantity }}</strong>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Budget estime</small>
                      <strong>{{ formatCurrency(request.budgetEstimated) }}</strong>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Creee le</small>
                      <strong>{{ formatDateShort(request.createdAt) }}</strong>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded">
                      <small class="text-muted d-block">Messages</small>
                      <strong>{{ request.whatsappMessages }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quotation -->
            <div v-if="request.quotedPrice" class="card border-0 shadow-sm mb-4 border-success">
              <div class="card-header bg-success-subtle">
                <h5 class="mb-0 text-success"><i class="bi bi-receipt me-2"></i>Devis</h5>
              </div>
              <div class="card-body">
                <table class="table table-borderless mb-0">
                  <tbody>
                    <tr v-if="request.quotedDetails">
                      <td>Cout produit</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.productCost) }}</td>
                    </tr>
                    <tr v-if="request.quotedDetails">
                      <td>Frais de service (5%)</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.serviceFee) }}</td>
                    </tr>
                    <tr v-if="request.quotedDetails">
                      <td>Inspection</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.inspectionFee) }}</td>
                    </tr>
                    <tr v-if="request.quotedDetails">
                      <td>Emballage</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.packagingFee) }}</td>
                    </tr>
                    <tr v-if="request.quotedDetails">
                      <td>Expedition</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost) }}</td>
                    </tr>
                    <tr class="border-top fw-bold fs-5">
                      <td>TOTAL</td>
                      <td class="text-end text-success">{{ formatCurrency(request.quotedPrice) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="request.status === 'negotiating'" class="d-grid gap-2 mt-4">
                  <button class="btn btn-success btn-lg" @click="acceptQuotation">
                    <i class="bi bi-check-circle me-2"></i>Accepter le devis
                  </button>
                  <button class="btn btn-outline-secondary" @click="openWhatsApp">
                    <i class="bi bi-whatsapp me-2"></i>Negocier
                  </button>
                </div>
              </div>
            </div>

            <!-- Tracking -->
            <div v-if="request.trackingNumber" class="card border-0 shadow-sm">
              <div class="card-header bg-transparent">
                <h5 class="mb-0"><i class="bi bi-truck me-2"></i>Suivi expedition</h5>
              </div>
              <div class="card-body">
                <p class="mb-2">
                  <strong>Numero de suivi :</strong>
                  <code>{{ request.trackingNumber }}</code>
                </p>
                <NuxtLink :to="`/import-export/tracking?tracking=${request.trackingNumber}`" class="btn btn-outline-primary">
                  Suivre mon colis
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Status Card -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h6 class="fw-medium mb-3">Statut de la demande</h6>
                <div class="timeline-status">
                  <div
                    v-for="(status, index) in statusTimeline"
                    :key="status.key"
                    class="timeline-item"
                    :class="{ 'active': isStatusReached(status.key), 'current': request.status === status.key }"
                  >
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <strong>{{ status.label }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h6 class="fw-medium mb-3">Actions</h6>
                <div class="d-grid gap-2">
                  <a
                    href="#"
                    class="btn btn-success"
                    @click.prevent="openWhatsApp"
                  >
                    <i class="bi bi-whatsapp me-2"></i>Contacter via WhatsApp
                  </a>
                  <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary">
                    <i class="bi bi-plus-circle me-2"></i>Nouvelle demande
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Help -->
            <div class="card border-0 bg-light">
              <div class="card-body">
                <h6 class="fw-medium mb-2"><i class="bi bi-question-circle me-2"></i>Besoin d'aide ?</h6>
                <p class="text-muted small mb-2">
                  Notre equipe est disponible pour repondre a vos questions.
                </p>
                <NuxtLink to="/resources/faq" class="btn btn-link btn-sm p-0">
                  Consulter la FAQ
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useFormatters } from '~/composables/useFormatters'
import { useWhatsApp } from '~/composables/useWhatsApp'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const psStore = usePersonalShoppingStore()
const { formatCurrency, formatDateShort, formatRequestStatus } = useFormatters()
const { contactForRequest } = useWhatsApp()
const { success } = useNotification()

const loading = ref(true)
const selectedImage = ref<string | null>(null)

const requestId = route.params.id as string

// Load request
onMounted(async () => {
  await psStore.fetchRequests()
  loading.value = false
})

const request = computed(() => psStore.getRequestById(requestId))

const statusTimeline = [
  { key: 'pending', label: 'En attente' },
  { key: 'searching', label: 'Recherche en cours' },
  { key: 'negotiating', label: 'Negociation' },
  { key: 'confirmed', label: 'Confirme' },
  { key: 'preparing', label: 'Preparation' },
  { key: 'shipped', label: 'Expedie' },
  { key: 'delivered', label: 'Livre' }
]

const statusOrder = ['pending', 'searching', 'negotiating', 'confirmed', 'preparing', 'shipped', 'delivered']

const isStatusReached = (status: string) => {
  if (!request.value) return false
  const currentIndex = statusOrder.indexOf(request.value.status)
  const statusIndex = statusOrder.indexOf(status)
  return statusIndex <= currentIndex
}

const openWhatsApp = () => {
  if (request.value) {
    contactForRequest(request.value.title, request.value.id)
  }
}

const acceptQuotation = async () => {
  if (request.value) {
    await psStore.updateRequestStatus(request.value.id, 'confirmed')
    success('Devis accepte ! Nous vous contacterons pour la suite.')
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.timeline-status {
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
  padding-left: 20px;
  border-left: 2px solid #e5e7eb;
}

.timeline-item:last-child {
  padding-bottom: 0;
  border-left: 2px solid transparent;
}

.timeline-item.active {
  border-left-color: var(--bs-success);
}

.timeline-item.current {
  border-left-color: var(--bs-primary);
}

.timeline-dot {
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid #fff;
}

.timeline-item.active .timeline-dot {
  background: var(--bs-success);
}

.timeline-item.current .timeline-dot {
  background: var(--bs-primary);
  box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.2);
}

.timeline-content {
  font-size: 0.875rem;
}

.timeline-item.active .timeline-content {
  color: var(--bs-success);
}

.timeline-item.current .timeline-content {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>

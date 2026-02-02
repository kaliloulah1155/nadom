<template>
  <div class="dashboard-page py-5">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 class="mb-1">Bonjour, {{ userFullName }} !</h2>
              <p class="text-muted mb-0">Bienvenue sur votre tableau de bord</p>
            </div>
            <NuxtLink to="/personal-shopping/new" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>Nouvelle demande
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stats-icon bg-primary-subtle text-primary me-3">
                  <i class="bi bi-bag-check"></i>
                </div>
                <div>
                  <h3 class="mb-0">{{ userRequests.length }}</h3>
                  <small class="text-muted">Demandes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stats-icon bg-warning-subtle text-warning me-3">
                  <i class="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <h3 class="mb-0">{{ pendingRequests.length }}</h3>
                  <small class="text-muted">En cours</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stats-icon bg-info-subtle text-info me-3">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div>
                  <h3 class="mb-0">{{ userShipments.length }}</h3>
                  <small class="text-muted">Colis</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stats-icon bg-success-subtle text-success me-3">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div>
                  <h3 class="mb-0">{{ deliveredShipments.length }}</h3>
                  <small class="text-muted">Livres</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Recent Requests -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Mes demandes recentes</h5>
              <NuxtLink to="/personal-shopping/my-requests" class="btn btn-sm btn-link">
                Voir tout <i class="bi bi-arrow-right"></i>
              </NuxtLink>
            </div>
            <div class="card-body p-0">
              <div v-if="userRequests.length === 0" class="text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>
                <p class="text-muted mt-3">Aucune demande pour le moment</p>
                <NuxtLink to="/personal-shopping/new" class="btn btn-primary">
                  Creer ma premiere demande
                </NuxtLink>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Produit</th>
                      <th>Categorie</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="request in userRequests.slice(0, 5)" :key="request.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img
                            :src="request.images[0] || 'https://via.placeholder.com/40'"
                            class="rounded me-2"
                            width="40"
                            height="40"
                            style="object-fit: cover;"
                          />
                          <span class="fw-medium">{{ truncate(request.title, 30) }}</span>
                        </div>
                      </td>
                      <td><small class="text-muted">{{ request.category }}</small></td>
                      <td>
                        <span
                          class="badge"
                          :style="{
                            backgroundColor: formatRequestStatus(request.status).bgColor,
                            color: formatRequestStatus(request.status).color
                          }"
                        >
                          {{ formatRequestStatus(request.status).label }}
                        </span>
                      </td>
                      <td><small class="text-muted">{{ formatDateShort(request.createdAt) }}</small></td>
                      <td>
                        <NuxtLink :to="`/personal-shopping/${request.id}`" class="btn btn-sm btn-link">
                          <i class="bi bi-eye"></i>
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Active Shipments -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">Colis en transit</h5>
            </div>
            <div class="card-body">
              <div v-if="inTransitShipments.length === 0" class="text-center py-3">
                <i class="bi bi-truck text-muted fs-2"></i>
                <p class="text-muted small mt-2 mb-0">Aucun colis en transit</p>
              </div>
              <div v-else>
                <div
                  v-for="shipment in inTransitShipments.slice(0, 3)"
                  :key="shipment.id"
                  class="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
                >
                  <div>
                    <div class="fw-medium">{{ shipment.trackingNumber }}</div>
                    <small class="text-muted">{{ shipment.destinationCountry }}</small>
                  </div>
                  <span class="badge bg-info-subtle text-info">
                    <i :class="formatShipmentStatus(shipment.status).icon" class="me-1"></i>
                    {{ formatShipmentStatus(shipment.status).label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">Actions rapides</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary">
                  <i class="bi bi-plus-circle me-2"></i>Nouvelle demande
                </NuxtLink>
                <NuxtLink to="/import-export/tracking" class="btn btn-outline-secondary">
                  <i class="bi bi-search me-2"></i>Suivre un colis
                </NuxtLink>
                <NuxtLink to="/import-export/calculator" class="btn btn-outline-secondary">
                  <i class="bi bi-calculator me-2"></i>Calculer tarifs
                </NuxtLink>
                <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-success">
                  <i class="bi bi-whatsapp me-2"></i>Contacter support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const authStore = useAuthStore()
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatRequestStatus, formatShipmentStatus, formatDateShort, truncate } = useFormatters()

// Auth check
onMounted(async () => {
  authStore.initializeAuth()

  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await Promise.all([
    psStore.fetchRequests(),
    shippingStore.fetchShipments()
  ])
})

// Computed
const userFullName = computed(() => authStore.userFullName)
const userId = computed(() => authStore.userId)

const userRequests = computed(() => psStore.getRequestsByUser(userId.value))
const pendingRequests = computed(() =>
  userRequests.value.filter(r => ['pending', 'searching', 'negotiating'].includes(r.status))
)

const userShipments = computed(() => shippingStore.getShipmentsByUser(userId.value))
const inTransitShipments = computed(() =>
  userShipments.value.filter(s => ['in_transit', 'in_customs', 'out_for_delivery'].includes(s.status))
)
const deliveredShipments = computed(() =>
  userShipments.value.filter(s => s.status === 'delivered')
)
</script>

<style scoped>
.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>

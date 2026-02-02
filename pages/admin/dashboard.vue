<template>
  <div>
    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-primary text-white me-3">
                <i class="bi bi-bag-check"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ stats.totalRequests }}</h3>
                <small class="text-muted">Demandes totales</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-warning text-white me-3">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ stats.pendingRequests }}</h3>
                <small class="text-muted">En attente</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-info text-white me-3">
                <i class="bi bi-box-seam"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ stats.inTransitShipments }}</h3>
                <small class="text-muted">Colis en transit</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-success text-white me-3">
                <i class="bi bi-currency-exchange"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ formatCurrency(stats.totalRevenue) }}</h3>
                <small class="text-muted">Revenus</small>
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
            <h5 class="mb-0">Demandes recentes</h5>
            <NuxtLink to="/admin/requests" class="btn btn-sm btn-primary">
              Voir tout
            </NuxtLink>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Produit</th>
                    <th>Statut</th>
                    <th>Budget</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in recentRequests" :key="request.id">
                    <td><code>{{ request.id.slice(-6) }}</code></td>
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          :src="request.images[0] || 'https://via.placeholder.com/40'"
                          class="rounded me-2"
                          width="40"
                          height="40"
                          style="object-fit: cover;"
                        />
                        <div>
                          <div class="fw-medium">{{ truncate(request.title, 25) }}</div>
                          <small class="text-muted">{{ request.category }}</small>
                        </div>
                      </div>
                    </td>
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
                    <td>{{ formatCurrency(request.budgetEstimated) }}</td>
                    <td><small>{{ formatDateShort(request.createdAt) }}</small></td>
                    <td>
                      <NuxtLink :to="`/admin/requests/${request.id}`" class="btn btn-sm btn-outline-primary">
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
        <!-- Shipments -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent">
            <h5 class="mb-0">Colis en transit</h5>
          </div>
          <div class="card-body">
            <div v-if="inTransitShipments.length === 0" class="text-center py-3">
              <p class="text-muted mb-0">Aucun colis en transit</p>
            </div>
            <div v-else>
              <div
                v-for="shipment in inTransitShipments.slice(0, 5)"
                :key="shipment.id"
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <div>
                  <code class="small">{{ shipment.trackingNumber }}</code>
                  <div class="small text-muted">{{ shipment.destinationCountry }}</div>
                </div>
                <span
                  class="badge"
                  :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
                >
                  {{ formatShipmentStatus(shipment.status).label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent">
            <h5 class="mb-0">Repartition demandes</h5>
          </div>
          <div class="card-body">
            <div v-for="(count, status) in requestStats" :key="status" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small>{{ formatRequestStatus(status as string).label }}</small>
                <small class="fw-medium">{{ count }}</small>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  class="progress-bar"
                  :style="{
                    width: `${(count / stats.totalRequests) * 100}%`,
                    backgroundColor: formatRequestStatus(status as string).color
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="mb-3">Actions rapides</h5>
            <div class="d-flex flex-wrap gap-2">
              <NuxtLink to="/admin/requests" class="btn btn-outline-primary">
                <i class="bi bi-bag me-2"></i>Gerer demandes
              </NuxtLink>
              <NuxtLink to="/admin/shipments" class="btn btn-outline-info">
                <i class="bi bi-box-seam me-2"></i>Gerer expeditions
              </NuxtLink>
              <NuxtLink to="/admin/users" class="btn btn-outline-secondary">
                <i class="bi bi-people me-2"></i>Utilisateurs
              </NuxtLink>
              <NuxtLink to="/admin/pricing" class="btn btn-outline-success">
                <i class="bi bi-currency-exchange me-2"></i>Tarifs
              </NuxtLink>
              <NuxtLink to="/admin/blog" class="btn btn-outline-dark">
                <i class="bi bi-journal-text me-2"></i>Blog
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatCurrency, formatDateShort, formatRequestStatus, formatShipmentStatus, truncate } = useFormatters()

// Load data
onMounted(async () => {
  await Promise.all([
    psStore.fetchRequests(),
    shippingStore.fetchShipments()
  ])
})

// Computed
const stats = computed(() => ({
  totalRequests: psStore.totalRequests,
  pendingRequests: psStore.getPendingRequests.length,
  inTransitShipments: shippingStore.getInTransitShipments.length,
  totalRevenue: psStore.totalRevenue
}))

const recentRequests = computed(() =>
  [...psStore.requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
)

const inTransitShipments = computed(() => shippingStore.getInTransitShipments)

const requestStats = computed(() => psStore.getRequestsStats())
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

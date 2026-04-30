<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 fw-bold">Tableau de bord</h4>
        <p class="text-muted mb-0 small">Résumé de l'activité NADOM.</p>
      </div>
      <span class="text-muted small d-none d-md-block">
        <i class="bi bi-calendar3 me-1"></i>{{ currentDate }}
      </span>
    </div>

    <!-- KPI Cards -->
    <div class="row g-4 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="kpi-icon bg-primary-subtle text-primary">
                <i class="bi bi-bag-check fs-5"></i>
              </div>
              <span class="badge bg-primary-subtle text-primary fw-normal">Total</span>
            </div>
            <h2 class="mb-0 fw-bold">{{ stats.totalRequests }}</h2>
            <p class="text-muted mb-0 small mt-1">Demandes enregistrées</p>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="kpi-icon bg-warning-subtle text-warning">
                <i class="bi bi-hourglass-split fs-5"></i>
              </div>
              <span class="badge bg-warning-subtle text-warning fw-normal">En attente</span>
            </div>
            <h2 class="mb-0 fw-bold">{{ stats.pendingRequests }}</h2>
            <p class="text-muted mb-0 small mt-1">Demandes en attente</p>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="kpi-icon bg-info-subtle text-info">
                <i class="bi bi-box-seam fs-5"></i>
              </div>
              <span class="badge bg-info-subtle text-info fw-normal">Transit</span>
            </div>
            <h2 class="mb-0 fw-bold">{{ stats.inTransitShipments }}</h2>
            <p class="text-muted mb-0 small mt-1">Colis en transit</p>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="kpi-icon bg-success-subtle text-success">
                <i class="bi bi-cash-coin fs-5"></i>
              </div>
              <span class="badge bg-success-subtle text-success fw-normal">Revenus</span>
            </div>
            <div v-if="revenueEntries.length === 0">
              <h3 class="mb-0 fw-bold text-muted">—</h3>
            </div>
            <div v-else>
              <div v-for="[cur, amt] in revenueEntries" :key="cur" class="mb-1">
                <h4 class="mb-0 fw-bold text-success lh-1">{{ formatCurrency(amt, cur) }}</h4>
              </div>
            </div>
            <p class="text-muted mb-0 small mt-1">Devis facturés</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row g-4">
      <!-- Recent Requests -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
            <h6 class="mb-0 fw-bold">Demandes récentes</h6>
            <NuxtLink to="/admin/requests" class="btn btn-sm btn-primary">Voir tout</NuxtLink>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0 align-middle">
                <thead class="table-light">
                  <tr>
                    <th class="ps-3">Produit</th>
                    <th>Statut</th>
                    <th>Budget / Devis</th>
                    <th>Date</th>
                    <th class="pe-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in recentRequests" :key="request.id">
                    <td class="ps-3">
                      <div class="d-flex align-items-center gap-2">
                        <img
                          :src="request.images?.[0] || 'https://via.placeholder.com/38'"
                          class="rounded flex-shrink-0"
                          width="38" height="38"
                          style="object-fit: cover;"
                        />
                        <div>
                          <div class="fw-medium small">{{ truncate(request.title, 26) }}</div>
                          <code class="text-muted" style="font-size: 0.7rem;">#{{ String(request.id ?? '').slice(-6) }}</code>
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
                      >{{ formatRequestStatus(request.status).label }}</span>
                    </td>
                    <td>
                      <div class="small text-muted">
                        {{ formatCurrency(request.budgetEstimated, (request as any).currency || 'XOF') }}
                      </div>
                      <div v-if="request.quotedPrice" class="small fw-semibold text-success">
                        Devis : {{ formatCurrency(request.quotedPrice, (request as any).currency || 'XOF') }}
                      </div>
                    </td>
                    <td>
                      <small class="text-muted">{{ formatDateShort(request.createdAt) }}</small>
                    </td>
                    <td class="pe-3">
                      <NuxtLink :to="`/admin/requests/${request.id}`" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye"></i>
                      </NuxtLink>
                    </td>
                  </tr>
                  <tr v-if="recentRequests.length === 0">
                    <td colspan="5" class="text-center text-muted py-5">
                      <i class="bi bi-inbox fs-3 d-block mb-2 opacity-25"></i>
                      Aucune demande
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
        <!-- Status Distribution -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h6 class="mb-0 fw-bold">Répartition des statuts</h6>
          </div>
          <div class="card-body">
            <div v-if="stats.totalRequests === 0" class="text-center text-muted py-2 small">Aucune donnée</div>
            <div v-for="(count, status) in requestStats" :key="status" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small class="text-muted">{{ formatRequestStatus(status as string).label }}</small>
                <small class="fw-semibold">{{ count }}</small>
              </div>
              <div class="progress rounded-pill" style="height: 5px;">
                <div
                  class="progress-bar rounded-pill"
                  :style="{
                    width: stats.totalRequests ? `${(count / stats.totalRequests) * 100}%` : '0%',
                    backgroundColor: formatRequestStatus(status as string).color || formatRequestStatus(status as string).bgColor
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- In-Transit Shipments -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
            <h6 class="mb-0 fw-bold">Colis en transit</h6>
            <NuxtLink to="/admin/shipments" class="btn btn-sm btn-outline-info">Tout voir</NuxtLink>
          </div>
          <div v-if="inTransitShipments.length === 0" class="card-body text-center text-muted py-4">
            <i class="bi bi-box-seam fs-3 d-block mb-2 opacity-25"></i>
            <small>Aucun colis en transit</small>
          </div>
          <div v-else>
            <NuxtLink
              v-for="shipment in inTransitShipments.slice(0, 5)"
              :key="shipment.id"
              :to="`/admin/shipments/${shipment.trackingNumber}`"
              class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom text-decoration-none text-body shipment-row"
            >
              <div>
                <code class="small d-block">{{ shipment.trackingNumber }}</code>
                <small class="text-muted">{{ shipment.destinationCity }}, {{ shipment.destinationCountry }}</small>
              </div>
              <span
                class="badge"
                :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
              >{{ formatShipmentStatus(shipment.status).label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <p class="text-uppercase text-muted small fw-bold mb-3" style="letter-spacing: .5px;">
              <i class="bi bi-lightning-charge me-1"></i>Actions rapides
            </p>
            <div class="d-flex flex-wrap gap-2">
              <NuxtLink to="/admin/requests" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-bag me-1"></i>Demandes
              </NuxtLink>
              <NuxtLink to="/admin/shipments" class="btn btn-sm btn-outline-info">
                <i class="bi bi-box-seam me-1"></i>Expéditions
              </NuxtLink>
              <NuxtLink to="/admin/users" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-people me-1"></i>Utilisateurs
              </NuxtLink>
              <NuxtLink to="/admin/pricing" class="btn btn-sm btn-outline-success">
                <i class="bi bi-currency-exchange me-1"></i>Tarifs
              </NuxtLink>
              <NuxtLink to="/admin/guides" class="btn btn-sm btn-outline-warning">
                <i class="bi bi-person-badge me-1"></i>Guides
              </NuxtLink>
              <NuxtLink to="/admin/visas" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-card-heading me-1"></i>Visas
              </NuxtLink>
              <NuxtLink to="/admin/blog" class="btn btn-sm btn-outline-dark">
                <i class="bi bi-journal-text me-1"></i>Blog
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

onMounted(async () => {
  await Promise.all([psStore.fetchRequests(), shippingStore.fetchShipments()])
  psStore.bindRealtime()
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const revenueGrouped = computed(() => {
  const map: Record<string, number> = {}
  psStore.requests.forEach(r => {
    if (r.quotedPrice) {
      const cur = (r as any).currency || 'XOF'
      map[cur] = (map[cur] || 0) + r.quotedPrice
    }
  })
  return map
})

const revenueEntries = computed(() => Object.entries(revenueGrouped.value))

const stats = computed(() => ({
  totalRequests: psStore.totalRequests,
  pendingRequests: psStore.getPendingRequests.length,
  inTransitShipments: shippingStore.getInTransitShipments.length,
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
.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shipment-row:hover {
  background-color: var(--bs-light);
}
</style>

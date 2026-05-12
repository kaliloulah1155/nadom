<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des demandes</h4>
        <p class="text-muted mb-0">{{ psStore.requestsMeta.total }} demandes au total</p>
      </div>
      <NuxtLink to="/personal-shopping/new?for=admin" class="btn btn-primary">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle demande
      </NuxtLink>
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
              placeholder="Rechercher..."
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="fetchRequests(1)">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="searching">Recherche</option>
              <option value="negotiating">Negociation</option>
              <option value="confirmed">Confirme</option>
              <option value="preparing">Preparation</option>
              <option value="shipped">Expedie</option>
              <option value="delivered">Livre</option>
              <option value="cancelled">Annule</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.category" class="form-select" @change="fetchRequests(1)">
              <option value="">Toutes categories</option>
              <option v-for="cat in (categories as any)" :key="cat.id" :value="cat.name_fr">
                {{ cat.name_fr }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="psStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Chargement des demandes...</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Produit</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Budget</th>
                <th>Devis</th>
                <th>Date</th>
                <th>Expédition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="psStore.requests.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">
                  Aucune demande trouvee
                </td>
              </tr>
              <tr v-for="request in psStore.requests" :key="request.id">
                <td><code>{{ String(request.id).slice(-6) }}</code></td>
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="requestThumbnailUrl(request, 40)"
                      class="rounded me-2"
                      width="40"
                      height="40"
                      style="object-fit: cover;"
                      alt=""
                    />
                    <div>
                      <div class="fw-medium">
                        {{ truncate(request.title, 25) }}
                        <span v-if="request.items?.length" class="badge bg-info-subtle text-info ms-1" style="font-size: 0.6rem;">
                          {{ request.items.length }} art.
                        </span>
                      </div>
                      <small class="text-muted">{{ request.category }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="small">
                    <div class="fw-medium">
                      {{
                        (request.user
                          ? [request.user.firstname, request.user.lastname].filter(Boolean).join(' ')
                          : '') || (request as any).contactFullname || 'Anonyme'
                      }}
                    </div>
                    <a
                      v-if="request.user?.phone || (request as any).contactNumber"
                      :href="`tel:${request.user?.phone || (request as any).contactNumber}`"
                      class="text-muted text-decoration-none"
                    >
                      <i class="bi bi-telephone me-1"></i>{{ request.user?.phone || (request as any).contactNumber }}
                    </a>
                    <span v-else class="text-muted fst-italic">—</span>
                  </div>
                </td>
                <td>
                  <select
                    :value="request.status"
                    class="form-select form-select-sm"
                    style="width: 130px;"
                    @change="updateStatus(request.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="pending">En attente</option>
                    <option value="searching">Recherche</option>
                    <option value="negotiating">Negociation</option>
                    <option value="confirmed">Confirme</option>
                    <option value="preparing">Preparation</option>
                    <option value="shipped">Expedie</option>
                    <option value="delivered">Livre</option>
                    <option value="cancelled">Annule</option>
                  </select>
                </td>
                <td>{{ formatCurrency(request.budgetEstimated, (request as any).currency || 'XOF') }}</td>
                <td>
                  <span v-if="request.quotedPrice" class="text-success fw-medium">
                    {{ formatCurrency(request.quotedPrice, (request as any).currency || 'XOF') }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td><small>{{ formatDateShort(request.createdAt) }}</small></td>
                <td>
                  <NuxtLink
                    v-if="request.shipmentId"
                    :to="`/admin/shipments/${request.shipmentId}`"
                    class="badge bg-info-subtle text-info text-decoration-none"
                  >
                    <i class="bi bi-box-seam me-1"></i>{{ request.trackingNumber || String(request.shipmentId ?? '').slice(-6) }}
                  </NuxtLink>
                  <button
                    v-else
                    class="btn btn-sm btn-outline-secondary"
                    title="Lier à une expédition"
                    @click="openLinkShipment(request)"
                  >
                    <i class="bi bi-link-45deg"></i>
                  </button>
                </td>
                <td>
                  <div class="d-flex">
                    <NuxtLink
                      :to="`/admin/requests/${request.id}`"
                      class="btn btn-outline-primary btn-sm me-2"
                      title="Voir"
                    >
                      <i class="bi bi-eye"></i>
                    </NuxtLink>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      title="Supprimer"
                      @click="deleteRequest(request.id)"
                    >
                      <i class="bi bi-trash"></i>
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
          v-model:current-page="psStore.requestsMeta.currentPage"
          v-model:limit="psStore.requestsMeta.perPage"
          :total-items="psStore.requestsMeta.total"
          @update:current-page="(p: number) => fetchRequests(p)"
          @update:limit="(l: number) => fetchRequests(1, l)"
        />
      </div>
    </div>

    <!-- Link Shipment Modal -->
    <div class="modal fade" id="linkShipmentModal" tabindex="-1" ref="linkModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">Lier à une expédition</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small">Demande #{{ String(linkingRequest?.id ?? '').slice(-6) }}</p>
            <label class="form-label">Expédition existante</label>
            <select v-model="selectedShipmentId" class="form-select">
              <option value="">— Sélectionner —</option>
              <option v-for="s in shippingStore.shipments" :key="s.id" :value="s.id">
                {{ s.trackingNumber || String(s.id ?? '').slice(-6) }} — {{ s.status }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
            <button class="btn btn-primary" :disabled="!selectedShipmentId" @click="confirmLinkShipment">
              Lier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatCurrency, formatDateShort, truncate, requestThumbnailUrl } = useFormatters()
const { success, error } = useNotification()

const categories = computed(() => psStore.categories)

const linkModalRef = ref<HTMLElement | null>(null)
let linkModalInstance: any = null
const linkingRequest = ref<any>(null)
const selectedShipmentId = ref('')

const openLinkShipment = async (request: any) => {
  linkingRequest.value = request
  selectedShipmentId.value = ''
  if (shippingStore.shipments.length === 0) {
    await shippingStore.fetchShipments()
  }
  linkModalInstance?.show()
}

const confirmLinkShipment = async () => {
  if (!linkingRequest.value || !selectedShipmentId.value) return
  try {
    await psStore.updateRequest(linkingRequest.value.id, { shipmentId: selectedShipmentId.value })
    success('Expédition liée à la demande')
    linkModalInstance?.hide()
    await fetchRequests(psStore.requestsMeta.currentPage)
  } catch (err: any) {
    error(err.message || 'Erreur lors de la liaison')
  }
}

const filters = reactive({
  search: '',
  status: '',
  category: ''
})

const fetchRequests = async (page?: number, limit?: number) => {
  await psStore.fetchRequests({
    page: page ?? psStore.requestsMeta.currentPage,
    limit: limit ?? psStore.requestsMeta.perPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchRequests(1), 400)
}

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.category = ''
  fetchRequests(1)
}

const updateStatus = async (id: string, status: string) => {
  try {
    await psStore.updateRequestStatus(id, status as RequestStatus)
    success('Statut mis a jour')
  } catch (err) {
    error('Erreur lors de la mise a jour')
  }
}

const deleteRequest = async (id: string) => {
  if (!confirm('Supprimer cette demande ?')) return

  try {
    await psStore.deleteRequest(id)
    success('Demande supprimee')
  } catch (err) {
    error('Erreur lors de la suppression')
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined' && (window as any).bootstrap && linkModalRef.value) {
    linkModalInstance = new (window as any).bootstrap.Modal(linkModalRef.value)
  }
  await psStore.fetchCategories()
  await fetchRequests(1)
})
</script>

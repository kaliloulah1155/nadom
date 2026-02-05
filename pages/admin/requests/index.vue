<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des demandes</h4>
        <p class="text-muted mb-0">{{ psStore.requests.length }} demandes au total</p>
      </div>
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
            />
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select">
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
            <select v-model="filters.category" class="form-select">
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
      <div class="card-body p-0">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Aucune demande trouvee
                </td>
              </tr>
              <tr v-for="request in paginatedRequests" :key="request.id">
                <td><code>{{ request.id.slice(-6) }}</code></td>
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="(request.items && request.items[0]?.image) || request.images[0] || 'https://via.placeholder.com/40'"
                      class="rounded me-2"
                      width="40"
                      height="40"
                      style="object-fit: cover;"
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
                  <small>{{ request.userId.slice(-4) }}</small>
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
                <td>{{ formatCurrency(request.budgetEstimated) }}</td>
                <td>
                  <span v-if="request.quotedPrice" class="text-success fw-medium">
                    {{ formatCurrency(request.quotedPrice) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td><small>{{ formatDateShort(request.createdAt) }}</small></td>
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
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="filteredRequests.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import { FAKE_CATEGORIES } from '~/utils/data/fakeData'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const { formatCurrency, formatDateShort, truncate } = useFormatters()
const { success, error } = useNotification()

const categories = FAKE_CATEGORIES
const currentPage = ref(1)
const perPage = ref(10)

const filters = reactive({
  search: '',
  status: '',
  category: ''
})

// Load data
onMounted(async () => {
  await psStore.fetchRequests()
})

// Computed
const filteredRequests = computed(() => {
  let requests = [...psStore.requests]

  if (filters.search) {
    const search = filters.search.toLowerCase()
    requests = requests.filter(r =>
      r.title.toLowerCase().includes(search) ||
      r.id.toLowerCase().includes(search)
    )
  }

  if (filters.status) {
    requests = requests.filter(r => r.status === filters.status)
  }

  if (filters.category) {
    requests = requests.filter(r => r.category === filters.category)
  }

  return requests.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const totalPages = computed(() => Math.ceil(filteredRequests.value.length / perPage.value))

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredRequests.value.slice(start, start + perPage.value)
})

// Methods
const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.category = ''
  currentPage.value = 1
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
</script>

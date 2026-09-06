<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.requests.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.requests.totalCount', { n: psStore.requestsMeta.total }) }}</p>
      </div>
      <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-plus-lg me-2"></i>{{ t('admin.requests.newRequest') }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <button type="button" class="dropdown-item" @click="openShoppingModal">
              <i class="bi bi-bag-heart me-2"></i>{{ t('admin.requests.typePersonalShopping') }}
            </button>
          </li>
          <li>
            <button type="button" class="dropdown-item" @click="openPackageModal">
              <i class="bi bi-box-seam me-2"></i>{{ t('admin.requests.typePackageSending') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Type tabs -->
    <ul class="nav nav-pills mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: filters.requestType === '' }"
          @click="setTypeFilter('')"
        >
          {{ t('admin.requests.typeAll') }}
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: filters.requestType === 'personal_shopping' }"
          @click="setTypeFilter('personal_shopping')"
        >
          <i class="bi bi-bag-heart me-1"></i>{{ t('admin.requests.typePersonalShopping') }}
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: filters.requestType === 'package_sending' }"
          @click="setTypeFilter('package_sending')"
        >
          <i class="bi bi-box-seam me-1"></i>{{ t('admin.requests.typePackageSending') }}
        </button>
      </li>
    </ul>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              :placeholder="t('admin.requests.searchPlaceholder')"
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="fetchRequests(1)">
              <option value="">{{ t('admin.requests.allStatuses') }}</option>
              <option value="pending">{{ t('admin.requests.status.pending') }}</option>
              <option value="searching">{{ t('admin.requests.status.searching') }}</option>
              <option value="negotiating">{{ t('admin.requests.status.negotiating') }}</option>
              <option value="confirmed">{{ t('admin.requests.status.confirmed') }}</option>
              <option value="preparing">{{ t('admin.requests.status.preparing') }}</option>
              <option value="shipped">{{ t('admin.requests.status.shipped') }}</option>
              <option value="delivered">{{ t('admin.requests.status.delivered') }}</option>
              <option value="cancelled">{{ t('admin.requests.status.cancelled') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.category" class="form-select" @change="fetchRequests(1)">
              <option value="">{{ t('admin.requests.allCategories') }}</option>
              <option
                v-for="cat in podCategories"
                :key="cat.uuid"
                :value="cat.label"
              >
                {{ podCategoryLabel(cat) }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>{{ t('admin.common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="psStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">{{ t('admin.requests.loading') }}</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.requests.id') }}</th>
                <th>{{ t('admin.dashboard.product') }}</th>
                <th>{{ t('admin.requests.client') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th>{{ t('admin.requests.budget') }}</th>
                <th>{{ t('admin.requests.quote') }}</th>
                <th>{{ t('admin.dashboard.date') }}</th>
                <th>{{ t('admin.requests.shipment') }}</th>
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="psStore.requests.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">
                  {{ t('admin.requests.noRequests') }}
                </td>
              </tr>
              <tr v-for="request in psStore.requests" :key="request.id">
                <td><code>{{ String(request.id).slice(-6) }}</code></td>
                <td>
                  <div v-if="request.requestType === 'package_sending'" class="d-flex align-items-center">
                    <span class="badge bg-warning-subtle text-warning me-2">
                      <i class="bi bi-box-seam"></i>
                    </span>
                    <div>
                      <div class="fw-medium">
                        {{ t('admin.requests.ctnCount', { n: request.ctnCount ?? '?' }) }}
                      </div>
                      <small class="text-muted">{{ request.destination?.country || '—' }}</small>
                    </div>
                  </div>
                  <div v-else class="d-flex align-items-center">
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
                        {{ truncate(requestTitle(request), 25) }}
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
                    <option value="pending">{{ t('admin.requests.status.pending') }}</option>
                    <option value="searching">{{ t('admin.requests.status.searching') }}</option>
                    <option value="negotiating">{{ t('admin.requests.status.negotiating') }}</option>
                    <option value="confirmed">{{ t('admin.requests.status.confirmed') }}</option>
                    <option value="preparing">{{ t('admin.requests.status.preparing') }}</option>
                    <option value="shipped">{{ t('admin.requests.status.shipped') }}</option>
                    <option value="delivered">{{ t('admin.requests.status.delivered') }}</option>
                    <option value="cancelled">{{ t('admin.requests.status.cancelled') }}</option>
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
                    :title="t('admin.requests.linkShipment')"
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
                      :title="t('admin.common.view')"
                    >
                      <i class="bi bi-eye"></i>
                    </NuxtLink>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      :title="t('admin.common.delete')"
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
            <h5 class="modal-title">{{ t('admin.requests.linkModalTitle') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small">{{ t('admin.requests.linkModalRequest', { id: String(linkingRequest?.id ?? '').slice(-6) }) }}</p>
            <label class="form-label">{{ t('admin.requests.existingShipment') }}</label>
            <select v-model="selectedShipmentId" class="form-select">
              <option value="">{{ t('admin.requests.selectShipment') }}</option>
              <option v-for="s in shippingStore.shipments" :key="s.id" :value="s.id">
                {{ s.trackingNumber || String(s.id ?? '').slice(-6) }} — {{ s.status }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" :disabled="!selectedShipmentId" @click="confirmLinkShipment">
              Lier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Nouvelle demande "Envoi de colis" — même formulaire que la page publique
         (composant partagé), ouvert en modale pour ne pas quitter la liste. -->
    <div id="packageRequestModal" ref="packageModalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-xl modal-2xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2"></i>{{ t('admin.requests.typePackageSending') }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- `v-if` : on remonte le formulaire à neuf à chaque ouverture, pour ne
                 pas retrouver la saisie précédente ni une étape déjà avancée. -->
            <EnvoiColisForm
              v-if="packageModalOpen"
              embedded
              admin
              @submitted="onPackageRequestCreated"
              @close="closePackageModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Nouvelle demande "Personal Shopping" — même formulaire que la page
         publique (composant partagé), ouvert en modale. -->
    <div id="shoppingRequestModal" ref="shoppingModalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-xl modal-2xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-bag-heart me-2"></i>{{ t('admin.requests.typePersonalShopping') }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <PersonalShoppingForm
              v-if="shoppingModalOpen"
              embedded
              admin
              @submitted="onShoppingRequestCreated"
              @close="closeShoppingModal"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import EnvoiColisForm from '~/components/envoiColis/EnvoiColisForm.vue'
import PersonalShoppingForm from '~/components/personalShopping/PersonalShoppingForm.vue'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatCurrency, formatDateShort, truncate, requestThumbnailUrl, requestTitle } = useFormatters()
const { success, error } = useNotification()

const { label: podCategoryLabel } = usePodCategoryLabel()

/** Catégories produit (slug POD) — l’API expose `label`, pas `name_fr`. */
const podCategories = computed(() =>
  (psStore.categories || []).filter((c: any) => String(c.slug || '') === 'POD'),
)

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
    success(t('admin.requests.linkedSuccess'))
    linkModalInstance?.hide()
    await fetchRequests(psStore.requestsMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.requests.linkError'))
  }
}

const filters = reactive({
  search: '',
  status: '',
  category: '',
  requestType: '' as '' | 'personal_shopping' | 'package_sending'
})

const fetchRequests = async (page?: number, limit?: number) => {
  await psStore.fetchRequests({
    page: page ?? psStore.requestsMeta.currentPage,
    limit: limit ?? psStore.requestsMeta.perPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
    request_type: filters.requestType || undefined
  })
}

const setTypeFilter = (type: '' | 'personal_shopping' | 'package_sending') => {
  filters.requestType = type
  fetchRequests(1)
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
  filters.requestType = ''
  fetchRequests(1)
}

const updateStatus = async (id: string, status: string) => {
  try {
    await psStore.updateRequestStatus(id, status as RequestStatus)
    success(t('admin.requests.statusUpdated'))
  } catch (err) {
    error(t('admin.messages.updateError'))
  }
}

const deleteRequest = async (id: string) => {
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteRequest'))) return

  try {
    await psStore.deleteRequest(id)
    success(t('admin.requests.requestDeleted'))
  } catch (err) {
    error(t('admin.requests.deleteError'))
  }
}

// --- Modale "Nouvelle demande — Envoi de colis" ---------------------------------
const packageModalRef = ref<HTMLElement | null>(null)
const packageModalOpen = ref(false)
let packageModalInstance: any = null

const openPackageModal = async () => {
  packageModalOpen.value = true
  await nextTick()
  packageModalInstance?.show()
}

const closePackageModal = () => {
  packageModalInstance?.hide()
}

const onPackageRequestCreated = async (ids: string[]) => {
  closePackageModal()
  // La demande vient d'être créée : on recharge la liste pour qu'elle y figure.
  await fetchRequests(1)
  success(
    ids.length > 1
      ? t('envoiColis.form.multiSubmitSuccess', { n: ids.length })
      : t('envoiColis.submitSuccess'),
  )
}

// --- Modale "Nouvelle demande — Personal Shopping" ------------------------------
const shoppingModalRef = ref<HTMLElement | null>(null)
const shoppingModalOpen = ref(false)
let shoppingModalInstance: any = null

const openShoppingModal = async () => {
  shoppingModalOpen.value = true
  await nextTick()
  shoppingModalInstance?.show()
}

const closeShoppingModal = () => {
  shoppingModalInstance?.hide()
}

const onShoppingRequestCreated = async () => {
  closeShoppingModal()
  await fetchRequests(1)
  success(t('personalShopping.formExtra.submitSuccess'))
}

onMounted(async () => {
  if (typeof window !== 'undefined' && (window as any).bootstrap && linkModalRef.value) {
    linkModalInstance = new (window as any).bootstrap.Modal(linkModalRef.value)
  }
  if (typeof window !== 'undefined' && (window as any).bootstrap && packageModalRef.value) {
    packageModalInstance = new (window as any).bootstrap.Modal(packageModalRef.value)
    // Vider le formulaire quand la modale est fermée (croix, Échap, clic dehors).
    packageModalRef.value.addEventListener('hidden.bs.modal', () => {
      packageModalOpen.value = false
    })
  }
  if (typeof window !== 'undefined' && (window as any).bootstrap && shoppingModalRef.value) {
    shoppingModalInstance = new (window as any).bootstrap.Modal(shoppingModalRef.value)
    shoppingModalRef.value.addEventListener('hidden.bs.modal', () => {
      shoppingModalOpen.value = false
    })
  }
  await psStore.fetchCategories({ page: 1, limit: 100, slug: 'POD' })
  await fetchRequests(1)
})
</script>

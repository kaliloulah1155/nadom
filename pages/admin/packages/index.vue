<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.packages.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.packages.totalCount', { n: store.packagesMeta.total }) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <select v-model="filters.status" class="form-select" @change="fetchPackages(1)">
              <option value="">{{ t('admin.packages.allStatuses') }}</option>
              <option value="open">{{ t('admin.packages.status.open') }}</option>
              <option value="closed">{{ t('admin.packages.status.closed') }}</option>
              <option value="shipped">{{ t('admin.packages.status.shipped') }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <div class="form-check mt-2">
              <input
                id="unassignedOnly"
                v-model="filters.unassigned"
                type="checkbox"
                class="form-check-input"
                @change="fetchPackages(1)"
              />
              <label class="form-check-label" for="unassignedOnly">{{ t('admin.packages.unassignedOnly') }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="store.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.packages.code') }}</th>
                <th>{{ t('admin.packages.date') }}</th>
                <th>{{ t('admin.packages.shipmentsCount') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th>{{ t('admin.packages.container') }}</th>
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.packages.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">{{ t('admin.packages.none') }}</td>
              </tr>
              <template v-for="pkg in store.packages" :key="pkg.id">
                <tr>
                  <td>
                    <button class="btn btn-link btn-sm p-0 text-decoration-none" @click="toggleExpand(pkg.id)">
                      <i class="bi" :class="expandedPackageId === pkg.id ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                      <code class="ms-1">{{ pkg.code }}</code>
                    </button>
                  </td>
                  <td>{{ formatDateShort(pkg.package_date) }}</td>
                  <td>{{ pkg.shipments_count ?? 0 }}</td>
                  <td>
                    <span class="badge bg-light text-dark">{{ t(`admin.packages.status.${pkg.status}`) }}</span>
                  </td>
                  <td>
                    <span v-if="pkg.container" class="badge bg-info-subtle text-info">
                      <i class="bi bi-truck-flatbed me-1"></i>{{ pkg.container.code }}
                    </span>
                    <span v-else class="text-muted small fst-italic">{{ t('admin.packages.noContainer') }}</span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button
                        v-if="!pkg.container_id"
                        class="btn btn-sm btn-outline-primary"
                        @click="openAssignModal(pkg)"
                      >
                        <i class="bi bi-truck-flatbed me-1"></i>{{ t('admin.packages.assign') }}
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        :disabled="(pkg.shipments_count ?? 0) > 0"
                        :title="(pkg.shipments_count ?? 0) > 0 ? t('admin.packages.cannotDeleteHasShipments') : ''"
                        @click="confirmDeletePackage(pkg)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="expandedPackageId === pkg.id">
                  <td colspan="6" class="bg-light">
                    <div v-if="loadingExpand" class="text-center py-2">
                      <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>
                    <ul v-else-if="expandedShipments.length" class="list-unstyled mb-0 small">
                      <li v-for="s in expandedShipments" :key="s.id" class="d-flex justify-content-between py-1 border-bottom">
                        <code>{{ s.tracking_number }}</code>
                        <span class="text-muted">{{ s.destination_city || s.destination_country || '—' }}</span>
                        <span class="badge bg-light text-dark">{{ s.status }}</span>
                      </li>
                    </ul>
                    <p v-else class="text-muted small mb-0">{{ t('admin.packages.noShipments') }}</p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="store.packagesMeta.currentPage"
          v-model:limit="store.packagesMeta.perPage"
          :total-items="store.packagesMeta.total"
          @update:current-page="(p: number) => fetchPackages(p)"
          @update:limit="(l: number) => fetchPackages(1, l)"
        />
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="assigningPackage" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.packages.assignModalTitle', { code: assigningPackage.code }) }}</h5>
            <button type="button" class="btn-close" @click="assigningPackage = null"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">{{ t('admin.packages.selectContainer') }}</label>
            <select v-model="selectedContainerId" class="form-select mb-3">
              <option value="">{{ t('admin.packages.selectContainerPlaceholder') }}</option>
              <option v-for="c in nomStore.containers" :key="c.id" :value="c.id">
                <!-- Statuts de CONTENEUR (en chargement / en transit / arrivé),
                     et non de package : le mauvais espace de noms affichait la
                     clé brute « admin.packages.status.loading ». -->
                {{ c.code }} ({{ t('admin.containers.status.' + c.status) }})
              </option>
            </select>
            <div class="text-center">
              <span class="text-muted small">{{ t('admin.common.or') }}</span>
            </div>
            <button class="btn btn-outline-secondary w-100 mt-2" :disabled="creatingContainer" @click="createNewContainer">
              <span v-if="creatingContainer" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-plus-lg me-1"></i>{{ t('admin.packages.createNewContainer') }}
            </button>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" @click="assigningPackage = null">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" :disabled="!selectedContainerId || assigning" @click="confirmAssign">
              <span v-if="assigning" class="spinner-border spinner-border-sm me-1"></span>
              {{ t('admin.packages.confirmAssign') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNomenclatureStore, type Package, type PackageShipment } from '~/stores/nomenclature'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const store = useNomenclatureStore()
const nomStore = store // même store — alias pour lisibilité dans le modal
const { formatDateShort } = useFormatters()
const { success, error: notifyError } = useNotification()

const filters = reactive({
  status: '',
  unassigned: false,
})

const fetchPackages = async (page?: number, limit?: number) => {
  await store.fetchPackages({
    page: page ?? store.packagesMeta.currentPage,
    limit: limit ?? store.packagesMeta.perPage,
    status: filters.status || undefined,
    unassigned: filters.unassigned || undefined,
  })
}

const assigningPackage = ref<Package | null>(null)
const selectedContainerId = ref('')
const assigning = ref(false)
const creatingContainer = ref(false)

const openAssignModal = async (pkg: Package) => {
  assigningPackage.value = pkg
  selectedContainerId.value = ''
  if (nomStore.containers.length === 0) {
    await nomStore.fetchContainers({ status: 'loading', limit: 50 })
  }
}

const createNewContainer = async () => {
  creatingContainer.value = true
  try {
    const created = await nomStore.createContainer()
    if (created) {
      success(t('admin.packages.containerCreated', { code: created.code }))
      selectedContainerId.value = created.id
    }
  } catch (err: any) {
    notifyError(err.message || t('admin.packages.containerCreateError'))
  } finally {
    creatingContainer.value = false
  }
}

const confirmAssign = async () => {
  if (!assigningPackage.value || !selectedContainerId.value) return
  assigning.value = true
  try {
    await nomStore.assignPackage(selectedContainerId.value, assigningPackage.value.id)
    success(t('admin.packages.assigned'))
    assigningPackage.value = null
    await fetchPackages(store.packagesMeta.currentPage)
  } catch (err: any) {
    notifyError(err.message || t('admin.packages.assignError'))
  } finally {
    assigning.value = false
  }
}

const expandedPackageId = ref<string | null>(null)
const expandedShipments = ref<PackageShipment[]>([])
const loadingExpand = ref(false)

const toggleExpand = async (packageId: string) => {
  if (expandedPackageId.value === packageId) {
    expandedPackageId.value = null
    return
  }
  expandedPackageId.value = packageId
  loadingExpand.value = true
  try {
    const pkg = await store.fetchPackageById(packageId)
    expandedShipments.value = pkg?.shipments || []
  } finally {
    loadingExpand.value = false
  }
}

const confirmDeletePackage = async (pkg: Package) => {
  if (!confirm(t('admin.packages.confirmDelete', { code: pkg.code }))) return
  try {
    await store.deletePackage(pkg.id)
    success(t('admin.packages.deleted'))
  } catch (err: any) {
    notifyError(err.message || t('admin.packages.deleteError'))
  }
}

onMounted(() => fetchPackages(1))
</script>

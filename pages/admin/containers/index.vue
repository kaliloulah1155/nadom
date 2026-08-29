<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.containers.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.containers.totalCount', { n: store.containersMeta.total }) }}</p>
      </div>
      <button class="btn btn-primary" :disabled="creating" @click="createNewContainer">
        <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="bi bi-plus-lg me-2"></i>{{ t('admin.containers.newContainer') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <select v-model="filters.status" class="form-select" style="max-width: 260px;" @change="fetchContainers(1)">
          <option value="">{{ t('admin.containers.allStatuses') }}</option>
          <option value="loading">{{ t('admin.containers.status.loading') }}</option>
          <option value="in_transit">{{ t('admin.containers.status.in_transit') }}</option>
          <option value="arrived">{{ t('admin.containers.status.arrived') }}</option>
        </select>
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
                <th>{{ t('admin.containers.code') }}</th>
                <th>{{ t('admin.containers.number') }}</th>
                <th>{{ t('admin.containers.lot') }}</th>
                <th>{{ t('admin.containers.shipmentsCount') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th>{{ t('admin.containers.etd') }}</th>
                <th>{{ t('admin.containers.eta') }}</th>
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.containers.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">{{ t('admin.containers.none') }}</td>
              </tr>
              <tr v-for="c in store.containers" :key="c.id">
                <td><code class="fw-bold">{{ c.code }}</code></td>
                <td>
                  <input
                    type="number"
                    min="1"
                    class="form-control form-control-sm"
                    style="width: 80px;"
                    :value="c.container_number"
                    @change="updateNumber(c, 'container_number', ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    class="form-control form-control-sm"
                    style="width: 80px;"
                    :value="c.lot_number"
                    @change="updateNumber(c, 'lot_number', ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td>{{ c.shipments_count ?? 0 }}</td>
                <td>
                  <select
                    :value="c.status"
                    class="form-select form-select-sm"
                    style="width: 130px;"
                    @change="updateStatus(c.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="loading">{{ t('admin.containers.status.loading') }}</option>
                    <option value="in_transit">{{ t('admin.containers.status.in_transit') }}</option>
                    <option value="arrived">{{ t('admin.containers.status.arrived') }}</option>
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    style="width: 150px;"
                    :value="c.etd?.slice(0, 10) || ''"
                    @change="updateDate(c.id, 'etd', ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    style="width: 150px;"
                    :value="c.eta?.slice(0, 10) || ''"
                    @change="updateDate(c.id, 'eta', ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" @click="openDetail(c)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      :disabled="(c.shipments_count ?? 0) > 0 || (c.packages_count ?? 0) > 0"
                      :title="(c.shipments_count ?? 0) > 0 || (c.packages_count ?? 0) > 0 ? t('admin.containers.cannotDeleteHasPackages') : ''"
                      @click="confirmDeleteContainer(c)"
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
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="store.containersMeta.currentPage"
          v-model:limit="store.containersMeta.perPage"
          :total-items="store.containersMeta.total"
          @update:current-page="(p: number) => fetchContainers(p)"
          @update:limit="(l: number) => fetchContainers(1, l)"
        />
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailContainer" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ detailContainer.code }}</h5>
            <button type="button" class="btn-close" @click="detailContainer = null"></button>
          </div>
          <div class="modal-body">
            <!-- Composition réelle du BL : les colis y sont rattachés un par un,
                 toutes journées confondues. Le regroupement par package ci-dessous
                 ne reflète que les affectations faites à l'ancienne méthode. -->
            <h6 class="text-muted small text-uppercase mb-2">{{ t('admin.containers.shipmentsInContainer') }}</h6>
            <table v-if="detailContainer.shipments?.length" class="table table-sm small align-middle mb-4">
              <tbody>
                <tr v-for="s in detailContainer.shipments" :key="s.id">
                  <td>
                    <NuxtLink :to="`/admin/shipments/${s.id}`"><code>{{ s.tracking_number }}</code></NuxtLink>
                  </td>
                  <td class="text-muted">{{ s.destination_city || s.destination_country || '—' }}</td>
                  <td class="text-muted">{{ s.package?.code || '—' }}</td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary py-0 px-1"
                      :title="t('admin.packages.unassignShipment')"
                      @click="retirerColis(s)"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-muted small mb-4">{{ t('admin.containers.noShipments') }}</p>

            <h6 class="text-muted small text-uppercase mb-2">{{ t('admin.containers.packagesInContainer') }}</h6>
            <div v-if="detailContainer.packages?.length" class="accordion" id="packagesAccordion">
              <div v-for="p in detailContainer.packages" :key="p.id" class="border rounded mb-2">
                <div class="d-flex justify-content-between align-items-center p-2">
                  <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-link btn-sm p-0 text-decoration-none" @click="toggleExpand(p.id)">
                      <i class="bi" :class="expandedPackageId === p.id ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                    </button>
                    <!-- Réciproque du lien conteneur : le code du package ouvre
                         sa fiche dans l'écran Packages. -->
                    <NuxtLink :to="`/admin/packages?package=${p.id}`" :title="t('admin.containers.openPackage')">
                      <code>{{ p.code }}</code>
                    </NuxtLink>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-light text-dark">{{ t('admin.containers.shipmentsInPackage', { n: p.shipments_count ?? p.shipments?.length ?? 0 }) }}</span>
                    <button class="btn btn-sm btn-outline-secondary py-0 px-1" :title="t('admin.containers.unassignPackage')" @click="unassignPackage(p)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
                <div v-if="expandedPackageId === p.id" class="border-top p-2 bg-light">
                  <div v-if="loadingExpand" class="text-center py-2">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                  </div>
                  <ul v-else-if="expandedShipments.length" class="list-unstyled mb-0 small">
                    <li v-for="s in expandedShipments" :key="s.id" class="d-flex justify-content-between py-1 border-bottom">
                      <code>{{ s.tracking_number }}</code>
                      <span class="text-muted">{{ s.destination_city || s.destination_country || '—' }}</span>
                    </li>
                  </ul>
                  <p v-else class="text-muted small mb-0">{{ t('admin.containers.noShipmentsInPackage') }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-muted small">{{ t('admin.containers.noPackages') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNomenclatureStore, type Container, type Package, type PackageShipment } from '~/stores/nomenclature'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const store = useNomenclatureStore()
const { success, error: notifyError } = useNotification()

const filters = reactive({ status: '' })

const fetchContainers = async (page?: number, limit?: number) => {
  await store.fetchContainers({
    page: page ?? store.containersMeta.currentPage,
    limit: limit ?? store.containersMeta.perPage,
    status: filters.status || undefined,
  })
}

const creating = ref(false)
const createNewContainer = async () => {
  creating.value = true
  try {
    const created = await store.createContainer()
    if (created) success(t('admin.containers.created', { code: created.code }))
  } catch (err: any) {
    notifyError(err.message || t('admin.containers.createError'))
  } finally {
    creating.value = false
  }
}

const updateStatus = async (id: string, status: string) => {
  try {
    await store.updateContainer(id, { status: status as Container['status'] })
    success(t('admin.containers.updated'))
  } catch {
    notifyError(t('admin.containers.updateError'))
  }
}

const updateDate = async (id: string, field: 'etd' | 'eta', value: string) => {
  if (!value) return
  try {
    await store.updateContainer(id, { [field]: value })
    success(t('admin.containers.updated'))
  } catch {
    notifyError(t('admin.containers.updateError'))
  }
}

const updateNumber = async (c: Container, field: 'container_number' | 'lot_number', value: string) => {
  const num = Number(value)
  if (!num || num < 1) {
    notifyError(t('admin.containers.invalidNumber'))
    await fetchContainers(store.containersMeta.currentPage)
    return
  }
  try {
    await store.updateContainer(c.id, { [field]: num })
    success(t('admin.containers.updated'))
  } catch (err: any) {
    notifyError(err.message || t('admin.containers.updateError'))
    await fetchContainers(store.containersMeta.currentPage)
  }
}

const confirmDeleteContainer = async (c: Container) => {
  if (!confirm(t('admin.containers.confirmDelete', { code: c.code }))) return
  try {
    await store.deleteContainer(c.id)
    success(t('admin.containers.deleted'))
  } catch (err: any) {
    notifyError(err.message || t('admin.containers.deleteError'))
  }
}

const detailContainer = ref<Container | null>(null)
const expandedPackageId = ref<string | null>(null)
const expandedShipments = ref<PackageShipment[]>([])
const loadingExpand = ref(false)

const openDetail = async (c: Container) => {
  expandedPackageId.value = null
  const full = await store.fetchContainerById(c.id)
  detailContainer.value = full || c
}

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

const unassignPackage = async (p: Package) => {
  if (!detailContainer.value) return
  if (!confirm(t('admin.containers.confirmUnassign', { code: p.code }))) return
  try {
    await store.unassignPackage(detailContainer.value.id, p.id)
    success(t('admin.containers.unassigned'))
    const full = await store.fetchContainerById(detailContainer.value.id)
    detailContainer.value = full
    await fetchContainers(store.containersMeta.currentPage)
  } catch (err: any) {
    notifyError(err.message || t('admin.containers.unassignError'))
  }
}

/** Retire un colis du BL. Le colis reste dans son package journalier. */
const retirerColis = async (s: PackageShipment) => {
  if (!detailContainer.value) return
  try {
    await store.setShipmentContainer(s.id, null, detailContainer.value.id)
    success(t('admin.packages.shipmentUnassigned'))
    detailContainer.value = await store.fetchContainerById(detailContainer.value.id)
    await fetchContainers(store.containersMeta.currentPage)
  } catch (err: any) {
    notifyError(err?.message || t('admin.common.error'))
  }
}

const route = useRoute()

onMounted(async () => {
  await fetchContainers(1)

  // Arrivée depuis l'écran Packages (clic sur le code du conteneur) : on ouvre
  // directement la fiche visée, sinon l'agent atterrit sur la liste et doit
  // rechercher lui-même la ligne d'où il vient.
  const cible = route.query.container as string | undefined
  if (!cible) return
  const trouve = store.containers.find((c: Container) => c.id === cible)
  if (trouve) {
    openDetail(trouve)
  } else {
    // La liste est paginée : le conteneur visé peut ne pas y figurer.
    const full = await store.fetchContainerById(cible)
    if (full) detailContainer.value = full
  }
})
</script>

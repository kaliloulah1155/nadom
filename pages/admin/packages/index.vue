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
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.packages.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">{{ t('admin.packages.none') }}</td>
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
                    <div class="d-flex gap-1">
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
                  <td colspan="5" class="bg-light">
                    <div v-if="loadingExpand" class="text-center py-2">
                      <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>
                    <!-- Le conteneur se choisit colis par colis : un même BL
                         embarque des envois de journées différentes. -->
                    <table v-else-if="expandedShipments.length" class="table table-sm mb-0 small align-middle">
                      <thead>
                        <tr class="text-muted">
                          <th class="fw-normal">{{ t('admin.packages.shipment') }}</th>
                          <th class="fw-normal">{{ t('admin.shipments.destination') }}</th>
                          <th class="fw-normal" style="width: 12rem;">{{ t('admin.packages.container') }}</th>
                          <th class="fw-normal">{{ t('admin.dashboard.status') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="s in expandedShipments" :key="s.id">
                          <td>
                            <NuxtLink :to="`/admin/shipments/${s.id}`" :title="t('admin.packages.openShipment')">
                              <code>{{ s.tracking_number }}</code>
                            </NuxtLink>
                          </td>
                          <td class="text-muted">{{ s.destination_city || s.destination_country || '—' }}</td>
                          <td>
                            <div class="d-flex align-items-center gap-1">
                              <select
                                class="form-select form-select-sm"
                                :value="s.container_id || ''"
                                :disabled="savingShipmentId === s.id"
                                @change="changerConteneur(s, ($event.target as HTMLSelectElement).value)"
                              >
                                <option value="">{{ t('admin.packages.noContainer') }}</option>
                                <option
                                  v-for="c in nomStore.containers"
                                  :key="c.id"
                                  :value="c.id"
                                  :disabled="c.status !== 'loading' && c.id !== s.container_id"
                                >
                                  {{ c.code }} ({{ t('admin.containers.status.' + c.status) }})
                                </option>
                              </select>
                              <!-- Le lien vers la fiche du BL vit desormais ici :
                                   le conteneur se decide colis par colis, plus au
                                   niveau du panier journalier. -->
                              <NuxtLink
                                v-if="s.container_id"
                                :to="`/admin/containers?container=${s.container_id}`"
                                class="btn btn-sm btn-outline-info py-0 px-1"
                                :title="t('admin.packages.openContainer')"
                              >
                                <i class="bi bi-box-arrow-up-right"></i>
                              </NuxtLink>
                              <!-- Retrait explicite : l'option vide du select est un
                                   moyen de detachement peu lisible pour l'agent. -->
                              <button
                                v-if="s.container_id"
                                class="btn btn-sm btn-outline-danger py-0 px-1"
                                :disabled="savingShipmentId === s.id"
                                :title="t('admin.packages.unassignShipment')"
                                @click="changerConteneur(s, '')"
                              >
                                <i class="bi bi-x-lg"></i>
                              </button>
                            </div>
                          </td>
                          <td><span class="badge bg-light text-dark">{{ s.status }}</span></td>
                        </tr>
                      </tbody>
                    </table>
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

/** Colis en cours d'enregistrement, pour neutraliser son select le temps de l'appel. */
const savingShipmentId = ref<string | null>(null)

/**
 * Change le conteneur d'un colis. L'affectation est propre au colis : deux
 * envois de journées différentes peuvent rejoindre le même BL.
 */
const changerConteneur = async (s: PackageShipment, containerId: string) => {
  const ancien = s.container_id ?? null
  const nouveau = containerId || null
  if (nouveau === ancien) return

  savingShipmentId.value = s.id
  try {
    await store.setShipmentContainer(s.id, nouveau, ancien)
    // Mise à jour locale : évite de recharger toute la liste pour un select.
    s.container_id = nouveau
    s.container = nouveau ? nomStore.containers.find(c => c.id === nouveau) ?? null : null
    success(nouveau ? t('admin.packages.shipmentAssigned') : t('admin.packages.shipmentUnassigned'))
  } catch (e: any) {
    notifyError(e?.message || t('admin.common.error'))
  } finally {
    savingShipmentId.value = null
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

const route = useRoute()

onMounted(async () => {
  await fetchPackages(1)

  // Les conteneurs alimentent le select présent sur chaque ligne de colis :
  // ils doivent être chargés dès l'ouverture, pas seulement à l'ouverture du modal.
  if (nomStore.containers.length === 0) {
    await nomStore.fetchContainers({ limit: 100 })
  }

  // Arrivée depuis le détail d'un conteneur (clic sur le code du package) :
  // on déplie directement la ligne concernée.
  const cible = route.query.package as string | undefined
  if (cible && store.packages.some((p: Package) => p.id === cible)) {
    await toggleExpand(cible)
  }
})
</script>

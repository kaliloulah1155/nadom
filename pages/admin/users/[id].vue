<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>
  <div v-else-if="!user" class="text-center py-5">
    <i class="bi bi-person-x display-1 text-muted"></i>
    <h4 class="mt-3">{{ t('admin.users.notFound') }}</h4>
    <NuxtLink to="/admin/users" class="btn btn-primary mt-2">{{ t('admin.requests.backToList') }}</NuxtLink>
  </div>
  <div v-else>
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin/users">{{ t('admin.nav.users') }}</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">{{ user.firstname }} {{ user.lastname }}</li>
      </ol>
    </nav>

    <!-- Header Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div class="d-flex align-items-center">
        <img
          :src="resolveStorageAssetUrl(user.picture) || `https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&background=random`"
          class="rounded-circle me-3 border"
          width="64"
          height="64"
        />
        <div>
          <h4 class="mb-0">{{ user.firstname }} {{ user.lastname }}</h4>
          <span
            class="badge text-uppercase"
            :class="{
              'bg-primary-subtle text-primary': user.role?.code === 'admin',
              'bg-warning-subtle text-warning': user.role?.code === 'super-admin',
              'bg-info-subtle text-info': user.role?.code === 'agent',
              'bg-secondary-subtle text-secondary': user.role?.code === 'client'
            }"
          >
            {{ user.role?.label || user.role?.code }}
          </span>
        </div>
      </div>
      <div class="btn-group">
        <button v-can="['update', 'users']" class="btn btn-outline-primary me-2" @click="openEditModal">
          <i class="bi bi-pencil me-2"></i>{{ t('admin.users.editProfile') }}
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Sidebar Info -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">{{ t('admin.users.coordinates') }}</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">Email</label>
              <a :href="`mailto:${user.email}`" class="fw-medium">{{ user.email }}</a>
            </div>
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">{{ t('admin.users.phone') }}</label>
              <a :href="`tel:${user.phone}`" class="fw-medium">{{ user.phone || t('admin.shipments.na') }}</a>
            </div>
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">{{ t('admin.users.location') }}</label>
              <p class="mb-0">{{ [user.city, user.country].filter(Boolean).join(', ') || t('admin.shipments.na') }}</p>
            </div>
            <div class="mb-0">
              <label class="text-muted small d-block mb-1">{{ t('admin.users.registeredOn') }}</label>
              <p class="mb-0">{{ formatDate(user.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="row g-3">
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center p-3">
              <div class="h4 mb-0">{{ userRequests.length }}</div>
              <small class="text-muted">{{ t('admin.nav.requests') }}</small>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center p-3">
              <div class="h4 mb-0">{{ userShipments.length }}</div>
              <small class="text-muted">{{ t('admin.nav.shipments') }}</small>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm text-center p-3">
              <div class="h4 mb-0">{{ userVisaApplications.length }}</div>
              <small class="text-muted">Visa</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Activity -->
      <div class="col-lg-8">
        <!-- Tabs -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white p-0">
            <ul class="nav nav-tabs border-bottom-0 mx-3" role="tablist">
              <li class="nav-item">
                <button class="nav-link active py-3 px-4 border-0 border-bottom border-2" data-bs-toggle="tab" data-bs-target="#user-requests">
                  {{ t('admin.nav.requests') }}
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 px-4 border-0 border-bottom border-2" data-bs-toggle="tab" data-bs-target="#user-shipments">
                  {{ t('admin.nav.shipments') }}
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 px-4 border-0 border-bottom border-2" data-bs-toggle="tab" data-bs-target="#user-visas">
                  Visa
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body p-0">
            <div class="tab-content">
              <!-- Requests Tab -->
              <div class="tab-pane fade show active" id="user-requests">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="ps-4">{{ t('admin.requests.request') }}</th>
                        <th>{{ t('admin.dashboard.status') }}</th>
                        <th>Date</th>
                        <th class="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="userRequests.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">{{ t('admin.users.noUserRequests') }}</td>
                      </tr>
                      <tr v-for="req in userRequests" :key="req.id">
                        <td class="ps-4">
                          <div class="fw-medium">{{ req.title || req.trackingNumber }}</div>
                          <small class="text-muted">{{ req.category }}</small>
                        </td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(req.status)">
                            {{ req.status }}
                          </span>
                        </td>
                        <td>{{ formatDateShort(req.createdAt) }}</td>
                        <td class="text-end pe-4">
                          <NuxtLink :to="`/admin/requests/${req.id}`" class="btn btn-sm btn-outline-primary">{{ t('admin.common.detail') }}</NuxtLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Shipments Tab -->
              <div class="tab-pane fade" id="user-shipments">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="ps-4">Tracking #</th>
                        <th>{{ t('admin.shipments.destination') }}</th>
                        <th>{{ t('admin.dashboard.status') }}</th>
                        <th class="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="userShipments.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">{{ t('admin.users.noUserShipments') }}</td>
                      </tr>
                      <tr v-for="ship in userShipments" :key="ship.id">
                        <td class="ps-4">
                          <code>{{ ship.tracking_number }}</code>
                        </td>
                        <td>{{ [ship.destination_city, ship.destination_country].filter(Boolean).join(', ') }}</td>
                        <td>
                          <span class="badge" :style="{ backgroundColor: formatShipmentStatus(ship.status).color, color: '#fff' }">
                            {{ formatShipmentStatus(ship.status).label }}
                          </span>
                        </td>
                        <td class="text-end pe-4">
                          <NuxtLink :to="`/admin/shipments/${ship.tracking_number}`" class="btn btn-sm btn-outline-primary">{{ t('tracking.search') }}</NuxtLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Visa Tab -->
              <div class="tab-pane fade" id="user-visas">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="ps-4">{{ t('admin.visas.type') }}</th>
                        <th>{{ t('admin.dashboard.status') }}</th>
                        <th>Date</th>
                        <th class="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="userVisaApplications.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">{{ t('admin.users.noUserVisas') }}</td>
                      </tr>
                      <tr v-for="app in userVisaApplications" :key="app.id">
                        <td class="ps-4">
                          <div class="fw-medium">{{ visasStore.getVisaById(app.visa_type_id)?.type || '—' }}</div>
                          <small class="text-muted">{{ app.applicant_nationality }}</small>
                        </td>
                        <td>
                          <span class="badge" :class="getVisaStatusBadgeClass(app.status)">
                            {{ app.status }}
                          </span>
                        </td>
                        <td>{{ formatDateShort(app.created_at) }}</td>
                        <td class="text-end pe-4">
                          <NuxtLink to="/admin/visas" class="btn btn-sm btn-outline-primary">{{ t('admin.common.detail') }}</NuxtLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.users.editProfile') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.users.firstName') }}</label>
                  <input v-model="editForm.firstname" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.users.lastName') }}</label>
                  <input v-model="editForm.lastname" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input v-model="editForm.email" type="email" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ t('admin.users.phone') }}</label>
                  <PhoneInput v-model="editForm.phone" country="ci" />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ t('admin.users.city') }}</label>
                  <input v-model="editForm.city" type="text" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ t('admin.users.country') }}</label>
                  <select v-model="editForm.country" class="form-select">
                    <option value="">{{ t('admin.users.selectCountry') }}</option>
                    <option v-for="country in countriesStore.activeCountries" :key="country.uuid" :value="country.label">{{ country.label }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>{{ t('admin.common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PhoneInput from '~/components/PhoneInput.vue'
const { t } = useI18n()

import { computed, onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useVisasStore } from '~/stores/visas'
import { useCountriesStore } from '~/stores/countries'
import { useFormatters } from '~/composables/useFormatters'
import { resolveStorageAssetUrl } from '~/composables/useStorageAssetUrl'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const api = useApi()
const { success, error: notifyError } = useNotification()
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const visasStore = useVisasStore()
const countriesStore = useCountriesStore()
const { formatDate, formatDateShort, formatShipmentStatus } = useFormatters()

const uuid = route.params.id as string

const loading = ref(true)
const user = ref<any>(null)

/**
 * La page reposait sur FAKE_USERS.find(u => u.id === id) — un reliquat du
 * prototype jamais reconnecte au vrai backend. Un id de route reel est un
 * uuid, absent de ce jeu de donnees factice : la recherche echouait
 * toujours, et la page restait bloquee sur le spinner "chargement" pour
 * n'importe quel client reel. Remplace par un vrai GET /user/{uuid}.
 */
const fetchUser = async () => {
  loading.value = true
  try {
    const res = await api.get<any>(`/user/${uuid}`)
    user.value = res.success ? res.data : null
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
}

// Memes filtres bugges que ci-dessus : comparaient l'uuid de la route a
// user_id (une cle numerique), jamais egaux. Filtrent desormais sur le vrai
// id numerique de l'utilisateur charge.
const userRequests = computed(() => (user.value ? psStore.getRequestsByUser(user.value.id) : []))
const userShipments = computed(() => (user.value ? shippingStore.getShipmentsByUser(user.value.id) : []))
const userVisaApplications = computed(() => (user.value ? visasStore.getApplicationsByUser(user.value.id) : []))

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const saving = ref(false)

const editForm = reactive({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  city: '',
  country: '',
})

onMounted(async () => {
  await fetchUser()
  await Promise.all([
    psStore.requests.length === 0 ? psStore.fetchRequests() : Promise.resolve(),
    shippingStore.shipments.length === 0 ? shippingStore.fetchShipments() : Promise.resolve(),
    visasStore.applications.length === 0 ? visasStore.fetchApplications() : Promise.resolve(),
    countriesStore.activeCountries.length === 0 ? countriesStore.fetchAll() : Promise.resolve(),
  ])

  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openEditModal = () => {
  if (user.value) {
    editForm.firstname = user.value.firstname || ''
    editForm.lastname = user.value.lastname || ''
    editForm.email = user.value.email || ''
    editForm.phone = user.value.phone || ''
    editForm.city = user.value.city || ''
    editForm.country = user.value.country || ''
  }
  modalInstance?.show()
}

/**
 * Ne mutait auparavant que le tableau FAKE_USERS en memoire : le bouton
 * "Enregistrer" semblait fonctionner (la modale se fermait sans erreur) mais
 * ne modifiait jamais le vrai compte. Appelle desormais PUT /user/{uuid}.
 */
const saveUser = async () => {
  saving.value = true
  try {
    const res = await api.put<any>(`/user/${uuid}`, {
      firstname: editForm.firstname,
      lastname: editForm.lastname,
      email: editForm.email,
      phone: editForm.phone,
      city: editForm.city,
      country: editForm.country,
    })
    if (res.success) {
      user.value = res.data
      success(t('admin.messages.updated'))
      modalInstance?.hide()
    } else {
      notifyError(res.message || t('admin.messages.saveError'))
    }
  } catch (e: any) {
    notifyError(e?.message || t('admin.messages.saveError'))
  } finally {
    saving.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-warning-subtle text-warning',
    searching: 'bg-info-subtle text-info',
    negotiating: 'bg-primary-subtle text-primary',
    confirmed: 'bg-success-subtle text-success',
    shipped: 'bg-dark-subtle text-dark',
    delivered: 'bg-success text-white',
  }
  return classes[status] || 'bg-secondary-subtle'
}

const getVisaStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-warning-subtle text-warning',
    processing: 'bg-info-subtle text-info',
    approved: 'bg-success-subtle text-success',
    rejected: 'bg-danger-subtle text-danger',
  }
  return classes[status] || 'bg-secondary-subtle'
}
</script>

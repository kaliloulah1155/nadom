<template>
  <div v-if="user">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin/users">Utilisateurs</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Profil de {{ user.firstName }}</li>
      </ol>
    </nav>

    <!-- Header Actions -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <img 
          :src="user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`" 
          class="rounded-circle me-3 border" 
          width="64" 
          height="64" 
        />
        <div>
          <h4 class="mb-0">{{ user.firstName }} {{ user.lastName }}</h4>
          <span 
            class="badge text-uppercase"
            :class="{
              'bg-primary-subtle text-primary': user.role === 'admin',
              'bg-info-subtle text-info': user.role === 'agent',
              'bg-secondary-subtle text-secondary': user.role === 'client'
            }"
          >
            {{ user.role }}
          </span>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-primary me-2" @click="openEditModal">
          <i class="bi bi-pencil me-2"></i>Modifier profil
        </button>
        <button class="btn btn-outline-danger">
          <i class="bi bi-slash-circle me-2"></i>Désactiver
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Sidebar Info -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent py-3">
            <h5 class="card-title mb-0">Coordonnées</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">Email</label>
              <a :href="`mailto:${user.email}`" class="fw-medium">{{ user.email }}</a>
            </div>
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">Téléphone</label>
              <a :href="`tel:${user.phone}`" class="fw-medium">{{ user.phone || 'Non renseigné' }}</a>
            </div>
            <div class="mb-3">
              <label class="text-muted small d-block mb-1">Localisation</label>
              <p class="mb-0">{{ user.city }}, {{ user.country }}</p>
            </div>
            <div class="mb-0">
              <label class="text-muted small d-block mb-1">Inscrit le</label>
              <p class="mb-0">{{ formatDate(user.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="row g-3">
          <div class="col-6">
            <div class="card border-0 shadow-sm text-center p-3">
              <div class="h4 mb-0">{{ userRequests.length }}</div>
              <small class="text-muted">Demandes</small>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm text-center p-3">
              <div class="h4 mb-0">{{ userShipments.length }}</div>
              <small class="text-muted">Expéditions</small>
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
                  Demandes Shopping
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link py-3 px-4 border-0 border-bottom border-2" data-bs-toggle="tab" data-bs-target="#user-shipments">
                  Expéditions
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
                        <th class="ps-4">Demande</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th class="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="userRequests.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">Aucune demande</td>
                      </tr>
                      <tr v-for="req in userRequests" :key="req.id">
                        <td class="ps-4">
                          <div class="fw-medium">{{ req.title }}</div>
                          <small class="text-muted">{{ req.category }}</small>
                        </td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(req.status)">
                            {{ req.status }}
                          </span>
                        </td>
                        <td>{{ formatDateShort(req.createdAt) }}</td>
                        <td class="text-end pe-4">
                          <NuxtLink :to="`/admin/requests/${req.id}`" class="btn btn-sm btn-outline-primary">Détails</NuxtLink>
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
                        <th>Destinataire</th>
                        <th>Statut</th>
                        <th class="text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="userShipments.length === 0">
                        <td colspan="4" class="text-center py-4 text-muted">Aucune expédition</td>
                      </tr>
                      <tr v-for="ship in userShipments" :key="ship.id">
                        <td class="ps-4">
                          <code>{{ ship.trackingNumber }}</code>
                        </td>
                        <td>{{ ship.destinationCity }}, {{ ship.destinationCountry }}</td>
                        <td>
                          <span class="badge" :style="{ backgroundColor: formatShipmentStatus(ship.status).color, color: '#fff' }">
                            {{ formatShipmentStatus(ship.status).label }}
                          </span>
                        </td>
                        <td class="text-end pe-4">
                          <NuxtLink :to="`/admin/shipments/${ship.trackingNumber}`" class="btn btn-sm btn-outline-primary">Suivre</NuxtLink>
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
            <h5 class="modal-title">Modifier le profil</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Prénom</label>
                  <input v-model="editForm.firstName" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom</label>
                  <input v-model="editForm.lastName" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input v-model="editForm.email" type="email" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Téléphone</label>
                  <input v-model="editForm.phone" type="tel" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">Ville</label>
                  <input v-model="editForm.city" type="text" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">Pays *</label>
                  <select v-model="editForm.country" class="form-select" required>
                    <option value="">Sélectionnez un pays</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { FAKE_USERS } from '~/utils/data/fakeData'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { formatDate, formatDateShort, formatShipmentStatus } = useFormatters()

const id = route.params.id as string

const user = computed(() => FAKE_USERS.find(u => u.id === id))

const userRequests = computed(() => psStore.requests.filter(r => r.userId === id))
const userShipments = computed(() => shippingStore.shipments.filter(s => s.userId === id))

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: ''
})

const countries = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
  'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi',
  'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo', 'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba',
  'Danemark', 'Djibouti', 'Dominique',
  'Égypte', 'Émirats Arabes Unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini', 'États-Unis', 'Éthiopie',
  'Fidji', 'Finlande', 'France',
  'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée-Bissau', 'Guinée Équatoriale', 'Guyana',
  'Haïti', 'Honduras', 'Hongrie',
  'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande', 'Israël', 'Italie',
  'Jamaïque', 'Japon', 'Jordanie',
  'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït',
  'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg',
  'Macédoine du Nord', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Maurice', 'Mauritanie', 'Mexique', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique',
  'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande',
  'Oman', 'Ouganda', 'Ouzbékistan',
  'Pakistan', 'Palaos', 'Palestine', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal',
  'Qatar',
  'République Centrafricaine', 'République Démocratique du Congo', 'République Dominicaine', 'République Tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  'Saint-Marin', 'Sainte-Lucie', 'Salvador', 'Samoa', 'São Tomé-et-Príncipe', 'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie',
  'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor Oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu',
  'Ukraine', 'Uruguay',
  'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam',
  'Yémen',
  'Zambie', 'Zimbabwe'
]

onMounted(async () => {
  if (psStore.requests.length === 0) await psStore.fetchRequests()
  if (shippingStore.shipments.length === 0) await shippingStore.fetchShipments()
  
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openEditModal = () => {
  if (user.value) {
    editForm.firstName = user.value.firstName
    editForm.lastName = user.value.lastName
    editForm.email = user.value.email
    editForm.phone = user.value.phone || ''
    editForm.city = user.value.city || ''
    editForm.country = user.value.country || ''
  }
  modalInstance?.show()
}

const saveUser = () => {
  // In a real app, this would call an API to update the user
  // For now, we'll just update the FAKE_USERS array
  const userIndex = FAKE_USERS.findIndex(u => u.id === id)
  if (userIndex !== -1) {
    FAKE_USERS[userIndex] = {
      ...FAKE_USERS[userIndex],
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone,
      city: editForm.city,
      country: editForm.country
    }
  }
  modalInstance?.hide()
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-warning-subtle text-warning',
    searching: 'bg-info-subtle text-info',
    negotiating: 'bg-primary-subtle text-primary',
    confirmed: 'bg-success-subtle text-success',
    shipped: 'bg-dark-subtle text-dark',
    delivered: 'bg-success text-white'
  }
  return classes[status] || 'bg-secondary-subtle'
}
</script>

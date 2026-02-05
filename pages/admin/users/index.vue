<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des utilisateurs</h4>
        <p class="text-muted mb-0">{{ users.length }} utilisateurs au total</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-person-plus me-2"></i>Nouvel utilisateur
      </button>
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
              placeholder="Nom, email, téléphone..."
            />
          </div>
          <div class="col-md-3">
            <select v-model="filters.role" class="form-select">
              <option value="">Tous les rôles</option>
              <option value="client">Client</option>
              <option value="admin">Administrateur</option>
              <option value="agent">Agent (Chine)</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
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
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  Aucun utilisateur trouvé
                </td>
              </tr>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <NuxtLink :to="`/admin/users/${user.id}`" class="d-flex align-items-center text-decoration-none text-dark">
                    <img 
                      :src="user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`" 
                      class="rounded-circle me-3" 
                      width="40" 
                      height="40"
                    />
                    <div>
                      <div class="fw-medium">{{ user.firstName }} {{ user.lastName }}</div>
                      <small class="text-muted">{{ user.email }}</small>
                    </div>
                  </NuxtLink>
                </td>
                <td>
                  <span 
                    class="badge"
                    :class="{
                      'bg-primary-subtle text-primary': user.role === 'admin',
                      'bg-info-subtle text-info': user.role === 'agent',
                      'bg-secondary-subtle text-secondary': user.role === 'client'
                    }"
                  >
                    {{ user.role.toUpperCase() }}
                  </span>
                </td>
                <td>
                  <div class="small">{{ user.phone || '-' }}</div>
                </td>
                <td>
                  <div class="small">{{ user.city }}, {{ user.country }}</div>
                </td>
                <td>
                  <small>{{ user.createdAt || '-' }}</small>
                </td>
                <td>
                  <span class="badge bg-success-subtle text-success">Actif</span>
                </td>
                <td>
                  <div class="d-flex">
                    <button class="btn btn-outline-info btn-sm me-2" title="Modifier" @click="openModal(user)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Désactiver">
                      <i class="bi bi-slash-circle"></i>
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
          :total-items="filteredUsers.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="userModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser ? 'Modifier' : 'Nouvel' }} utilisateur</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Prénom *</label>
                  <input v-model="form.firstName" type="text" class="form-control input-md" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom *</label>
                  <input v-model="form.lastName" type="text" class="form-control input-md" required />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Email *</label>
                  <input v-model="form.email" type="email" class="form-control input-md" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rôle *</label>
                  <select v-model="form.role" class="form-select input-md" required>
                    <option value="client">Client</option>
                    <option value="admin">Administrateur</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Téléphone</label>
                  <input v-model="form.phone" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Pays</label>
                  <select v-model="form.country" class="form-select">
                    <option v-for="country in countries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ville</label>
                  <input v-model="form.city" type="text" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md">
                <i class="bi bi-check-lg me-2"></i>{{ editingUser ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { FAKE_USERS } from '~/utils/data/fakeData'

definePageMeta({
  layout: 'admin'
})

const users = ref(FAKE_USERS)
const currentPage = ref(1)
const perPage = ref(10)

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingUser = ref<any>(null)
const form = reactive<any>({
  firstName: '',
  lastName: '',
  email: '',
  role: 'client',
  phone: '',
  country: 'Côte d\'Ivoire',
  city: 'Abidjan'
})

const countries = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola',
  'Antigua-et-Barbuda', 'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche',
  'Azerbaïdjan', 'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin',
  'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil',
  'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert',
  'Centrafrique', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo', 'Corée du Nord',
  'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti',
  'Dominique', 'Égypte', 'Émirats Arabes Unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie',
  'Eswatini', 'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon', 'Gambie',
  'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée-Bissau',
  'Guinée Équatoriale', 'Guyana', 'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak',
  'Iran', 'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie',
  'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït', 'Laos', 'Lesotho', 'Lettonie',
  'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg', 'Macédoine du Nord',
  'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Marshall',
  'Maurice', 'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie',
  'Monténégro', 'Mozambique', 'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigeria',
  'Norvège', 'Nouvelle-Zélande', 'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palaos',
  'Palestine', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou',
  'Philippines', 'Pologne', 'Portugal', 'Qatar', 'République Démocratique du Congo',
  'République Dominicaine', 'République Tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  'Saint-Christophe-et-Niévès', 'Sainte-Lucie', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines',
  'Salomon', 'Salvador', 'Samoa', 'São Tomé-et-Príncipe', 'Sénégal', 'Serbie', 'Seychelles',
  'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud',
  'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad',
  'Thaïlande', 'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan',
  'Turquie', 'Tuvalu', 'Ukraine', 'Uruguay', 'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam',
  'Yémen', 'Zambie', 'Zimbabwe'
]


onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (user?: any) => {
  if (user) {
    editingUser.value = user
    form.firstName = user.firstName
    form.lastName = user.lastName
    form.email = user.email
    form.role = user.role
    form.phone = user.phone || ''
    form.country = user.country
    form.city = user.city
  } else {
    editingUser.value = null
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.role = 'client'
    form.phone = ''
    form.country = 'Côte d\'Ivoire'
    form.city = 'Abidjan'
  }
  modalInstance?.show()
}

const saveUser = () => {
  if (editingUser.value) {
    const idx = users.value.findIndex(u => u.id === editingUser.value.id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...form }
    }
  } else {
    users.value.push({
      id: `usr_${Date.now()}`,
      createdAt: new Date().toLocaleDateString(),
      ...form
    } as any)
  }
  modalInstance?.hide()
}

const filters = reactive({
  search: '',
  role: '',
  status: ''
})

const filteredUsers = computed(() => {
  let list = [...users.value]

  if (filters.search) {
    const search = filters.search.toLowerCase()
    list = list.filter(u => 
      u.firstName.toLowerCase().includes(search) ||
      u.lastName.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.phone?.includes(search)
    )
  }

  if (filters.role) {
    list = list.filter(u => u.role === filters.role)
  }

  return list
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredUsers.value.slice(start, start + perPage.value)
})

const resetFilters = () => {
  filters.search = ''
  filters.role = ''
  filters.status = ''
  currentPage.value = 1
}
</script>

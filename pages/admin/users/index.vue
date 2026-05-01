<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des utilisateurs</h4>
        <p class="text-muted mb-0">{{ usersStore.total }} utilisateurs au total</p>
      </div>
      <button v-can="['create', 'users']" class="btn btn-primary" @click="openModal()">
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
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-3">
            <select v-model="filters.role" class="form-select" @change="fetchUsers(1)">
              <option value="">Tous les rôles</option>
              <option v-for="role in rolesStore.roles" :key="role.role.uuid" :value="role.role.code">
                {{ role.role.libelle }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="fetchUsers(1)">
              <option value="">Tous les statuts</option>
              <option value="1">Actif</option>
              <option value="0">Inactif</option>
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
    <div class="card border-0 shadow-sm overflow-hidden">
      <div v-if="usersStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Chargement des utilisateurs...</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>Inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usersStore.users.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  Aucun utilisateur trouvé
                </td>
              </tr>
              <tr v-for="user in usersStore.users" :key="user.uuid">
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      :src="getUserAvatar(user)" 
                      class="rounded-circle me-3 border" 
                      width="40" 
                      height="40"
                    />
                    <div>
                      <div class="fw-medium text-dark">{{ user.firstname }} {{ user.lastname }}</div>
                      <small class="text-muted d-block">{{ user.email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    class="badge"
                    :class="getRoleBadgeClass(user.role?.code)"
                  >
                    {{ user.role?.label || 'Utilisateur' }}
                  </span>
                </td>
                <td>
                  <div class="small fw-medium">{{ user.phone || '-' }}</div>
                </td>
                <td>
                  <div class="small text-muted">{{ (user.city || user.country) ? `${user.city || ''} ${user.country || ''}`.trim() : '-' }}</div>
                </td>
                <td>
                  <small class="text-muted">{{ formatDate(user.created_at) }}</small>
                </td>
                <td>
                  <span class="badge rounded-pill" :class="user.status === 1 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ user.status === 1 ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex">
                    <button v-can="['update', 'users']" class="btn btn-sm btn-icon btn-outline-info me-2" @click="openModal(user)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button v-can="['delete', 'users']" class="btn btn-sm btn-icon btn-outline-danger" @click="handleDelete(user)">
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
          v-model:current-page="usersStore.currentPage"
          v-model:limit="usersStore.perPage"
          :total-items="usersStore.total"
          @update:current-page="(p: number) => fetchUsers(p)"
          @update:limit="(l: number) => fetchUsers(1, l)"
        />
      </div>
    </div>

    <!-- Modal User -->
    <div class="modal fade shadow" id="userModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-bottom-0 pt-4 px-4">
            <h5 class="modal-title fw-bold">
              {{ editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="modal-body p-4">
              <div class="row g-4">
                <!-- Photo Upload -->
                <div class="col-12 text-center mb-2">
                  <div class="position-relative d-inline-block">
                    <img 
                      :src="previewAvatar || getUserAvatar(editingUser)" 
                      class="rounded-circle border p-1" 
                      width="100" 
                      height="100"
                      style="object-fit: cover"
                    />
                    <label class="btn btn-sm btn-light btn-icon rounded-circle shadow-sm position-absolute bottom-0 end-0">
                      <i class="bi bi-camera"></i>
                      <input type="file" hidden accept="image/*" @change="onFileChange" />
                    </label>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Prénom *</label>
                  <input v-model="form.firstname" type="text" class="form-control" required placeholder="Ex: Jean" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Nom *</label>
                  <input v-model="form.lastname" type="text" class="form-control" required placeholder="Ex: Dupont" />
                </div>
                <div class="col-md-12">
                  <label class="form-label fw-medium small text-uppercase">Email *</label>
                  <input v-model="form.email" type="email" class="form-control" required placeholder="email@exemple.com" />
                </div>
                
                <div v-if="!editingUser" class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Mot de passe *</label>
                  <input v-model="form.password" type="password" class="form-control" required />
                </div>
                <div v-if="!editingUser" class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Confirmer le mot de passe *</label>
                  <input v-model="form.password_confirmation" type="password" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Rôle / Profil *</label>
                  <select v-model="form.role_uuid" class="form-select" required>
                    <option v-for="role in rolesStore.roles" :key="role.role.uuid" :value="role.role.uuid">
                      {{ role.role.libelle }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Téléphone</label>
                  <input v-model="form.phone" type="text" class="form-control" placeholder="+225..." />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Status</label>
                  <select v-model="form.status" class="form-select">
                    <option :value="1">Actif</option>
                    <option :value="0">Inactif</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-uppercase">Sexe</label>
                  <select v-model="form.sex" class="form-select">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top-0 pb-4 px-4">
              <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const { success, error } = useNotification()

// State
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const editingUser = ref<any>(null)
const submitting = ref(false)
const previewAvatar = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const filters = reactive({
  search: '',
  role: '',
  status: ''
})

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  role_uuid: '',
  status: 1,
  sex: 'M',
  country: '',
  city: ''
})

// Methods
const fetchUsers = async (page?: number, limit?: number) => {
  await usersStore.fetchUsers({
    page: page ?? usersStore.currentPage,
    limit: limit ?? usersStore.perPage,
    search: filters.search,
    role: filters.role,
    status: filters.status
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchUsers(1), 500)
}

const resetFilters = () => {
  filters.search = ''
  filters.role = ''
  filters.status = ''
  fetchUsers(1)
}

const openModal = (user?: any) => {
  previewAvatar.value = null
  selectedFile.value = null
  
  if (user) {
    editingUser.value = user
    Object.assign(form, {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone || '',
      role_uuid: user.role?.uuid,
      status: user.status,
      sex: user.sex || 'M',
      country: user.country || '',
      city: user.city || '',
      password: '',
      password_confirmation: ''
    })
  } else {
    editingUser.value = null
    resetForm()
  }
  modalInstance?.show()
}

const resetForm = () => {
  Object.assign(form, {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role_uuid: rolesStore.roles[0]?.role.uuid || '',
    status: 1,
    sex: 'M',
    country: '',
    city: ''
  })
}

const onFileChange = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    previewAvatar.value = URL.createObjectURL(file)
  }
}

const handleSave = async () => {
  // Vérification mot de passe côté client
  if (form.password || !editingUser.value) {
    if (form.password !== form.password_confirmation) {
      error('Les mots de passe ne correspondent pas')
      return
    }
    if (form.password && form.password.length < 8) {
      error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
  }

  if (!form.role_uuid) {
    error('Veuillez sélectionner un rôle')
    return
  }

  submitting.value = true
  try {
    const payload: any = { ...form }
    if (selectedFile.value) {
      payload.picture = selectedFile.value
    }

    if (editingUser.value) {
      if (!payload.password) {
        delete payload.password
        delete payload.password_confirmation
      }
      await usersStore.updateUser(editingUser.value.uuid, payload)
      success('Utilisateur mis à jour avec succès')
    } else {
      await usersStore.createUser(payload)
      success('Utilisateur créé avec succès')
    }
    modalInstance?.hide()
    await fetchUsers(usersStore.currentPage)
  } catch (err: any) {
    error(err.message || 'Une erreur est survenue')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (user: any) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstname} ${user.lastname} ?`)) {
    try {
      await usersStore.deleteUser(user.uuid)
      success('Utilisateur supprimé')
    } catch (err: any) {
      error(err.message)
    }
  }
}

// Helpers
const getUserAvatar = (user: any) => {
  if (user?.picture_url) {
    return /^https?:\/\//i.test(user.picture_url)
      ? user.picture_url
      : `${config.public.apiBase.replace('/api', '')}${user.picture_url}`
  }
  if (user?.picture) return `${config.public.apiBase.replace('/api', '')}/storage/${user.picture}`
  return `https://ui-avatars.com/api/?name=${user?.firstname || 'U'}+${user?.lastname || 'U'}&background=random&color=fff`
}

const getRoleBadgeClass = (code?: string) => {
  switch (code?.toLowerCase()) {
    case 'admin': return 'bg-primary-subtle text-primary'
    case 'agent': return 'bg-info-subtle text-info'
    case 'client': return 'bg-secondary-subtle text-secondary'
    default: return 'bg-light text-dark'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
  
  await Promise.all([
    rolesStore.fetchRoles(),
    fetchUsers(1)
  ])
})

onUnmounted(() => {
  if (previewAvatar.value) URL.revokeObjectURL(previewAvatar.value)
})
</script>

<style scoped>
.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
</style>

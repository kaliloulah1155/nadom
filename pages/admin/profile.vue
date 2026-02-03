<template>
  <div>
    <div class="mb-4">
      <h4 class="mb-1">Mon profil</h4>
      <p class="text-muted">Gérez vos informations personnelles et votre mot de passe</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm text-center py-4">
          <div class="card-body">
            <div class="position-relative d-inline-block mb-3">
              <img
                :src="authStore.currentUser?.avatar || 'https://ui-avatars.com/api/?name=Admin'"
                class="rounded-circle"
                width="120"
                height="120"
                alt="Avatar"
              />
              <button class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle">
                <i class="bi bi-camera"></i>
              </button>
            </div>
            <h5>{{ authStore.userFullName }}</h5>
            <p class="text-muted small mb-3">{{ authStore.currentUser?.email }}</p>
            <span class="badge bg-primary-subtle text-primary">Administrateur</span>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h5 class="card-title mb-4">Informations personnelles</h5>
            <form @submit.prevent="updateProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Prénom</label>
                  <input v-model="form.firstName" type="text" class="form-control input-md" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nom</label>
                  <input v-model="form.lastName" type="text" class="form-control input-md" />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control input-md" />
                </div>
                <hr class="my-4">
                <h5 class="card-title mb-3">Changer le mot de passe</h5>
                <div class="col-md-6">
                  <label class="form-label">Nouveau mot de passe</label>
                  <input v-model="form.password" type="password" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Confirmer le mot de passe</label>
                  <input v-model="form.confirmPassword" type="password" class="form-control" />
                </div>
                <div class="col-12 mt-4 text-end">
                  <button type="submit" class="btn btn-primary btn-md px-4">
                    <i class="bi bi-check-lg me-2"></i>Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const authStore = useAuthStore()
const { success } = useNotification()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  if (authStore.currentUser) {
    form.firstName = authStore.currentUser.firstName
    form.lastName = authStore.currentUser.lastName
    form.email = authStore.currentUser.email
  }
})

const updateProfile = () => {
  // Mock update
  if (form.password && form.password !== form.confirmPassword) {
    return
  }
  success('Profil mis à jour avec succès')
}
</script>

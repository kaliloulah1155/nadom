<template>
  <div class="auth-page min-vh-100 d-flex align-items-center py-5">
    <div class="auth-pattern"></div>
    <div class="container position-relative">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card border-0 shadow-lg overflow-hidden">
            <div class="row g-0">
              <!-- Left Side - Image -->
              <div class="col-lg-6 d-none d-lg-block auth-image">
                <div class="auth-image-content">
                  <div class="mb-4">
                    <img src="~/assets/img/logo-light.svg" alt="NADOM" height="50" />
                  </div>
                  <h3 class="text-white mb-3">{{ locale === 'fr' ? 'Bienvenue sur NADOM' : 'Welcome to NADOM' }}</h3>
                  <p class="text-white opacity-75">
                    {{ locale === 'fr' ? 'Votre partenaire de confiance pour l\'import-export avec la Chine.' : 'Your trusted partner for import-export with China.' }}
                  </p>
                  <div class="mt-4">
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ locale === 'fr' ? 'Personal Shopping' : 'Personal Shopping' }}</span>
                    </div>
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ locale === 'fr' ? 'Expedition securisee' : 'Secure shipping' }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ locale === 'fr' ? 'Suivi en temps reel' : 'Real-time tracking' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Side - Forms -->
              <div class="col-lg-6">
                <div class="card-body p-4 p-lg-5">
                  <!-- Mobile Logo -->
                  <div class="text-center mb-4 d-lg-none">
                    <NuxtLink to="/">
                      <img src="~/assets/img/logo.svg" alt="NADOM" height="40" />
                    </NuxtLink>
                  </div>

                  <!-- Tabs -->
                  <ul class="nav nav-pills nav-fill mb-4" role="tablist">
                    <li class="nav-item">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'client' }"
                        @click="activeTab = 'client'"
                      >
                        <i class="bi bi-person me-2"></i>{{ t('auth.clientAccess') }}
                      </button>
                    </li>
                    <li class="nav-item">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'admin' }"
                        @click="activeTab = 'admin'"
                      >
                        <i class="bi bi-shield-lock me-2"></i>{{ t('auth.adminLogin') }}
                      </button>
                    </li>
                  </ul>

                  <!-- Client Access Tab -->
                  <div v-if="activeTab === 'client'">
                    <div class="text-center mb-4">
                      <div class="client-icon mb-3">
                        <i class="bi bi-box-seam"></i>
                      </div>
                      <h5>{{ locale === 'fr' ? 'Suivez votre commande' : 'Track your order' }}</h5>
                      <p class="text-muted small">
                        {{ locale === 'fr' ? 'Entrez votre code de suivi pour acceder a vos demandes et colis' : 'Enter your tracking code to access your requests and packages' }}
                      </p>
                    </div>

                    <form @submit.prevent="handleClientAccess">
                      <div class="mb-4">
                        <label class="form-label">{{ t('auth.trackingCode') }}</label>
                        <div class="input-group input-group-lg">
                          <span class="input-group-text bg-light">
                            <i class="bi bi-upc-scan"></i>
                          </span>
                          <input
                            v-model="clientCode"
                            type="text"
                            class="form-control"
                            :placeholder="locale === 'fr' ? 'Ex: TRK-2024-001234 ou REQ-001234' : 'E.g., TRK-2024-001234 or REQ-001234'"
                            required
                          />
                        </div>
                        <small class="text-muted">
                          {{ locale === 'fr' ? 'Numero de suivi colis ou numero de demande' : 'Package tracking number or request number' }}
                        </small>
                      </div>

                      <button
                        type="submit"
                        class="btn btn-primary btn-lg w-100"
                        :disabled="clientLoading"
                      >
                        <span v-if="clientLoading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ t('auth.accessMyRequests') }}
                      </button>
                    </form>

                    <div class="text-center mt-4">
                      <p class="text-muted small mb-2">{{ locale === 'fr' ? 'Pas de code ?' : 'No code?' }}</p>
                      <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-plus-circle me-1"></i>{{ t('personalShopping.newRequest') }}
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Admin Login Tab -->
                  <div v-if="activeTab === 'admin'">
                    <div class="alert alert-warning border-0 mb-4">
                      <div class="d-flex">
                        <i class="bi bi-shield-exclamation me-2"></i>
                        <small>{{ t('auth.adminOnly') }}</small>
                      </div>
                    </div>

                    <!-- Error Alert -->
                    <div v-if="error" class="alert alert-danger" role="alert">
                      {{ error }}
                    </div>

                    <!-- Admin Login Form -->
                    <form @submit.prevent="handleAdminLogin">
                      <div class="mb-3">
                        <label class="form-label">{{ t('auth.email') }}</label>
                        <input
                          v-model="form.email"
                          type="email"
                          class="form-control form-control-lg"
                          :class="{ 'is-invalid': errors.email }"
                          placeholder="admin@nadom.com"
                          required
                        />
                        <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                      </div>

                      <div class="mb-4">
                        <label class="form-label">{{ t('auth.password') }}</label>
                        <input
                          v-model="form.password"
                          type="password"
                          class="form-control form-control-lg"
                          :class="{ 'is-invalid': errors.password }"
                          :placeholder="locale === 'fr' ? 'Votre mot de passe' : 'Your password'"
                          required
                        />
                        <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
                      </div>

                      <button
                        type="submit"
                        class="btn btn-dark btn-lg w-100"
                        :disabled="loading"
                      >
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ loading ? t('common.loading') : t('auth.login') }}
                      </button>
                    </form>

                    <!-- Demo Account -->
                    <div class="mt-4 p-3 bg-light rounded">
                      <p class="small text-muted mb-1"><strong>{{ locale === 'fr' ? 'Compte demo :' : 'Demo account:' }}</strong></p>
                      <div class="small text-muted">admin@example.com / admin123</div>
                    </div>
                  </div>

                  <!-- Back to Home -->
                  <div class="text-center mt-4 pt-3 border-top">
                    <NuxtLink to="/" class="text-muted small">
                      <i class="bi bi-arrow-left me-1"></i>{{ locale === 'fr' ? 'Retour a l\'accueil' : 'Back to home' }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { success, error: notifyError } = useNotification()

// State
const activeTab = ref<'client' | 'admin'>('client')
const clientCode = ref('')
const clientLoading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

// Client Access
const handleClientAccess = () => {
  if (!clientCode.value.trim()) return

  clientLoading.value = true

  // Check if it's a tracking number or request ID
  const code = clientCode.value.trim()

  setTimeout(() => {
    clientLoading.value = false

    if (code.startsWith('TRK-')) {
      router.push(`/import-export/tracking?tracking=${code}`)
    } else if (code.startsWith('REQ-') || code.startsWith('req_')) {
      router.push(`/personal-shopping/${code}`)
    } else {
      // Try tracking first
      router.push(`/import-export/tracking?tracking=${code}`)
    }
  }, 500)
}

// Admin Login
const validateForm = () => {
  errors.email = ''
  errors.password = ''

  const msgs = locale.value === 'fr' ? {
    emailRequired: 'L\'email est requis',
    emailInvalid: 'Email invalide',
    passwordRequired: 'Le mot de passe est requis',
    passwordShort: 'Le mot de passe doit contenir au moins 6 caracteres'
  } : {
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email',
    passwordRequired: 'Password is required',
    passwordShort: 'Password must be at least 6 characters'
  }

  if (!form.email) {
    errors.email = msgs.emailRequired
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = msgs.emailInvalid
  }

  if (!form.password) {
    errors.password = msgs.passwordRequired
  } else if (form.password.length < 6) {
    errors.password = msgs.passwordShort
  }

  return !errors.email && !errors.password
}

const handleAdminLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''

  try {
    const user = await authStore.login(form.email, form.password)

    if (user.role !== 'admin') {
      error.value = locale.value === 'fr' ? 'Acces reserve aux administrateurs' : 'Admin access only'
      await authStore.logout()
      return
    }

    success(locale.value === 'fr' ? 'Connexion reussie !' : 'Login successful!')
    router.push('/admin/dashboard')
  } catch (err: any) {
    error.value = err.message || (locale.value === 'fr' ? 'Erreur lors de la connexion' : 'Login error')
    notifyError(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  position: relative;
}

.auth-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.auth-image {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  position: relative;
}

.auth-image-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.client-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto;
}

.nav-pills .nav-link {
  color: #64748b;
  border-radius: 8px;
  padding: 12px 20px;
}

.nav-pills .nav-link.active {
  background: var(--bs-primary);
  color: white;
}
</style>

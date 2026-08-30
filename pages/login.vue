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
                    <img :src="config.public.logo" :alt="config.public.siteName" height="50" />
                  </div>
                  <h3 class="text-white mb-3">{{ t('auth.welcome') }}</h3>
                  <p class="text-white opacity-75">
                    {{ t('auth.welcomeSubtitle') }}
                  </p>
                  <div class="mt-4">
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ t('auth.personalShoppingFeature') }}</span>
                    </div>
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ t('auth.secureShipping') }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-check-circle-fill text-success me-2"></i>
                      <span class="text-white">{{ t('tracking.realTimeTracking') }}</span>
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
                      <img :src="config.public.logo" :alt="config.public.siteName" height="40" />
                    </NuxtLink>
                  </div>

                  <div class="text-center mb-4">
                    <h5>{{ t('auth.login') }}</h5>
                    <p class="text-muted small">
                      {{ t('auth.loginHint') }}
                    </p>
                  </div>

                  <!-- Error Alert -->
                  <div v-if="error" class="alert alert-danger" role="alert">
                    {{ error }}
                  </div>

                  <!-- Login Form -->
                  <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                      <label class="form-label">{{ t('auth.emailOrPhone') }}</label>
                      <input
                        v-model="form.identifier"
                        type="text"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': errors.identifier }"
                        :placeholder="t('auth.emailOrPhonePlaceholder')"
                        required
                        autocomplete="username"
                      />
                      <div v-if="errors.identifier" class="invalid-feedback">{{ errors.identifier }}</div>
                    </div>

                    <div class="mb-4">
                      <label class="form-label">{{ t('auth.password') }}</label>
                      <div class="input-group input-group-lg has-validation">
                        <input
                          v-model="form.password"
                          :type="showPassword ? 'text' : 'password'"
                          class="form-control"
                          :class="{ 'is-invalid': errors.password }"
                          :placeholder="t('auth.passwordPlaceholder')"
                          required
                          autocomplete="current-password"
                        />
                        <button
                          type="button"
                          class="btn btn-outline-secondary password-toggle-btn"
                          :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                          :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                          @click="showPassword = !showPassword"
                        >
                          <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'" aria-hidden="true"></i>
                        </button>
                        <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
                      </div>
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

                  <div class="text-center mt-4">
                    <p class="text-muted small mb-2">{{ t('auth.noAccountYet') }}</p>
                    <NuxtLink to="/register" class="btn btn-primary btn-sm mb-2">
                      <i class="bi bi-person-plus me-1"></i>{{ t('nav.register') }}
                    </NuxtLink>
                    <div class="mt-2">
                      <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-plus-circle me-1"></i>{{ t('personalShopping.newRequest') }}
                      </NuxtLink>
                      <span class="mx-2 text-muted">·</span>
                      <NuxtLink to="/import-export/tracking" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-upc-scan me-1"></i>{{ t('auth.trackWithoutAccount') }}
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Back to Home -->
                  <div class="text-center mt-4 pt-3 border-top">
                    <NuxtLink to="/" class="text-muted small">
                      <i class="bi bi-arrow-left me-1"></i>{{ t('auth.backHome') }}
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
  layout: 'default',
  middleware: ['guest']
})

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { success, error: notifyError } = useNotification()
const config = useRuntimeConfig()
// State
const form = reactive({
  identifier: '',
  password: ''
})

const errors = reactive({
  identifier: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const validateForm = () => {
  errors.identifier = ''
  errors.password = ''

  if (!form.identifier.trim()) {
    errors.identifier = t('auth.emailOrPhoneRequired')
  }

  if (!form.password) {
    errors.password = t('auth.passwordRequired')
  } else if (form.password.length < 8) {
    errors.password = t('auth.passwordShort')
  }

  return !errors.identifier && !errors.password
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''

  const identifier = form.identifier.trim()
  const credentials = identifier.includes('@')
    ? { email: identifier, password: form.password }
    : { phone: identifier, password: form.password }

  try {
    await authStore.login(credentials)
    success(t('auth.loginSuccess'))
    router.push(authStore.hasBackofficeAccess ? '/admin/dashboard' : '/dashboard')
  } catch (err: any) {
    error.value = err.message || t('auth.loginError')
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
  text-align: center;
}

.auth-image-content {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.password-toggle-btn {
  border-color: #dee2e6;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.password-toggle-btn:hover,
.password-toggle-btn:focus {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
}
</style>

<template>
  <div>
    <section
      class="bg-cover position-relative"
      :style="{ backgroundImage: `url(${heroBg})`, backgroundRepeat: 'no-repeat' }"
      data-overlay="6"
    >
      <div class="container">
        <div class="row justify-content-center align-items-center">
          <div class="col-xl-7 col-lg-9 col-md-12">
            <div class="position-relative text-center mb-5 pt-lg-0 pt-5">
              <h1 class="text-light xl-heading">{{ t('auth.registerTitle') }}</h1>
              <p class="text-light opacity-90 mb-3">{{ t('auth.registerSubtitle') }}</p>
              <nav id="breadcrumbs" class="breadcrumbs light">
                <ul>
                  <li><NuxtLink to="/">{{ t('nav.home') }}</NuxtLink></li>
                  <li><span>{{ t('auth.registerTitle') }}</span></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-7 col-lg-8 col-md-10">
            <div class="contactForm">
              <div class="touch-block d-flex flex-column mb-4">
                <h2>{{ t('auth.registerTitle') }}</h2>
                <p class="mb-0">{{ t('auth.registerIntro') }}</p>
              </div>

              <div v-if="error" class="alert alert-danger rounded-4 mb-4" role="alert">
                {{ error }}
              </div>

              <ul class="nav nav-tabs register-tabs mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    type="button"
                    class="nav-link"
                    :class="{ active: activeTab === 'infos' }"
                    role="tab"
                    @click="activeTab = 'infos'"
                  >
                    {{ t('auth.tabInfos') }}
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    type="button"
                    class="nav-link"
                    :class="{ active: activeTab === 'password' }"
                    role="tab"
                    @click="goToPasswordTab"
                  >
                    {{ t('auth.tabPassword') }}
                  </button>
                </li>
              </ul>

              <form @submit.prevent="onSubmit">
                <!-- Tab Infos -->
                <div v-show="activeTab === 'infos'" class="tab-pane">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('clientArea.firstname') }} *</label>
                        <input
                          v-model="form.firstname"
                          type="text"
                          class="form-control bg-light"
                          :placeholder="t('auth.firstnamePlaceholder')"
                          required
                          autocomplete="given-name"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('clientArea.lastname') }} *</label>
                        <input
                          v-model="form.lastname"
                          type="text"
                          class="form-control bg-light"
                          :placeholder="t('auth.lastnamePlaceholder')"
                          required
                          autocomplete="family-name"
                        />
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('auth.email') }} *</label>
                        <input
                          v-model="form.email"
                          type="email"
                          class="form-control bg-light"
                          placeholder="name@example.com"
                          required
                          autocomplete="email"
                        />
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('clientArea.phone') }}</label>
                        <PhoneInput v-model="form.phone" country="ci" />
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('clientArea.country') }}</label>
                        <select
                          v-model="selectedCountryUuid"
                          class="form-select bg-light"
                          :disabled="countriesStore.loading"
                          @change="onCountryChange"
                        >
                          <option value="">
                            {{
                              countriesStore.loading
                                ? t('auth.loadingCountries')
                                : t('clientArea.selectCountry')
                            }}
                          </option>
                          <option
                            v-for="c in countriesList"
                            :key="c.uuid"
                            :value="c.uuid"
                          >
                            {{ c.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('clientArea.city') }}</label>
                        <input
                          v-model="form.city"
                          type="text"
                          class="form-control bg-light"
                          :placeholder="t('auth.cityPlaceholder')"
                          autocomplete="address-level2"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <p class="text-muted mb-0">
                      {{ t('auth.alreadyHaveAccount') }}
                      <NuxtLink to="/login" class="fw-medium text-primary">
                        {{ t('auth.loginHere') }}
                      </NuxtLink>
                    </p>
                    <button type="button" class="btn btn-primary fw-medium px-4" @click="goToPasswordTab">
                      {{ t('auth.nextTab') }}
                      <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>

                <!-- Tab Mot de passe -->
                <div v-show="activeTab === 'password'" class="tab-pane">
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('auth.password') }} *</label>
                        <div class="input-group">
                          <input
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            class="form-control bg-light"
                            :placeholder="t('auth.passwordMinPlaceholder')"
                            required
                            minlength="8"
                            autocomplete="new-password"
                          />
                          <button
                            type="button"
                            class="btn btn-outline-secondary"
                            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                            :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                            @click="showPassword = !showPassword"
                          >
                            <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-group form-border">
                        <label class="form-label">{{ t('auth.confirmPassword') }} *</label>
                        <div class="input-group">
                          <input
                            v-model="form.password_confirmation"
                            :type="showPasswordConfirm ? 'text' : 'password'"
                            class="form-control bg-light"
                            placeholder="*********"
                            required
                            minlength="8"
                            autocomplete="new-password"
                          />
                          <button
                            type="button"
                            class="btn btn-outline-secondary"
                            :aria-label="showPasswordConfirm ? t('auth.hidePassword') : t('auth.showPassword')"
                            :title="showPasswordConfirm ? t('auth.hidePassword') : t('auth.showPassword')"
                            @click="showPasswordConfirm = !showPasswordConfirm"
                          >
                            <i :class="showPasswordConfirm ? 'bi bi-eye' : 'bi bi-eye-slash'" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p
                    v-if="form.password !== form.password_confirmation && form.password_confirmation"
                    class="text-danger small mt-2 mb-0"
                  >
                    {{ t('auth.passwordsMismatch') }}
                  </p>

                  <div class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <button type="button" class="btn btn-outline-secondary fw-medium px-4" @click="activeTab = 'infos'">
                      <i class="bi bi-arrow-left me-1"></i>
                      {{ t('auth.prevTab') }}
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary fw-medium px-5"
                      :disabled="loading || form.password !== form.password_confirmation"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
                      {{ loading ? t('auth.creatingAccount') : t('auth.createAccount') }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PhoneInput from '~/components/PhoneInput.vue'
import heroBg from '@/assets/img/title-banner.jpg'
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCountriesStore } from '~/stores/countries'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'default',
  middleware: ['guest'],
})

const { t } = useI18n()
const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const router = useRouter()

const activeTab = ref<'infos' | 'password'>('infos')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const error = ref('')
const selectedCountryUuid = ref('')

const countriesList = computed(() => countriesStore.activeCountries)

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  password: '',
  password_confirmation: '',
})

const infosValides = () => {
  if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
    error.value = t('auth.infosRequired')
    return false
  }
  error.value = ''
  return true
}

const goToPasswordTab = () => {
  if (!infosValides()) {
    activeTab.value = 'infos'
    return
  }
  activeTab.value = 'password'
}

const onCountryChange = () => {
  const country = countriesStore.getByUuid(selectedCountryUuid.value)
  form.country = country?.label || ''
}

onMounted(async () => {
  await countriesStore.fetchAll()
  // Côte d'Ivoire par défaut (comme l'indicatif téléphone CI)
  const civ =
    countriesStore.getByCode('ci') ||
    countriesList.value.find((c) =>
      /c[oô]te\s*d['’]?\s*ivoire/i.test(c.label || '') ||
      /ivory\s*coast/i.test(c.label || '')
    )
  if (civ) {
    selectedCountryUuid.value = civ.uuid
    form.country = civ.label || ''
  }
})

const onSubmit = async () => {
  error.value = ''

  if (!infosValides()) {
    activeTab.value = 'infos'
    return
  }

  if (form.password !== form.password_confirmation) {
    error.value = t('auth.passwordsMismatch')
    activeTab.value = 'password'
    return
  }

  if (form.password.length < 8) {
    error.value = t('auth.passwordShort')
    activeTab.value = 'password'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      country: form.country || undefined,
      city: form.city || undefined,
    })

    router.push('/profile?registered=true')
  } catch (err: any) {
    error.value = err.message || t('auth.registerError')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-select.bg-light {
  height: 56px;
  font-size: 14px;
}

.form-group .input-group .form-control {
  height: 56px;
}

.form-group .input-group .btn {
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-color: var(--bs-border-color, #dee2e6);
}

.register-tabs {
  border-bottom: 2px solid #eee;
}

.register-tabs .nav-link {
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  color: #6c757d;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  background: transparent;
}

.register-tabs .nav-link:hover {
  color: #dc3545;
  border-color: transparent;
}

.register-tabs .nav-link.active {
  color: #dc3545;
  border-bottom-color: #dc3545;
  background: transparent;
}
</style>

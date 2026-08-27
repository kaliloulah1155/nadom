<template>
  <div class="profile-page">
          <div class="mb-4">
            <h2 class="mb-1">{{ t('clientArea.profileTitle') }}</h2>
            <p class="text-muted mb-0">{{ t('clientArea.profileSubtitle') }}</p>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form @submit.prevent="handleSave">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">{{ t('clientArea.firstname') }}</label>
                    <input v-model="form.firstname" type="text" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('clientArea.lastname') }}</label>
                    <input v-model="form.lastname" type="text" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('auth.email') }}</label>
                    <input :value="authStore.userEmail" type="email" class="form-control bg-light" readonly :title="t('clientArea.emailReadonly')" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('clientArea.phone') }}</label>
                    <input v-model="form.phone" type="text" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('clientArea.country') }}</label>
                    <select v-model="form.country" class="form-select">
                      <option value="">{{ t('clientArea.selectCountry') }}</option>
                      <option v-for="c in countriesList" :key="c.uuid" :value="c.label">{{ c.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('clientArea.city') }}</label>
                    <input v-model="form.city" type="text" class="form-control" />
                  </div>
                </div>

                <div class="mt-4">
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    {{ t('clientArea.saveChanges') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Changer le mot de passe -->
          <div class="card border-0 shadow-sm mt-4">
            <div class="card-body p-4">
              <h5 class="mb-3">{{ t('clientArea.changePassword') }}</h5>
              <form @submit.prevent="handleChangePassword">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">{{ t('clientArea.currentPassword') }}</label>
                    <div class="input-group">
                      <input v-model="pwdForm.current" :type="showPwd.current ? 'text' : 'password'" class="form-control" autocomplete="current-password" required />
                      <button type="button" class="btn btn-outline-secondary" tabindex="-1" @click="showPwd.current = !showPwd.current">
                        <i :class="showPwd.current ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">{{ t('clientArea.newPassword') }}</label>
                    <div class="input-group">
                      <input v-model="pwdForm.next" :type="showPwd.next ? 'text' : 'password'" class="form-control" autocomplete="new-password" minlength="8" required />
                      <button type="button" class="btn btn-outline-secondary" tabindex="-1" @click="showPwd.next = !showPwd.next">
                        <i :class="showPwd.next ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">{{ t('clientArea.confirmPassword') }}</label>
                    <div class="input-group">
                      <input v-model="pwdForm.confirm" :type="showPwd.confirm ? 'text' : 'password'" class="form-control" autocomplete="new-password" minlength="8" required />
                      <button type="button" class="btn btn-outline-secondary" tabindex="-1" @click="showPwd.confirm = !showPwd.confirm">
                        <i :class="showPwd.confirm ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="pwdError" class="text-danger small mt-2">{{ pwdError }}</div>
                <div class="mt-4">
                  <button type="submit" class="btn btn-outline-danger" :disabled="changingPwd">
                    <span v-if="changingPwd" class="spinner-border spinner-border-sm me-2"></span>
                    {{ t('clientArea.changePassword') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCountriesStore } from '~/stores/countries'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client-only']
})

const { t } = useI18n()
const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const { success, error: notifyError } = useNotification()

const countriesList = computed(() => countriesStore.activeCountries)

const saving = ref(false)
const form = reactive({
  firstname: '',
  lastname: '',
  phone: '',
  country: '',
  city: ''
})

onMounted(async () => {
  const u: any = authStore.currentUser
  if (u) {
    form.firstname = u.firstname || ''
    form.lastname = u.lastname || ''
    form.phone = u.phone || ''
    form.country = u.country || ''
    form.city = u.city || ''
  }
  await countriesStore.fetchAll()
})

const handleSave = async () => {
  saving.value = true
  try {
    await authStore.updateProfile({ ...form })
    success(t('clientArea.updateSuccess'))
  } catch (err: any) {
    notifyError(err?.message || t('clientArea.updateError'))
  } finally {
    saving.value = false
  }
}

const changingPwd = ref(false)
const pwdError = ref('')
const pwdForm = reactive({
  current: '',
  next: '',
  confirm: ''
})
const showPwd = reactive({
  current: false,
  next: false,
  confirm: false
})

const handleChangePassword = async () => {
  pwdError.value = ''

  if (pwdForm.next.length < 8) {
    pwdError.value = t('clientArea.passwordTooShort')
    return
  }
  if (pwdForm.next !== pwdForm.confirm) {
    pwdError.value = t('clientArea.passwordMismatch')
    return
  }

  changingPwd.value = true
  try {
    await authStore.changePassword({ current_password: pwdForm.current, new_password: pwdForm.next })
    success(t('clientArea.passwordChangedSuccess'))
    pwdForm.current = ''
    pwdForm.next = ''
    pwdForm.confirm = ''
  } catch (err: any) {
    pwdError.value = err?.message || t('clientArea.passwordChangeError')
  } finally {
    changingPwd.value = false
  }
}
</script>

<style scoped>
.profile-page {
  background: #f8fafc;
  min-height: 100vh;
}
</style>

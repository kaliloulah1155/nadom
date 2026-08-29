<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-6">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body p-5">
            <div v-if="loading" class="py-4">
              <div class="spinner-border text-primary mb-3"></div>
              <p class="text-muted mb-0">{{ t('paymentReturn.checking') }}</p>
            </div>

            <template v-else>
              <div
                class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                :class="iconWrapClass"
                style="width: 88px; height: 88px;"
              >
                <i class="bi" :class="iconClass" style="font-size: 2.5rem;"></i>
              </div>

              <h3 class="fw-bold mb-2">{{ title }}</h3>
              <p class="text-muted">{{ message }}</p>

              <div v-if="reference" class="bg-light rounded p-3 my-3 small text-start">
                <div class="d-flex justify-content-between"><span class="text-muted">{{ t('paymentReturn.reference') }}</span><strong>{{ reference }}</strong></div>
                <div v-if="amount" class="d-flex justify-content-between mt-1"><span class="text-muted">{{ t('paymentReturn.amount') }}</span><strong>{{ amount.toLocaleString(numberLocale) }} {{ currency }}</strong></div>
                <div v-if="paymentMethod" class="d-flex justify-content-between mt-1"><span class="text-muted">{{ t('paymentReturn.method') }}</span><strong>{{ paymentMethod }}</strong></div>
                <div class="d-flex justify-content-between mt-1"><span class="text-muted">{{ t('paymentReturn.status') }}</span><strong>{{ statusLabel }}</strong></div>
              </div>

              <div class="d-flex gap-2 justify-content-center mt-4 flex-wrap">
                <NuxtLink to="/" class="btn btn-outline-secondary">{{ t('nav.home') }}</NuxtLink>
                <button v-if="['paid', 'confirming'].includes(state) && reference" class="btn btn-success" @click="downloadReceipt(reference)">
                  <i class="bi bi-download me-1"></i>{{ t('paymentReturn.downloadReceipt') }}
                </button>
                <NuxtLink v-if="isAuthenticated && state !== 'failed'" to="/dashboard" class="btn btn-outline-primary">{{ t('paymentReturn.myOrders') }}</NuxtLink>
                <NuxtLink v-if="state === 'failed'" to="/" class="btn btn-primary">{{ t('paymentReturn.retry') }}</NuxtLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

const { t, locale } = useI18n()
const route = useRoute()
const api = useApi()
const { downloadReceipt } = usePayment()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const reference = computed(() => String(route.query.reference || route.query.ref || route.query.order_number || ''))
const redirectStatus = computed(() => String(route.query.status || '').toLowerCase())
const loading = ref(true)
const state = ref<'paid' | 'confirming' | 'pending' | 'failed'>('pending')
const amount = ref<number | null>(null)
const currency = ref('XOF')
const paymentMethod = ref<string | null>(null)
const statusLabel = ref('')

const numberLocale = computed(() => {
  const current = String(locale.value || '')
  if (current.startsWith('zh')) return 'zh-CN'
  if (current.startsWith('en')) return 'en-US'
  return 'fr-FR'
})

const title = computed(() => t(`paymentReturn.titles.${state.value}`))
const message = computed(() => t(`paymentReturn.messages.${state.value}`))

const iconClass = computed(() => ({ paid: 'bi-check-lg', confirming: 'bi-check-lg', pending: 'bi-hourglass-split', failed: 'bi-x-lg' }[state.value]))
const iconWrapClass = computed(() => ({
  paid: 'bg-success-subtle text-success',
  confirming: 'bg-success-subtle text-success',
  pending: 'bg-warning-subtle text-warning',
  failed: 'bg-danger-subtle text-danger',
}[state.value]))

async function checkStatus() {
  if (!reference.value) {
    state.value = 'failed'
    loading.value = false
    return
  }
  const res = await api.get<any>(`/payments/${reference.value}/status`)
  if (res.success && res.data) {
    const s = Number(res.data.status)
    amount.value = res.data.amount_public ?? null
    currency.value = res.data.currency || 'XOF'
    paymentMethod.value = res.data.payment_method || null

    if (s === 1) {
      state.value = 'paid'
    } else if ([3, 8].includes(s)) {
      state.value = 'failed'
    } else if (['completed', 'success', 'paid'].includes(redirectStatus.value)) {
      state.value = 'confirming'
    } else if (['failed', 'cancelled', 'expired'].includes(redirectStatus.value)) {
      state.value = 'failed'
    } else {
      state.value = 'pending'
    }
  } else {
    state.value = ['completed', 'success', 'paid'].includes(redirectStatus.value) ? 'confirming' : 'failed'
  }
  statusLabel.value = t(`paymentReturn.statusLabels.${state.value}`)
  loading.value = false
}

onMounted(checkStatus)
</script>

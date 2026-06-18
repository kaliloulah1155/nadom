<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-6">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body p-5">
            <!-- Vérification en cours -->
            <div v-if="loading" class="py-4">
              <div class="spinner-border text-primary mb-3"></div>
              <p class="text-muted mb-0">Vérification du paiement en cours…</p>
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
                <div class="d-flex justify-content-between"><span class="text-muted">Référence</span><strong>{{ reference }}</strong></div>
                <div v-if="amount" class="d-flex justify-content-between mt-1"><span class="text-muted">Montant</span><strong>{{ amount.toLocaleString('fr-FR') }} {{ currency }}</strong></div>
                <div v-if="paymentMethod" class="d-flex justify-content-between mt-1"><span class="text-muted">Moyen de paiement</span><strong>{{ paymentMethod }}</strong></div>
                <div class="d-flex justify-content-between mt-1"><span class="text-muted">Statut</span><strong>{{ statusLabel }}</strong></div>
              </div>

              <div class="d-flex gap-2 justify-content-center mt-4 flex-wrap">
                <NuxtLink to="/" class="btn btn-outline-secondary">Accueil</NuxtLink>
                <button v-if="['paid', 'confirming'].includes(state) && reference" class="btn btn-success" @click="downloadReceipt(reference)">
                  <i class="bi bi-download me-1"></i>Télécharger le reçu
                </button>
                <NuxtLink v-if="isAuthenticated && state !== 'failed'" to="/dashboard" class="btn btn-outline-primary">Mes commandes</NuxtLink>
                <NuxtLink v-if="state === 'failed'" to="/" class="btn btn-primary">Réessayer</NuxtLink>
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

const route = useRoute()
const api = useApi()
const { downloadReceipt } = usePayment()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const reference = computed(() => String(route.query.reference || route.query.ref || route.query.order_number || ''))
// Statut indicatif renvoyé par GeniusPay dans l'URL de redirection (non authoritatif)
const redirectStatus = computed(() => String(route.query.status || '').toLowerCase())
const loading = ref(true)
const state = ref<'paid' | 'confirming' | 'pending' | 'failed'>('pending')
const amount = ref<number | null>(null)
const currency = ref('XOF')
const paymentMethod = ref<string | null>(null)
const statusLabel = ref('')

const STATUS_LABELS: Record<string, string> = {
  paid: 'Réussi', confirming: 'Confirmation en cours', pending: 'En attente', failed: 'Échoué',
}

const title = computed(() => ({
  paid: 'Paiement confirmé',
  confirming: 'Paiement reçu',
  pending: 'Paiement en attente',
  failed: 'Paiement non abouti',
}[state.value]))

const message = computed(() => ({
  paid: 'Merci ! Votre paiement a bien été reçu. Vous recevrez une confirmation sous peu.',
  confirming: 'Merci ! Votre paiement a été effectué. La confirmation finale est en cours de traitement — votre commande sera validée sous quelques minutes.',
  pending: 'Votre paiement est en cours de validation par l’opérateur. Cela peut prendre quelques minutes.',
  failed: 'Votre paiement n’a pas pu être finalisé ou a été annulé. Aucun montant n’a été débité.',
}[state.value]))

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
      // GeniusPay a redirigé en succès mais la confirmation backend (webhook) n'est
      // pas encore arrivée — on rassure le client sans marquer payé en base.
      state.value = 'confirming'
    } else if (['failed', 'cancelled', 'expired'].includes(redirectStatus.value)) {
      state.value = 'failed'
    } else {
      state.value = 'pending'
    }
  } else {
    state.value = ['completed', 'success', 'paid'].includes(redirectStatus.value) ? 'confirming' : 'failed'
  }
  statusLabel.value = STATUS_LABELS[state.value]
  loading.value = false
}

onMounted(checkStatus)
</script>

<template>
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">{{ t('admin.payments.title') }}</h5>
      <button class="btn btn-sm btn-primary" @click="showForm = !showForm">
        <i class="bi bi-plus-lg me-1"></i>{{ t('admin.payments.record') }}
      </button>
    </div>
    <div class="card-body">
      <!-- Amount summary -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small class="text-muted d-block">{{ t('admin.payments.collected') }}</small>
          <span class="h5 mb-0 text-success">{{ formatCurrency(totalCollected, 'XOF') }}</span>
        </div>
        <div v-if="amountDue != null" class="text-end">
          <small class="text-muted d-block">{{ t('admin.payments.due') }}</small>
          <span class="h5 mb-0" :class="remaining > 0 ? 'text-danger' : 'text-success'">
            {{ formatCurrency(remaining, 'XOF') }}
          </span>
        </div>
      </div>

      <!-- Record form -->
      <div v-if="showForm" class="border rounded p-3 mb-3 bg-light">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label small">{{ t('admin.payments.amount') }}</label>
            <input v-model.number="form.amount" type="number" min="1" class="form-control form-control-sm" />
          </div>
          <div class="col-12">
            <label class="form-label small">{{ t('admin.payments.method') }}</label>
            <select v-model="form.payment_method" class="form-select form-select-sm">
              <option v-for="m in MANUAL_PAYMENT_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small">{{ t('admin.payments.note') }}</label>
            <input v-model="form.note" type="text" class="form-control form-control-sm" />
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-sm btn-outline-secondary" @click="showForm = false">{{ t('admin.common.cancel') }}</button>
          <button class="btn btn-sm btn-primary" :disabled="saving || !form.amount" @click="submit">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ t('admin.payments.save') }}
          </button>
        </div>
      </div>

      <!-- History -->
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary"></div>
      </div>
      <div v-else-if="transactions.length === 0" class="text-muted small text-center py-2">
        {{ t('admin.payments.none') }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm mb-0 align-middle">
        <thead>
          <tr class="text-muted small">
            <th>{{ t('admin.payments.date') }}</th>
            <th>{{ t('admin.payments.method') }}</th>
            <th class="text-end">{{ t('admin.payments.amount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td class="small">{{ formatDateShort(tx.created_at) }}</td>
            <td class="small">
              <span class="badge bg-light text-dark">{{ methodLabel(tx.payment_method) }}</span>
              <span v-if="tx.platform === 'manual'" class="badge bg-warning-subtle text-warning ms-1">{{ t('admin.payments.manual') }}</span>
            </td>
            <td class="text-end small fw-medium">{{ formatCurrency(tx.amount_public, tx.currency || 'XOF') }}</td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { usePayment, MANUAL_PAYMENT_METHODS } from '~/composables/usePayment'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'


const props = defineProps<{
  payableType: 'shipment' | 'personal_shopping'
  payableId: string
  /** Montant dû (ex. shipping_cost / quoted_price) — optionnel, affiche le reste à payer si fourni. */
  amountDue?: number | null
}>()

const { t } = useI18n()
const { formatCurrency, formatDateShort } = useFormatters()
const { recordManualPayment, fetchPayablePayments } = usePayment()
const { success, error: notifyError } = useNotification()

const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const transactions = ref<any[]>([])
const totalCollected = ref(0)

const remaining = computed(() => Math.max(0, (props.amountDue ?? 0) - totalCollected.value))

const form = reactive({
  amount: null as number | null,
  payment_method: 'cash' as typeof MANUAL_PAYMENT_METHODS[number]['value'],
  note: '',
})

const methodLabel = (value: string) => MANUAL_PAYMENT_METHODS.find(m => m.value === value)?.label || value || '—'

const load = async () => {
  loading.value = true
  try {
    const res = await fetchPayablePayments(props.payableType, props.payableId)
    transactions.value = res.transactions
    totalCollected.value = res.total_collected
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!form.amount) return
  saving.value = true
  try {
    const ok = await recordManualPayment({
      payable_type: props.payableType,
      payable_id: props.payableId,
      amount: form.amount,
      payment_method: form.payment_method,
      note: form.note || undefined,
    })
    if (ok) {
      success(t('admin.payments.recorded'))
      showForm.value = false
      form.amount = null
      form.note = ''
      await load()
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

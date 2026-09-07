<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h4 class="mb-1">{{ t('admin.nav.transactions') }}</h4>
        <p class="text-muted mb-0">
          {{ t('admin.transactions.subtitle') }}
        </p>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="balanceLoading" @click="openBalance">
          <span v-if="balanceLoading" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-wallet2 me-1"></i>{{ t('admin.transactions.balance') }}
        </button>
        <button type="button" class="btn btn-outline-success btn-sm" :disabled="exporting" @click="doExport">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-file-earmark-excel me-1"></i>{{ t('admin.common.exportExcel') }}
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="store.loading" @click="reload(1)">
          <i class="bi bi-arrow-clockwise me-1"></i>{{ t('admin.common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">{{ t('admin.transactions.type') }}</label>
            <select v-model="filters.type" class="form-select form-select-sm" @change="reload(1)">
              <option value="">{{ t('admin.common.all') }}</option>
              <option value="payment">{{ t('admin.transactions.typePayment') }}</option>
              <option value="refund">{{ t('admin.transactions.typeRefund') }}</option>
              <option value="reversement">{{ t('admin.transactions.typeReversement') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">{{ t('admin.transactions.object') }}</label>
            <select v-model="filters.kind" class="form-select form-select-sm" @change="reload(1)">
              <option value="">{{ t('admin.common.all') }}</option>
              <option value="cart">{{ t('admin.transactions.kindCart') }}</option>
              <option value="visa">{{ t('admin.transactions.kindVisa') }}</option>
              <option value="guide_booking">{{ t('admin.transactions.kindGuideBooking') }}</option>
              <option value="shipment">{{ t('admin.transactions.kindShipment') }}</option>
              <option value="personal_shopping">{{ t('admin.transactions.kindPersonalShopping') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">{{ t('admin.dashboard.status') }}</label>
            <select v-model="filters.status" class="form-select form-select-sm" @change="reload(1)">
              <option :value="null">{{ t('admin.common.all') }}</option>
              <option :value="0">{{ t('admin.transactions.statusPending') }}</option>
              <option :value="1">{{ t('admin.transactions.statusSuccess') }}</option>
              <option :value="3">{{ t('admin.transactions.statusFailed') }}</option>
              <option :value="4">{{ t('admin.transactions.statusRefunded') }}</option>
              <option :value="7">{{ t('admin.transactions.statusCashoutCompleted') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">{{ t('admin.transactions.dateFrom') }}</label>
            <input v-model="filters.dateFrom" type="date" class="form-control form-control-sm" @change="reload(1)" />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">{{ t('admin.transactions.dateTo') }}</label>
            <input v-model="filters.dateTo" type="date" class="form-control form-control-sm" @change="reload(1)" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">{{ t('admin.transactions.searchByReference') }}</label>
            <input v-model="filters.search" type="text" class="form-control form-control-sm"
              :placeholder="t('admin.transactions.referenceIdPlaceholder')" @input="debouncedReload" />
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>{{ t('admin.common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="store.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted mb-0">{{ t('admin.common.loading') }}</p>
      </div>
      <div v-else-if="!store.items.length" class="card-body text-center py-5 text-muted">
        <i class="bi bi-inbox fs-2 d-block mb-2"></i>{{ t('admin.transactions.noTransactions') }}
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.transactions.reference') }}</th>
                <th>{{ t('admin.transactions.object') }}</th>
                <th>{{ t('admin.transactions.client') }}</th>
                <th>{{ t('admin.transactions.type') }}</th>
                <th class="text-end">{{ t('admin.transactions.amount') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th class="text-end">{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trx in store.items" :key="trx.id">
                <td>
                  <code class="small d-block text-truncate" style="max-width: 180px;">{{ trx.reference || trx.id }}</code>
                  <div class="d-flex align-items-center gap-1 mt-1">
                    <span class="badge bg-dark-subtle text-dark text-uppercase" style="font-size:.6rem;">{{ trx.platform || 'nadom' }}</span>
                    <span class="text-muted" style="font-size:.7rem;">{{ formatDateTime(trx.created_at || '') }}</span>
                  </div>
                </td>
                <td><span class="badge bg-info-subtle text-info">{{ kindLabel(trx.payable_kind) }}</span></td>
                <td>
                  <div class="fw-medium text-truncate" style="max-width: 160px;">{{ clientName(trx) }}</div>
                  <div v-if="trx.phone" class="text-muted small">{{ trx.phone }}</div>
                </td>
                <td><span :class="typeBadge(trx.type)">{{ typeLabel(trx.type) }}</span></td>
                <td class="text-end">
                  <div class="fw-semibold">{{ money(trx.amount_public) }}</div>
                  <div v-if="trx.type === 'payment'" class="text-muted" style="font-size:.7rem;">
                    net {{ money(netMarchand(trx)) }} · com {{ money(trx.commission) }}
                  </div>
                </td>
                <td>
                  <span :class="statusBadge(trx.status)">{{ statusLabel(trx.status) }}</span>
                  <div v-if="trx.reversed" class="text-success mt-1" style="font-size:.7rem;"><i class="bi bi-check-circle-fill"></i> {{ t('admin.transactions.reversedLabel') }}</div>
                </td>
                <td class="text-end">
                  <div class="d-flex gap-2 justify-content-end flex-wrap">
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 0"
                      class="btn btn-sm btn-outline-warning" :title="t('admin.transactions.confirmManuallyTitle')"
                      :disabled="busy === trx.reference" @click="doConfirm(trx)">
                      <i class="bi bi-check2-circle"></i>
                    </button>
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 1"
                      class="btn btn-sm btn-outline-success" :title="t('admin.transactions.reverseNetTitle')"
                      :disabled="busy === trx.reference" @click="doReverser(trx)">
                      <i class="bi bi-send"></i>
                    </button>
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 1"
                      class="btn btn-sm btn-outline-danger" :title="t('admin.transactions.refundClientTitle')"
                      :disabled="busy === trx.reference" @click="doRefund(trx)">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button v-if="trx.reference && trx.status === 1" class="btn btn-sm btn-outline-secondary" :title="t('admin.transactions.receiptTitle')" @click="downloadReceipt(trx.reference)">
                      <i class="bi bi-receipt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" :title="t('admin.transactions.detailsTitle')" @click="openDetails(trx)">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="store.meta.currentPage"
          v-model:limit="store.meta.perPage"
          :total-items="store.meta.total"
          :limit-options="[10, 20, 50, 100]"
          @update:current-page="(p: number) => reload(p)"
          @update:limit="(l: number) => reload(1, l)"
        />
      </div>
    </div>

    <!-- Détails -->
    <div v-if="selected" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);" @click.self="selected = null">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.transactions.transactionRef', { reference: selected.reference }) }}</h5>
            <button type="button" class="btn-close" @click="selected = null"></button>
          </div>
          <div class="modal-body">
            <h6 class="text-muted text-uppercase small mb-2">{{ t('admin.transactions.operation') }}</h6>
            <dl class="row mb-3">
              <dt class="col-sm-4">{{ t('admin.transactions.reference') }}</dt><dd class="col-sm-8"><code>{{ selected.reference || '—' }}</code></dd>
              <dt class="col-sm-4">{{ t('admin.transactions.transactionId') }}</dt><dd class="col-sm-8"><code class="small">{{ selected.id }}</code></dd>
              <dt class="col-sm-4">{{ t('admin.transactions.platform') }}</dt><dd class="col-sm-8 text-uppercase">{{ selected.platform || 'nadom' }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.object') }}</dt><dd class="col-sm-8">{{ kindLabel(selected.payable_kind) }} <span v-if="selected.payable_id" class="text-muted">/ {{ selected.payable_id }}</span></dd>
              <dt class="col-sm-4">{{ t('admin.transactions.type') }}</dt><dd class="col-sm-8">{{ typeLabel(selected.type) }}</dd>
              <dt class="col-sm-4">{{ t('admin.dashboard.status') }}</dt><dd class="col-sm-8"><span :class="statusBadge(selected.status)">{{ statusLabel(selected.status) }}</span></dd>
              <dt class="col-sm-4">{{ t('admin.transactions.paymentMethod') }}</dt><dd class="col-sm-8">{{ selected.payment_method || '—' }}</dd>
              <dt class="col-sm-4">{{ t('admin.dashboard.date') }}</dt><dd class="col-sm-8">{{ formatDateTime(selected.created_at || '') }}</dd>
              <template v-if="selected.type === 'payment'">
                <dt class="col-sm-4">{{ t('admin.transactions.reversedToNadom') }}</dt>
                <dd class="col-sm-8">
                  <span v-if="selected.reversed" class="text-success"><i class="bi bi-check-circle-fill"></i> {{ t('admin.common.yes') }}<span v-if="selected.reversed_at" class="text-muted"> — {{ formatDateTime(selected.reversed_at) }}</span></span>
                  <span v-else class="text-muted">{{ t('admin.common.no') }}</span>
                </dd>
              </template>
            </dl>

            <h6 class="text-muted text-uppercase small mb-2">{{ t('admin.transactions.client') }}</h6>
            <dl class="row mb-3">
              <dt class="col-sm-4">{{ t('admin.transactions.name') }}</dt><dd class="col-sm-8">{{ clientName(selected) }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.email') }}</dt><dd class="col-sm-8">{{ clientEmail(selected) || '—' }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.phone') }}</dt><dd class="col-sm-8">{{ selected.phone || '—' }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.accountType') }}</dt><dd class="col-sm-8">{{ selected.user_id ? t('admin.transactions.clientAccount') : t('admin.transactions.guestNoAccount') }}</dd>
            </dl>

            <h6 class="text-muted text-uppercase small mb-2">{{ t('admin.transactions.amounts') }}</h6>
            <dl class="row mb-0">
              <dt class="col-sm-4">{{ t('admin.transactions.salePriceNet') }}</dt><dd class="col-sm-8">{{ money(selected.amount_net) }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.publicPricePaid') }}</dt><dd class="col-sm-8 fw-semibold">{{ money(selected.amount_public) }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.commission') }}</dt><dd class="col-sm-8">{{ money(selected.commission) }}</dd>
              <dt class="col-sm-4">{{ t('admin.transactions.netMerchant') }}</dt><dd class="col-sm-8 text-success fw-semibold">{{ money(netMarchand(selected)) }}</dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button v-if="selected.reference" class="btn btn-outline-success" @click="downloadReceipt(selected.reference)">
              <i class="bi bi-download me-1"></i>{{ t('admin.transactions.downloadReceipt') }}
            </button>
            <button class="btn btn-secondary" @click="selected = null">{{ t('admin.common.close') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup Solde NADOM (basé sur la table transactions) -->
    <div v-if="showBalance" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);" @click.self="showBalance = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-wallet2 me-2"></i>{{ t('admin.transactions.myBalance') }}</h5>
            <button type="button" class="btn-close" @click="showBalance = false"></button>
          </div>
          <div class="modal-body">
            <!-- Ce qui revient réellement à NADOM (net) -->
            <h6 class="text-success text-uppercase small fw-bold mb-2"><i class="bi bi-check-circle me-1"></i>{{ t('admin.transactions.whatYouGetNet') }}</h6>
            <div class="alert alert-warning d-flex justify-content-between align-items-center mb-2">
              <span class="fw-semibold">{{ t('admin.transactions.pendingReversement') }}</span>
              <span class="fs-4 fw-bold">{{ money(bal.pending_reversement) }} {{ balanceCurrency }}</span>
            </div>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-1">
                <tbody>
                  <tr>
                    <td class="text-muted">{{ t('admin.transactions.alreadyReversed') }}</td>
                    <td class="text-end fw-semibold text-success">{{ money(bal.total_reversed) }} {{ balanceCurrency }}</td>
                  </tr>
                  <tr class="border-top border-2">
                    <td class="fw-semibold">{{ t('admin.transactions.totalNetYours') }}</td>
                    <td class="text-end fw-bold text-success">{{ money(bal.total_net) }} {{ balanceCurrency }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Informations : ne vous appartiennent PAS -->
            <h6 class="text-muted text-uppercase small mb-2 mt-3"><i class="bi bi-info-circle me-1"></i>{{ t('admin.transactions.forInfoNotYours') }}</h6>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted">{{ t('admin.transactions.paidByClients') }} <small>{{ t('admin.transactions.publicPriceFeesIncluded') }}</small></td>
                    <td class="text-end">{{ money(bal.total_public) }} {{ balanceCurrency }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">{{ t('admin.transactions.totalSalePrice') }}</td>
                    <td class="text-end">{{ money(bal.total_sales) }} {{ balanceCurrency }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">{{ t('admin.transactions.serviceCommission') }}</td>
                    <td class="text-end text-muted">− {{ money(bal.total_commission) }} {{ balanceCurrency }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">{{ t('admin.transactions.refundedToClients') }}</td>
                    <td class="text-end text-danger">{{ money(bal.total_refunded) }} {{ balanceCurrency }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="alert alert-light border small mb-0 mt-3">
              <i class="bi bi-shield-check me-1 text-success"></i>
              <span v-html="sanitizeHtml(t('admin.transactions.balanceExplanation'))"></span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" :disabled="balanceLoading" @click="openBalance">
              <i class="bi bi-arrow-clockwise me-1"></i>{{ t('admin.common.refresh') }}
            </button>
            <button class="btn btn-secondary" @click="showBalance = false">{{ t('admin.common.close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive } from 'vue'
import { useTransactionsStore, type TransactionRow } from '~/stores/transactions'
import { getToken } from '~/composables/useApi'
import { useFormatters } from '~/composables/useFormatters'
import { useAdminAbility } from '~/composables/useAdminAbility'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const store = useTransactionsStore()
const { formatCurrency, formatDateTime } = useFormatters()
const { can } = useAdminAbility()
const { success: notifySuccess, error: notifyError } = useNotification()
const { downloadReceipt } = usePayment()
const swal = useSwal()

const canManage = computed(() => can('update', 'transactions'))

const filters = reactive<{ type: string; kind: string; status: number | null; search: string; dateFrom: string; dateTo: string }>({
  type: '',
  kind: '',
  status: null,
  search: '',
  dateFrom: '',
  dateTo: '',
})

const selected = ref<TransactionRow | null>(null)
const busy = ref<string | null>(null)

// Popup du solde (agrégats issus des transactions NADOM)
const showBalance = ref(false)
const balanceLoading = ref(false)
const balanceCurrency = ref('XOF')
const bal = reactive({ pending_reversement: 0, total_reversed: 0, total_net: 0, total_public: 0, total_sales: 0, total_commission: 0, total_refunded: 0 })

const reload = async (page = store.meta.currentPage, perPage = store.meta.perPage) => {
  await store.fetch({ page, per_page: perPage, type: filters.type || null, kind: filters.kind || null, status: filters.status, search: filters.search || null, date_from: filters.dateFrom || null, date_to: filters.dateTo || null })
}

let debounceTimer: any = null
const debouncedReload = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => reload(1), 400)
}

const resetFilters = () => {
  filters.type = ''
  filters.kind = ''
  filters.status = null
  filters.search = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  reload(1)
}

const money = (v: string | number | null | undefined) => formatCurrency(Number(v ?? 0), 'XOF')
// Le Marchand touche l'intégralité du prix de vente saisi (commission ajoutée par-dessus, payée par le client)
const netMarchand = (trx: TransactionRow) => Number(trx.amount_net)

const clientName = (trx: TransactionRow) => {
  const u = trx.user
  const fromUser = u ? (u.name || [u.firstname, u.lastname].filter(Boolean).join(' ').trim() || u.email) : ''
  // Paiement invité : le nom est dans metadata.customer
  const fromMeta = trx.metadata?.customer?.name || trx.metadata?.customer?.email
  return fromUser || fromMeta || '—'
}

const clientEmail = (trx: TransactionRow) =>
  trx.user?.email || trx.metadata?.customer?.email || null

const typeLabel = (tp: string) => ({ payment: t('admin.transactions.typePayment'), refund: t('admin.transactions.typeRefund'), reversement: t('admin.transactions.typeReversement') }[tp] || tp)
const kindLabel = (k: string | null) => ({
  cart: t('admin.transactions.kindCart'), visa: t('admin.transactions.kindVisa'), guide_booking: t('admin.transactions.kindGuideBooking'),
  shipment: t('admin.transactions.kindShipment'), personal_shopping: t('admin.transactions.kindPersonalShopping'),
}[k || 'cart'] || (k || '—'))
const typeBadge = (tp: string) => 'badge ' + ({ payment: 'bg-primary-subtle text-primary', refund: 'bg-danger-subtle text-danger', reversement: 'bg-success-subtle text-success' }[tp] || 'bg-secondary')

const statusLabel = (s: number) => ({
  0: t('admin.transactions.statusPending'), 1: t('admin.transactions.statusSuccess'), 2: t('admin.transactions.statusUnknown'), 3: t('admin.transactions.statusFailed'), 4: t('admin.transactions.statusRefunded'),
  5: t('admin.transactions.statusCashoutRequested'), 6: t('admin.transactions.statusCashoutApproved'), 7: t('admin.transactions.statusCashoutCompleted'), 8: t('admin.transactions.statusCashoutFailed'),
}[s] || t('admin.transactions.statusUnknown'))
const statusBadge = (s: number) => 'badge ' + ({
  1: 'bg-success', 7: 'bg-success', 0: 'bg-warning text-dark', 5: 'bg-info text-dark', 6: 'bg-info text-dark',
  3: 'bg-danger', 8: 'bg-danger', 4: 'bg-secondary',
}[s] || 'bg-secondary')

const openDetails = (trx: TransactionRow) => { selected.value = trx }

const exporting = ref(false)
const doExport = async () => {
  exporting.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const query: Record<string, any> = {}
    if (filters.type) query.type = filters.type
    if (filters.kind) query.kind = filters.kind
    if (filters.status !== null) query.status = filters.status
    if (filters.search) query.search = filters.search
    if (filters.dateFrom) query.date_from = filters.dateFrom
    if (filters.dateTo) query.date_to = filters.dateTo

    const blob = await $fetch<Blob>('/payments/export', {
      baseURL: config.public.apiBase as string,
      responseType: 'blob',
      query,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e: any) {
    swal.error(t('admin.transactions.exportImpossibleTitle'), e?.message)
  } finally {
    exporting.value = false
  }
}

const openBalance = async () => {
  balanceLoading.value = true
  const res = await store.balance()
  balanceLoading.value = false
  if (res.success && res.data) {
    bal.pending_reversement = Number(res.data.pending_reversement || 0)
    bal.total_reversed = Number(res.data.total_reversed || 0)
    bal.total_net = Number(res.data.total_net || 0)
    bal.total_public = Number(res.data.total_public || 0)
    bal.total_sales = Number(res.data.total_sales || 0)
    bal.total_commission = Number(res.data.total_commission || 0)
    bal.total_refunded = Number(res.data.total_refunded || 0)
    balanceCurrency.value = res.data.currency || 'XOF'
    showBalance.value = true
  } else {
    notifyError(res.message)
  }
}

const doConfirm = async (trx: TransactionRow) => {
  if (!trx.reference) return
  const ok = await swal.confirm({
    title: t('admin.transactions.confirmManualTitle'),
    html: sanitizeHtml(t('admin.transactions.confirmManualHtml', { reference: trx.reference })),
    confirmButtonText: t('admin.transactions.confirmPaymentButton'),
  })
  if (!ok) return
  busy.value = trx.reference
  const res = await store.confirmManually(trx.reference)
  busy.value = null
  res.success ? swal.success(res.message) : swal.error(res.message)
  if (res.success) reload()
}

const doReverser = async (trx: TransactionRow) => {
  if (!trx.reference) return
  const ok = await swal.confirm({
    title: t('admin.transactions.reverseTitle'),
    html: sanitizeHtml(t('admin.transactions.reverseHtml', { reference: trx.reference })),
    confirmButtonText: t('admin.transactions.reverseButton'),
  })
  if (!ok) return
  busy.value = trx.reference
  const res = await store.reverser(trx.reference)
  busy.value = null
  res.success ? swal.success(res.message) : swal.error(res.message)
  if (res.success) reload()
}

const doRefund = async (trx: TransactionRow) => {
  if (!trx.reference) return
  const reason = await swal.prompt({
    title: t('admin.transactions.refundClientTitle'),
    text: t('admin.transactions.refundOf', { reference: trx.reference }),
    inputLabel: t('admin.transactions.refundReasonLabel'),
    inputPlaceholder: t('admin.transactions.refundReasonPlaceholder'),
    confirmButtonText: t('admin.transactions.refundButton'),
  })
  if (reason === null) return
  busy.value = trx.reference
  const res = await store.refund(trx.reference, { reason: reason || undefined })
  busy.value = null
  res.success ? swal.success(res.message) : swal.error(res.message)
  if (res.success) reload()
}

onMounted(() => reload(1))
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h4 class="mb-1">{{ t('admin.nav.transactions') }}</h4>
        <p class="text-muted mb-0">
          Encaissements, remboursements clients et reversements au marchand (NADOM).
        </p>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="balanceLoading" @click="openBalance">
          <span v-if="balanceLoading" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-wallet2 me-1"></i>Soldes
        </button>
        <button type="button" class="btn btn-outline-success btn-sm" :disabled="exporting" @click="doExport">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-file-earmark-excel me-1"></i>Exporter Excel
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
            <label class="form-label small text-muted mb-1">Type</label>
            <select v-model="filters.type" class="form-select form-select-sm" @change="reload(1)">
              <option value="">Tous</option>
              <option value="payment">Encaissement</option>
              <option value="refund">Remboursement</option>
              <option value="reversement">Reversement</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Objet</label>
            <select v-model="filters.kind" class="form-select form-select-sm" @change="reload(1)">
              <option value="">Tous</option>
              <option value="cart">Panier</option>
              <option value="visa">Visa</option>
              <option value="guide_booking">Réservation guide</option>
              <option value="shipment">Expédition</option>
              <option value="personal_shopping">Demande PS</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Statut</label>
            <select v-model="filters.status" class="form-select form-select-sm" @change="reload(1)">
              <option :value="null">Tous</option>
              <option :value="0">En attente</option>
              <option :value="1">Réussi</option>
              <option :value="3">Échoué</option>
              <option :value="4">Remboursé</option>
              <option :value="7">Cashout complété</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Du</label>
            <input v-model="filters.dateFrom" type="date" class="form-control form-control-sm" @change="reload(1)" />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Au</label>
            <input v-model="filters.dateTo" type="date" class="form-control form-control-sm" @change="reload(1)" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Recherche (référence)</label>
            <input v-model="filters.search" type="text" class="form-control form-control-sm"
              placeholder="Référence / ID" @input="debouncedReload" />
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary btn-sm w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="store.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted mb-0">Chargement…</p>
      </div>
      <div v-else-if="!store.items.length" class="card-body text-center py-5 text-muted">
        <i class="bi bi-inbox fs-2 d-block mb-2"></i>Aucune transaction.
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Référence</th>
                <th>Objet</th>
                <th>Client</th>
                <th>Type</th>
                <th class="text-end">Montant</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
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
                  <div v-if="trx.reversed" class="text-success mt-1" style="font-size:.7rem;"><i class="bi bi-check-circle-fill"></i> reversé</div>
                </td>
                <td class="text-end">
                  <div class="d-flex gap-2 justify-content-end flex-wrap">
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 0"
                      class="btn btn-sm btn-outline-warning" title="Confirmer manuellement le paiement"
                      :disabled="busy === trx.reference" @click="doConfirm(trx)">
                      <i class="bi bi-check2-circle"></i>
                    </button>
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 1"
                      class="btn btn-sm btn-outline-success" title="Reverser le net à NADOM"
                      :disabled="busy === trx.reference" @click="doReverser(trx)">
                      <i class="bi bi-send"></i>
                    </button>
                    <button v-if="canManage && trx.type === 'payment' && trx.status === 1"
                      class="btn btn-sm btn-outline-danger" title="Rembourser le client"
                      :disabled="busy === trx.reference" @click="doRefund(trx)">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button v-if="trx.reference && trx.status === 1" class="btn btn-sm btn-outline-secondary" title="Reçu de paiement" @click="downloadReceipt(trx.reference)">
                      <i class="bi bi-receipt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" title="Détails" @click="openDetails(trx)">
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
            <h5 class="modal-title">Transaction {{ selected.reference }}</h5>
            <button type="button" class="btn-close" @click="selected = null"></button>
          </div>
          <div class="modal-body">
            <h6 class="text-muted text-uppercase small mb-2">Opération</h6>
            <dl class="row mb-3">
              <dt class="col-sm-4">Référence</dt><dd class="col-sm-8"><code>{{ selected.reference || '—' }}</code></dd>
              <dt class="col-sm-4">ID transaction</dt><dd class="col-sm-8"><code class="small">{{ selected.id }}</code></dd>
              <dt class="col-sm-4">Plateforme</dt><dd class="col-sm-8 text-uppercase">{{ selected.platform || 'nadom' }}</dd>
              <dt class="col-sm-4">Objet</dt><dd class="col-sm-8">{{ kindLabel(selected.payable_kind) }} <span v-if="selected.payable_id" class="text-muted">/ {{ selected.payable_id }}</span></dd>
              <dt class="col-sm-4">Type</dt><dd class="col-sm-8">{{ typeLabel(selected.type) }}</dd>
              <dt class="col-sm-4">Statut</dt><dd class="col-sm-8"><span :class="statusBadge(selected.status)">{{ statusLabel(selected.status) }}</span></dd>
              <dt class="col-sm-4">Moyen de paiement</dt><dd class="col-sm-8">{{ selected.payment_method || '—' }}</dd>
              <dt class="col-sm-4">Date</dt><dd class="col-sm-8">{{ formatDateTime(selected.created_at || '') }}</dd>
              <template v-if="selected.type === 'payment'">
                <dt class="col-sm-4">Reversé à NADOM</dt>
                <dd class="col-sm-8">
                  <span v-if="selected.reversed" class="text-success"><i class="bi bi-check-circle-fill"></i> Oui<span v-if="selected.reversed_at" class="text-muted"> — {{ formatDateTime(selected.reversed_at) }}</span></span>
                  <span v-else class="text-muted">Non</span>
                </dd>
              </template>
            </dl>

            <h6 class="text-muted text-uppercase small mb-2">Client</h6>
            <dl class="row mb-3">
              <dt class="col-sm-4">Nom</dt><dd class="col-sm-8">{{ clientName(selected) }}</dd>
              <dt class="col-sm-4">Email</dt><dd class="col-sm-8">{{ clientEmail(selected) || '—' }}</dd>
              <dt class="col-sm-4">Téléphone</dt><dd class="col-sm-8">{{ selected.phone || '—' }}</dd>
              <dt class="col-sm-4">Type de compte</dt><dd class="col-sm-8">{{ selected.user_id ? 'Compte client' : 'Invité (sans compte)' }}</dd>
            </dl>

            <h6 class="text-muted text-uppercase small mb-2">Montants</h6>
            <dl class="row mb-0">
              <dt class="col-sm-4">Prix de vente (net)</dt><dd class="col-sm-8">{{ money(selected.amount_net) }}</dd>
              <dt class="col-sm-4">Prix public payé</dt><dd class="col-sm-8 fw-semibold">{{ money(selected.amount_public) }}</dd>
              <dt class="col-sm-4">Commission (10 %)</dt><dd class="col-sm-8">{{ money(selected.commission) }}</dd>
              <dt class="col-sm-4">Net marchand</dt><dd class="col-sm-8 text-success fw-semibold">{{ money(netMarchand(selected)) }}</dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button v-if="selected.reference" class="btn btn-outline-success" @click="downloadReceipt(selected.reference)">
              <i class="bi bi-download me-1"></i>Télécharger le reçu
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
            <h5 class="modal-title"><i class="bi bi-wallet2 me-2"></i>Mon solde</h5>
            <button type="button" class="btn-close" @click="showBalance = false"></button>
          </div>
          <div class="modal-body">
            <!-- Ce qui revient réellement à NADOM (net) -->
            <h6 class="text-success text-uppercase small fw-bold mb-2"><i class="bi bi-check-circle me-1"></i>Ce qui vous revient (net)</h6>
            <div class="alert alert-warning d-flex justify-content-between align-items-center mb-2">
              <span class="fw-semibold">En attente de reversement</span>
              <span class="fs-4 fw-bold">{{ money(bal.pending_reversement) }} {{ balanceCurrency }}</span>
            </div>
            <table class="table table-sm align-middle mb-1">
              <tbody>
                <tr>
                  <td class="text-muted">Déjà reversé</td>
                  <td class="text-end fw-semibold text-success">{{ money(bal.total_reversed) }} {{ balanceCurrency }}</td>
                </tr>
                <tr class="border-top border-2">
                  <td class="fw-semibold">Total net qui vous revient</td>
                  <td class="text-end fw-bold text-success">{{ money(bal.total_net) }} {{ balanceCurrency }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Informations : ne vous appartiennent PAS -->
            <h6 class="text-muted text-uppercase small mb-2 mt-3"><i class="bi bi-info-circle me-1"></i>Pour information (ne vous revient pas)</h6>
            <table class="table table-sm align-middle mb-0">
              <tbody>
                <tr>
                  <td class="text-muted">Payé par les clients <small>(prix public, frais inclus)</small></td>
                  <td class="text-end">{{ money(bal.total_public) }} {{ balanceCurrency }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Total prix de vente</td>
                  <td class="text-end">{{ money(bal.total_sales) }} {{ balanceCurrency }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Commission de service (10 %)</td>
                  <td class="text-end text-muted">− {{ money(bal.total_commission) }} {{ balanceCurrency }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Remboursé aux clients</td>
                  <td class="text-end text-danger">{{ money(bal.total_refunded) }} {{ balanceCurrency }}</td>
                </tr>
              </tbody>
            </table>

            <div class="alert alert-light border small mb-0 mt-3">
              <i class="bi bi-shield-check me-1 text-success"></i>
              Le montant payé par le client (<strong>prix public</strong>) inclut les <strong>frais de traitement</strong> et la <strong>commission de service de 10 %</strong>.
              Conformément au contrat (Art. 4-5), <strong>seul le net</strong> (prix de vente − 10 %) vous est reversé. Le reste ne vous appartient pas.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" :disabled="balanceLoading" @click="openBalance">
              <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
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

const typeLabel = (tp: string) => ({ payment: 'Encaissement', refund: 'Remboursement', reversement: 'Reversement' }[tp] || tp)
const kindLabel = (k: string | null) => ({
  cart: 'Panier', visa: 'Visa', guide_booking: 'Réservation guide',
  shipment: 'Expédition', personal_shopping: 'Demande PS',
}[k || 'cart'] || (k || '—'))
const typeBadge = (tp: string) => 'badge ' + ({ payment: 'bg-primary-subtle text-primary', refund: 'bg-danger-subtle text-danger', reversement: 'bg-success-subtle text-success' }[tp] || 'bg-secondary')

const statusLabel = (s: number) => ({
  0: 'En attente', 1: 'Réussi', 2: 'Inconnu', 3: 'Échoué', 4: 'Remboursé',
  5: 'Cashout demandé', 6: 'Cashout approuvé', 7: 'Cashout complété', 8: 'Cashout échoué',
}[s] || 'Inconnu')
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
    swal.error('Export impossible', e?.message)
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
    title: 'Confirmer manuellement ?',
    html: `Confirmer le paiement <strong>${trx.reference}</strong> ?<br><small class="text-muted">À n'utiliser que si la notification automatique n'arrive pas.</small>`,
    confirmButtonText: 'Confirmer le paiement',
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
    title: 'Reverser à NADOM ?',
    html: `Reverser le net de <strong>${trx.reference}</strong> à NADOM ?`,
    confirmButtonText: 'Reverser',
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
    title: 'Rembourser le client',
    text: `Remboursement de ${trx.reference}`,
    inputLabel: 'Motif (optionnel)',
    inputPlaceholder: 'Ex : annulation de commande',
    confirmButtonText: 'Rembourser',
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

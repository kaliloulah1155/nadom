<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.shipments.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.shipments.totalCount', { n: shippingStore.shipmentsMeta.total }) }}</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.shipments.newShipment') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              :placeholder="t('admin.shipments.trackingPlaceholder')"
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-4">
            <select v-model="filters.status" class="form-select" @change="fetchShipments(1)">
              <option value="">{{ t('admin.shipments.allStatuses') }}</option>
              <option value="pending">{{ t('admin.shipments.status.pending') }}</option>
              <option value="picked_up">{{ t('admin.shipments.status.picked_up') }}</option>
              <option value="in_transit">{{ t('admin.shipments.status.in_transit') }}</option>
              <option value="in_customs">{{ t('admin.shipments.status.in_customs') }}</option>
              <option value="out_for_delivery">{{ t('admin.shipments.status.out_for_delivery') }}</option>
              <option value="delivered">{{ t('admin.shipments.status.delivered') }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-x-circle me-1"></i>{{ t('admin.common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="shippingStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">{{ t('admin.shipments.loading') }}</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.shipments.trackingNumber') }}</th>
                <th>{{ t('admin.requests.client') }}</th>
                <th>{{ t('admin.shipments.request') }}</th>
                <th>{{ t('admin.shipments.destination') }}</th>
                <th>{{ t('admin.shipments.mode') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th>{{ t('admin.shipments.weight') }}</th>
                <th>{{ t('admin.dashboard.date') }}</th>
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="shippingStore.shipments.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">
                  {{ t('admin.shipments.noShipments') }}
                </td>
              </tr>
              <tr v-for="shipment in shippingStore.shipments" :key="shipment.id">
                <td>
                  <NuxtLink :to="`/admin/shipments/${shipment.tracking_number}`" class="text-decoration-none">
                    <code>{{ shipment.tracking_number }}</code>
                  </NuxtLink>
                </td>
                <td>
                  <div class="small">
                    <div class="fw-medium">{{ getShipmentClientName(shipment) }}</div>
                    <span class="text-muted fst-italic" v-if="!getShipmentClientName(shipment)">—</span>
                  </div>
                </td>
                <td>
                  <NuxtLink
                    v-if="(shipment as any).request_id"
                    :to="`/admin/requests/${(shipment as any).request_id}`"
                    class="badge bg-primary-subtle text-primary text-decoration-none"
                  >
                    <i class="bi bi-bag-check me-1"></i>{{ String((shipment as any).request_id).slice(-6) }}
                  </NuxtLink>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <div>{{ shipment.destination_country }}</div>
                  <small class="text-muted">{{ shipment.destination_city }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ shippingModeLabel(shipment.shipping_mode) }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :style="{ backgroundColor: formatShipmentStatus(shipment.status).color, color: '#fff' }"
                  >
                    {{ formatShipmentStatus(shipment.status).label }}
                  </span>
                </td>
                <td>{{ shipment.weight }} kg</td>
                <td><small>{{ formatDateShort(shipment.created_at) }}</small></td>
                <td>
                  <div class="d-flex">
                    <NuxtLink :to="`/admin/shipments/${shipment.tracking_number}`" class="btn btn-outline-primary btn-sm me-2" :title="t('admin.common.view')">
                      <i class="bi bi-eye"></i>
                    </NuxtLink>
                    <button class="btn btn-outline-info btn-sm me-2" :title="t('admin.common.edit')" @click="openModal(shipment)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      v-if="Number(shipment.shipping_cost) > 0 && shipment.status === 'pending'"
                      class="btn btn-outline-primary btn-sm"
                      title="Générer un lien de paiement"
                      :disabled="payProcessing === String(shipment.id)"
                      @click="generatePaymentLink(shipment.id)"
                    >
                      <span v-if="payProcessing === String(shipment.id)" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-link-45deg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="shippingStore.shipmentsMeta.currentPage"
          v-model:limit="shippingStore.shipmentsMeta.perPage"
          :total-items="shippingStore.shipmentsMeta.total"
          @update:current-page="(p: number) => fetchShipments(p)"
          @update:limit="(l: number) => fetchShipments(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="shipmentModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingShipment ? t('admin.shipments.modalEditTitle') : t('admin.shipments.modalNewTitle') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveShipment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.trackingNumberLabel') }}</label>
                  <input v-model="form.trackingNumber" type="text" class="form-control input-md" required :disabled="!!editingShipment" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.clientLabel') }}</label>
                  <input
                    :value="form.clientName || (form.userId ? `ID: ${form.userId}` : '')"
                    type="text"
                    class="form-control input-md bg-light"
                    :placeholder="t('admin.shipments.clientAutoPlaceholder')"
                    readonly
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ t('admin.shipments.linkedRequestLabel') }}</label>
                  <select v-model="form.requestId" class="form-select input-md" required @change="onRequestChange">
                    <option value="">{{ t('admin.shipments.selectRequestPlaceholder') }}</option>
                    <option v-for="req in availableRequests" :key="req.id" :value="req.id">
                      #{{ String(req.id ?? '').slice(-6) }} — {{ truncate(req.title, 40) }} · {{ t('admin.shipments.requestOptionQuote', { price: formatCurrency(req.quotedPrice ?? 0, (req as any).currency || 'XOF') }) }}
                    </option>
                  </select>
                  <small v-if="availableRequests.length === 0" class="text-warning">
                    {{ t('admin.shipments.noRequestsWithQuote') }}
                  </small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.destinationCountryLabel') }}</label>
                  <select
                    v-model="form.destinationCountry"
                    class="form-select input-md"
                    required
                    @change="onCountryChange"
                  >
                    <option value="">{{ t('admin.shipments.selectCountry') }}</option>
                    <option v-for="c in countriesList" :key="c.uuid" :value="c.label">
                      {{ c.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.destinationCityLabel') }}</label>
                  <select
                    v-if="availableCities.length > 0"
                    v-model="form.destinationCity"
                    class="form-select input-md"
                    required
                  >
                    <option value="">{{ t('admin.shipments.selectCity') }}</option>
                    <option v-for="city in availableCities" :key="city.uuid" :value="city.label">
                      {{ city.label }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="form.destinationCity"
                    type="text"
                    class="form-control input-md"
                    :placeholder="t('admin.shipments.enterCityPlaceholder')"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.shippingModeLabel') }}</label>
                  <select v-model="form.shippingMode" class="form-select input-md" required>
                    <option value="air_normal">{{ t('admin.shipments.airNormal') }}</option>
                    <option value="air_express">{{ t('admin.shipments.airExpress') }}</option>
                    <option value="sea">{{ t('admin.shipments.sea') }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.statusLabel') }}</label>
                  <select v-model="form.status" class="form-select input-md" required>
                    <option value="pending">{{ t('admin.shipments.status.pending') }}</option>
                    <option value="picked_up">{{ t('admin.shipments.status.picked_up') }}</option>
                    <option value="in_transit">{{ t('admin.shipments.status.in_transit') }}</option>
                    <option value="in_customs">{{ t('admin.shipments.status.in_customs') }}</option>
                    <option value="out_for_delivery">{{ t('admin.shipments.status.out_for_delivery') }}</option>
                    <option value="delivered">{{ t('admin.shipments.status.delivered') }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.shipments.weightKg') }}</label>
                  <input v-model.number="form.weight" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ t('admin.shipments.lengthCm') }}</label>
                  <input v-model.number="form.length" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ t('admin.shipments.widthCm') }}</label>
                  <input v-model.number="form.width" type="number" step="0.1" min="0" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ t('admin.shipments.heightCm') }}</label>
                  <input v-model.number="form.height" type="number" step="0.1" min="0" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary btn-md" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>{{ editingShipment ? t('admin.common.save') : t('admin.common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive, computed, onMounted } from 'vue'
import { useShippingStore, type Shipment, type ShippingMode, type ShipmentStatus } from '~/stores/shipping'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useCountriesStore } from '~/stores/countries'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const shippingStore = useShippingStore()
const psStore = usePersonalShoppingStore()
const countriesStore = useCountriesStore()
const { formatDateShort, formatShipmentStatus, formatCurrency, truncate } = useFormatters()
const { success, error: notifyError } = useNotification()
const { createPaymentLink, processing: payProcessing } = usePayment()

/** Génère un lien de paiement pour une expédition et ouvre WhatsApp pré-rempli. */
const generatePaymentLink = async (id: string) => {
  const data = await createPaymentLink('shipment', String(id))
  if (!data) return
  try { await navigator.clipboard?.writeText(data.checkout_url) } catch {}
  useSwal().success('Lien de paiement généré', 'Lien copié. WhatsApp ouvert pour envoi au client.')
  if (data.whatsapp_url) window.open(data.whatsapp_url, '_blank')
}

const shippingModeLabel = (mode: string) => {
  if (mode === 'air_express') return t('admin.shipments.airExpress')
  if (mode === 'sea') return t('admin.shipments.sea')
  return t('admin.shipments.airNormal')
}

const countriesList = computed(() => countriesStore.activeCountries)
const availableCities = computed(() => {
  const country = countriesStore.getByLabel(form.destinationCountry)
  return country?.cities?.filter((c: any) => c.status === undefined || c.status === 1) || []
})

const onCountryChange = () => {
  form.destinationCity = ''
}

const filters = reactive({
  search: '',
  status: ''
})

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingShipment = ref<any>(null)
const saving = ref(false)
const form = reactive<{
  trackingNumber: string
  userId: any
  clientName: string
  requestId: any
  destinationCountry: string
  destinationCity: string
  shippingMode: ShippingMode
  status: ShipmentStatus
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
}>({
  trackingNumber: '',
  userId: '',
  clientName: '',
  requestId: '',
  destinationCountry: '',
  destinationCity: '',
  shippingMode: 'air_normal',
  status: 'pending',
  weight: null,
  length: null,
  width: null,
  height: null
})

const fetchShipments = async (page?: number, limit?: number) => {
  await shippingStore.fetchShipments({
    page: page ?? shippingStore.shipmentsMeta.currentPage,
    limit: limit ?? shippingStore.shipmentsMeta.perPage,
    tracking_number: filters.search || undefined,
    status: filters.status || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchShipments(1), 400)
}

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  fetchShipments(1)
}

onMounted(async () => {
  await Promise.all([
    fetchShipments(1),
    psStore.fetchRequests(),
    countriesStore.fetchAll()
  ])
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const availableRequests = computed(() => {
  // Une demande est eligible si elle a un devis (quoted_price > 0) ET pas encore expediee
  // (sauf si on edite et que c'est la demande deja liee)
  return psStore.requests.filter((r: any) => {
    const editingId = editingShipment.value?.request_id ?? editingShipment.value?.requestId
    if (editingId && r.id === editingId) return true
    const hasQuote = Number(r.quotedPrice ?? r.quoted_price ?? 0) > 0
    const notShipped = !['shipped', 'delivered', 'cancelled'].includes(r.status)
    return hasQuote && notShipped
  })
})

const onRequestChange = () => {
  const req = psStore.requests.find((r: any) => r.id === form.requestId)
  if (req) {
    form.userId = (req as any).user_id ?? (req as any).userId
    const u = (req as any).user
    const fullname = u
      ? [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
      : ''
    form.clientName = fullname || (req as any).contactFullname || (req as any).contact_fullname || (form.userId ? t('admin.shipments.clientFallback', { id: form.userId }) : '')
  }
}

const getShipmentClientName = (shipment: any): string => {
  const reqUser = shipment.request?.user
  if (reqUser) {
    return [reqUser.firstname, reqUser.lastname].filter(Boolean).join(' ').trim() || t('admin.shipments.clientFallback', { id: reqUser.id })
  }
  return shipment.request?.contact_fullname || shipment.request?.contactFullname || ''
}

const openModal = (shipment?: any) => {
  if (shipment) {
    editingShipment.value = shipment
    const s = shipment as any
    form.trackingNumber = s.tracking_number ?? s.trackingNumber
    form.userId = s.user_id ?? s.userId
    form.clientName = getShipmentClientName(s)
    form.destinationCountry = s.destination_country ?? s.destinationCountry ?? ''
    form.destinationCity = s.destination_city ?? s.destinationCity ?? ''
    form.shippingMode = s.shipping_mode ?? s.shippingMode
    form.status = s.status
    form.weight = s.weight != null ? Number(s.weight) : null
    form.length = s.length != null ? Number(s.length) : null
    form.width = s.width != null ? Number(s.width) : null
    form.height = s.height != null ? Number(s.height) : null
    form.requestId = s.request_id ?? s.requestId ?? ''
  } else {
    editingShipment.value = null
    form.trackingNumber = `TRK-${Date.now().toString().slice(-6)}`
    form.userId = ''
    form.clientName = ''
    form.requestId = ''
    form.destinationCountry = ''
    form.destinationCity = ''
    form.shippingMode = 'air_normal'
    form.status = 'pending'
    form.weight = null
    form.length = null
    form.width = null
    form.height = null
  }
  modalInstance?.show()
}

const saveShipment = async () => {
  if (saving.value) return
  saving.value = true
  const payload: Record<string, any> = {
    request_id: form.requestId || null,
    destination_country: form.destinationCountry,
    destination_city: form.destinationCity,
    shipping_mode: form.shippingMode,
    status: form.status,
    weight: form.weight,
    length: form.length,
    width: form.width,
    height: form.height
  }

  try {
    if (editingShipment.value) {
      const prevStatus = editingShipment.value.status
      const updated = await shippingStore.updateShipment(String(editingShipment.value.id), payload as Partial<Shipment>)
      if (!updated) throw new Error(t('admin.shipments.updateFailed'))
      success(t('admin.shipments.updatedSuccess'))
      if (form.status === 'delivered' && prevStatus !== 'delivered' && form.requestId) {
        await psStore.updateRequestStatus(String(form.requestId), 'delivered' as RequestStatus)
        success(t('admin.shipments.requestMarkedDelivered'))
      }
    } else {
      payload.tracking_number = form.trackingNumber
      payload.user_id = form.userId
      const cost = shippingStore.calculateShippingCost(form.destinationCountry, form.weight ?? 0, form.shippingMode)
      payload.shipping_cost = cost
      await shippingStore.createShipment(payload as Partial<Shipment>)
      success(t('admin.shipments.createdSuccess'))
    }
    modalInstance?.hide()
    await fetchShipments(shippingStore.shipmentsMeta.currentPage)
  } catch (err: any) {
    notifyError(err?.message || t('admin.shipments.saveError'))
  } finally {
    saving.value = false
  }
}
</script>

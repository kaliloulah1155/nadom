<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!request" class="text-center py-5">
      <h4>{{ t('admin.requests.detail.notFound') }}</h4>
      <NuxtLink to="/admin/requests" class="btn btn-primary">{{ t('common.back') }}</NuxtLink>
    </div>

    <!-- Request Detail -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <NuxtLink to="/admin/requests" class="btn btn-link p-0 mb-2">
            <i class="bi bi-arrow-left me-1"></i>{{ t('common.back') }}
          </NuxtLink>
          <h4 class="mb-0">{{ t('admin.requests.detail.title', { id: String(request.id ?? '').slice(-6) }) }}</h4>
        </div>
        <div class="d-flex gap-2">
          <select
            :value="request.status"
            class="form-select"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
          >
            <option value="pending">{{ t('admin.requests.status.pending') }}</option>
            <option value="searching">{{ t('admin.requests.status.searching') }}</option>
            <option value="negotiating">{{ t('admin.requests.status.negotiating') }}</option>
            <option value="confirmed">{{ t('admin.requests.status.confirmed') }}</option>
            <option value="preparing">{{ t('admin.requests.status.preparing') }}</option>
            <option value="shipped">{{ t('admin.requests.status.shipped') }}</option>
            <option value="delivered">{{ t('admin.requests.status.delivered') }}</option>
            <option value="cancelled">{{ t('admin.requests.status.cancelled') }}</option>
          </select>
        </div>
      </div>

      <div class="row g-4">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Ordered Items (from Catalog) -->
          <div v-if="request.items && request.items.length > 0" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">{{ t('admin.requests.detail.orderedProducts') }}</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>{{ t('admin.dashboard.product') }}</th>
                      <th>{{ t('admin.requests.detail.price') }}</th>
                      <th>{{ t('admin.requests.detail.qty') }}</th>
                      <th class="text-end">{{ t('admin.dashboard.total') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in request.items" :key="item.productId">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="item.image || 'https://via.placeholder.com/40'" class="rounded me-2" width="40" height="40" style="object-fit: cover;" />
                          <span>{{ itemDisplayName(item) }}</span>
                        </div>
                      </td>
                      <td>{{ formatCurrency(item.price, requestCurrency) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="text-end fw-bold">{{ formatCurrency(item.price * item.quantity, requestCurrency) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Product Info (Original Request) -->
          <div v-else class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">{{ t('admin.requests.detail.productInfo') }}</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <img
                    :src="requestThumbnailUrl(request, 200)"
                    class="img-fluid rounded"
                    alt=""
                  />
                  <div v-if="(request.images?.length ?? 0) > 1" class="d-flex gap-2 mt-2">
                    <img
                      v-for="(img, i) in request.images.slice(1, 4)"
                      :key="i"
                      :src="img"
                      class="rounded"
                      width="50"
                      height="50"
                      style="object-fit: cover;"
                      alt=""
                    />
                  </div>
                </div>
                <div class="col-md-8">
                  <h5>{{ request.title }}</h5>
                  <span class="badge bg-secondary mb-3">{{ request.category }}</span>
                  <div class="text-muted request-description" v-html="request.description"></div>
                  <div class="row g-2">
                    <div class="col-6">
                      <small class="text-muted d-block">{{ t('admin.requests.detail.quantity') }}</small>
                      <strong>{{ request.quantity }}</strong>
                    </div>
                    <div class="col-6">
                      <small class="text-muted d-block">{{ t('admin.requests.detail.estimatedBudget') }}</small>
                      <strong>{{ formatCurrency(request.budgetEstimated, requestCurrency) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quotation -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                {{ t('admin.requests.detail.quoteTitle') }}
                <small class="text-muted fs-6 ms-2">— {{ t('admin.requests.detail.currencyLabel') }} : <strong>{{ requestCurrency }}</strong></small>
              </h5>
              <div class="d-flex gap-2">
                <button
                  v-if="!showQuotationForm && !request.quotedPrice && canEditQuotation"
                  class="btn btn-sm btn-primary"
                  @click="openQuotationForm()"
                >
                  <i class="bi bi-plus me-1"></i>{{ t('admin.requests.detail.createQuote') }}
                </button>
                <button
                  v-if="!showQuotationForm && request.quotedPrice && canEditQuotation"
                  class="btn btn-sm btn-outline-primary"
                  @click="openQuotationForm()"
                >
                  <i class="bi bi-pencil me-1"></i>{{ t('admin.requests.detail.editQuote') }}
                </button>
                <button
                  v-if="request.quotedPrice"
                  class="btn btn-sm btn-outline-secondary"
                  :disabled="downloadingPdf"
                  @click="downloadQuotationPdf"
                >
                  <span v-if="downloadingPdf" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-file-earmark-pdf me-1"></i>{{ t('admin.requests.detail.pdfQuote') }}
                </button>
                <button
                  v-if="request.status === 'confirmed' || request.status === 'preparing'"
                  class="btn btn-sm btn-success"
                  @click="openShipmentModal"
                >
                  <i class="bi bi-box-seam me-1"></i>{{ t('admin.requests.detail.createShipment') }}
                </button>
                <NuxtLink
                  v-if="request.shipmentId || request.trackingNumber"
                  :to="`/admin/shipments/${request.trackingNumber || request.shipmentId}`"
                  class="btn btn-sm btn-info text-white"
                >
                  <i class="bi bi-box-seam me-1"></i>{{ t('admin.requests.detail.viewShipment') }}
                </NuxtLink>
              </div>
            </div>
            <div class="card-body">
              <!-- Existing Quotation -->
              <div v-if="request.quotedPrice && request.quotedDetails && !showQuotationForm">
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td>{{ t('admin.requests.detail.productCost') }}</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.productCost, requestCurrency) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('admin.requests.detail.commission') }}</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.serviceFee, requestCurrency) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('admin.requests.detail.inspection') }}</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.inspectionFee, requestCurrency) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('admin.requests.detail.packaging') }}</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.packagingFee, requestCurrency) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('admin.requests.detail.shippingLine') }}</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost, requestCurrency) }}</td>
                    </tr>
                    <tr class="fw-bold border-top">
                      <td>{{ t('admin.requests.detail.total') }}</td>
                      <td class="text-end text-success">{{ formatCurrency(request.quotedPrice, requestCurrency) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Quotation Form -->
              <form v-else-if="showQuotationForm" @submit.prevent="submitQuotation">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.productCost') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.productCost" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.inspection') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.inspectionFee" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.packaging') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.packagingFee" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.shippingLine') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.shippingCost" type="number" min="0" step="any" class="form-control" required />
                  </div>
                </div>

                <div class="alert alert-info mt-3">
                  <strong>{{ t('admin.requests.detail.estimatedTotal') }} :</strong> {{ formatCurrency(quotationTotal, requestCurrency) }}
                  <small class="d-block">{{ t('admin.requests.detail.commissionHint', { currency: requestCurrency }) }}</small>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success">
                    <i class="bi bi-check me-1"></i>{{ t('admin.common.save') }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="showQuotationForm = false">
                    {{ t('admin.common.cancel') }}
                  </button>
                </div>
              </form>

              <div v-else class="text-center py-3 text-muted">
                {{ t('admin.requests.detail.noQuote') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Status -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.currentStatus') }}</h6>
              <span
                class="badge fs-6"
                :style="{
                  backgroundColor: formatRequestStatus(request.status).bgColor,
                  color: formatRequestStatus(request.status).color
                }"
              >
                {{ formatRequestStatus(request.status).label }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.info') }}</h6>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.client') }}</small>
                <div class="fw-medium">
                  {{ clientFullName || t('admin.requests.detail.anonymousClient') }}
                </div>
                <small class="text-muted">
                  {{ (request as any).user?.email || (request as any).contactEmail || '' }}
                </small>
              </div>
              <div v-if="clientPhone" class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.clientContact') }}</small>
                <div class="d-flex align-items-center justify-content-between">
                  <a
                    :href="`tel:${clientPhone}`"
                    class="text-decoration-none"
                  >
                    <i class="bi bi-telephone text-primary me-2"></i>
                    <strong>{{ clientPhone }}</strong>
                  </a>
                  <a
                    :href="whatsappLinkForClient"
                    target="_blank"
                    class="btn btn-sm btn-success"
                    :title="t('admin.requests.detail.openWhatsapp')"
                  >
                    <i class="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
              <div v-else class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.clientContact') }}</small>
                <span class="text-muted small fst-italic">{{ t('admin.shipments.noPhone') }}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.createdOn') }}</small>
                <span>{{ formatDate(request.createdAt) }}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.updatedOn') }}</small>
                <span>{{ formatDate(request.updatedAt) }}</span>
              </div>
              <div>
                <small class="text-muted d-block">{{ t('admin.requests.detail.whatsappMessages') }}</small>
                <span>{{ request.whatsappMessages }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.actions') }}</h6>
              <div class="d-grid gap-2">
                <a href="#" class="btn btn-success" @click.prevent="openWhatsApp">
                  <i class="bi bi-whatsapp me-2"></i>{{ t('admin.requests.detail.contactClient') }}
                </a>
                <small v-if="isConfirmed && quotationPdfUrl" class="text-success d-flex align-items-center gap-1">
                  <i class="bi bi-file-earmark-pdf"></i>
                  {{ t('admin.requests.detail.confirmSendQuote') }}
                </small>
                <small v-else-if="!isConfirmed && quotationPdfUrl" class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-info-circle"></i>
                  {{ t('admin.requests.detail.confirmToSendQuote') }}
                </small>
                <button class="btn btn-outline-danger" @click="deleteRequest">
                  <i class="bi bi-trash me-2"></i>{{ t('admin.common.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Shipment Modal -->
    <div v-if="showShipmentModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.requests.detail.createShipmentModal') }}</h5>
            <button type="button" class="btn-close" @click="showShipmentModal = false"></button>
          </div>
          <div class="modal-body">
            <p>{{ t('admin.requests.detail.createShipmentConfirm') }}</p>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.requests.detail.shippingMode') }}</label>
              <select v-model="shipmentForm.shippingMode" class="form-select">
                <option value="air_normal">{{ t('admin.shipments.airStandard') }}</option>
                <option value="air_express">{{ t('admin.shipments.airExpress') }}</option>
                <option value="sea">{{ t('admin.shipments.sea') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.requests.detail.estimatedWeight') }}</label>
              <input v-model.number="shipmentForm.weight" type="number" step="0.1" class="form-control" />
            </div>
            <div class="alert alert-info">
              {{ t('admin.requests.detail.createShipmentHint') }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showShipmentModal = false">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" @click="createShipment" :disabled="creatingShipment">
              <span v-if="creatingShipment" class="spinner-border spinner-border-sm me-2"></span>
              {{ t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const pdfLangQuery = () => {
  const lang = ['fr', 'en', 'zh'].includes(locale.value) ? locale.value : 'fr'
  return `?lang=${lang}`
}

import { ref, reactive, computed, onMounted } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import { useWhatsApp } from '~/composables/useWhatsApp'
import { getToken } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { field } = useLocaleField()
const { formatCurrency, formatDate, formatRequestStatus, requestThumbnailUrl } = useFormatters()

const itemDisplayName = (item: Record<string, unknown>) =>
  field(item, 'name') || String(item.name_fr || item.name_en || '')
const { success, error: notifyError } = useNotification()
const { contactClientForRequest, generateLink, buildClientRequestMessage } = useWhatsApp()

const loading = ref(true)
const showQuotationForm = ref(false)
const showShipmentModal = ref(false)
const creatingShipment = ref(false)
const downloadingPdf = ref(false)

const quotation = reactive({
  productCost: 0,
  inspectionFee: 5000,
  packagingFee: 3000,
  shippingCost: 0
})

const shipmentForm = reactive({
  shippingMode: 'air_normal' as any,
  weight: 1
})

const requestId = route.params.id as string

onMounted(async () => {
  await psStore.fetchRequests()
  loading.value = false
})

const request = computed(() => psStore.getRequestById(requestId))

const requestCurrency = computed(() => {
  const c = (request.value as any)?.currency
  return (c || 'XOF').toString().toUpperCase()
})

const EDITABLE_QUOTATION_STATUSES: RequestStatus[] = ['pending', 'searching', 'negotiating']
const canEditQuotation = computed(() => {
  const status = request.value?.status as RequestStatus | undefined
  return !!status && EDITABLE_QUOTATION_STATUSES.includes(status)
})

const openQuotationForm = () => {
  const d = request.value?.quotedDetails
  if (d) {
    quotation.productCost = Number(d.productCost) || 0
    quotation.inspectionFee = Number(d.inspectionFee) || 0
    quotation.packagingFee = Number(d.packagingFee) || 0
    quotation.shippingCost = Number(d.shippingCost) || 0
  } else {
    quotation.productCost = 0
    quotation.inspectionFee = 5000
    quotation.packagingFee = 3000
    quotation.shippingCost = 0
  }
  showQuotationForm.value = true
}

const quotationTotal = computed(() => {
  const subtotal = quotation.productCost + quotation.inspectionFee + quotation.packagingFee + quotation.shippingCost
  const serviceFee = quotation.productCost * 0.05
  return subtotal + serviceFee
})

const updateStatus = async (status: string) => {
  try {
    await psStore.updateRequestStatus(requestId, status as RequestStatus)
    success(t('admin.requests.detail.statusUpdated'))
  } catch (err) {
    notifyError(t('common.error'))
  }
}

const openShipmentModal = () => {
  showShipmentModal.value = true
}

const createShipment = async () => {
  if (!request.value) return
  
  creatingShipment.value = true
  try {
    const newShipment = await shippingStore.createShipment({
      userId: request.value.userId,
      requestId: request.value.id,
      destinationCountry: 'Côte d\'Ivoire', // Default
      destinationCity: 'Abidjan', // Default
      shippingMode: shipmentForm.shippingMode,
      weight: shipmentForm.weight,
      declaredValue: request.value.budgetEstimated,
      shippingCost: request.value.quotedDetails?.shippingCost || 0
    })
    
    success(t('admin.requests.detail.shipmentCreated'))
    showShipmentModal.value = false
    
    // Refresh to show new status
    await psStore.fetchRequests()
    
    // Redirect to shipment
    router.push(`/admin/shipments/${newShipment.trackingNumber}`)
  } catch (err) {
    notifyError(t('admin.requests.detail.shipmentCreateError'))
  } finally {
    creatingShipment.value = false
  }
}

const submitQuotation = async () => {
  const serviceFee = quotation.productCost * 0.05
  const isUpdate = !!request.value?.quotedPrice

  const quotedDetails = {
    productCost: quotation.productCost,
    serviceFee,
    inspectionFee: quotation.inspectionFee,
    packagingFee: quotation.packagingFee,
    shippingCost: quotation.shippingCost,
    totalPrice: quotationTotal.value
  }

  try {
    await psStore.addQuotation(requestId, quotationTotal.value, quotedDetails)
    showQuotationForm.value = false
    success(isUpdate ? t('admin.requests.detail.quotationUpdated') : t('admin.requests.detail.quotationCreated'))
  } catch (err) {
    notifyError(t('common.error'))
  }
}

const clientFullName = computed(() => {
  const r = request.value as any
  if (!r) return ''
  const u = r.user
  if (u) {
    const name = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    if (name) return name
  }
  return r.contactFullname || ''
})

const clientPhone = computed(() => {
  const r: any = request.value
  if (!r) return ''
  return r.user?.phone || r.contactNumber || r.contact_number || ''
})

/** URL publique du PDF de devis — accessible sans authentification (route publique). */
const quotationPdfUrl = computed(() => {
  if (!request.value?.quotedPrice) return null
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '').replace(/\/$/, '')
  return `${base}/personal-shopping-requests/${request.value.id}/pdf${pdfLangQuery()}`
})

/** Numero de suivi : colonne demande ou colis lie */
const requestTrackingNumber = computed(() => {
  const r = request.value as any
  if (!r) return null
  return (
    r.trackingNumber ||
    r.tracking_number ||
    r.shipment?.tracking_number ||
    r.shipment?.trackingNumber ||
    null
  )
})

/** Lien public vers la page suivi du site (meme origine que l'admin). */
const clientTrackingPageUrl = computed(() => {
  const tn = requestTrackingNumber.value
  if (!tn) return null
  if (typeof window === 'undefined' || !window.location?.origin) return null
  return `${window.location.origin}/import-export/tracking?tracking=${encodeURIComponent(String(tn))}`
})

const isConfirmed = computed(() => {
  const st = request.value?.status
  return ['confirmed', 'preparing', 'shipped', 'delivered'].includes(st || '')
})

const whatsappOptions = computed(() => {
  const r = request.value
  if (!r) {
    return {
      quotationUrl: null as string | null,
      totalLabel: null as string | null,
      confirmed: false,
      trackingNumber: null as string | null,
      trackingPageUrl: null as string | null,
    }
  }
  return {
    quotationUrl: r.quotedPrice ? quotationPdfUrl.value : null,
    totalLabel: r.quotedPrice ? formatCurrency(r.quotedPrice, requestCurrency.value) : null,
    confirmed: isConfirmed.value,
    trackingNumber: requestTrackingNumber.value,
    trackingPageUrl: clientTrackingPageUrl.value,
  }
})

const whatsappLinkForClient = computed(() => {
  if (!request.value) return '#'
  if (!clientPhone.value) return '#'
  const message = buildClientRequestMessage(
    request.value.title,
    request.value.id,
    whatsappOptions.value,
  )
  return generateLink(clientPhone.value, message)
})

const openWhatsApp = () => {
  if (!request.value) return
  contactClientForRequest(
    clientPhone.value,
    request.value.title,
    request.value.id,
    whatsappOptions.value,
  )
}

const downloadQuotationPdf = async () => {
  if (!request.value) return
  downloadingPdf.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const url = `${config.public.apiBase}/personal-shopping-requests/${request.value.id}/pdf${pdfLangQuery()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } })
    if (!res.ok) throw new Error('Erreur PDF')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `devis-${request.value.id}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    notifyError(t('admin.requests.detail.pdfError'))
  } finally {
    downloadingPdf.value = false
  }
}

const deleteRequest = async () => {
  if (!confirm(t('admin.confirm.deleteRequest'))) return

  try {
    await psStore.deleteRequest(requestId)
    success(t('admin.requests.detail.requestDeleted'))
    router.push('/admin/requests')
  } catch (err) {
    notifyError(t('common.error'))
  }
}
</script>
<style scoped>
.request-description :deep(img),
.request-description img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

.request-description {
  line-height: 1.6;
}
</style>

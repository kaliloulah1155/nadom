<template>
  <div class="tracking-page">
    <!-- Hero Section -->
    <section class="tracking-hero">
      <div class="hero-pattern"></div>
      <div class="container position-relative">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center text-white">
            <h1 class="fw-bold mb-3 text-white">{{ t('tracking.title') }}</h1>
            <p class="lead opacity-75 text-white">{{ t('tracking.subtitle') }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container" style="margin-top: -60px;">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Search Card -->
          <div class="card border-0 shadow-lg mb-4">
            <div class="card-body p-4">
              <form @submit.prevent="searchTracking">
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-primary"></i>
                  </span>
                  <input
                    v-model="trackingNumber"
                    type="text"
                    class="form-control border-start-0"
                    :placeholder="t('tracking.placeholderLong')"
                    required
                  />
                  <button
                    type="submit"
                    class="btn btn-primary px-4"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ t('tracking.search') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-circle me-2"></i>
            {{ error }}
          </div>

          <!-- Result -->
          <div v-if="shipment" class="card border-0 shadow">
            <div class="card-header bg-transparent py-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 class="mb-1">{{ shipment.tracking_number }}</h5>
                  <small class="text-muted">{{ shipment.destination_country }} - {{ shipment.destination_city }}</small>
                </div>
                <!-- `ms-auto` : le statut est cale a droite sans dependre de la
                     repartition du conteneur, qui ne le poussait pas au bout. -->
                <span
                  class="badge fs-6 ms-auto text-nowrap"
                  :style="{
                    backgroundColor: formatShipmentStatus(shipment.status).color,
                    color: '#fff'
                  }"
                >
                  <i :class="formatShipmentStatus(shipment.status).icon" class="me-1"></i>
                  {{ formatShipmentStatus(shipment.status).label }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <!-- Summary -->
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">Mode</small>
                    <strong>{{ shippingStore.getShippingModeLabel(shipment.shipping_mode) }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">{{ t('clientForms.weight') }}</small>
                    <strong>{{ shipment.weight ?? '-' }} kg</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">{{ t('clientForms.shipping') }}</small>
                    <strong>{{ formatDateShort(shipment.created_at) }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">{{ t('clientForms.estimatedDelivery') }}</small>
                    <strong>{{ shipment.estimated_delivery ? formatDateShort(shipment.estimated_delivery) : '-' }}</strong>
                  </div>
                </div>
              </div>

              <!-- Conteneur (BL) : n'apparait que si le colis y est rattache.
                   Le code du BL et ses dates sont des informations de transport,
                   sans donnee personnelle — leur place est bien sur le suivi. -->
              <div v-if="shipment.container" class="border rounded p-3 mb-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <div>
                    <small class="text-muted d-block">{{ t('tracking.container') }}</small>
                    <strong class="fs-6"><i class="bi bi-truck-flatbed me-1"></i>{{ shipment.container.code }}</strong>
                  </div>
                  <small class="text-muted">
                    {{ t('tracking.containerLot', {
                      n: shipment.container.container_number,
                      lot: shipment.container.lot_number
                    }) }}
                  </small>
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="p-2 bg-light rounded text-center">
                      <small class="text-muted d-block">{{ t('tracking.etd') }}</small>
                      <strong>{{ shipment.container.etd ? formatDateShort(shipment.container.etd) : '-' }}</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="p-2 bg-light rounded text-center">
                      <small class="text-muted d-block">{{ t('tracking.eta') }}</small>
                      <strong>{{ shipment.container.eta ? formatDateShort(shipment.container.eta) : '-' }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Location -->
              <div class="alert alert-primary mb-4">
                <div class="d-flex align-items-center">
                  <i class="bi bi-geo-alt-fill fs-4 me-3"></i>
                  <div>
                    <strong>{{ t('tracking.currentLocation') }}</strong>
                    <p class="mb-0">{{ shipment.current_location || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Project/Request Details -->
              <div v-if="linkedRequest" class="card bg-light border-0 mb-4">
                <div class="card-body">
                  <h6 class="fw-bold mb-3">
                    <i class="bi bi-bag-check me-2 text-primary"></i>
                    {{ t('tracking.projectDetails') }}
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <small class="text-muted d-block">{{ t('tracking.projectTitle') }}</small>
                      <strong>{{ linkedRequest.title }}</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">{{ t('tracking.projectCategory') }}</small>
                      <strong>{{ linkedRequest.category }}</strong>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">{{ t('tracking.projectStatus') }}</small>
                      <span class="badge" :class="getRequestStatusClass(linkedRequest.status)">
                        {{ getRequestStatusLabel(linkedRequest.status) }}
                      </span>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">{{ t('tracking.budget') }}</small>
                      <strong>{{ formatCurrency(linkedRequest.budget_estimated ?? linkedRequest.budgetEstimated, linkedRequest.currency || 'XOF') }}</strong>
                    </div>
                    <div v-if="linkedRequest.description" class="col-12">
                      <small class="text-muted d-block">{{ t('tracking.description') }}</small>
                      <div class="mb-0 request-description" style="white-space: pre-line">{{ linkedRequest.description }}</div>
                    </div>
                    <div v-if="linkedRequest.images && linkedRequest.images.length > 0" class="col-12">
                      <small class="text-muted d-block mb-2">{{ t('tracking.projectImages') }}</small>
                      <div class="d-flex flex-wrap gap-2">
                        <div
                          v-for="(image, idx) in linkedRequest.images"
                          :key="idx"
                          class="project-image-thumb"
                        >
                          <img
                            :src="resolveStorageAssetUrl(image)"
                            :alt="`Image ${Number(idx) + 1}`"
                            class="img-thumbnail"
                            @click="openZoom(resolveStorageAssetUrl(image))"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <h6 class="fw-bold mb-3">{{ t('tracking.timeline') }}</h6>
              <div class="timeline">
                <div
                  v-for="(event, index) in timelineEvents"
                  :key="index"
                  class="timeline-item"
                  :class="{ 'active': index === 0 }"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="fw-bold mb-1 text-primary">
                          <i :class="formatShipmentStatus(event.status).icon" class="me-2"></i>
                          {{ formatShipmentStatus(event.status).label }}
                        </h6>
                        <div class="request-description" v-html="sanitizeHtml(event.description)"></div>
                        <p class="text-muted small mb-0">{{ event.location }}</p>
                      </div>
                      <small class="text-muted">{{ formatDateShort(event.sdate || event.date) }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions (pas d’étiquette/QR : réservé au back-office / usage interne) -->
              <div class="d-flex gap-2 mt-4 pt-4 border-top flex-wrap">
                <a :href="`https://wa.me/${runtimeCfg.public.whatsapp}`" target="_blank" class="btn btn-success flex-fill">
                  <i class="bi bi-whatsapp me-2"></i>{{ t('tracking.contactSupport') }}
                </a>
                <button class="btn btn-outline-secondary" @click="resetSearch">
                  <i class="bi bi-arrow-left me-2"></i>{{ t('tracking.newSearch') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Personal Shopping only (pas encore d'expedition liee au meme numero) -->
          <div v-else-if="psPublicOnly" class="card border-0 shadow">
            <div class="card-header bg-transparent py-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span class="badge bg-secondary mb-2">Personal Shopping</span>
                  <h5 class="mb-1">{{ psPublicOnly.tracking_number }}</h5>
                  <div class="fw-medium">{{ psPublicOnly.title }}</div>
                  <small v-if="psPublicOnly.category" class="text-muted">{{ psPublicOnly.category }}</small>
                </div>
                <span class="badge fs-6" :class="getRequestStatusClass(psPublicOnly.status)">
                  {{ getRequestStatusLabel(psPublicOnly.status) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                {{ t('tracking.psOnlyHint') }}
              </p>
              <div class="d-flex flex-wrap gap-2">
                <a :href="`https://wa.me/${runtimeCfg.public.whatsapp}`" target="_blank" class="btn btn-success btn-sm">
                  <i class="bi bi-whatsapp me-1"></i>{{ t('common.contactUs') }}
                </a>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetSearch">
                  {{ t('tracking.newSearch') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Suivi générique (réservation guide, visa, …) -->
          <div v-else-if="genericResult" class="card border-0 shadow">
            <div class="card-header bg-transparent py-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span class="badge bg-secondary mb-2">{{ genericResult.type_label }}</span>
                  <h5 class="mb-1">{{ genericResult.reference }}</h5>
                </div>
                <span class="badge fs-6" :class="getRequestStatusClass(genericResult.status)">
                  {{ getRequestStatusLabel(genericResult.status) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <dl class="row mb-3">
                <template v-for="(d, i) in (genericResult.details || [])" :key="i">
                  <dt v-if="d.value" class="col-sm-4 text-muted">{{ d.label }}</dt>
                  <dd v-if="d.value" class="col-sm-8">{{ d.value }}</dd>
                </template>
              </dl>
              <div class="d-flex flex-wrap gap-2">
                <a :href="`https://wa.me/${runtimeCfg.public.whatsapp}`" target="_blank" class="btn btn-success btn-sm">
                  <i class="bi bi-whatsapp me-1"></i>{{ t('common.contactUs') }}
                </a>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetSearch">
                  {{ t('tracking.newSearch') }}
                </button>
              </div>
            </div>
          </div>

          <!-- No Result -->
          <div v-else-if="searched && !shipment && !psPublicOnly && !genericResult && !loading" class="card border-0 shadow">
            <div class="card-body text-center py-5">
              <i class="bi bi-box-seam display-1 text-muted"></i>
              <h4 class="mt-3">{{ t('tracking.packageNotFound') }}</h4>
              <p class="text-muted">
                {{ t('tracking.noPackageMatch') }} <strong>{{ trackingNumber }}</strong>
              </p>
              <p class="text-muted small">
                {{ t('tracking.checkNumber') }}
              </p>
              <a :href="`https://wa.me/${runtimeCfg.public.whatsapp}`" target="_blank" class="btn btn-success">
                <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
              </a>
            </div>
          </div>

          <!-- Help Section -->
          <div v-if="!shipment && !psPublicOnly" class="mt-5">
            <div class="row g-4">
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  <h6>{{ t('tracking.realTimeTracking') }}</h6>
                  <p class="text-muted small">{{ t('tracking.trackEveryStep') }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-bell"></i>
                  </div>
                  <h6>{{ t('tracking.notifications') }}</h6>
                  <p class="text-muted small">{{ t('tracking.alertsWhatsApp') }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-headset"></i>
                  </div>
                  <h6>{{ t('tracking.support247') }}</h6>
                  <p class="text-muted small">{{ t('tracking.teamHelp') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zoom Modal -->
    <div v-if="zoomedImage" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8); z-index: 2000;">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-body p-0 position-relative text-center">
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" @click="zoomedImage = null"></button>
            <img :src="zoomedImage" class="img-fluid rounded shadow-lg" style="max-height: 90vh; cursor: pointer;" @click="zoomedImage = null" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'client',
  // Les utilisateurs back-office sont renvoyes vers leur equivalent admin.
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const runtimeCfg = useRuntimeConfig()
const pub = usePublicApi()
const shippingStore = useShippingStore()
const { formatShipmentStatus, formatDateShort, formatCurrency } = useFormatters()

const trackingNumber = ref('')
const shipment = ref<any>(null)
const psPublicOnly = ref<any>(null)
const genericResult = ref<any>(null)
const zoomedImage = ref<string | null>(null)

const openZoom = (image: string) => {
  zoomedImage.value = image
}

const loading = ref(false)
const error = ref('')
const searched = ref(false)

const linkedRequest = computed(() => shipment.value?.request || null)

const timelineEvents = computed(() => {
  const list = shipment.value?.timeline || []
  return [...list].sort((a, b) => {
    const dateA = new Date(a.sdate || a.date).getTime()
    const dateB = new Date(b.sdate || b.date).getTime()
    return dateB - dateA
  })
})

function syncTrackingQuery(code: string) {
  const cur = typeof route.query.tracking === 'string' ? route.query.tracking : ''
  if (cur === code) return
  router.replace({ path: '/import-export/tracking', query: { tracking: code } })
}

async function searchTracking() {
  const code = trackingNumber.value.trim()
  if (!code) return

  loading.value = true
  error.value = ''
  searched.value = true
  shipment.value = null
  psPublicOnly.value = null
  genericResult.value = null

  try {
    const shipRes = await pub.get<any>(`/shipments/track/${encodeURIComponent(code)}`)
    if (shipRes.success && shipRes.data) {
      shipment.value = shipRes.data
      syncTrackingQuery(code)
      return
    }

    const psRes = await pub.get<any>(`/personal-shopping-requests/track/${encodeURIComponent(code)}`)
    if (psRes.success && psRes.data) {
      const d = psRes.data
      if (d.shipment) {
        shipment.value = d.shipment
      } else {
        psPublicOnly.value = d
      }
      syncTrackingQuery(code)
      return
    }

    // Suivi unifié : réservation guide, visa, ou autre type
    const genRes = await pub.get<any>(`/track/${encodeURIComponent(code)}`)
    if (genRes.success && genRes.data) {
      genericResult.value = genRes.data
      syncTrackingQuery(code)
      return
    }
  } catch (err) {
    error.value = (err as Error).message || 'Erreur lors de la recherche'
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  trackingNumber.value = ''
  shipment.value = null
  psPublicOnly.value = null
  genericResult.value = null
  error.value = ''
  searched.value = false
  router.replace({ path: '/import-export/tracking' })
}

watch(
  () => route.query.tracking,
  async (q) => {
    const raw = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : ''
    const v = raw ? String(raw).trim() : ''
    if (!v) {
      if (searched.value && (shipment.value || psPublicOnly.value || genericResult.value || trackingNumber.value)) {
        trackingNumber.value = ''
        shipment.value = null
        psPublicOnly.value = null
        genericResult.value = null
        error.value = ''
        searched.value = false
      }
      return
    }
    if (trackingNumber.value === v && (shipment.value || psPublicOnly.value || genericResult.value)) {
      return
    }
    trackingNumber.value = v
    await searchTracking()
  },
  { immediate: true }
)

const getRequestStatusLabel = (status: string) => {
  const key = `personalShopping.status.${status}`
  const translated = t(key)
  return translated !== key ? translated : status
}

const getRequestStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-warning-subtle text-warning',
    searching: 'bg-info-subtle text-info',
    negotiating: 'bg-primary-subtle text-primary',
    confirmed: 'bg-success-subtle text-success',
    preparing: 'bg-secondary-subtle text-secondary',
    shipped: 'bg-dark-subtle text-dark',
    delivered: 'bg-success text-white',
    cancelled: 'bg-danger-subtle text-danger'
  }
  return classes[status] || 'bg-secondary-subtle'
}
</script>

<style scoped>
.tracking-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.tracking-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding-bottom: 100px;
  position: relative;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.help-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
  padding-left: 20px;
  border-left: 2px solid #e5e7eb;
}

.timeline-item:last-child {
  padding-bottom: 0;
  border-left: 2px solid transparent;
}

.timeline-item.active {
  border-left-color: var(--bs-primary);
}

.timeline-dot {
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid #fff;
}

.timeline-item.active .timeline-dot {
  background: var(--bs-primary);
  box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.2);
}

.timeline-content {
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.project-image-thumb {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.project-image-thumb:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.project-image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.request-description :deep(img),
.request-description img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

.request-description {
  line-height: 1.5;
  margin-bottom: 4px;
}
</style>

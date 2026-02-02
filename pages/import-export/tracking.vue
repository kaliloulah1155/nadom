<template>
  <div class="tracking-page">
    <!-- Hero Section -->
    <section class="tracking-hero">
      <div class="hero-pattern"></div>
      <div class="container position-relative py-5">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center text-white">
            <div class="mb-4">
              <i class="bi bi-box-seam display-3"></i>
            </div>
            <h1 class="fw-bold mb-3">{{ t('tracking.title') }}</h1>
            <p class="lead opacity-75">{{ t('tracking.subtitle') }}</p>
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
                    :placeholder="locale === 'fr' ? 'Entrez votre numero de suivi (ex: TRK-2024-001234)' : 'Enter your tracking number (e.g., TRK-2024-001234)'"
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
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">{{ shipment.trackingNumber }}</h5>
                  <small class="text-muted">{{ shipment.destinationCountry }} - {{ shipment.destinationCity }}</small>
                </div>
                <span
                  class="badge fs-6"
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
                    <strong>{{ shippingStore.getShippingModeLabel(shipment.shippingMode) }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">Poids</small>
                    <strong>{{ shipment.weight }} kg</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">Expedition</small>
                    <strong>{{ formatDateShort(shipment.createdAt) }}</strong>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-light rounded text-center">
                    <small class="text-muted d-block">Livraison estimee</small>
                    <strong>{{ shipment.estimatedDelivery }}</strong>
                  </div>
                </div>
              </div>

              <!-- Current Location -->
              <div class="alert alert-primary mb-4">
                <div class="d-flex align-items-center">
                  <i class="bi bi-geo-alt-fill fs-4 me-3"></i>
                  <div>
                    <strong>Position actuelle</strong>
                    <p class="mb-0">{{ shipment.currentLocation }}</p>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <h6 class="fw-bold mb-3">Historique</h6>
              <div class="timeline">
                <div
                  v-for="(event, index) in [...shipment.timeline].reverse()"
                  :key="index"
                  class="timeline-item"
                  :class="{ 'active': index === 0 }"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{{ event.description }}</strong>
                        <p class="text-muted small mb-0">{{ event.location }}</p>
                      </div>
                      <small class="text-muted">{{ formatDateShort(event.date) }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex gap-2 mt-4 pt-4 border-top">
                <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-success flex-fill">
                  <i class="bi bi-whatsapp me-2"></i>Contacter le support
                </a>
                <button class="btn btn-outline-secondary" @click="resetSearch">
                  <i class="bi bi-arrow-left me-2"></i>Nouvelle recherche
                </button>
              </div>
            </div>
          </div>

          <!-- No Result -->
          <div v-else-if="searched && !shipment && !loading" class="card border-0 shadow">
            <div class="card-body text-center py-5">
              <i class="bi bi-box-seam display-1 text-muted"></i>
              <h4 class="mt-3">{{ locale === 'fr' ? 'Colis non trouve' : 'Package not found' }}</h4>
              <p class="text-muted">
                {{ locale === 'fr' ? 'Aucun colis ne correspond au numero' : 'No package matches the number' }} <strong>{{ trackingNumber }}</strong>
              </p>
              <p class="text-muted small">
                {{ locale === 'fr' ? 'Verifiez le numero de suivi ou contactez notre support.' : 'Check the tracking number or contact our support.' }}
              </p>
              <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-success">
                <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
              </a>
            </div>
          </div>

          <!-- Help Section -->
          <div v-if="!shipment" class="mt-5">
            <div class="row g-4">
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  <h6>{{ locale === 'fr' ? 'Suivi en temps reel' : 'Real-time tracking' }}</h6>
                  <p class="text-muted small">{{ locale === 'fr' ? 'Suivez votre colis a chaque etape' : 'Track your package at every step' }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-bell"></i>
                  </div>
                  <h6>{{ locale === 'fr' ? 'Notifications' : 'Notifications' }}</h6>
                  <p class="text-muted small">{{ locale === 'fr' ? 'Recevez des alertes sur WhatsApp' : 'Get alerts on WhatsApp' }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="help-icon mb-3">
                    <i class="bi bi-headset"></i>
                  </div>
                  <h6>{{ locale === 'fr' ? 'Support 24/7' : '24/7 Support' }}</h6>
                  <p class="text-muted small">{{ locale === 'fr' ? 'Notre equipe est a votre ecoute' : 'Our team is here to help' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useShippingStore, type Shipment } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const route = useRoute()
const shippingStore = useShippingStore()
const { formatShipmentStatus, formatDateShort } = useFormatters()

const trackingNumber = ref('')
const shipment = ref<Shipment | null>(null)
const loading = ref(false)
const error = ref('')
const searched = ref(false)

// Check for query param
onMounted(async () => {
  await shippingStore.fetchShipments()

  const tracking = route.query.tracking as string
  if (tracking) {
    trackingNumber.value = tracking
    await searchTracking()
  }
})

const searchTracking = async () => {
  if (!trackingNumber.value.trim()) return

  loading.value = true
  error.value = ''
  searched.value = true

  try {
    const result = await shippingStore.trackShipment(trackingNumber.value.trim())
    shipment.value = result || null
  } catch (err) {
    error.value = (err as Error).message || 'Erreur lors de la recherche'
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  trackingNumber.value = ''
  shipment.value = null
  error.value = ''
  searched.value = false
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
</style>

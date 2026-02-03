<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('importExport.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">
              {{ t('importExport.subtitle') }}
            </p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <NuxtLink to="/import-export/calculator" class="btn btn-light btn-md me-2">
              <i class="bi bi-calculator "></i>{{ t('nav.calculator') }}
            </NuxtLink>
            <NuxtLink to="/import-export/tracking" class="btn btn-outline-light btn-md">
              <i class="bi bi-search"></i>{{ t('nav.tracking') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Modes -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('importExport.shippingModes') }}</h2>
          <p class="text-muted">{{ t('importExport.shippingModesSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-danger-subtle text-danger">
                  <i class="bi bi-airplane"></i>
                </div>
                <h5>{{ t('importExport.airExpress') }}</h5>
                <p class="text-muted">{{ t('importExport.airExpressDesc') }}</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airExpressTransit') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airExpressTracking') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airExpressIdeal') }}</li>
                </ul>
                <p class="fw-bold text-primary mb-0">{{ t('pricing.from') }} 12 500 FCFA/kg</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm border-primary">
              <div class="card-header bg-primary text-white text-center py-2">
                <small class="fw-medium">{{ t('pricing.popular') }}</small>
              </div>
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-primary-subtle text-primary">
                  <i class="bi bi-airplane"></i>
                </div>
                <h5>{{ t('importExport.airStandard') }}</h5>
                <p class="text-muted">{{ t('importExport.airStandardDesc') }}</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airStandardTransit') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airStandardTracking') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.airStandardIdeal') }}</li>
                </ul>
                <p class="fw-bold text-primary mb-0">{{ t('pricing.from') }} 9 000 FCFA/kg</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-info-subtle text-info">
                  <i class="bi bi-water"></i>
                </div>
                <h5>{{ t('importExport.seaFreight') }}</h5>
                <p class="text-muted">{{ t('importExport.seaFreightDesc') }}</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.seaFreightTransit') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.seaFreightPrice') }}</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>{{ t('importExport.seaFreightIdeal') }}</li>
                </ul>
                <p class="fw-bold text-primary mb-0">{{ t('pricing.from') }} 2 000 FCFA/kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Destinations -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('importExport.destinations') }}</h2>
          <p class="text-muted">{{ t('importExport.destinationsSubtitle') }}</p>
        </div>

        <div class="row g-3">
          <div v-for="dest in destinations" :key="dest.id" class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <span class="fs-2">{{ dest.flag }}</span>
                <h6 class="mb-0 mt-2">{{ dest.country }}</h6>
                <small class="text-muted">{{ dest.city }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-box-seam"></i>
              </div>
              <h5>{{ t('importExport.consolidation') }}</h5>
              <p class="text-muted small">{{ t('importExport.consolidationDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5>{{ t('importExport.securePacking') }}</h5>
              <p class="text-muted small">{{ t('importExport.securePackingDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-file-text"></i>
              </div>
              <h5>{{ t('importExport.customsClearance') }}</h5>
              <p class="text-muted small">{{ t('importExport.customsClearanceDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-truck"></i>
              </div>
              <h5>{{ t('importExport.delivery') }}</h5>
              <p class="text-muted small">{{ t('importExport.deliveryDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5 bg-primary text-white text-center">
      <div class="container">
        <h2 class="fw-bold mb-3">{{ t('importExport.ctaTitle') }}</h2>
        <p class="lead opacity-75 mb-4">{{ t('importExport.ctaSubtitle') }}</p>
        <NuxtLink to="/import-export/calculator" class="btn btn-light btn-lg">
          <i class="bi bi-calculator me-2"></i>{{ t('importExport.useCalculator') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useShippingStore } from '~/stores/shipping'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const shippingStore = useShippingStore()

onMounted(async () => {
  await shippingStore.fetchDestinations()
})

const destinations = computed(() => shippingStore.destinations)
</script>

<style scoped>
.hero-mini {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #1e40af 100%);
}

.shipping-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.service-icon {
  width: 70px;
  height: 70px;
  background: var(--bs-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>

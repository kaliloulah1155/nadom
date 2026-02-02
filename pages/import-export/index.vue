<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3 text-white">Import-Export</h1>
            <p class="lead opacity-75 mb-0 text-white">
              Expedition de vos marchandises depuis la Chine vers l'Afrique. Fret aerien et maritime, consolidation de colis, dedouanement.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <NuxtLink to="/import-export/calculator" class="btn btn-light btn-lg me-2 mb-2">
              <i class="bi bi-calculator me-2"></i>Calculateur
            </NuxtLink>
            <NuxtLink to="/import-export/tracking" class="btn btn-outline-light btn-lg">
              <i class="bi bi-search me-2"></i>Tracking
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Modes -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Modes d'expedition</h2>
          <p class="text-muted">Choisissez le mode adapte a vos besoins</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-danger-subtle text-danger">
                  <i class="bi bi-airplane"></i>
                </div>
                <h5>Fret Aerien Express</h5>
                <p class="text-muted">Livraison rapide pour vos colis urgents</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>3-5 jours de transit</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Suivi en temps reel</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Ideal petits colis</li>
                </ul>
                <p class="fw-bold text-primary mb-0">A partir de 12 500 FCFA/kg</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm border-primary">
              <div class="card-header bg-primary text-white text-center py-2">
                <small class="fw-medium">Populaire</small>
              </div>
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-primary-subtle text-primary">
                  <i class="bi bi-airplane"></i>
                </div>
                <h5>Fret Aerien Standard</h5>
                <p class="text-muted">Le meilleur rapport qualite-prix</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>15-18 jours de transit</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Suivi regulier</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Tous types de colis</li>
                </ul>
                <p class="fw-bold text-primary mb-0">A partir de 9 000 FCFA/kg</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4 text-center">
                <div class="shipping-icon mx-auto mb-3 bg-info-subtle text-info">
                  <i class="bi bi-water"></i>
                </div>
                <h5>Fret Maritime</h5>
                <p class="text-muted">Economique pour les gros volumes</p>
                <ul class="list-unstyled text-start">
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>30-45 jours de transit</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Prix tres competitif</li>
                  <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Ideal gros volumes</li>
                </ul>
                <p class="fw-bold text-primary mb-0">A partir de 2 000 FCFA/kg</p>
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
          <h2 class="fw-bold">Destinations</h2>
          <p class="text-muted">Nous livrons dans toute l'Afrique</p>
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
              <h5>Consolidation</h5>
              <p class="text-muted small">Regroupez vos achats de differents fournisseurs</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5>Emballage securise</h5>
              <p class="text-muted small">Protection optimale de vos marchandises</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-file-text"></i>
              </div>
              <h5>Dedouanement</h5>
              <p class="text-muted small">Assistance complete pour les formalites</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-truck"></i>
              </div>
              <h5>Livraison</h5>
              <p class="text-muted small">Livraison porte a porte disponible</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5 bg-primary text-white text-center">
      <div class="container">
        <h2 class="fw-bold mb-3">Calculez vos frais d'expedition</h2>
        <p class="lead opacity-75 mb-4">Obtenez une estimation instantanee</p>
        <NuxtLink to="/import-export/calculator" class="btn btn-light btn-lg">
          <i class="bi bi-calculator me-2"></i>Utiliser le calculateur
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

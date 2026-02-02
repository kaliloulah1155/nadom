<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3">Nos Tarifs</h1>
            <p class="lead opacity-75 mb-0">
              Tarifs transparents pour tous nos services d'import-export
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Choisissez votre formule</h2>
          <p class="text-muted">Des tarifs adaptes a vos besoins</p>
        </div>

        <div class="row g-4 justify-content-center">
          <!-- Personal Shopping -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-0 shadow-sm pricing-card">
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-bag-check fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">Personal Shopping</h4>
                <p class="text-muted small mb-0">Recherche et achat de produits</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="h2 fw-bold text-primary">5%</span>
                  <span class="text-muted">commission</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Recherche de produits
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Negociation des prix
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Controle qualite
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Photos avant expedition
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Suivi WhatsApp
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <NuxtLink to="/personal-shopping/new" class="btn btn-primary w-100">
                  Commencer
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Expedition -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-primary border-2 shadow pricing-card featured">
              <div class="badge bg-primary position-absolute top-0 start-50 translate-middle">
                Populaire
              </div>
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-airplane fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">Expedition</h4>
                <p class="text-muted small mb-0">Transport de marchandises</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="text-muted">A partir de</span>
                  <span class="h2 fw-bold text-primary d-block">9 000 FCFA</span>
                  <span class="text-muted">/kg (aerien)</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Fret aerien express (3-5j)
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Fret aerien standard (15-18j)
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Fret maritime (30-45j)
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Emballage securise
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Suivi en temps reel
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Assurance incluse
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <NuxtLink to="/import-export/calculator" class="btn btn-primary w-100">
                  Calculer mon tarif
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Services Annexes -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-0 shadow-sm pricing-card">
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-gear fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">Services Annexes</h4>
                <p class="text-muted small mb-0">Visa, guides, etc.</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="text-muted">Variable selon</span>
                  <span class="h4 fw-bold text-primary d-block">le service</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Assistance visa Chine
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Guides francophones
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Visite d'usines
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Interpretation
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    Accompagnement marches
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-primary w-100">
                  <i class="bi bi-whatsapp me-2"></i>Nous contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Rates Table -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Grille tarifaire expedition</h2>
          <p class="text-muted">Tarifs par kg selon la destination et le mode</p>
        </div>

        <div class="table-responsive">
          <table class="table table-hover bg-white rounded shadow-sm">
            <thead class="table-primary">
              <tr>
                <th>Destination</th>
                <th class="text-center">Aerien Express<br><small>(3-5 jours)</small></th>
                <th class="text-center">Aerien Standard<br><small>(15-18 jours)</small></th>
                <th class="text-center">Maritime<br><small>(30-45 jours)</small></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dest in destinations" :key="dest.id">
                <td>
                  <span class="me-2">{{ dest.flag }}</span>
                  {{ dest.country }}
                </td>
                <td class="text-center" v-for="mode in dest.shippingModes" :key="mode.mode">
                  <strong>{{ formatCurrency(mode.costPerKg) }}</strong>/kg
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          Les tarifs ci-dessus sont indicatifs et peuvent varier selon le volume et le type de marchandises.
          <NuxtLink to="/import-export/calculator" class="alert-link">Utilisez notre calculateur</NuxtLink> pour une estimation precise.
        </div>
      </div>
    </section>

    <!-- FAQ Pricing -->
    <section class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-6">
            <h3 class="fw-bold mb-4">Questions frequentes</h3>
            <div class="accordion" id="pricingFaq">
              <div class="accordion-item border-0 mb-3 shadow-sm">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                    Comment est calculee la commission ?
                  </button>
                </h2>
                <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#pricingFaq">
                  <div class="accordion-body">
                    La commission de 5% est calculee sur le prix d'achat du produit. Elle couvre la recherche, la negociation, le controle qualite et la coordination avec les fournisseurs.
                  </div>
                </div>
              </div>
              <div class="accordion-item border-0 mb-3 shadow-sm">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                    Y a-t-il des frais caches ?
                  </button>
                </h2>
                <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                  <div class="accordion-body">
                    Non, tous nos tarifs sont transparents. Les seuls frais supplementaires peuvent etre les frais de douane qui dependent de la nature des marchandises et sont reglementes par votre pays.
                  </div>
                </div>
              </div>
              <div class="accordion-item border-0 mb-3 shadow-sm">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                    Quels modes de paiement acceptez-vous ?
                  </button>
                </h2>
                <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                  <div class="accordion-body">
                    Nous acceptons les virements bancaires, Orange Money, Wave, et Western Union. Le paiement se fait generalement en deux temps : un acompte a la commande et le solde avant expedition.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm bg-primary text-white h-100">
              <div class="card-body p-5 d-flex flex-column justify-content-center">
                <h3 class="fw-bold mb-3">Besoin d'un devis personnalise ?</h3>
                <p class="opacity-75 mb-4">
                  Pour les commandes en gros ou les besoins specifiques, contactez-nous pour obtenir un devis adapte a votre projet.
                </p>
                <div class="d-flex gap-3 flex-wrap">
                  <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light">
                    <i class="bi bi-whatsapp me-2"></i>WhatsApp
                  </a>
                  <NuxtLink to="/contact-us" class="btn btn-outline-light">
                    Formulaire de contact
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { FAKE_DESTINATIONS } from '~/utils/data/fakeData'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { formatCurrency } = useFormatters()
const destinations = FAKE_DESTINATIONS
</script>

<style scoped>
.hero-mini {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #1e40af 100%);
}

.pricing-card {
  transition: transform 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
}

.pricing-card.featured {
  transform: scale(1.02);
}

.pricing-card.featured:hover {
  transform: scale(1.02) translateY(-10px);
}

.pricing-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.accordion-button:not(.collapsed) {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}
</style>

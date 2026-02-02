<template>
  <div class="guide-page">
    <!-- Hero Section -->
    <section class="guide-hero">
      <div class="hero-pattern"></div>
      <div class="container position-relative py-5">
        <div class="row align-items-center">
          <div class="col-lg-8 text-white">
            <div class="mb-3">
              <span class="badge bg-warning text-dark px-3 py-2">
                <i class="bi bi-book me-1"></i>{{ t('guide.badge') }}
              </span>
            </div>
            <h1 class="display-5 fw-bold mb-3">{{ t('guide.title') }}</h1>
            <p class="lead opacity-75 mb-0">{{ t('guide.subtitle') }}</p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light btn-lg">
              <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="container" style="margin-top: -60px;">
      <!-- Documentation Guides Section -->
      <section class="mb-5">
        <div class="section-header mb-4">
          <h3 class="fw-bold">{{ t('guide.docTitle') }}</h3>
          <p class="text-muted mb-0">{{ t('guide.docSubtitle') }}</p>
        </div>

        <!-- Category Filters -->
        <div class="d-flex flex-wrap gap-2 mb-4">
          <button
            v-for="cat in docCategories"
            :key="cat.id"
            class="btn"
            :class="selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-primary'"
            @click="selectedCategory = cat.id"
          >
            <i :class="cat.icon" class="me-2"></i>{{ cat.name }}
          </button>
        </div>

        <!-- Documentation Grid -->
        <div class="row g-4">
          <div v-for="doc in filteredDocs" :key="doc.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-lg doc-card">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="doc-icon">
                    <i :class="getCategoryIcon(doc.category)"></i>
                  </div>
                  <span class="badge bg-primary-subtle text-primary">{{ getCategoryLabel(doc.category) }}</span>
                </div>
                <h5 class="card-title fw-bold mb-2">{{ doc.name }}</h5>
                <p class="text-muted small mb-3">{{ doc.description }}</p>
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-translate text-muted me-2"></i>
                  <small class="text-muted">{{ doc.language }}</small>
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 p-4 pt-0">
                <a
                  v-if="doc.fileUrl"
                  :href="doc.fileUrl"
                  target="_blank"
                  class="btn btn-primary w-100"
                >
                  <i class="bi bi-file-earmark-pdf me-2"></i>{{ t('guide.downloadPdf') }}
                </a>
                <a
                  v-else
                  :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`"
                  target="_blank"
                  class="btn btn-outline-primary w-100"
                >
                  <i class="bi bi-whatsapp me-2"></i>{{ t('guide.requestDoc') }}
                </a>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredDocs.length === 0" class="col-12">
            <div class="card border-0 shadow text-center py-5">
              <i class="bi bi-file-earmark-x display-1 text-muted"></i>
              <h5 class="mt-3">{{ locale === 'fr' ? 'Aucun guide disponible' : 'No guide available' }}</h5>
              <p class="text-muted">{{ locale === 'fr' ? 'Contactez-nous pour plus d\'informations.' : 'Contact us for more information.' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tour Guides Section -->
      <section class="tour-guides-section mb-5">
        <div class="section-header-inline mb-4">
          <h3 class="fw-bold">{{ t('guide.interpretersTitle') }}</h3>
          <p class="text-muted mb-0">{{ t('guide.interpretersSubtitle') }}</p>
        </div>

        <!-- Filters -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label small text-muted">{{ t('guide.filterCity') }}</label>
                <select v-model="filters.city" class="form-select">
                  <option value="">{{ t('guide.allCities') }}</option>
                  <option v-for="city in allCities" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small text-muted">{{ t('guide.filterSpec') }}</label>
                <select v-model="filters.specialization" class="form-select">
                  <option value="">{{ t('guide.allSpecs') }}</option>
                  <option v-for="spec in allSpecs" :key="spec" :value="spec">{{ spec }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small text-muted">{{ t('guide.filterLang') }}</label>
                <select v-model="filters.language" class="form-select">
                  <option value="">{{ t('guide.allLangs') }}</option>
                  <option v-for="lang in allLanguages" :key="lang" :value="lang">{{ lang }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tour Guides Grid -->
        <div class="row g-4">
          <div v-for="guide in filteredGuides" :key="guide.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-lg guide-card">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <img
                    :src="guide.avatar"
                    class="rounded-circle me-3"
                    width="70"
                    height="70"
                    style="object-fit: cover;"
                  />
                  <div>
                    <h5 class="mb-1">{{ guide.name }}</h5>
                    <div class="text-warning">
                      <i v-for="i in 5" :key="i" :class="i <= Math.floor(guide.rating) ? 'bi-star-fill' : 'bi-star'" class="bi small me-1"></i>
                      <span class="text-muted small ms-1">{{ guide.rating }} ({{ guide.reviews }})</span>
                    </div>
                  </div>
                </div>

                <p class="text-muted small mb-3">{{ guide.description }}</p>

                <div class="mb-3">
                  <div class="mb-2">
                    <i class="bi bi-geo-alt text-primary me-2"></i>
                    <small>{{ guide.cities?.join(', ') }}</small>
                  </div>
                  <div class="mb-2">
                    <i class="bi bi-translate text-primary me-2"></i>
                    <small>{{ guide.languages?.join(', ') }}</small>
                  </div>
                  <div>
                    <i class="bi bi-briefcase text-primary me-2"></i>
                    <small>{{ guide.experience }} {{ locale === 'fr' ? 'ans d\'experience' : 'years experience' }}</small>
                  </div>
                </div>

                <div class="d-flex flex-wrap gap-1 mb-3">
                  <span v-for="spec in guide.specializations?.slice(0, 3)" :key="spec" class="badge bg-light text-dark small">
                    {{ spec }}
                  </span>
                  <span v-if="guide.specializations?.length > 3" class="badge bg-light text-dark small">
                    +{{ guide.specializations.length - 3 }}
                  </span>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <small class="text-muted">{{ locale === 'fr' ? 'A partir de' : 'From' }}</small>
                    <div class="fw-bold text-primary">{{ formatCurrency(guide.pricePerDay) }}/{{ locale === 'fr' ? 'jour' : 'day' }}</div>
                  </div>
                  <span v-if="guide.available" class="badge bg-success">{{ locale === 'fr' ? 'Disponible' : 'Available' }}</span>
                  <span v-else class="badge bg-secondary">{{ locale === 'fr' ? 'Indisponible' : 'Unavailable' }}</span>
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 p-4 pt-0">
                <a
                  :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`"
                  target="_blank"
                  class="btn btn-primary w-100"
                  :class="{ 'disabled': !guide.available }"
                >
                  <i class="bi bi-calendar-check me-2"></i>{{ t('guide.book') }}
                </a>
              </div>
            </div>
          </div>

          <div v-if="filteredGuides.length === 0" class="col-12">
            <div class="card border-0 shadow text-center py-5">
              <i class="bi bi-search display-1 text-muted"></i>
              <h5 class="mt-3">{{ locale === 'fr' ? 'Aucun guide trouve' : 'No guide found' }}</h5>
              <p class="text-muted">{{ locale === 'fr' ? 'Modifiez vos filtres de recherche' : 'Adjust your search filters' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section class="services-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('guide.ourServices') }}</span>
          <h3 class="fw-bold">{{ t('guide.servicesTitle') }}</h3>
        </div>

        <div class="row g-4">
          <div v-for="(service, index) in services" :key="index" class="col-md-4">
            <div class="card h-100 border-0 shadow-sm service-card text-center">
              <div class="card-body p-4">
                <div class="service-icon mx-auto mb-3">
                  <i :class="service.icon"></i>
                </div>
                <h5>{{ service.title }}</h5>
                <p class="text-muted small mb-0">{{ service.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CTA Section -->
    <section class="cta-section py-5">
      <div class="cta-pattern"></div>
      <div class="container text-center position-relative">
        <h2 class="fw-bold text-white mb-3">{{ t('guide.ctaTitle') }}</h2>
        <p class="lead text-white opacity-75 mb-4">{{ t('guide.ctaSubtitle') }}</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light btn-lg">
            <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { useGuidesStore } from '~/stores/guides'
import { useFormatters } from '~/composables/useFormatters'
import { FAKE_GUIDES } from '~/utils/data/fakeData'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const guidesStore = useGuidesStore()
const { formatCurrency } = useFormatters()

// Documentation guides from admin
const documentationGuides = ref<any[]>([])
const selectedCategory = ref('all')

// Tour guide filters
const filters = reactive({
  city: '',
  specialization: '',
  language: ''
})

// Tour guides data
const tourGuides = ref<any[]>([])

onMounted(async () => {
  // Load documentation guides from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guides')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if it's documentation guides (has category property but no cities)
      if (parsed.length > 0 && parsed[0].category && !parsed[0].cities) {
        documentationGuides.value = parsed.filter((g: any) => g.active !== false)
      }
    }
  }

  // If no docs from localStorage, use defaults
  if (documentationGuides.value.length === 0) {
    documentationGuides.value = [
      { id: 'doc_1', name: locale.value === 'fr' ? 'Guide Import Chine-Afrique' : 'China-Africa Import Guide', category: 'import', description: locale.value === 'fr' ? 'Guide complet pour importer des marchandises de Chine vers l\'Afrique' : 'Complete guide to importing goods from China to Africa', language: locale.value === 'fr' ? 'Francais' : 'French', fileUrl: '', active: true },
      { id: 'doc_2', name: locale.value === 'fr' ? 'Procedures Douanieres' : 'Customs Procedures', category: 'douane', description: locale.value === 'fr' ? 'Tout savoir sur les procedures douanieres et les documents requis' : 'Everything about customs procedures and required documents', language: locale.value === 'fr' ? 'Francais' : 'French', fileUrl: '', active: true },
      { id: 'doc_3', name: locale.value === 'fr' ? 'Modes de Paiement' : 'Payment Methods', category: 'paiement', description: locale.value === 'fr' ? 'Les differents modes de paiement securises pour vos transactions' : 'Different secure payment methods for your transactions', language: locale.value === 'fr' ? 'Francais' : 'French', fileUrl: '', active: true }
    ]
  }

  // Load tour guides - use FAKE_GUIDES directly
  tourGuides.value = [...FAKE_GUIDES]
})

// Documentation categories
const docCategories = computed(() => [
  { id: 'all', name: locale.value === 'fr' ? 'Tous' : 'All', icon: 'bi bi-grid' },
  { id: 'import', name: 'Import', icon: 'bi bi-box-arrow-in-down' },
  { id: 'export', name: 'Export', icon: 'bi bi-box-arrow-up' },
  { id: 'douane', name: locale.value === 'fr' ? 'Douane' : 'Customs', icon: 'bi bi-building' },
  { id: 'transport', name: 'Transport', icon: 'bi bi-truck' },
  { id: 'paiement', name: locale.value === 'fr' ? 'Paiement' : 'Payment', icon: 'bi bi-credit-card' }
])

const filteredDocs = computed(() => {
  if (selectedCategory.value === 'all') return documentationGuides.value
  return documentationGuides.value.filter(d => d.category === selectedCategory.value)
})

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    import: 'bi bi-box-arrow-in-down',
    export: 'bi bi-box-arrow-up',
    douane: 'bi bi-building',
    transport: 'bi bi-truck',
    paiement: 'bi bi-credit-card',
    general: 'bi bi-book'
  }
  return icons[category] || 'bi bi-file-text'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, Record<string, string>> = {
    import: { fr: 'Import', en: 'Import' },
    export: { fr: 'Export', en: 'Export' },
    douane: { fr: 'Douane', en: 'Customs' },
    transport: { fr: 'Transport', en: 'Transport' },
    paiement: { fr: 'Paiement', en: 'Payment' },
    general: { fr: 'General', en: 'General' }
  }
  return labels[category]?.[locale.value] || category
}

// Tour guides
const allCities = computed(() => {
  const cities = new Set<string>()
  tourGuides.value.forEach(g => g.cities?.forEach((c: string) => cities.add(c)))
  return Array.from(cities)
})

const allSpecs = computed(() => {
  const specs = new Set<string>()
  tourGuides.value.forEach(g => g.specializations?.forEach((s: string) => specs.add(s)))
  return Array.from(specs)
})

const allLanguages = computed(() => {
  const languages = new Set<string>()
  tourGuides.value.forEach(g => g.languages?.forEach((l: string) => languages.add(l)))
  return Array.from(languages)
})

const filteredGuides = computed(() => {
  return tourGuides.value.filter((guide: any) => {
    if (filters.city && !guide.cities?.includes(filters.city)) return false
    if (filters.specialization && !guide.specializations?.includes(filters.specialization)) return false
    if (filters.language && !guide.languages?.includes(filters.language)) return false
    return true
  })
})

// Services
const services = computed(() => locale.value === 'fr' ? [
  { icon: 'bi bi-shop', title: 'Visite de marches', description: 'Accompagnement dans les grands marches de gros en Chine' },
  { icon: 'bi bi-building', title: 'Visite d\'usines', description: 'Organisation de visites chez les fabricants et producteurs' },
  { icon: 'bi bi-people', title: 'Negociation', description: 'Assistance pour negocier les meilleurs prix avec les fournisseurs' },
  { icon: 'bi bi-translate', title: 'Interpretation', description: 'Traduction professionnelle lors de vos reunions d\'affaires' },
  { icon: 'bi bi-truck', title: 'Logistique locale', description: 'Gestion du transport local et des formalites' },
  { icon: 'bi bi-calendar-check', title: 'Planification', description: 'Organisation complete de votre voyage d\'affaires' }
] : [
  { icon: 'bi bi-shop', title: 'Market Visits', description: 'Accompaniment in major wholesale markets in China' },
  { icon: 'bi bi-building', title: 'Factory Visits', description: 'Organization of visits to manufacturers and producers' },
  { icon: 'bi bi-people', title: 'Negotiation', description: 'Assistance to negotiate the best prices with suppliers' },
  { icon: 'bi bi-translate', title: 'Interpretation', description: 'Professional translation during your business meetings' },
  { icon: 'bi bi-truck', title: 'Local Logistics', description: 'Management of local transport and formalities' },
  { icon: 'bi bi-calendar-check', title: 'Planning', description: 'Complete organization of your business trip' }
])
</script>

<style scoped>
.guide-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.guide-hero {
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

.section-header {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.section-header-inline {
  padding: 20px 0;
}

.doc-card, .guide-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
}

.doc-card:hover, .guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.doc-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.service-card {
  transition: transform 0.3s ease;
  border-radius: 16px;
}

.service-card:hover {
  transform: translateY(-3px);
}

.service-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--bs-primary);
}

.tour-guides-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.services-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.cta-section {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  position: relative;
  overflow: hidden;
}

.cta-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none;
}
</style>

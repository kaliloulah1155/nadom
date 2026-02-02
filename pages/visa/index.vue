<template>
  <div class="visa-page">
    <!-- Hero Section -->
    <section class="visa-hero">
      <div class="hero-pattern"></div>
      <div class="container position-relative">
        <div class="row align-items-center">
          <div class="col-lg-8 text-white">
            <div class="mb-3">
              <span class="badge bg-warning text-dark px-3">
                <i class="bi bi-passport me-1"></i>{{ t('visa.badge') }}
              </span>
            </div>
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('visa.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">{{ t('visa.subtitle') }}</p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light btn-lg">
              <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="container mt-2">
      <!-- Visa Types -->
      <div class="row g-4 mb-5">
        <div v-for="visa in visaTypes" :key="visa.id" class="col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-lg visa-card">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="visa-type-icon">
                  <i :class="getVisaIcon(visa.type)" class="fs-4"></i>
                </div>
                <span class="badge bg-primary fs-6">{{ formatCurrency(visa.cost) }}</span>
              </div>

              <h5 class="card-title fw-bold mb-2">{{ visa.name || visa.type }}</h5>
              <p class="text-muted small mb-3">{{ visa.description }}</p>

              <!-- Info Grid -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.duration') }}</small>
                    <strong>{{ visa.duration }}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.validity') }}</small>
                    <strong>{{ visa.validity }}</strong>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.processingTime') }}</small>
                    <strong>{{ visa.processingTime }}</strong>
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <h6 class="fw-medium mb-2">{{ t('visa.requiredDocs') }}</h6>
              <ul class="list-unstyled mb-3">
                <li v-for="(req, index) in visa.requirements?.slice(0, 4)" :key="index" class="mb-1">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  <small>{{ req }}</small>
                </li>
                <li v-if="visa.requirements?.length > 4">
                  <small class="text-muted">+ {{ visa.requirements.length - 4 }} {{ t('visa.otherDocs') }}</small>
                </li>
              </ul>

              <!-- PDF Link -->
              <div v-if="visa.pdfUrl" class="mb-3">
                <a
                  :href="visa.pdfUrl"
                  target="_blank"
                  class="btn btn-outline-danger btn-sm w-100"
                >
                  <i class="bi bi-file-earmark-pdf me-2"></i>{{ t('visa.downloadForm') }}
                </a>
              </div>
            </div>

            <div class="card-footer bg-transparent border-0 p-4 pt-0">
              <a
                :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`"
                target="_blank"
                class="btn btn-primary w-100"
              >
                <i class="bi bi-whatsapp me-2"></i>{{ t('visa.requestQuote') }}
              </a>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="visaTypes.length === 0 && !loading" class="col-12">
          <div class="card border-0 shadow">
            <div class="card-body text-center py-5">
              <i class="bi bi-passport display-1 text-muted"></i>
              <h4 class="mt-3">{{ locale === 'fr' ? 'Aucun visa disponible' : 'No visa available' }}</h4>
              <p class="text-muted">{{ locale === 'fr' ? 'Contactez-nous pour plus d\'informations.' : 'Contact us for more information.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Section -->
      <section class="process-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('visa.processSection') }}</span>
          <h2 class="fw-bold">{{ t('visa.processTitle') }}</h2>
          <p class="text-muted">{{ t('visa.processSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <div v-for="(step, index) in processSteps" :key="index" class="col-md-3">
            <div class="text-center process-step">
              <div class="step-icon mx-auto mb-3">
                <i :class="step.icon"></i>
              </div>
              <div class="step-number">{{ index + 1 }}</div>
              <h5 class="mt-3">{{ step.title }}</h5>
              <p class="text-muted small">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section mb-5">
        <div class="text-center mb-4">
          <h3 class="fw-bold">{{ t('visa.faqTitle') }}</h3>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="accordion" id="visaFaq">
              <div v-for="(faq, index) in faqs" :key="index" class="accordion-item border-0 mb-2">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed bg-light"
                    type="button"
                    :data-bs-toggle="'collapse'"
                    :data-bs-target="'#faq' + index"
                  >
                    {{ faq.question }}
                  </button>
                </h2>
                <div :id="'faq' + index" class="accordion-collapse collapse" data-bs-parent="#visaFaq">
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
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
        <h2 class="fw-bold text-white mb-3">{{ t('visa.ctaTitle') }}</h2>
        <p class="lead text-white opacity-75 mb-4">{{ t('visa.ctaSubtitle') }}</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light btn-lg">
            <i class="bi bi-whatsapp me-2"></i>{{ t('visa.requestQuote') }}
          </a>
          <NuxtLink to="/contact-us" class="btn btn-outline-light btn-lg">
            <i class="bi bi-envelope me-2"></i>{{ t('common.contactUs') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useVisasStore } from '~/stores/visas'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const visasStore = useVisasStore()
const { formatCurrency } = useFormatters()

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await visasStore.fetchVisaTypes()
  loading.value = false
})

const visaTypes = computed(() => visasStore.visaTypes)

const getVisaIcon = (type: string) => {
  const icons: Record<string, string> = {
    tourisme: 'bi bi-camera',
    affaires: 'bi bi-briefcase',
    travail: 'bi bi-building',
    etudes: 'bi bi-mortarboard',
    transit: 'bi bi-arrow-left-right'
  }
  return icons[type?.toLowerCase()] || 'bi bi-passport'
}

const processSteps = computed(() => locale.value === 'fr' ? [
  { icon: 'bi bi-chat-dots', title: 'Consultation', description: 'Evaluation de votre dossier et conseils personnalises' },
  { icon: 'bi bi-file-earmark-check', title: 'Preparation', description: 'Constitution et verification de votre dossier' },
  { icon: 'bi bi-send', title: 'Depot', description: 'Soumission de votre demande au consulat' },
  { icon: 'bi bi-eye', title: 'Suivi', description: 'Suivi de votre dossier jusqu\'a l\'obtention' }
] : [
  { icon: 'bi bi-chat-dots', title: 'Consultation', description: 'Evaluation of your file and personalized advice' },
  { icon: 'bi bi-file-earmark-check', title: 'Preparation', description: 'Constitution and verification of your file' },
  { icon: 'bi bi-send', title: 'Submission', description: 'Submission of your application to the consulate' },
  { icon: 'bi bi-eye', title: 'Follow-up', description: 'Follow-up of your file until you receive it' }
])

const faqs = computed(() => locale.value === 'fr' ? [
  { question: 'Combien de temps faut-il pour obtenir un visa?', answer: 'Le delai varie selon le type de visa. Un visa tourisme prend generalement 5-7 jours ouvrables, tandis qu\'un visa travail peut prendre 15-20 jours.' },
  { question: 'Quels documents sont necessaires?', answer: 'Les documents de base incluent: passeport valide 6 mois, photos d\'identite, formulaire de demande. D\'autres documents peuvent etre requis selon le type de visa.' },
  { question: 'Puis-je faire ma demande en ligne?', answer: 'Non, la demande de visa chinois doit etre faite en personne au consulat. Cependant, nous pouvons vous accompagner dans toutes les demarches.' },
  { question: 'Le visa est-il remboursable?', answer: 'Les frais de visa ne sont pas remboursables en cas de refus. C\'est pourquoi nous verifions soigneusement votre dossier avant depot.' }
] : [
  { question: 'How long does it take to get a visa?', answer: 'The time varies depending on the type of visa. A tourist visa generally takes 5-7 business days, while a work visa can take 15-20 days.' },
  { question: 'What documents are required?', answer: 'Basic documents include: passport valid for 6 months, ID photos, application form. Other documents may be required depending on the type of visa.' },
  { question: 'Can I apply online?', answer: 'No, the Chinese visa application must be made in person at the consulate. However, we can assist you with all the steps.' },
  { question: 'Is the visa refundable?', answer: 'Visa fees are not refundable in case of refusal. That\'s why we carefully check your file before submitting.' }
])
</script>

<style scoped>
.visa-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.visa-hero {
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

.visa-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
}

.visa-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.visa-type-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.info-box {
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
}

.process-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.process-step {
  position: relative;
}

.step-icon {
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

.step-number {
  position: absolute;
  top: 0;
  right: calc(50% - 55px);
  width: 24px;
  height: 24px;
  background: var(--bs-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.faq-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.accordion-button:not(.collapsed) {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
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

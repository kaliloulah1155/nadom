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
      <!-- Mes demandes de visa (client connecté) -->
      <div v-if="isAuthenticated && myApplications.length" class="card border-0 shadow-sm mb-5">
        <div class="card-header bg-transparent">
          <h5 class="mb-0"><i class="bi bi-passport me-2"></i>{{ t('clientForms.myVisaRequests') }}</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Type</th>
                <th>{{ t('clientForms.status') }}</th>
                <th class="text-end">{{ t('clientForms.amount') }}</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in myApplications" :key="app.id">
                <td class="fw-medium">{{ app.visaType?.name_fr || app.visa_type || '—' }}</td>
                <td><span class="badge bg-secondary-subtle text-secondary">{{ app.status }}</span></td>
                <td class="text-end">
                  <div class="fw-semibold">{{ formatCurrency(publicPrice(Number(app.total_cost) || 0), 'XOF') }}</div>
                  <div class="text-muted" style="font-size:.72rem;">frais inclus</div>
                </td>
                <td class="text-end">
                  <button
                    v-if="(Number(app.total_cost) || 0) > 0 && ['pending', 'processing'].includes(app.status)"
                    class="btn btn-sm btn-primary"
                    :disabled="payProcessing !== null"
                    @click="pay('visa', String(app.id))"
                  >
                    <span v-if="payProcessing === String(app.id)" class="spinner-border spinner-border-sm"></span>
                    <template v-else><i class="bi bi-credit-card me-1"></i>{{ t('clientForms.pay') }}</template>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
                <span class="badge bg-primary fs-6">{{ formatCurrency(Number(visa.cost) || 0, visa.currency || 'XOF') }}</span>
              </div>

              <h5 class="card-title fw-bold mb-2">{{ visa[`name_${locale}`] || visa.name_fr || visa.type }}</h5>
              <div class="text-muted small mb-3 visa-desc" v-html="visa[`description_${locale}`] || visa.description_fr || ''"></div>

              <!-- Info Grid -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.duration') }}</small>
                    <strong>{{ visa[`duration_${locale}`] || visa.duration_fr }}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.validity') }}</small>
                    <strong>{{ visa[`validity_${locale}`] || visa.validity_fr }}</strong>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-box">
                    <small class="text-muted d-block">{{ t('visa.processingTime') }}</small>
                    <strong>{{ visa[`processing_time_${locale}`] || visa.processing_time_fr }}</strong>
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <h6 class="fw-medium mb-2">{{ t('visa.requiredDocs') }}</h6>
              <ul class="list-unstyled mb-3">
                <li v-for="(req, index) in (visa[`requirements_${locale}`] || visa.requirements_fr || []).slice(0, 4)" :key="index" class="mb-1">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  <small>{{ req }}</small>
                </li>
                <li v-if="(visa[`requirements_${locale}`] || visa.requirements_fr || []).length > 4">
                  <small class="text-muted">+ {{ (visa[`requirements_${locale}`] || visa.requirements_fr).length - 4 }} {{ t('visa.otherDocs') }}</small>
                </li>
              </ul>

              <!-- PDF Link -->
              <div v-if="visa.pdf_url || visa.pdfUrl" class="mb-3">
                <a
                  :href="resolvePdf(visa.pdf_url || visa.pdfUrl)"
                  target="_blank"
                  class="btn btn-outline-danger btn-sm w-100"
                >
                  <i class="bi bi-file-earmark-pdf me-2"></i>{{ t('visa.downloadForm') }}
                </a>
              </div>
            </div>

            <div class="card-footer bg-transparent border-0 p-4 pt-0 d-grid gap-2">
              <button type="button" class="btn btn-primary" @click="openVisaRequest(visa)">
                <i class="bi bi-passport me-2"></i>Demander ce visa
              </button>
              <a
                :href="visaWhatsAppHref(visa)"
                target="_blank"
                rel="noopener"
                class="btn btn-outline-success"
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
              <h4 class="mt-3">{{ t('visa.noVisa') }}</h4>
              <p class="text-muted">{{ t('guide.contactInfo') }}</p>
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

    <!-- Modal demande de visa (invité, sans connexion) -->
    <div v-if="showVisaModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);" @click.self="showVisaModal = false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Demande de visa<span v-if="visaForm.visaLabel"> — {{ visaForm.visaLabel }}</span>
            </h5>
            <button type="button" class="btn-close" @click="showVisaModal = false"></button>
          </div>
          <form @submit.prevent="submitVisaRequest">
            <div class="modal-body">
              <div class="alert alert-light border d-flex justify-content-between align-items-center">
                <span class="text-muted">{{ t('clientForms.amountToPay') }}</span>
                <strong class="text-primary fs-5">{{ formatCurrency(publicPrice(Number(visaForm.cost) || 0), 'XOF') }}</strong>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.firstName') }} *</label>
                  <input v-model="visaForm.first_name" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.lastName') }} *</label>
                  <input v-model="visaForm.last_name" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.whatsapp') }} *</label>
                  <input v-model="visaForm.phone" type="tel" class="form-control" placeholder="+225 07 XX XX XX XX" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.email') }}</label>
                  <input v-model="visaForm.email" type="email" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.nationality') }}</label>
                  <input v-model="visaForm.nationality" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.passportNumber') }}</label>
                  <input v-model="visaForm.passport_number" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.departureDate') }}</label>
                  <input v-model="visaForm.departure_date" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('clientForms.returnDate') }}</label>
                  <input v-model="visaForm.return_date" type="date" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">{{ t('clientForms.notes') }}</label>
                  <textarea v-model="visaForm.notes" class="form-control" rows="2"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showVisaModal = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="visaSubmitting">
                <span v-if="visaSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                Soumettre &amp; payer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useVisasStore } from '~/stores/visas'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'client',
  middleware: 'client-only'
})

const { t } = useI18n()
const { resolveList } = useI18nResolved()

const VISA_PROCESS_ICONS = [
  'bi bi-chat-dots',
  'bi bi-file-earmark-check',
  'bi bi-send',
  'bi bi-eye',
]

const processSteps = computed(() =>
  resolveList('visa.processSteps', ['title', 'description'] as const).map((item, i) => ({
    icon: VISA_PROCESS_ICONS[i] || 'bi bi-circle',
    ...item,
  })),
)

// FAQ page visa = statut 3 (BD), repli sur les libellés i18n si la BD est vide.
const { locale } = useI18n()
const blogStore = useBlogStore()
const dbFaqs = ref<{ question: string; answer: string }[]>([])
const faqFallback = computed(() => resolveList('visa.faqItems', ['question', 'answer'] as const))
const faqs = computed(() => (dbFaqs.value.length ? dbFaqs.value : faqFallback.value))

const visasStore = useVisasStore()
const authStore = useAuthStore()
const { formatCurrency } = useFormatters()
const { pay, payGuestEntity, publicPrice, processing: payProcessing } = usePayment()
const { error: notifyVisaError } = useNotification()

// Demande de visa (invité)
const showVisaModal = ref(false)
const visaSubmitting = ref(false)
const visaForm = reactive({
  visa_type: '', visaLabel: '', cost: 0,
  first_name: '', last_name: '', phone: '', email: '',
  nationality: '', passport_number: '', departure_date: '', return_date: '', notes: ''
})

function openVisaRequest(visa: any) {
  visaForm.visa_type = visa.type
  visaForm.visaLabel = visa[`name_${locale.value}`] || visa.name_fr || visa.type
  visaForm.cost = Number(visa.cost) || 0
  const u: any = authStore.currentUser
  visaForm.first_name = u?.firstname || ''
  visaForm.last_name = u?.lastname || ''
  visaForm.phone = u?.phone || ''
  visaForm.email = u?.email || ''
  visaForm.nationality = ''
  visaForm.passport_number = ''
  visaForm.departure_date = ''
  visaForm.return_date = ''
  visaForm.notes = ''
  showVisaModal.value = true
}

async function submitVisaRequest() {
  if (visaForm.first_name.trim().length < 2 || !/^[\+]?[0-9\s\-]{8,20}$/.test(visaForm.phone)) {
    notifyVisaError('Veuillez renseigner votre prénom et un numéro WhatsApp valide.')
    return
  }
  try {
    visaSubmitting.value = true
    const created: any = await visasStore.createApplication({
      visa_type: visaForm.visa_type,
      first_name: visaForm.first_name.trim(),
      last_name: visaForm.last_name.trim(),
      phone: visaForm.phone.trim(),
      email: visaForm.email.trim() || undefined,
      nationality: visaForm.nationality.trim() || undefined,
      passport_number: visaForm.passport_number.trim() || undefined,
      departure_date: visaForm.departure_date || undefined,
      return_date: visaForm.return_date || undefined,
      notes: visaForm.notes.trim() || undefined,
    } as any)
    showVisaModal.value = false
    const id = created?.id || created?.data?.id
    if (id) {
      await payGuestEntity('visa', String(id), {
        name: `${visaForm.first_name} ${visaForm.last_name}`.trim(),
        phone: visaForm.phone.trim(),
        email: visaForm.email.trim() || undefined,
      })
    }
  } catch (e: any) {
    notifyVisaError(e?.message || 'Erreur lors de la demande.')
  } finally {
    visaSubmitting.value = false
  }
}
const config = useRuntimeConfig()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const myApplications = computed(() => visasStore.applications)

const loading = ref(false)

const resolvePdf = (url: string | null) => {
  if (!url) return '#'
  if (/^https?:\/\//i.test(url)) return url
  return resolveStorageAssetUrl(url)
}

// Lien WhatsApp « Demander un devis » avec un message pré-rempli reprenant le visa.
const whatsappDigits = computed(() => String(config.public.whatsapp ?? '').replace(/\D/g, ''))
const visaWhatsAppHref = (visa: any): string => {
  const raw = whatsappDigits.value
  if (!raw) return '#'
  const name = visa[`name_${locale.value}`] || visa.name_fr || visa.type || ''
  const price = formatCurrency(Number(visa.cost) || 0, visa.currency || 'XOF')
  const fr = String(locale.value).startsWith('fr')
  const lines = fr
    ? [`Bonjour, je souhaite un devis pour le visa : ${name}.`, `Tarif indicatif : ${price}.`, 'Merci de me recontacter.']
    : [`Hello, I would like a quote for the visa: ${name}.`, `Indicative price: ${price}.`, 'Please get back to me.']
  return `https://wa.me/${raw}?text=${encodeURIComponent(lines.join('\n'))}`
}

onMounted(async () => {
  loading.value = true
  await visasStore.fetchVisaTypes()
  if (authStore.isAuthenticated) {
    visasStore.fetchMyApplications()
  }
  try {
    const rows = await blogStore.fetchFAQByStatut(3)
    dbFaqs.value = rows.map((f: any) => ({
      question: f[`question_${locale.value}`] || f.question_fr || '',
      answer: f[`answer_${locale.value}`] || f.answer_fr || '',
    }))
  } catch {
    dbFaqs.value = []
  }
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

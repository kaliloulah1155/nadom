<template>
  <div class="guide-page">
    <!-- Hero Section -->
    <section class="guide-hero">
      <div class="hero-pattern"></div>
      <div class="container position-relative">
        <div class="row align-items-center">
          <div class="col-lg-8 text-white">
            <div class="mb-3">
              <span class="badge bg-warning text-dark px-3 py-2">
                <i class="bi bi-book me-1"></i>{{ t('guide.badge') }}
              </span>
            </div>
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('guide.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">{{ t('guide.subtitle') }}</p>
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
            <i :class="cat.icon" class="me-2"></i>{{ categoryLabel(cat) }}
          </button>
        </div>

        <!-- Documentation Grid -->
        <div class="row g-4">
          <div v-for="doc in filteredDocs" :key="doc.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-lg doc-card">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="doc-icon">
                    <i :class="getDocCategoryIcon(doc)"></i>
                  </div>
                  <span class="badge bg-primary-subtle text-primary">{{ getDocCategoryLabel(doc) }}</span>
                </div>
                <h5 class="card-title fw-bold mb-2">{{ doc.name }}</h5>
                <p class="text-muted small mb-3">{{ docDescription(doc) }}</p>
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-translate text-muted me-2"></i>
                  <small class="text-muted">{{ docLanguages(doc) }}</small>
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 p-4 pt-0">
                <div v-if="doc.document_url" class="d-flex gap-2">
                  <a
                    :href="doc.document_url"
                    target="_blank"
                    class="btn btn-outline-primary flex-fill"
                  >
                    <i class="bi bi-eye me-2"></i>{{ t('guide.viewDoc') }}
                  </a>
                  <a
                    :href="doc.document_url"
                    :download="doc.name + '.pdf'"
                    class="btn btn-primary flex-fill"
                  >
                    <i class="bi bi-download me-2"></i>{{ t('guide.downloadPdf') }}
                  </a>
                </div>
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
              <h5 class="mt-3">{{ t('guide.noGuide') }}</h5>
              <p class="text-muted">{{ t('guide.contactInfo') }}</p>
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
                    :src="resolveStorageAssetUrl(guide.avatar) || guide.avatar"
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
                    <small>{{ guide.experience }} {{ t('guide.yearsExp') }}</small>
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
                    <small class="text-muted">{{ t('guide.from') }}</small>
                    <div class="fw-bold text-primary">{{ formatCurrency(Number(guide.price_per_day || guide.pricePerDay) || 0) }}/{{ t('guide.perDay') }}</div>
                  </div>
                  <span v-if="guide.available" class="badge bg-success">{{ t('guide.available') }}</span>
                  <span v-else class="badge bg-secondary">{{ t('guide.unavailable') }}</span>
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 p-4 pt-0">
                <div class="d-grid">
                  <button
                    type="button"
                    class="btn btn-primary w-100"
                    :disabled="!guide.available || bookingSubmitting"
                    @click="openBookingModal(guide)"
                  >
                    <i class="bi bi-calendar-check me-2"></i>{{ t('guide.book') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredGuides.length === 0" class="col-12">
            <div class="card border-0 shadow text-center py-5">
              <i class="bi bi-search display-1 text-muted"></i>
              <h5 class="mt-3">{{ t('guide.noGuideFound') }}</h5>
              <p class="text-muted">{{ t('guide.adjustFilters') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Booking modal (authenticated) -->
      <div id="guideBookingModal" ref="bookingModalRef" class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header">
              <h5 class="modal-title">{{ t('guide.bookingTitle') }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form @submit.prevent="submitBooking">
              <div class="modal-body">
                <div v-if="bookingGuide" class="mb-3 pb-3 border-bottom">
                  <div class="fw-semibold">{{ bookingGuide.name }}</div>
                  <small class="text-muted">{{ bookingGuide.cities?.join(', ') }}</small>
                </div>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">{{ t('guide.bookingDocTheme') }}</label>
                    <select v-model.number="bookingForm.documentation_category_id" class="form-select">
                      <option :value="0">{{ t('guide.bookingDocThemeNone') }}</option>
                      <option v-for="c in gdcCategories" :key="c.id" :value="c.id">{{ categoryLabel(c) }}</option>
                    </select>
                    <small class="text-muted">{{ t('guide.bookingDocThemeHint') }}</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('guide.bookingServiceType') }}</label>
                    <select v-model="bookingForm.service_type" class="form-select">
                      <option value="daily">{{ t('guide.bookingDaily') }}</option>
                      <option value="hourly">{{ t('guide.bookingHourly') }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('guide.bookingStart') }}</label>
                    <input v-model="bookingForm.start_date" type="date" class="form-control" required />
                  </div>
                  <div v-if="bookingForm.service_type === 'daily'" class="col-md-6">
                    <label class="form-label">{{ t('guide.bookingEnd') }}</label>
                    <input v-model="bookingForm.end_date" type="date" class="form-control" required />
                  </div>
                  <div v-if="bookingForm.service_type === 'hourly'" class="col-md-6">
                    <label class="form-label">{{ t('guide.bookingHours') }}</label>
                    <input v-model.number="bookingForm.hours" type="number" min="1" max="24" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('guide.bookingPeopleCount') }}</label>
                    <input v-model.number="bookingForm.people_count" type="number" min="1" max="100" class="form-control" required />
                    <small class="text-muted">{{ t('guide.bookingPeopleCountHint') }}</small>
                  </div>
                  <div class="col-12">
                    <label class="form-label">{{ t('guide.bookingNotes') }}</label>
                    <textarea v-model="bookingForm.notes" class="form-control" rows="3"></textarea>
                  </div>

                  <!-- Coordonnées du client (réservation sans connexion) -->
                  <template v-if="!isLoggedIn">
                    <div class="col-12"><hr class="my-1" /><small class="text-muted">Vos coordonnées</small></div>
                    <div class="col-md-6">
                      <label class="form-label">Nom complet *</label>
                      <input v-model="bookingForm.contact_name" type="text" class="form-control" placeholder="Nom et prénom" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">WhatsApp *</label>
                      <input v-model="bookingForm.contact_phone" type="tel" class="form-control" placeholder="+225 07 XX XX XX XX" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Email</label>
                      <input v-model="bookingForm.contact_email" type="email" class="form-control" placeholder="email@exemple.com (optionnel)" />
                    </div>
                  </template>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">{{ t('common.cancel') }}</button>
                <button type="submit" class="btn btn-primary" :disabled="bookingSubmitting">
                  <span v-if="bookingSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ t('guide.bookingSubmit') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- My bookings (logged-in) -->
      <section v-if="isLoggedIn" class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="fw-bold mb-0">{{ t('guide.myBookingsTitle') }}</h3>
        </div>
        <div v-if="myBookingsLoading" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          {{ t('guide.myBookingsLoading') }}
        </div>
        <div v-else-if="myBookings.length === 0" class="alert alert-light border mb-0">
          {{ t('guide.myBookingsEmpty') }}
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm align-middle bg-white border rounded shadow-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.guideBookings.guide') }}</th>
                <th>{{ t('admin.guideBookings.period') }}</th>
                <th>{{ t('admin.dashboard.status') }}</th>
                <th class="text-end">{{ t('admin.guideBookings.amount') }}</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in myBookings" :key="b.id">
                <td class="fw-medium">{{ b.guide?.name || '—' }}</td>
                <td><small>{{ formatBookingDay(b.start_date) }} → {{ formatBookingDay(b.end_date) }}</small></td>
                <td><span class="badge" :class="bookingStatusClass(b.status)">{{ bookingStatusLabel(b.status) }}</span></td>
                <td class="text-end small">
                  <div class="fw-semibold">{{ formatCurrency(publicPrice(Number(b.total_price)), b.guide?.currency || 'XOF') }}</div>
                  <div class="text-muted" style="font-size:.72rem;">frais inclus</div>
                </td>
                <td class="text-end">
                  <button
                    v-if="(Number(b.total_price) || 0) > 0 && b.status !== 'paid' && b.status !== 'cancelled'"
                    class="btn btn-sm btn-primary"
                    :disabled="payProcessing !== null"
                    @click="pay('guide_booking', String(b.id))"
                  >
                    <span v-if="payProcessing === String(b.id)" class="spinner-border spinner-border-sm"></span>
                    <template v-else><i class="bi bi-credit-card me-1"></i>Payer</template>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Services Section -->
      <section class="services-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('guide.ourServices') }}</span>
          <h3 class="fw-bold">{{ t('guide.servicesTitle') }}</h3>
        </div>

        <div class="row g-4">
          <div v-for="service in guideAccompanimentCards" :key="service.id" class="col-md-4">
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
import { useFormatters } from '~/composables/useFormatters'
import { usePublicApi } from '~/composables/usePublicApi'
import { getToken } from '~/composables/useApi'
import { useGuideAccompanimentServicesStore } from '~/stores/guideAccompanimentServices'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default'
})

const { t, te, locale } = useI18n()
const { field } = useLocaleField()
const { categoryLabel } = useCategoryLabel()
const { resolveList } = useI18nResolved()

const GUIDE_FB_ICONS = [
  'bi bi-shop',
  'bi bi-building',
  'bi bi-people',
  'bi bi-translate',
  'bi bi-truck',
  'bi bi-calendar-check',
]
const { formatCurrency } = useFormatters()
const pub = usePublicApi()
const guidesStore = useGuidesStore()
const { pay, payGuestEntity, publicPrice, processing: payProcessing } = usePayment()
const authStore = useAuthStore()
const gasStore = useGuideAccompanimentServicesStore()
const { success, error, warning } = useNotification()

const allGuides = ref<any[]>([])
const gdcCategories = ref<any[]>([])
const selectedCategory = ref<string>('all')

const bookingModalRef = ref<HTMLElement | null>(null)
let bookingBsModal: any = null
const bookingGuide = ref<any>(null)
const bookingSubmitting = ref(false)
const isLoggedIn = computed(() => Boolean(getToken()))
const myBookings = computed(() => guidesStore.myBookings)
const myBookingsLoading = computed(() => guidesStore.myBookingsLoading)

const bookingStatusLabel = (status: string) => {
  const key = `guide.bookingStatus.${status}` as const
  return te(key) ? t(key) : status
}

const bookingStatusClass = (status: string) => {
  const m: Record<string, string> = {
    pending: 'bg-warning text-dark',
    confirmed: 'bg-primary',
    completed: 'bg-success',
    cancelled: 'bg-secondary',
  }
  return m[status] || 'bg-light text-dark'
}

const formatBookingDay = (d?: string) => {
  if (!d) return '—'
  // L'API peut renvoyer soit "YYYY-MM-DD" soit un ISO complet ("YYYY-MM-DDTHH:mm:ss.uuuuuuZ").
  // On ne garde que la partie date pour éviter "Invalid Date".
  const day = String(d).slice(0, 10)
  const dt = new Date(`${day}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : locale.value === 'en' ? 'en-GB' : 'fr-FR')
}

const bookingForm = reactive({
  documentation_category_id: 0,
  service_type: 'daily' as 'daily' | 'hourly',
  start_date: '',
  end_date: '',
  hours: 4,
  people_count: 1,
  notes: '',
  // Coordonnées du client (réservation sans connexion)
  contact_name: '',
  contact_phone: '',
  contact_email: ''
})

function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function isoAddDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

function resetBookingForm() {
  const start = isoToday()
  bookingForm.documentation_category_id = 0
  bookingForm.service_type = 'daily'
  bookingForm.start_date = start
  bookingForm.end_date = isoAddDays(start, 1)
  bookingForm.hours = 4
  bookingForm.people_count = 1
  bookingForm.notes = ''
  // Préremplit avec le compte si connecté (sinon vide pour saisie invité)
  const u: any = authStore.currentUser
  bookingForm.contact_name = u ? [u.firstname, u.lastname].filter(Boolean).join(' ').trim() : ''
  bookingForm.contact_phone = u?.phone || ''
  bookingForm.contact_email = u?.email || ''
}

function openBookingModal(guide: any) {
  if (!guide?.available) return
  // Le client n'a pas besoin de se connecter : il saisit ses coordonnées dans le formulaire.
  bookingGuide.value = guide
  resetBookingForm()
  bookingBsModal?.show()
}

async function submitBooking() {
  if (!bookingGuide.value) return
  if (bookingForm.service_type === 'daily') {
    if (!bookingForm.end_date || bookingForm.end_date < bookingForm.start_date) {
      error(t('guide.bookingInvalidDates'))
      return
    }
  }
  // Coordonnées requises (le client ne se connecte pas)
  if (!isLoggedIn.value) {
    if (bookingForm.contact_name.trim().length < 2 || !/^[\+]?[0-9\s\-]{8,20}$/.test(bookingForm.contact_phone)) {
      error('Veuillez renseigner votre nom et un numéro WhatsApp valide.')
      return
    }
  }
  try {
    bookingSubmitting.value = true
    const payload: Record<string, unknown> = {
      guide_id: String(bookingGuide.value.id),
      start_date: bookingForm.start_date,
      service_type: bookingForm.service_type,
      people_count: Math.min(100, Math.max(1, Math.floor(Number(bookingForm.people_count)) || 1)),
      notes: bookingForm.notes?.trim() || undefined,
      contact_name: bookingForm.contact_name?.trim() || undefined,
      contact_phone: bookingForm.contact_phone?.trim() || undefined,
      contact_email: bookingForm.contact_email?.trim() || undefined
    }
    if (bookingForm.documentation_category_id > 0) {
      payload.documentation_category_id = bookingForm.documentation_category_id
    }
    if (bookingForm.service_type === 'daily') {
      payload.end_date = bookingForm.end_date
      const start = new Date(`${bookingForm.start_date}T12:00:00`)
      const end = new Date(`${bookingForm.end_date}T12:00:00`)
      const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
      payload.days = Math.max(1, diff)
    } else {
      payload.end_date = bookingForm.start_date
      payload.hours = bookingForm.hours
    }
    const created: any = await guidesStore.createBooking(payload as any)
    bookingBsModal?.hide()

    const bookingId = created?.id || created?.data?.id
    if (!isLoggedIn.value && bookingId) {
      // Client invité : paiement immédiat (redirection wallet)
      success(t('guide.bookingSuccess'))
      await payGuestEntity('guide_booking', String(bookingId), {
        name: bookingForm.contact_name.trim(),
        phone: bookingForm.contact_phone.trim(),
        email: bookingForm.contact_email.trim() || undefined,
      })
    } else {
      await guidesStore.fetchMyBookings()
      success(t('guide.bookingSuccess'))
    }
  } catch (e: any) {
    error(e?.message || 'Erreur')
  } finally {
    bookingSubmitting.value = false
  }
}

const filters = reactive({
  city: '',
  specialization: '',
  language: ''
})

const documentationGuides = computed(() =>
  allGuides.value.filter((g: any) => g.kind === 'documentation')
)

const tourGuides = computed(() =>
  allGuides.value.filter((g: any) => !g.kind || g.kind === 'tour')
)

onMounted(async () => {
  const [guidesRes, catRes] = await Promise.all([
    pub.get<any[]>('/guides/all'),
    pub.get<any[]>('/category/slug/GDC'),
    gasStore.fetchPublic(),
  ])
  if (getToken()) {
    await guidesStore.fetchMyBookings()
  }
  if (guidesRes.success && Array.isArray(guidesRes.data)) {
    allGuides.value = guidesRes.data
  }
  if (catRes.success && Array.isArray(catRes.data)) {
    gdcCategories.value = [...catRes.data].sort(
      (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    )
  }

  if (typeof window !== 'undefined' && (window as any).bootstrap && bookingModalRef.value) {
    bookingBsModal = new (window as any).bootstrap.Modal(bookingModalRef.value)
  }
})

const docCategories = computed(() => {
  const allTab = {
    id: 'all',
    label: t('guide.all'),
    icon: 'bi bi-grid'
  }
  const rows = gdcCategories.value.map((c: any) => ({
    id: String(c.id),
    label: categoryLabel(c),
    icon: String(c.icon || 'bi bi-tag').trim()
  }))
  return [allTab, ...rows]
})

const filteredDocs = computed(() => {
  const docs = documentationGuides.value
  if (selectedCategory.value === 'all') {
    return docs
  }
  return docs.filter((d: any) => String(d.category_id) === selectedCategory.value)
})

function stripHtml(s: string): string {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function docDescription(doc: any): string {
  return stripHtml(field(doc, 'description'))
}

function docLanguages(doc: any): string {
  return Array.isArray(doc.languages) ? doc.languages.join(', ') : ''
}

function getDocCategoryIcon(doc: any): string {
  const ic = doc.category?.icon?.trim()
  return ic || 'bi bi-file-text'
}

function getDocCategoryLabel(doc: any): string {
  if (!doc.category) return '—'
  return categoryLabel(doc.category as Record<string, unknown>)
}

const allCities = computed(() => {
  const cities = new Set<string>()
  tourGuides.value.forEach(g => g.cities?.forEach((c: string) => cities.add(c)))
  return Array.from(cities)
})

const allSpecs = computed(() => {
  const specs = new Set<string>()
  tourGuides.value.forEach(g => {
    g.specializations_fr?.forEach((s: string) => specs.add(s))
    g.specializations_en?.forEach((s: string) => specs.add(s))
  })
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
    const specs = [...(guide.specializations_fr || []), ...(guide.specializations_en || [])]
    if (filters.specialization && !specs.includes(filters.specialization)) return false
    if (filters.language && !guide.languages?.includes(filters.language)) return false
    return true
  })
})

function normalizeAccompIcon(ic: string | null | undefined): string {
  const s = String(ic || 'bi-grid').trim()
  if (!s) return 'bi bi-grid'
  if (s.startsWith('bi bi-')) return s
  if (s.startsWith('bi-')) return `bi ${s}`
  return s.includes(' ') ? s : `bi ${s}`
}

const fallbackGuideAccompanimentCards = computed(() =>
  resolveList('guide.accompanimentFallback', ['title', 'description'] as const).map((item, i) => ({
    id: `fb-${i}`,
    icon: GUIDE_FB_ICONS[i] || 'bi bi-grid',
    ...item,
  })),
)

const guideAccompanimentCards = computed(() => {
  if (gasStore.publicFetched && !gasStore.publicFetchFailed && gasStore.publicItems.length > 0) {
    return gasStore.publicItems.map(row => ({
      id: row.slug || row.id,
      icon: normalizeAccompIcon(row.icon),
      title: field(row, 'title'),
      description: stripHtml(field(row, 'description')),
    }))
  }
  return fallbackGuideAccompanimentCards.value
})
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

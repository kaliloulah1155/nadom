<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des visas</h4>
        <p class="text-muted mb-0">{{ visas.length }} types de visa configures</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau visa
      </button>
    </div>

    <!-- Visa Cards -->
    <div class="row g-4">
      <div v-for="visa in paginatedVisas" :key="visa.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="visa-icon">
                <i class="bi bi-passport fs-4"></i>
              </div>
              <span :class="['badge', visa.active ? 'bg-success' : 'bg-secondary']">
                {{ visa.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <h5 class="card-title">{{ visa.name_fr }}</h5>
            <p class="text-muted small mb-3">{{ truncate(visa.description_fr, 100) }}</p>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Duree</small>
                <strong>{{ visa.duration_fr }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Prix</small>
                <strong class="text-primary">{{ formatCurrency(visa.price) }}</strong>
              </div>
            </div>

            <div class="mb-3">
              <small class="text-muted d-block mb-1">Documents requis</small>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="doc in visa.requiredDocs_fr.slice(0, 3)" :key="doc" class="badge bg-light text-dark small">
                  {{ doc }}
                </span>
                <span v-if="visa.requiredDocs_fr.length > 3" class="badge bg-light text-dark small">
                  +{{ visa.requiredDocs_fr.length - 3 }}
                </span>
              </div>
            </div>

            <div v-if="visa.pdfUrl" class="mb-3">
              <a :href="visa.pdfUrl" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                <i class="bi bi-file-earmark-pdf me-2"></i>Voir le formulaire PDF
              </a>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-flex w-100">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(visa)">
                <i class="bi bi-pencil me-1"></i>Modifier
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteVisa(visa.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="visas.length === 0" class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-passport display-4 text-muted"></i>
            <h5 class="mt-3">Aucun visa configure</h5>
            <p class="text-muted">Configurez les types de visas disponibles.</p>
            <button class="btn btn-primary" @click="openModal()">
              <i class="bi bi-plus-lg me-2"></i>Ajouter un visa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="visas.length > 0" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="visas.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="visaModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingVisa ? 'Modifier' : 'Nouveau' }} visa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveVisa">
            <div class="modal-body">
              <!-- Tabs for Bilingual Support -->
              <ul class="nav nav-tabs mb-3" id="visaLangTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="visa-fr-tab" data-bs-toggle="tab" data-bs-target="#visa-fr-content" type="button" role="tab">Français</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="visa-en-tab" data-bs-toggle="tab" data-bs-target="#visa-en-content" type="button" role="tab">English</button>
                </li>
              </ul>

              <div class="tab-content" id="visaLangTabsContent">
                <!-- French Tab -->
                <div class="tab-pane fade show active" id="visa-fr-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Nom du visa (FR) *</label>
                      <input v-model="form.name_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (FR) *</label>
                      <WysiwygEditor v-model="form.description_fr" height="150px" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Durée (FR) *</label>
                      <input v-model="form.duration_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Délai (FR) *</label>
                      <input v-model="form.processingTime_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Validité (FR) *</label>
                      <input v-model="form.validity_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Documents requis (FR)</label>
                      <textarea v-model="form.requiredDocsInput_fr" class="form-control" rows="2" placeholder="Un document par ligne"></textarea>
                    </div>
                  </div>
                </div>

                <!-- English Tab -->
                <div class="tab-pane fade" id="visa-en-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Visa Name (EN)</label>
                      <input v-model="form.name_en" type="text" class="form-control" placeholder="English name..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (EN)</label>
                      <WysiwygEditor v-model="form.description_en" height="150px" placeholder="English description..." />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Duration (EN)</label>
                      <input v-model="form.duration_en" type="text" class="form-control" placeholder="30 days..." />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Processing (EN)</label>
                      <input v-model="form.processingTime_en" type="text" class="form-control" placeholder="5-7 working days..." />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Validity (EN)</label>
                      <input v-model="form.validity_en" type="text" class="form-control" placeholder="3 months..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Required Docs (EN)</label>
                      <textarea v-model="form.requiredDocsInput_en" class="form-control" rows="2" placeholder="One document per line"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <!-- General settings -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Type technique *</label>
                  <input v-model="form.type" type="text" class="form-control" placeholder="ex: tourisme" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Prix (FCFA) *</label>
                  <input v-model.number="form.price" type="number" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Formulaire PDF</label>
                  <input type="file" class="form-control" accept=".pdf" @change="handlePdfUpload" />
                  <small v-if="form.pdfUrl" class="text-muted d-block mt-1">
                    <i class="bi bi-file-earmark-pdf me-1"></i>Fichier chargé
                  </small>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input v-model="form.active" type="checkbox" class="form-check-input" id="visaActive" />
                    <label class="form-check-label" for="visaActive">Type de visa actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md">
                <i class="bi bi-check-lg me-2"></i>Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import WysiwygEditor from '~/components/admin/WysiwygEditor.vue'

definePageMeta({
  layout: 'admin'
})

const { formatCurrency, truncate } = useFormatters()
const { success, error } = useNotification()

interface Visa {
  id: string
  name_fr: string
  name_en: string
  type: string
  description_fr: string
  description_en: string
  duration_fr: string
  duration_en: string
  price: number
  processingTime_fr: string
  processingTime_en: string
  validity_fr: string
  validity_en: string
  pdfUrl: string
  requiredDocs_fr: string[]
  requiredDocs_en: string[]
  active: boolean

  // compatibility
  name?: string
  description?: string
  duration?: string
  processingTime?: string
  validity?: string
  requiredDocs?: string[]
}

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const visas = ref<Visa[]>([])
const editingVisa = ref<Visa | null>(null)

const currentPage = ref(1)
const perPage = ref(6)

const paginatedVisas = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return visas.value.slice(start, start + perPage.value)
})

const form = reactive({
  name_fr: '',
  name_en: '',
  type: '',
  description_fr: '',
  description_en: '',
  duration_fr: '',
  duration_en: '',
  price: 0,
  processingTime_fr: '',
  processingTime_en: '',
  validity_fr: '',
  validity_en: '',
  pdfUrl: '',
  requiredDocsInput_fr: '',
  requiredDocsInput_en: '',
  active: true
})

onMounted(() => {
  loadVisas()

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const loadVisas = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('visas')
    visas.value = saved ? JSON.parse(saved) : getDefaultVisas()
  }
}

const saveToLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('visas', JSON.stringify(visas.value))
  }
}

const getDefaultVisas = (): Visa[] => [
  {
    id: 'visa_1',
    name_fr: 'Visa Tourisme Chine',
    name_en: 'China Tourist Visa',
    type: 'tourisme',
    description_fr: 'Visa de tourisme pour visiter la Chine',
    description_en: 'Tourist visa for visiting China',
    duration_fr: '30 jours',
    duration_en: '30 days',
    price: 150000,
    processingTime_fr: '5-7 jours ouvrables',
    processingTime_en: '5-7 working days',
    validity_fr: '3 mois',
    validity_en: '3 months',
    pdfUrl: '',
    requiredDocs_fr: ['Passeport valide 6 mois', 'Photo d\'identite', 'Reservation d\'hotel', 'Billet d\'avion'],
    requiredDocs_en: ['Valid passport', 'ID Photo', 'Hotel reservation', 'Flight ticket'],
    active: true
  },
  {
    id: 'visa_2',
    name_fr: 'Visa Affaires Chine',
    name_en: 'China Business Visa',
    type: 'affaires',
    description_fr: 'Visa pour voyages d\'affaires et reunions professionnelles',
    description_en: 'Visa for business trips and professional meetings',
    duration_fr: '90 jours',
    duration_en: '90 days',
    price: 250000,
    processingTime_fr: '7-10 jours ouvrables',
    processingTime_en: '7-10 working days',
    validity_fr: '6 mois',
    validity_en: '6 months',
    pdfUrl: '',
    requiredDocs_fr: ['Passeport valide 6 mois', 'Lettre d\'invitation', 'Justificatif d\'entreprise', 'Photo d\'identite'],
    requiredDocs_en: ['Valid passport', 'Invitation letter', 'Business proof', 'ID Photo'],
    active: true
  }
]

const resetForm = () => {
  form.name_fr = ''
  form.name_en = ''
  form.type = ''
  form.description_fr = ''
  form.description_en = ''
  form.duration_fr = ''
  form.duration_en = ''
  form.price = 0
  form.processingTime_fr = ''
  form.processingTime_en = ''
  form.validity_fr = ''
  form.validity_en = ''
  form.pdfUrl = ''
  form.requiredDocsInput_fr = ''
  form.requiredDocsInput_en = ''
  form.active = true
}

const openModal = (visa?: Visa) => {
  if (visa) {
    editingVisa.value = visa
    form.name_fr = visa.name_fr || ''
    form.name_en = visa.name_en || ''
    form.type = visa.type
    form.description_fr = visa.description_fr || ''
    form.description_en = visa.description_en || ''
    form.duration_fr = visa.duration_fr || ''
    form.duration_en = visa.duration_en || ''
    form.price = visa.price || 0
    form.processingTime_fr = visa.processingTime_fr || ''
    form.processingTime_en = visa.processingTime_en || ''
    form.validity_fr = visa.validity_fr || ''
    form.validity_en = visa.validity_en || ''
    form.pdfUrl = visa.pdfUrl || ''
    form.requiredDocsInput_fr = visa.requiredDocs_fr?.join(', ') || ''
    form.requiredDocsInput_en = visa.requiredDocs_en?.join(', ') || ''
    form.active = visa.active !== false
  } else {
    editingVisa.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveVisa = () => {
  const requiredDocs_fr = form.requiredDocsInput_fr.split(',').map(d => d.trim()).filter(Boolean)
  const requiredDocs_en = form.requiredDocsInput_en.split(',').map(d => d.trim()).filter(Boolean)

  const visaData: Partial<Visa> = {
    name_fr: form.name_fr,
    name_en: form.name_en,
    type: form.type,
    description_fr: form.description_fr,
    description_en: form.description_en,
    duration_fr: form.duration_fr,
    duration_en: form.duration_en,
    price: form.price,
    processingTime_fr: form.processingTime_fr,
    processingTime_en: form.processingTime_en,
    validity_fr: form.validity_fr,
    validity_en: form.validity_en,
    pdfUrl: form.pdfUrl,
    requiredDocs_fr: requiredDocs_fr,
    requiredDocs_en: requiredDocs_en,
    active: form.active
  }

  if (editingVisa.value) {
    const idx = visas.value.findIndex(v => v.id === editingVisa.value!.id)
    if (idx !== -1) {
      visas.value[idx] = {
        ...visas.value[idx],
        ...visaData
      } as Visa
    }
    success('Visa modifié')
  } else {
    const newVisa: Visa = {
      id: `visa_${Date.now()}`,
      ...visaData
    } as Visa
    visas.value.unshift(newVisa)
    success('Visa créé')
  }

  saveToLocalStorage()
  modalInstance?.hide()
  resetForm()
}

const handlePdfUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.pdfUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const deleteVisa = (id: string) => {
  if (!confirm('Supprimer ce visa ?')) return

  visas.value = visas.value.filter(v => v.id !== id)
  saveToLocalStorage()
  success('Visa supprime')
}
</script>

<style scoped>
.visa-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>

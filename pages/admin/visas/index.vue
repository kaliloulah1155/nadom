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
      <div v-for="visa in visas" :key="visa.id" class="col-md-6 col-lg-4">
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
            <h5 class="card-title">{{ visa.name }}</h5>
            <p class="text-muted small mb-3">{{ visa.description }}</p>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Duree</small>
                <strong>{{ visa.duration }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Prix</small>
                <strong class="text-primary">{{ formatCurrency(visa.price) }}</strong>
              </div>
            </div>

            <div class="mb-3">
              <small class="text-muted d-block mb-1">Documents requis</small>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="doc in visa.requiredDocs?.slice(0, 3)" :key="doc" class="badge bg-light text-dark small">
                  {{ doc }}
                </span>
                <span v-if="visa.requiredDocs?.length > 3" class="badge bg-light text-dark small">
                  +{{ visa.requiredDocs.length - 3 }}
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
            <div class="btn-group w-100">
              <button class="btn btn-sm btn-outline-primary" @click="openModal(visa)">
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
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nom du visa *</label>
                  <input v-model="form.name" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type *</label>
                  <select v-model="form.type" class="form-select" required>
                    <option value="">Selectionnez</option>
                    <option value="tourisme">Tourisme</option>
                    <option value="affaires">Affaires</option>
                    <option value="travail">Travail</option>
                    <option value="etudes">Etudes</option>
                    <option value="transit">Transit</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea v-model="form.description" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Duree</label>
                  <input v-model="form.duration" type="text" class="form-control" placeholder="Ex: 30 jours" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Prix (FCFA)</label>
                  <input v-model.number="form.price" type="number" class="form-control" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Delai de traitement</label>
                  <input v-model="form.processingTime" type="text" class="form-control" placeholder="Ex: 5-7 jours" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Validite</label>
                  <input v-model="form.validity" type="text" class="form-control" placeholder="Ex: 3 mois" />
                </div>
                <div class="col-12">
                  <label class="form-label">URL du formulaire PDF</label>
                  <input v-model="form.pdfUrl" type="url" class="form-control" placeholder="https://..." />
                  <small class="text-muted">Lien vers le formulaire de demande PDF</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Documents requis</label>
                  <textarea
                    v-model="form.requiredDocsInput"
                    class="form-control"
                    rows="3"
                    placeholder="Un document par ligne"
                  ></textarea>
                  <small class="text-muted">Entrez chaque document sur une nouvelle ligne</small>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input v-model="form.active" type="checkbox" class="form-check-input" id="visaActive" />
                    <label class="form-check-label" for="visaActive">Visa disponible</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary">
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
import { ref, reactive, onMounted } from 'vue'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const { formatCurrency } = useFormatters()
const { success, error } = useNotification()

interface Visa {
  id: string
  name: string
  type: string
  description: string
  duration: string
  price: number
  processingTime: string
  validity: string
  pdfUrl: string
  requiredDocs: string[]
  active: boolean
}

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const visas = ref<Visa[]>([])
const editingVisa = ref<Visa | null>(null)

const form = reactive({
  name: '',
  type: '',
  description: '',
  duration: '',
  price: 0,
  processingTime: '',
  validity: '',
  pdfUrl: '',
  requiredDocsInput: '',
  active: true
})

onMounted(() => {
  loadVisas()

  if (typeof window !== 'undefined' && window.bootstrap) {
    modalInstance = new window.bootstrap.Modal(modalRef.value)
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
    name: 'Visa Tourisme Chine',
    type: 'tourisme',
    description: 'Visa de tourisme pour visiter la Chine',
    duration: '30 jours',
    price: 150000,
    processingTime: '5-7 jours ouvrables',
    validity: '3 mois',
    pdfUrl: '',
    requiredDocs: ['Passeport valide 6 mois', 'Photo d\'identite', 'Reservation d\'hotel', 'Billet d\'avion'],
    active: true
  },
  {
    id: 'visa_2',
    name: 'Visa Affaires Chine',
    type: 'affaires',
    description: 'Visa pour voyages d\'affaires et reunions professionnelles',
    duration: '90 jours',
    price: 250000,
    processingTime: '7-10 jours ouvrables',
    validity: '6 mois',
    pdfUrl: '',
    requiredDocs: ['Passeport valide 6 mois', 'Lettre d\'invitation', 'Justificatif d\'entreprise', 'Photo d\'identite'],
    active: true
  },
  {
    id: 'visa_3',
    name: 'Visa Travail Chine',
    type: 'travail',
    description: 'Visa pour emploi en Chine',
    duration: '1 an',
    price: 350000,
    processingTime: '15-20 jours ouvrables',
    validity: '1 an',
    pdfUrl: '',
    requiredDocs: ['Passeport valide 6 mois', 'Contrat de travail', 'Diplomes certifies', 'Certificat medical', 'Photo d\'identite'],
    active: true
  }
]

const resetForm = () => {
  form.name = ''
  form.type = ''
  form.description = ''
  form.duration = ''
  form.price = 0
  form.processingTime = ''
  form.validity = ''
  form.pdfUrl = ''
  form.requiredDocsInput = ''
  form.active = true
}

const openModal = (visa?: Visa) => {
  if (visa) {
    editingVisa.value = visa
    form.name = visa.name
    form.type = visa.type
    form.description = visa.description
    form.duration = visa.duration
    form.price = visa.price
    form.processingTime = visa.processingTime
    form.validity = visa.validity
    form.pdfUrl = visa.pdfUrl
    form.requiredDocsInput = visa.requiredDocs?.join('\n') || ''
    form.active = visa.active
  } else {
    editingVisa.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveVisa = () => {
  const requiredDocs = form.requiredDocsInput.split('\n').map(d => d.trim()).filter(Boolean)

  if (editingVisa.value) {
    const idx = visas.value.findIndex(v => v.id === editingVisa.value!.id)
    if (idx !== -1) {
      visas.value[idx] = {
        ...visas.value[idx],
        name: form.name,
        type: form.type,
        description: form.description,
        duration: form.duration,
        price: form.price,
        processingTime: form.processingTime,
        validity: form.validity,
        pdfUrl: form.pdfUrl,
        requiredDocs,
        active: form.active
      }
    }
    success('Visa modifie')
  } else {
    const newVisa: Visa = {
      id: `visa_${Date.now()}`,
      name: form.name,
      type: form.type,
      description: form.description,
      duration: form.duration,
      price: form.price,
      processingTime: form.processingTime,
      validity: form.validity,
      pdfUrl: form.pdfUrl,
      requiredDocs,
      active: form.active
    }
    visas.value.unshift(newVisa)
    success('Visa cree')
  }

  saveToLocalStorage()
  modalInstance?.hide()
  resetForm()
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

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des guides</h4>
        <p class="text-muted mb-0">{{ guides.length }} guides disponibles</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau guide
      </button>
    </div>

    <!-- Guides List -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Nom</th>
                <th>Categorie</th>
                <th>Description</th>
                <th>Fichier</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="guides.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Aucun guide configure
                </td>
              </tr>
              <tr v-for="guide in guides" :key="guide.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="guide-icon me-3">
                      <i :class="[getCategoryIcon(guide.category), 'fs-4']"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ guide.name }}</div>
                      <small class="text-muted">{{ guide.language }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge bg-secondary">{{ guide.category }}</span></td>
                <td><small>{{ truncate(guide.description, 50) }}</small></td>
                <td>
                  <a v-if="guide.fileUrl" :href="guide.fileUrl" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-file-earmark-pdf me-1"></i>PDF
                  </a>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span :class="['badge', guide.active ? 'bg-success' : 'bg-secondary']">
                    {{ guide.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="openModal(guide)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteGuide(guide.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="guideModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingGuide ? 'Modifier' : 'Nouveau' }} guide</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveGuide">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nom du guide *</label>
                  <input v-model="form.name" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Categorie *</label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="">Selectionnez</option>
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                    <option value="douane">Douane</option>
                    <option value="transport">Transport</option>
                    <option value="paiement">Paiement</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Langue</label>
                  <select v-model="form.language" class="form-select">
                    <option value="Francais">Francais</option>
                    <option value="English">English</option>
                    <option value="Chinois">Chinois</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label">URL du fichier PDF</label>
                  <input v-model="form.fileUrl" type="url" class="form-control" placeholder="https://..." />
                  <small class="text-muted">Lien vers le fichier PDF heberge</small>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input v-model="form.active" type="checkbox" class="form-check-input" id="guideActive" />
                    <label class="form-check-label" for="guideActive">Guide actif</label>
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

const { truncate } = useFormatters()
const { success, error } = useNotification()

interface Guide {
  id: string
  name: string
  category: string
  description: string
  fileUrl: string
  language: string
  active: boolean
}

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const guides = ref<Guide[]>([])
const editingGuide = ref<Guide | null>(null)

const form = reactive({
  name: '',
  category: '',
  description: '',
  fileUrl: '',
  language: 'Francais',
  active: true
})

onMounted(() => {
  loadGuides()

  if (typeof window !== 'undefined' && window.bootstrap) {
    modalInstance = new window.bootstrap.Modal(modalRef.value)
  }
})

const loadGuides = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guides')
    guides.value = saved ? JSON.parse(saved) : getDefaultGuides()
  }
}

const saveToLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guides', JSON.stringify(guides.value))
  }
}

const getDefaultGuides = (): Guide[] => [
  {
    id: 'guide_1',
    name: 'Guide Import Chine-Afrique',
    category: 'import',
    description: 'Guide complet pour importer des marchandises de Chine vers l\'Afrique',
    fileUrl: '',
    language: 'Francais',
    active: true
  },
  {
    id: 'guide_2',
    name: 'Procedures Douanieres',
    category: 'douane',
    description: 'Tout savoir sur les procedures douanieres et les documents requis',
    fileUrl: '',
    language: 'Francais',
    active: true
  },
  {
    id: 'guide_3',
    name: 'Modes de Paiement',
    category: 'paiement',
    description: 'Les differents modes de paiement securises pour vos transactions',
    fileUrl: '',
    language: 'Francais',
    active: true
  }
]

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

const resetForm = () => {
  form.name = ''
  form.category = ''
  form.description = ''
  form.fileUrl = ''
  form.language = 'Francais'
  form.active = true
}

const openModal = (guide?: Guide) => {
  if (guide) {
    editingGuide.value = guide
    form.name = guide.name
    form.category = guide.category
    form.description = guide.description
    form.fileUrl = guide.fileUrl
    form.language = guide.language
    form.active = guide.active
  } else {
    editingGuide.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveGuide = () => {
  if (editingGuide.value) {
    const idx = guides.value.findIndex(g => g.id === editingGuide.value!.id)
    if (idx !== -1) {
      guides.value[idx] = {
        ...guides.value[idx],
        name: form.name,
        category: form.category,
        description: form.description,
        fileUrl: form.fileUrl,
        language: form.language,
        active: form.active
      }
    }
    success('Guide modifie')
  } else {
    const newGuide: Guide = {
      id: `guide_${Date.now()}`,
      name: form.name,
      category: form.category,
      description: form.description,
      fileUrl: form.fileUrl,
      language: form.language,
      active: form.active
    }
    guides.value.unshift(newGuide)
    success('Guide cree')
  }

  saveToLocalStorage()
  modalInstance?.hide()
  resetForm()
}

const deleteGuide = (id: string) => {
  if (!confirm('Supprimer ce guide ?')) return

  guides.value = guides.value.filter(g => g.id !== id)
  saveToLocalStorage()
  success('Guide supprime')
}
</script>

<style scoped>
.guide-icon {
  width: 40px;
  height: 40px;
  background: var(--bs-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}
</style>

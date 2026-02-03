<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des services & tarifs</h4>
        <p class="text-muted mb-0">{{ services.length }} services configurés</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau service
      </button>
    </div>

    <!-- Services Grid -->
    <div class="row g-4 mb-5">
      <div v-for="service in paginatedServices" :key="service.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="service-icon bg-primary-subtle text-primary me-3">
                <i :class="['bi', service.icon]"></i>
              </div>
              <h5 class="card-title mb-0">{{ service.name_fr }}</h5>
            </div>
            <p class="text-muted small mb-3">{{ service.description_fr }}</p>
            <ul class="list-unstyled small mb-0">
              <li v-for="feature in service.features_fr" :key="feature" class="mb-1">
                <i class="bi bi-check2 text-success me-2"></i>{{ feature }}
              </li>
            </ul>
          </div>
          <div class="card-footer bg-transparent border-0 pt-0">
                  <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm me-2" title="Modifier" @click="openModal(service)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Supprimer" @click="deleteService(service.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="card border-0 shadow-sm">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="services.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="serviceModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingService ? 'Modifier' : 'Nouveau' }} service</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveService">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3" id="serviceTabs" role="tablist">
                <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#svc-fr-content" type="button">Français</button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#svc-en-content" type="button">English</button>
                </li>
              </ul>

              <div class="tab-content">
                <div class="tab-pane fade show active" id="svc-fr-content">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Nom du service (FR) *</label>
                      <input v-model="form.name_fr" type="text" class="form-control input-md" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (FR)</label>
                      <textarea v-model="form.description_fr" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Caractéristiques (FR, une par ligne)</label>
                      <textarea v-model="form.featuresInput_fr" class="form-control" rows="3"></textarea>
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="svc-en-content">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Service Name (EN)</label>
                      <input v-model="form.name_en" type="text" class="form-control input-md" placeholder="English name..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (EN)</label>
                      <textarea v-model="form.description_en" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Features (EN, one per line)</label>
                      <textarea v-model="form.featuresInput_en" class="form-control" rows="3"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Icon (Bootstrap Icon class)</label>
                  <input v-model="form.icon" type="text" class="form-control input-md" placeholder="bi-bag" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { FAKE_SERVICES } from '~/utils/data/fakeData'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const { success, error } = useNotification()

interface Service {
  id: string
  name_fr: string
  name_en: string
  icon: string
  description_fr: string
  description_en: string
  features_fr: string[]
  features_en: string[]

  // compatibility
  name?: string
  description?: string
  features?: string[]
}

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const services = ref<Service[]>([])
const editingService = ref<Service | null>(null)

const currentPage = ref(1)
const perPage = ref(6)

const form = reactive({
  name_fr: '',
  name_en: '',
  icon: 'bi-box',
  description_fr: '',
  description_en: '',
  featuresInput_fr: '',
  featuresInput_en: ''
})

onMounted(() => {
  loadServices()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const loadServices = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('services')
    const data = saved ? JSON.parse(saved) : FAKE_SERVICES
    services.value = data.map((s: any) => ({
      ...s,
      name_fr: s.name_fr || s.name || '',
      name_en: s.name_en || '',
      description_fr: s.description_fr || s.description || '',
      description_en: s.description_en || '',
      features_fr: s.features_fr || s.features || [],
      features_en: s.features_en || []
    }))
  }
}

const saveToLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('services', JSON.stringify(services.value))
  }
}

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return services.value.slice(start, start + perPage.value)
})

const resetForm = () => {
  form.name_fr = ''
  form.name_en = ''
  form.icon = 'bi-box'
  form.description_fr = ''
  form.description_en = ''
  form.featuresInput_fr = ''
  form.featuresInput_en = ''
}

const openModal = (service?: Service) => {
  if (service) {
    editingService.value = service
    form.name_fr = service.name_fr || ''
    form.name_en = service.name_en || ''
    form.icon = service.icon || 'bi-box'
    form.description_fr = service.description_fr || ''
    form.description_en = service.description_en || ''
    form.featuresInput_fr = (service.features_fr || []).join('\n')
    form.featuresInput_en = (service.features_en || []).join('\n')
  } else {
    editingService.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveService = () => {
  const features_fr = form.featuresInput_fr.split('\n').map(f => f.trim()).filter(Boolean)
  const features_en = form.featuresInput_en.split('\n').map(f => f.trim()).filter(Boolean)

  const serviceData: Partial<Service> = {
    name_fr: form.name_fr,
    name_en: form.name_en,
    icon: form.icon,
    description_fr: form.description_fr,
    description_en: form.description_en,
    features_fr,
    features_en
  }

  if (editingService.value) {
    const idx = services.value.findIndex(s => s.id === editingService.value!.id)
    if (idx !== -1) {
      services.value[idx] = { ...services.value[idx], ...serviceData } as Service
    }
    success('Service modifié')
  } else {
    const newService: Service = {
      id: `svc_${Date.now()}`,
      ...serviceData
    } as Service
    services.value.unshift(newService)
    success('Service créé')
  }

  saveToLocalStorage()
  modalInstance?.hide()
  resetForm()
}

const deleteService = (id: string) => {
  if (!confirm('Supprimer ce service ?')) return
  services.value = services.value.filter(s => s.id !== id)
  saveToLocalStorage()
  success('Service supprimé')
}
</script>

<style scoped>
.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>

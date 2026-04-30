<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des services & tarifs</h4>
        <p class="text-muted mb-0">{{ pricingStore.servicesMeta.total }} services configurés</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau service
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="pricingStore.error" class="alert alert-danger d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <div class="flex-grow-1">{{ pricingStore.error }}</div>
      <button class="btn btn-sm btn-outline-danger" @click="fetchServices(1)">Réessayer</button>
    </div>

    <!-- Loading -->
    <div v-if="pricingStore.loading && services.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3 mb-0">Chargement des services...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!pricingStore.loading && services.length === 0 && !pricingStore.error" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <i class="bi bi-tag fs-1 text-muted d-block mb-3"></i>
        <h5 class="mb-2">Aucun service configuré</h5>
        <p class="text-muted mb-4">Commencez par créer votre premier service pour définir les tarifs affichés aux clients.</p>
        <button class="btn btn-primary" @click="openModal()">
          <i class="bi bi-plus-lg me-2"></i>Créer un service
        </button>
      </div>
    </div>

    <!-- Services Grid -->
    <div v-else class="row g-4 mb-5">
      <div v-for="service in services" :key="service.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="service-icon bg-primary-subtle text-primary me-3">
                <i class="bi bi-tag fs-4"></i>
              </div>
              <h5 class="card-title mb-0">{{ service.key.replace('SERVICE_', '') }}</h5>
            </div>
            <p class="text-muted small mb-3">{{ service.description }}</p>
            <h4 class="text-primary">{{ service.value }} FCAF</h4>
          </div>
          <div class="card-footer bg-transparent border-0 pt-0">
            <div class="d-flex">
              <button class="btn btn-outline-primary btn-sm me-2" @click="openModal(service)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteService(service.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="services.length > 0" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="pricingStore.servicesMeta.currentPage"
          v-model:limit="pricingStore.servicesMeta.perPage"
          :total-items="pricingStore.servicesMeta.total"
          @update:current-page="(p: number) => fetchServices(p)"
          @update:limit="(l: number) => fetchServices(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="serviceModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingService ? 'Modifier' : 'Nouveau' }} service</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveService">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nom du service *</label>
                  <input v-model="form.key" type="text" class="form-control" required :disabled="!!editingService" />
                  <small class="text-muted">Identifiant (ex: PERSONAL_SHOPPING)</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Prix (FCFA) *</label>
                  <input v-model.number="form.value" type="number" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Slug *</label>
                  <input v-model="form.slug" type="text" class="form-control" required />
                  <small class="text-muted">URL unique (ex: personal-shopping)</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <WysiwygEditor v-model="form.description" height="120px" />
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="form.status" type="checkbox" class="form-check-input" id="serviceStatus" />
                    <label class="form-check-label" for="serviceStatus">
                      Service actif
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { usePricingStore } from '~/stores/pricing'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const pricingStore = usePricingStore()
const { success, error } = useNotification()

const services = computed(() => pricingStore.services)

const editingService = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  key: '',
  value: 0,
  slug: '',
  description: '',
  status: true
})

const fetchServices = async (page?: number, limit?: number) => {
  await pricingStore.fetchServices({
    page: page ?? pricingStore.servicesMeta.currentPage,
    limit: limit ?? pricingStore.servicesMeta.perPage
  })
}

onMounted(async () => {
  await fetchServices(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (service?: any) => {
  if (service) {
    editingService.value = service
    form.key = service.key.replace('SERVICE_', '')
    form.value = parseFloat(service.value) || 0
    form.slug = service.slug.replace('service_', '')
    form.description = service.description || ''
    form.status = service.status === 1
  } else {
    editingService.value = null
    form.key = ''
    form.value = 0
    form.slug = ''
    form.description = ''
    form.status = true
  }
  modalInstance?.show()
}

const saveService = async () => {
  const data = {
    kkey: form.key.toUpperCase(),
    vvalue: String(form.value),
    slug: 'service_' + form.slug.toLowerCase(),
    description: form.description || null,
    status: form.status ? 1 : 0
  }

  try {
    if (editingService.value) {
      await pricingStore.updateService(editingService.value.id, data as any)
      success('Service modifié')
    } else {
      await pricingStore.createService(data as any)
      success('Service créé')
    }
    modalInstance?.hide()
    await fetchServices(pricingStore.servicesMeta.currentPage)
  } catch (err: any) {
    error(err.message)
  }
}

const deleteService = async (id: number) => {
  if (confirm('Supprimer ce service ?')) {
    await pricingStore.deleteService(id)
    success('Service supprimé')
    await fetchServices(pricingStore.servicesMeta.currentPage)
  }
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
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
              <div>
                <h5 class="card-title mb-0">{{ service.key.replace('SERVICE_', '').replace(/_/g, ' ') }}</h5>
                <small class="text-muted">{{ service.slug }}</small>
              </div>
            </div>
            <p v-if="service.description" class="text-muted small mb-3" v-html="service.description"></p>
            <h4 class="text-primary mb-0">
              {{ formatCurrency(parseServiceValue(service.value).amount, parseServiceValue(service.value).currency) }}
            </h4>
          </div>
          <div class="card-footer bg-transparent border-0 pt-0">
            <div class="d-flex align-items-center justify-content-between">
              <span class="badge" :class="service.status === 1 ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                {{ service.status === 1 ? 'Actif' : 'Inactif' }}
              </span>
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

                <!-- Prix + Devise -->
                <div class="col-8">
                  <label class="form-label">Prix *</label>
                  <input v-model.number="form.value" type="number" class="form-control" required min="0" step="any" />
                </div>
                <div class="col-4">
                  <label class="form-label">Devise *</label>
                  <select v-model="form.currency" class="form-select" required>
                    <option v-for="cur in currencies" :key="cur.uuid || cur.code" :value="cur.code">
                      {{ cur.label || cur.code }}
                    </option>
                  </select>
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
                    <label class="form-check-label" for="serviceStatus">Service actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
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
import { usePricingStore } from '~/stores/pricing'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({ layout: 'admin' })

const pricingStore = usePricingStore()
const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()
const { formatCurrency } = useFormatters()

const services = computed(() => pricingStore.services)

// Devises = catégories slug DVS (même pattern que admin/products)
const currencies = computed(() => {
  const list = (psStore.categories || [])
    .filter((c: any) => {
      const s = (c.slug || '').toString().toUpperCase()
      return s === 'DVS' || s.startsWith('DVS-') || s.startsWith('DVS_')
    })
    .map((c: any) => ({
      uuid: c.uuid,
      code: (c.code || c.label || '').toString().toUpperCase(),
      label: c.label || c.code || '',
    }))
    .filter((c: any) => c.code)
  return list.length > 0 ? list : [{ uuid: 'xof', code: 'XOF', label: 'FCFA (XOF)' }]
})

const parseServiceValue = (raw: string): { amount: number; currency: string } => {
  try {
    const p = JSON.parse(raw)
    if (p && typeof p === 'object' && 'amount' in p) {
      return { amount: Number(p.amount) || 0, currency: String(p.currency || 'XOF') }
    }
  } catch {}
  return { amount: parseFloat(raw) || 0, currency: 'XOF' }
}

const editingService = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const saving = ref(false)

const form = reactive({
  key: '',
  value: 0,
  currency: 'XOF',
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
  await Promise.all([
    fetchServices(1),
    psStore.fetchCategories()
  ])
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (service?: any) => {
  if (service) {
    editingService.value = service
    form.key = service.key.replace(/^SERVICE_/i, '')
    const parsed = parseServiceValue(service.value)
    form.value = parsed.amount
    form.currency = parsed.currency
    form.slug = service.slug.replace(/^service_/, '')
    form.description = service.description || ''
    form.status = service.status === 1
  } else {
    editingService.value = null
    form.key = ''
    form.value = 0
    form.currency = currencies.value[0]?.code || 'XOF'
    form.slug = ''
    form.description = ''
    form.status = true
  }
  modalInstance?.show()
}

const saveService = async () => {
  saving.value = true
  const data = {
    kkey: form.key.toUpperCase(),
    vvalue: JSON.stringify({ amount: form.value, currency: form.currency }),
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
  } finally {
    saving.value = false
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
  flex-shrink: 0;
}
</style>

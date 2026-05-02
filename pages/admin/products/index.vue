<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des produits</h4>
        <p class="text-muted mb-0">{{ psStore.productsMeta.total }} produits configurés</p>
      </div>
      <button v-can="['create', 'products']" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau produit
      </button>
    </div>

    <!-- Tools -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Rechercher un produit..." @input="debouncedFetch" />
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Catégorie produit</label>
            <select v-model="categoryFilter" class="form-select" @change="fetchProducts(1)">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in productCategories" :key="cat.uuid" :value="cat.uuid">
                {{ cat.label }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Lignes / page</label>
            <select
              :value="psStore.productsMeta.perPage"
              class="form-select"
              @change="(e) => fetchProducts(1, Number((e.target as HTMLSelectElement).value))"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <div class="col-md-2 text-md-end small text-muted">
            Page {{ psStore.productsMeta.currentPage }} / {{ psStore.productsMeta.lastPage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="px-4 py-3 border-0">Produit</th>
              <th class="py-3 border-0">Catégorie</th>
              <th class="py-3 border-0">Prix</th>
              <th class="py-3 border-0">Description</th>
              <th class="py-3 border-0 text-end px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
<tr v-for="prod in products" :key="prod.id">
              <td class="px-4">
                <div class="d-flex align-items-center gap-3">
                  <img :src="prod.image || 'https://placehold.co/50x50?text=No+Img'" class="rounded border" width="45" height="45" style="object-fit: cover;" />
                  <div class="fw-bold">{{ prod.name_fr || prod.name_en }}</div>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-primary border border-primary-subtle px-2 py-1">
                  {{ getCategoryName(prod.category_id) }}
                </span>
              </td>
              <td class="fw-bold text-primary">{{ formatCurrency(prod.price, prod.currency || 'XOF') }}</td>
              <td>
                <div class="text-muted small text-truncate" style="max-width: 250px;" v-html="prod.description_fr || prod.description_en || ''"></div>
              </td>
              <td class="text-end px-4">
                <div class="d-flex justify-content-end gap-2">
                  <button v-can="['update', 'products']" class="btn btn-sm btn-outline-primary" @click="openModal(prod)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-can="['delete', 'products']" class="btn btn-sm btn-outline-danger" @click="confirmDelete(prod.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="5" class="text-center py-5">
                <i class="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
                <p class="text-muted mb-0">Aucun produit trouvé</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent py-3 border-top-0">
        <AdminPagination
          v-model:current-page="psStore.productsMeta.currentPage"
          v-model:limit="psStore.productsMeta.perPage"
          :total-items="psStore.productsMeta.total"
          @update:current-page="(p: number) => fetchProducts(p)"
          @update:limit="(l: number) => fetchProducts(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingProduct ? 'Modifier' : 'Nouveau' }} produit</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveProduct">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#prod-fr">Français</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#prod-en">English</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="prod-fr">
                  <div class="mb-3">
                    <label class="form-label">Nom du produit (FR) *</label>
                    <input v-model="form.name_fr" type="text" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (FR)</label>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.description_fr" height="180px" placeholder="Décrivez le produit..." />
                    </ClientOnly>
                  </div>
                </div>
                <div class="tab-pane fade" id="prod-en">
                  <div class="mb-3">
                    <label class="form-label">Product Name (EN) *</label>
                    <input v-model="form.name_en" type="text" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (EN)</label>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.description_en" height="180px" placeholder="Describe the product..." />
                    </ClientOnly>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Catégorie *</label>
                  <select v-model="form.category_id" class="form-select" required>
                    <option value="">
                      {{ loadingCategories ? 'Chargement...' : 'Sélectionnez une catégorie' }}
                    </option>
                    <option v-for="cat in productCategories" :key="cat.uuid" :value="cat.uuid">
                      {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Prix *</label>
                  <input v-model.number="form.price" type="number" class="form-control" required min="0" step="any" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Devise *</label>
                  <select v-model="form.currency" class="form-select" required>
                    <option v-for="cur in currencies" :key="cur.uuid || cur.code" :value="cur.code">
                      {{ cur.label }}
                    </option>
                  </select>
                </div>
                
                <div class="col-12">
                  <label class="form-label">Image du produit</label>
                  <div class="d-flex gap-3 align-items-start">
                    <div class="image-upload-wrapper border rounded-3 overflow-hidden bg-light" style="width: 120px; height: 120px; flex-shrink: 0;">
                      <img v-if="form.image" :src="form.image" class="w-100 h-100 object-fit-cover" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i class="bi bi-image fs-1"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <div class="mb-3">
                        <input type="file" class="form-control" @change="handleImageUpload" accept="image/*" />
                        <div class="form-text">Formats acceptés: JPG, PNG, WebP. Max 2Mo.</div>
                      </div>
                      <div class="input-group">
                        <span class="input-group-text small">OU URL</span>
                        <input v-model="form.image" type="text" class="form-control" placeholder="https://..." />
                        <button type="button" class="btn btn-outline-secondary" @click="generateDemoImage">
                          <i class="bi bi-magic me-1"></i>Démo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving || isUploading">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving || isUploading">
                <span v-if="saving || isUploading" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : isUploading ? 'Upload...' : 'Enregistrer' }}
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
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()
const { formatCurrency } = useFormatters()

const products = computed(() => psStore.products)
// Filtre catégories produits = slug POD (insensible à la casse)
const productCategories = computed(() =>
  (psStore.categories || []).filter((c: any) =>
    (c.slug || '').toString().toUpperCase() === 'POD'
  )
)
// Devises = catégories slug DVS (insensible à la casse, avec fallback FCFA)
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
  return list.length > 0 ? list : [{ uuid: 'xof', code: 'XOF', label: 'CFA' }]
})

const searchQuery = ref('')
const categoryFilter = ref('')

const editingProduct = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
const isUploading = ref(false)
const saving = ref(false)
const loadingCategories = ref(false)
let modalInstance: any = null

const form = reactive({
  category_id: '',
  name_fr: '',
  name_en: '',
  description_fr: '',
  description_en: '',
  price: 0,
  currency: 'XOF',
  image: '',
  is_active: true,
  stock_status: 'on_demand' as 'in_stock' | 'out_of_stock' | 'on_demand'
})

const fetchProducts = async (page?: number, limit?: number) => {
  await psStore.fetchProducts({
    page: page ?? psStore.productsMeta.currentPage,
    limit: limit ?? psStore.productsMeta.perPage,
    search: searchQuery.value || undefined,
    category_id: categoryFilter.value || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchProducts(1), 400)
}

onMounted(async () => {
  await psStore.fetchCategories()
  await fetchProducts(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const getCategoryName = (id: string | null | number) => {
  if (id === null || id === undefined || id === '') return 'Aucune'
  const idStr = String(id)
  const cat = (psStore.categories || []).find((c: any) =>
    String(c.uuid) === idStr || String(c.id) === idStr
  )
  return cat ? cat.label : 'Inconnue'
}

const resolveCategoryUuid = (categoryId: any): string => {
  if (!categoryId) return ''
  const idStr = String(categoryId)
  const cat = (psStore.categories || []).find((c: any) =>
    String(c.uuid) === idStr || String(c.id) === idStr
  )
  return cat?.uuid || ''
}

const handleImageUpload = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    error('L\'image est trop lourde (max 2Mo)')
    return
  }

  isUploading.value = true
  try {
    const api = useApi()
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'products')
    const res = await api.post<{ url: string; path: string }>('/upload/image', formData)
    if (res.success && res.data?.url) {
      form.image = res.data.url
    } else {
      error(res.message || 'Erreur lors de l\'upload')
    }
  } catch (err: any) {
    error('Erreur lors de l\'upload de l\'image')
  } finally {
    isUploading.value = false
  }
}

const openModal = async (prod?: any) => {
  // Recharge les catégories si elles ne sont pas encore disponibles
  if (productCategories.value.length === 0 && !loadingCategories.value) {
    loadingCategories.value = true
    await psStore.fetchCategories()
    loadingCategories.value = false
  }

  if (prod) {
    editingProduct.value = prod
    Object.assign(form, {
      category_id: resolveCategoryUuid(prod.category_id),
      name_fr: prod.name_fr || '',
      name_en: prod.name_en || '',
      description_fr: prod.description_fr || '',
      description_en: prod.description_en || '',
      price: Number(prod.price) || 0,
      currency: prod.currency || 'XOF',
      image: prod.image || '',
      is_active: prod.is_active ?? true,
      stock_status: prod.stock_status || 'on_demand'
    })
  } else {
    editingProduct.value = null
    Object.assign(form, {
      category_id: productCategories.value[0]?.uuid || '',
      name_fr: '',
      name_en: '',
      description_fr: '',
      description_en: '',
      price: 0,
      currency: currencies.value[0]?.code || 'XOF',
      image: '',
      is_active: true,
      stock_status: 'on_demand'
    })
  }
  modalInstance?.show()
}

const saveProduct = async () => {
  saving.value = true
  try {
    if (editingProduct.value) {
      await psStore.updateProduct(editingProduct.value.id, { ...form })
      success('Produit modifié')
    } else {
      await psStore.createProduct({ ...form })
      success('Produit créé')
    }
    modalInstance?.hide()
    await fetchProducts(psStore.productsMeta.currentPage)
  } catch (err) {
    error('Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (id: string) => {
  if (confirm('Supprimer ce produit ?')) {
    await psStore.deleteProduct(id)
    success('Produit supprimé')
    await fetchProducts(psStore.productsMeta.currentPage)
  }
}

const generateDemoImage = () => {
  const keywords = form.name_en.split(' ').join(',')
  form.image = `https://loremflickr.com/400/400/${keywords || 'product'}`
}
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
.image-upload-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

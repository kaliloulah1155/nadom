<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.categories.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.categories.totalCount', { n: psStore.categoriesMeta.total }) }}</p>
      </div>
      <button v-can="['create', 'categories']" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.categories.newCategory') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">{{ t('admin.categories.filterSlug') }}</label>
            <select v-model="filterSlug" class="form-select form-select-sm" @change="fetchCategories(1)">
              <option value="">{{ t('admin.categories.allTypes') }}</option>
              <option value="POD">{{ t('admin.categories.slugTypePod') }}</option>
              <option value="DVS">{{ t('admin.categories.slugTypeDvs') }}</option>
              <option value="MEX">{{ t('admin.categories.slugTypeMex') }}</option>
              <option value="TVS">{{ t('admin.categories.slugTypeTvs') }}</option>
              <option value="BLG">{{ t('admin.categories.slugTypeBlg') }}</option>
              <option value="FAQ">{{ t('admin.categories.slugTypeFaq') }}</option>
              <option value="GDC">{{ t('admin.categories.slugTypeGdc') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">{{ t('admin.categories.linesPerPage') }}</label>
            <select
              :value="psStore.categoriesMeta.perPage"
              class="form-select form-select-sm"
              @change="(e) => fetchCategories(1, Number((e.target as HTMLSelectElement).value))"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="col-md-5 text-md-end small text-muted">
            {{ t('admin.pagination.pageOf', { current: psStore.categoriesMeta.currentPage, last: psStore.categoriesMeta.lastPage }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>{{ t('admin.users.label') }}</th>
              <th>{{ t('admin.categories.slug') }}</th>
              <th>{{ t('admin.users.code') }}</th>
              <th>{{ t('admin.dashboard.status') }}</th>
              <th>{{ t('admin.categories.order') }}</th>
              <th>{{ t('admin.common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.uuid">
              <td class="fw-medium">{{ categoryLabel(cat) }}</td>
              <td><code>{{ cat.slug }}</code></td>
              <td><span v-if="cat.code" class="badge bg-secondary">{{ cat.code }}</span></td>
              <td>
                <span :class="['badge', cat.status === '1' ? 'bg-success' : cat.status === '2' ? 'bg-warning' : 'bg-secondary']">
                  {{ getStatusLabel(cat.status) }}
                </span>
              </td>
              <td>{{ cat.sort_order }}</td>
              <td>
                <div class="d-flex gap-2">
                  <button v-can="['update', 'categories']" class="btn btn-sm btn-outline-primary" @click="openModal(cat)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-can="['delete', 'categories']" class="btn btn-sm btn-outline-danger" @click="confirmDelete(cat.uuid)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="card border-0 shadow-sm">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="psStore.categoriesMeta.currentPage"
          v-model:limit="psStore.categoriesMeta.perPage"
          :total-items="psStore.categoriesMeta.total"
          @update:current-page="(p: number) => fetchCategories(p)"
          @update:limit="(l: number) => fetchCategories(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCategory ? t('admin.categories.modalEdit') : t('admin.categories.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#cat-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#cat-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#cat-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="cat-fr">
                  <div class="mb-3">
                    <label class="form-label">{{ t('admin.categories.labelFr') }} *</label>
                    <input v-model="form.label_fr" type="text" class="form-control" required />
                  </div>
                  <div class="mb-0">
                    <label class="form-label">{{ t('admin.categories.descriptionFr') }}</label>
                    <ClientOnly>
                      <WysiwygEditor
                        v-if="modalOpen"
                        v-model="form.description_fr"
                        height="180px"
                        :placeholder="t('admin.categories.describePlaceholder')"
                      />
                    </ClientOnly>
                  </div>
                </div>
                <div class="tab-pane fade" id="cat-en">
                  <div class="mb-3">
                    <label class="form-label">{{ t('admin.categories.labelEn') }}</label>
                    <input v-model="form.label_en" type="text" class="form-control" />
                  </div>
                  <div class="mb-0">
                    <label class="form-label">{{ t('admin.categories.descriptionEn') }}</label>
                    <ClientOnly>
                      <WysiwygEditor
                        v-if="modalOpen"
                        v-model="form.description_en"
                        height="180px"
                        :placeholder="t('admin.categories.describePlaceholder')"
                      />
                    </ClientOnly>
                  </div>
                </div>
                <div class="tab-pane fade" id="cat-zh">
                  <div class="mb-3">
                    <label class="form-label">{{ t('admin.categories.labelZh') }}</label>
                    <input v-model="form.label_zh" type="text" class="form-control" />
                  </div>
                  <div class="mb-0">
                    <label class="form-label">{{ t('admin.categories.descriptionZh') }}</label>
                    <ClientOnly>
                      <WysiwygEditor
                        v-if="modalOpen"
                        v-model="form.description_zh"
                        height="180px"
                        :placeholder="t('admin.categories.describePlaceholder')"
                      />
                    </ClientOnly>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">{{ t('admin.categories.slug') }} *</label>
                  <ClientOnly>
                    <Multiselect
                      v-if="modalOpen"
                      v-model="slugSelected"
                      :options="slugOptions"
                      :taggable="true"
                      :searchable="true"
                      :show-no-options="false"
                      track-by="value"
                      label="label"
                      :placeholder="t('admin.categories.selectSlug')"
                      :tag-placeholder="t('admin.categories.addSlug')"
                      select-label=""
                      deselect-label=""
                      selected-label=""
                      @tag="addSlugTag"
                    />
                  </ClientOnly>
                  <small class="text-muted">{{ t('admin.categories.slugHint') }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ t('admin.users.code') }}</label>
                  <input v-model="form.code" type="text" class="form-control" placeholder="air_express" />
                </div>
                <div class="col-md-4">
                  <label class="form-label d-flex justify-content-between align-items-center">
                    <span>{{ t('admin.categories.icon') }}</span>
                    <a
                      href="https://icons.getbootstrap.com/"
                      target="_blank"
                      rel="noopener"
                      class="small text-decoration-none"
                      :title="t('admin.categories.viewIcons')"
                    >
                      <i class="bi bi-box-arrow-up-right me-1"></i>{{ t('admin.categories.viewIcons') }}
                    </a>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i v-if="form.icon" :class="form.icon"></i>
                      <i v-else class="bi bi-image text-muted"></i>
                    </span>
                    <input v-model="form.icon" type="text" class="form-control" placeholder="bi bi-airplane" />
                  </div>
                  <small class="text-muted">{{ t('admin.categories.iconBootstrapHint') }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ t('admin.categories.sortOrder') }}</label>
                  <input v-model.number="form.sort_order" type="number" class="form-control" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.dashboard.status') }}</label>
                  <select v-model="form.status" class="form-select">
                    <option value="1">{{ t('admin.categories.statusActive') }}</option>
                    <option value="2">{{ t('admin.categories.statusInactive') }}</option>
                    <option value="0">{{ t('admin.categories.archived') }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.categories.parentCategory') }}</label>
                  <select v-model="form.parent_uuid" class="form-select">
                    <option :value="null">{{ t('admin.categories.none') }}</option>
                    <option v-for="cat in parentOptions" :key="cat.uuid" :value="cat.uuid">
                      {{ categoryLabel(cat) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? t('admin.common.savingDots') : t('admin.common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { categoryLabel } = useCategoryLabel()

import { ref, reactive, computed, onMounted, watch } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()

const categories = computed(() => psStore.categories)
const editingCategory = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
const modalOpen = ref(false)
const saving = ref(false)
let modalInstance: any = null

const parentOptions = computed(() => {
  // Parents possibles : même type (slug) que la catégorie en cours, hors elle-même.
  return categories.value.filter((c: any) =>
    c.uuid !== editingCategory.value?.uuid
    && (!form.slug || String(c.slug || '').toUpperCase() === String(form.slug).toUpperCase())
  )
})

const form = reactive({
  label_fr: '',
  label_en: '',
  label_zh: '',
  slug: '',
  code: '',
  description_fr: '',
  description_en: '',
  description_zh: '',
  icon: '',
  sort_order: 0,
  status: '1',
  parent_uuid: null as string | null
})

const filterSlug = ref('')

type SlugOption = { value: string; label: string }

const knownSlugs = (): SlugOption[] => [
  { value: 'POD', label: t('admin.categories.slugTypePod') },
  { value: 'DVS', label: t('admin.categories.slugTypeDvs') },
  { value: 'MEX', label: t('admin.categories.slugTypeMex') },
  { value: 'TVS', label: t('admin.categories.slugTypeTvs') },
  { value: 'BLG', label: t('admin.categories.slugTypeBlg') },
  { value: 'FAQ', label: t('admin.categories.slugTypeFaq') },
  { value: 'GDC', label: t('admin.categories.slugTypeGdc') },
]

const slugOptions = computed<SlugOption[]>(() => {
  const fromCategories = (categories.value || [])
    .map((c: any) => (c.slug || '').toString().toUpperCase())
    .filter(Boolean)
  const merged = new Map<string, SlugOption>()
  for (const opt of knownSlugs()) merged.set(opt.value, opt)
  for (const slug of fromCategories) {
    if (!merged.has(slug)) merged.set(slug, { value: slug, label: slug })
  }
  return Array.from(merged.values()).sort((a, b) => a.value.localeCompare(b.value))
})

const slugSelected = ref<SlugOption | null>(null)

watch(slugSelected, (val) => {
  form.slug = val?.value || ''
})

const addSlugTag = (newSlug: string) => {
  const value = (newSlug || '').toString().trim().toUpperCase()
  if (!value) return
  slugSelected.value = { value, label: value }
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    '0': t('admin.categories.archived'),
    '1': t('admin.categories.statusActive'),
    '2': t('admin.categories.statusInactive'),
  }
  return labels[status] || status
}

const fetchCategories = async (page?: number, limit?: number) => {
  await psStore.fetchCategories({
    page: page ?? psStore.categoriesMeta.currentPage,
    limit: limit ?? psStore.categoriesMeta.perPage,
    slug: filterSlug.value || undefined,
  })
}

onMounted(async () => {
  await fetchCategories(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
    modalRef.value?.addEventListener('shown.bs.modal', () => {
      modalOpen.value = true
    })
    modalRef.value?.addEventListener('hidden.bs.modal', () => {
      modalOpen.value = false
    })
  }
})

const syncSlugSelected = (slug: string) => {
  if (!slug) {
    slugSelected.value = null
    return
  }
  const value = slug.toUpperCase()
  slugSelected.value =
    slugOptions.value.find(o => o.value === value) || { value, label: value }
}

const openModal = (cat?: any) => {
  if (cat) {
    editingCategory.value = cat
    form.label_fr = cat.label_fr || cat.label || ''
    form.label_en = cat.label_en || ''
    form.label_zh = cat.label_zh || ''
    form.slug = cat.slug
    form.code = cat.code || ''
    form.description_fr = cat.description_fr || cat.description || ''
    form.description_en = cat.description_en || ''
    form.description_zh = cat.description_zh || ''
    form.icon = cat.icon || ''
    form.sort_order = cat.sort_order || 0
    form.status = cat.status
    form.parent_uuid = cat.parent?.uuid || null
  } else {
    editingCategory.value = null
    form.label_fr = ''
    form.label_en = ''
    form.label_zh = ''
    form.slug = ''
    form.code = ''
    form.description_fr = ''
    form.description_en = ''
    form.description_zh = ''
    form.icon = ''
    form.sort_order = 0
    form.status = '1'
    form.parent_uuid = null
  }
  syncSlugSelected(form.slug)
  modalInstance?.show()
}

const saveCategory = async () => {
  if (!form.slug) {
    error(t('admin.categories.slugRequired'))
    return
  }
  if (!form.label_fr?.trim()) {
    error(t('admin.categories.labelFrRequired'))
    return
  }
  const data = {
    label_fr: form.label_fr.trim(),
    label_en: form.label_en?.trim() || null,
    label_zh: form.label_zh?.trim() || null,
    slug: form.slug,
    code: form.code || null,
    description_fr: form.description_fr || null,
    description_en: form.description_en || null,
    description_zh: form.description_zh || null,
    icon: form.icon || null,
    sort_order: form.sort_order,
    status: form.status,
    parent_uuid: form.parent_uuid
  }

  saving.value = true
  try {
    if (editingCategory.value) {
      await psStore.updateCategory(editingCategory.value.uuid, data)
      success(t('admin.categories.updated'))
    } else {
      await psStore.addCategory(data)
      success(t('admin.categories.created'))
    }
    modalInstance?.hide()
  } catch (err: any) {
    error(err.message)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (uuid: string) => {
  if (await useSwal().confirmDelete(t('admin.confirm.deleteCategory'))) {
    await psStore.deleteCategory(uuid)
    success(t('admin.categories.deleted'))
  }
}
</script>

<style>
/* Restaure la bordure du multiselect dans la modale (le style global le retire) */
#categoryModal .multiselect__tags {
  padding: 8px 40px 0 8px !important;
  border: 1px solid #ced4da !important;
  border-radius: 0.375rem !important;
  min-height: 38px;
}
#categoryModal .multiselect__select {
  height: 38px !important;
}
#categoryModal .multiselect__placeholder {
  margin-bottom: 8px;
  padding-top: 0;
}
#categoryModal .multiselect__single {
  margin-bottom: 8px;
  padding-left: 0;
}
#categoryModal .multiselect__input {
  margin-bottom: 8px;
  padding-left: 0;
}
</style>
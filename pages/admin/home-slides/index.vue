<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.homeSlides.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.homeSlides.subtitle', { n: rows.length }) }}</p>
      </div>
      <button v-can="['create', 'home-slides']" type="button" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.homeSlides.newSlide') }}
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.homeSlides.colImage') }}</th>
                <th>{{ t('admin.homeSlides.colTitleFr') }}</th>
                <th class="text-center">{{ t('admin.homeSlides.colOrder') }}</th>
                <th class="text-center">{{ t('admin.homeSlides.colActive') }}</th>
                <th>{{ t('admin.homeSlides.colActions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rows.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">{{ t('admin.homeSlides.noSlides') }}</td>
              </tr>
              <tr v-for="row in rows" :key="row.id">
                <td>
                  <img
                    :src="resolveStorageAssetUrl(row.image_path) || 'https://placehold.co/120x60?text=?'"
                    class="rounded border"
                    width="120"
                    height="60"
                    style="object-fit: cover;"
                    alt=""
                  />
                </td>
                <td>{{ row.title_fr || '—' }}</td>
                <td class="text-center">{{ row.display_order }}</td>
                <td class="text-center">
                  <span class="badge" :class="row.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ row.is_active ? t('admin.common.yes') : t('admin.common.no') }}
                  </span>
                </td>
                <td>
                  <button v-can="['update', 'home-slides']" type="button" class="btn btn-outline-primary btn-sm me-2" @click="openModal(row)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'home-slides']"
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="deletingId === row.id"
                    @click="remove(row)"
                  >
                    <span v-if="deletingId === row.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="homeSlideModal" class="modal fade" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? t('admin.homeSlides.modalEdit') : t('admin.homeSlides.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body" style="max-height: 65vh; overflow-y: auto;">
              <!-- Image -->
              <div class="mb-3">
                <label class="form-label fw-semibold">{{ t('admin.homeSlides.imageLabel') }}</label>
                <div class="d-flex align-items-center gap-3">
                  <img
                    v-if="form.image_path"
                    :src="resolveStorageAssetUrl(form.image_path)"
                    class="rounded border"
                    width="180"
                    height="90"
                    style="object-fit: cover;"
                    alt=""
                  />
                  <div class="flex-grow-1">
                    <input type="file" accept="image/*" class="form-control" :disabled="uploading" @change="onImageSelected" />
                    <small v-if="uploading" class="text-muted">{{ t('admin.homeSlides.uploading') }}</small>
                    <small v-else-if="form.image_path" class="text-muted text-truncate d-block">{{ form.image_path }}</small>
                  </div>
                  <button v-if="form.image_path" type="button" class="btn btn-outline-danger btn-sm" @click="form.image_path = ''">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-8">
                  <label class="form-label">{{ t('admin.homeSlides.ctaUrl') }}</label>
                  <input v-model="form.cta_url" type="text" class="form-control" :placeholder="t('admin.homeSlides.ctaUrlPlaceholder')" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">{{ t('admin.homeSlides.order') }}</label>
                  <input v-model.number="form.display_order" type="number" min="0" class="form-control" />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <div class="form-check">
                    <input id="slide-active" v-model="form.is_active" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="slide-active">{{ t('admin.homeSlides.active') }}</label>
                  </div>
                </div>
              </div>

              <ul class="nav nav-tabs mb-3">
                <li class="nav-item"><button type="button" class="nav-link" :class="{ active: activeLang === 'fr' }" @click="activeLang = 'fr'">{{ t('admin.common.french') }}</button></li>
                <li class="nav-item"><button type="button" class="nav-link" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">{{ t('admin.common.english') }}</button></li>
                <li class="nav-item"><button type="button" class="nav-link" :class="{ active: activeLang === 'zh' }" @click="activeLang = 'zh'">{{ t('admin.common.chinese') }}</button></li>
              </ul>

              <div class="tab-content">
                <div v-show="activeLang === 'fr'">
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.titleFr') }}</label><input v-model="form.title_fr" type="text" class="form-control" /></div>
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.subtitleFr') }}</label><textarea v-model="form.subtitle_fr" rows="2" class="form-control"></textarea></div>
                  <div class="mb-2"><label class="form-label">{{ t('admin.homeSlides.ctaLabelFr') }}</label><input v-model="form.cta_label_fr" type="text" class="form-control" :placeholder="t('admin.homeSlides.ctaLabelFrPlaceholder')" /></div>
                </div>
                <div v-show="activeLang === 'en'">
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.titleEn') }}</label><input v-model="form.title_en" type="text" class="form-control" /></div>
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.subtitleEn') }}</label><textarea v-model="form.subtitle_en" rows="2" class="form-control"></textarea></div>
                  <div class="mb-2"><label class="form-label">{{ t('admin.homeSlides.ctaLabelEn') }}</label><input v-model="form.cta_label_en" type="text" class="form-control" :placeholder="t('admin.homeSlides.ctaLabelEnPlaceholder')" /></div>
                </div>
                <div v-show="activeLang === 'zh'">
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.titleZh') }}</label><input v-model="form.title_zh" type="text" class="form-control" /></div>
                  <div class="mb-3"><label class="form-label">{{ t('admin.homeSlides.subtitleZh') }}</label><textarea v-model="form.subtitle_zh" rows="2" class="form-control"></textarea></div>
                  <div class="mb-2"><label class="form-label">{{ t('admin.homeSlides.ctaLabelZh') }}</label><input v-model="form.cta_label_zh" type="text" class="form-control" :placeholder="t('admin.homeSlides.ctaLabelZhPlaceholder')" /></div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving || uploading">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ saving ? t('admin.common.savingEllipsis') : t('admin.common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useHomeSlidesStore, type HomeSlideRow } from '~/stores/homeSlides'
import { useNotification } from '~/composables/useNotification'
import { resolveStorageAssetUrl } from '~/composables/useStorageAssetUrl'
import { getToken } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })

const { t } = useI18n()
const store = useHomeSlidesStore()
const { success, error } = useNotification()
const config = useRuntimeConfig()

const rows = computed(() =>
  [...store.adminItems].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
)

const editing = ref<HomeSlideRow | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const uploading = ref(false)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const activeLang = ref<'fr' | 'en' | 'zh'>('fr')
let modalInstance: any = null

const emptyForm = () => ({
  image_path: '',
  title_fr: '', title_en: '', title_zh: '',
  subtitle_fr: '', subtitle_en: '', subtitle_zh: '',
  cta_label_fr: '', cta_label_en: '', cta_label_zh: '',
  cta_url: '',
  display_order: 0,
  is_active: true
})

const form = reactive(emptyForm())

onMounted(async () => {
  await store.fetchAdmin()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const onImageSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('folder', 'home-slides')
    const token = getToken()
    const res = await fetch((config.public.apiBase as string).replace(/\/$/, '') + '/upload/image', {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd
    })
    const json = await res.json()
    if ((json?.success || json?.status === 'success') && (json.data?.path || json.data?.url)) {
      form.image_path = json.data.path || json.data.url
      success(t('admin.homeSlides.imageUploaded'))
    } else {
      throw new Error(json?.message || t('admin.messages.uploadError'))
    }
  } catch (err: any) {
    error(err?.message || t('admin.messages.uploadError'))
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

const openModal = (row?: HomeSlideRow) => {
  activeLang.value = 'fr'
  if (row) {
    editing.value = row
    Object.assign(form, {
      image_path: row.image_path || '',
      title_fr: row.title_fr || '', title_en: row.title_en || '', title_zh: row.title_zh || '',
      subtitle_fr: row.subtitle_fr || '', subtitle_en: row.subtitle_en || '', subtitle_zh: row.subtitle_zh || '',
      cta_label_fr: row.cta_label_fr || '', cta_label_en: row.cta_label_en || '', cta_label_zh: row.cta_label_zh || '',
      cta_url: row.cta_url || '',
      display_order: row.display_order ?? 0,
      is_active: !!row.is_active
    })
  } else {
    editing.value = null
    Object.assign(form, emptyForm())
    form.display_order = (store.adminItems.reduce((m, r) => Math.max(m, r.display_order ?? 0), 0) || 0) + 10
  }
  modalInstance?.show()
}

const save = async () => {
  if (saving.value) return
  if (!form.image_path) {
    error(t('admin.homeSlides.imageRequired'))
    return
  }
  saving.value = true
  const payload = { ...form }
  try {
    if (editing.value) {
      await store.update(editing.value.id, payload)
      success(t('admin.homeSlides.slideUpdated'))
    } else {
      await store.create(payload)
      success(t('admin.homeSlides.slideCreated'))
    }
    modalInstance?.hide()
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || t('admin.messages.saveError'))
  } finally {
    saving.value = false
  }
}

const remove = async (row: HomeSlideRow) => {
  if (deletingId.value) return
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteSlide'))) return
  deletingId.value = row.id
  try {
    await store.remove(row.id)
    success(t('admin.homeSlides.slideDeleted'))
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || t('admin.messages.deleteError'))
  } finally {
    deletingId.value = null
  }
}
</script>

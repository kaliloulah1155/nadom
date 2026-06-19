<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Services d'accompagnement (page Guides)</h4>
        <p class="text-muted mb-0">{{ rows.length }} carte(s) — contenu multilingue FR / EN (éditeur riche)</p>
      </div>
      <button v-can="['create', 'guide-accompaniment-services']" type="button" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle carte
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Slug</th>
                <th>Titre (FR)</th>
                <th class="text-center">Ordre</th>
                <th class="text-center">Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rows.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  Aucun service — importez les données ou créez une carte.
                </td>
              </tr>
              <tr v-for="row in rows" :key="row.id">
                <td><code>{{ row.slug }}</code></td>
                <td>{{ row.title_fr || '—' }}</td>
                <td class="text-center">{{ row.display_order }}</td>
                <td class="text-center">
                  <span class="badge" :class="row.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ row.is_active ? 'Oui' : 'Non' }}
                  </span>
                </td>
                <td>
                  <button
                    v-can="['update', 'guide-accompaniment-services']"
                    type="button"
                    class="btn btn-outline-primary btn-sm me-2"
                    :title="t('admin.common.edit')"
                    @click="openModal(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'guide-accompaniment-services']"
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    :title="t('admin.common.delete')"
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

    <div id="gasAccompModal" class="modal fade" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Modifier la carte' : 'Nouvelle carte' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label">Slug * <small class="text-muted">(unique, non modifiable après création)</small></label>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="form-control"
                    placeholder="visit-marches"
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    :disabled="!!editing"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Icône Bootstrap</label>
                  <input v-model="form.icon" type="text" class="form-control" placeholder="bi bi-shop" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Ordre</label>
                  <input v-model.number="form.display_order" type="number" min="0" class="form-control" />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <div class="form-check">
                    <input id="gas-active" v-model="form.is_active" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="gas-active">Actif</label>
                  </div>
                </div>
              </div>

              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#gas-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#gas-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#gas-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div id="gas-fr" class="tab-pane fade show active">
                  <div class="mb-3">
                    <label class="form-label">Titre (FR)</label>
                    <input v-model="form.title_fr" type="text" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (FR)</label>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.description_fr" height="140px" />
                    </ClientOnly>
                  </div>
                </div>
                <div id="gas-en" class="tab-pane fade">
                  <div class="mb-3">
                    <label class="form-label">Title (EN)</label>
                    <input v-model="form.title_en" type="text" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (EN)</label>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.description_en" height="140px" />
                    </ClientOnly>
                  </div>
                </div>
                <div id="gas-zh" class="tab-pane fade">
                  <div class="mb-3">
                    <label class="form-label">标题 (中文)</label>
                    <input v-model="form.title_zh" type="text" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">描述 (中文)</label>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.description_zh" height="140px" />
                    </ClientOnly>
                  </div>
                </div>
              </div>

              <div class="border rounded p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-semibold mb-0">Points clés (liste à puces sur le site)</label>
                  <button type="button" class="btn btn-sm btn-outline-primary" @click="addFeatureRow">
                    <i class="bi bi-plus-lg"></i> Ligne
                  </button>
                </div>
                <p class="small text-muted mb-3">Une ligne = FR / EN / 中文 (éditeur riche).</p>
                <div v-for="(_, idx) in form.features_fr" :key="'feat-' + idx" class="row g-2 mb-3 align-items-start border-bottom pb-3">
                  <div class="col-md-4">
                    <span class="small text-muted">FR {{ idx + 1 }}</span>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.features_fr[idx]!" height="100px" />
                    </ClientOnly>
                  </div>
                  <div class="col-md-4">
                    <span class="small text-muted">EN {{ idx + 1 }}</span>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.features_en[idx]!" height="100px" />
                    </ClientOnly>
                  </div>
                  <div class="col-md-3">
                    <span class="small text-muted">中文 {{ idx + 1 }}</span>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.features_zh[idx]!" height="100px" />
                    </ClientOnly>
                  </div>
                  <div class="col-md-1 d-flex justify-content-end pt-4">
                    <button type="button" class="btn btn-outline-danger btn-sm" title="Supprimer la ligne" @click="removeFeatureRow(idx)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('admin.common.save') }}
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

import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import {
  useGuideAccompanimentServicesStore,
  type GuideAccompanimentServiceRow
} from '~/stores/guideAccompanimentServices'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const store = useGuideAccompanimentServicesStore()
const { success, error } = useNotification()

const rows = computed(() =>
  [...store.adminItems].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.slug).localeCompare(String(b.slug)))
)

const editing = ref<GuideAccompanimentServiceRow | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)

function getBsModal(): any {
  if (typeof window === 'undefined') return null
  const Bootstrap = (window as any).bootstrap
  const el = modalRef.value as HTMLElement | null
  if (!Bootstrap?.Modal || !el) return null
  try {
    return Bootstrap.Modal.getOrCreateInstance?.(el) ?? Bootstrap.Modal.getInstance?.(el) ?? new Bootstrap.Modal(el)
  } catch {
    return new Bootstrap.Modal(el)
  }
}

const emptyForm = () => ({
  slug: '',
  icon: 'bi-grid',
  title_fr: '',
  title_en: '',
  title_zh: '',
  description_fr: '',
  description_en: '',
  description_zh: '',
  features_fr: [''],
  features_en: [''],
  features_zh: [''],
  display_order: 0,
  is_active: true
})

const form = reactive(emptyForm())

const stripInnerText = (html: string) =>
  String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeFeatureArrays = () => {
  const n = Math.max(form.features_fr.length, form.features_en.length, form.features_zh.length, 1)
  while (form.features_fr.length < n) form.features_fr.push('')
  while (form.features_en.length < n) form.features_en.push('')
  while (form.features_zh.length < n) form.features_zh.push('')
}

const packFeatures = () => {
  const fr: string[] = []
  const en: string[] = []
  const zh: string[] = []
  const len = Math.max(form.features_fr.length, form.features_en.length, form.features_zh.length)
  for (let i = 0; i < len; i++) {
    const a = form.features_fr[i] ?? ''
    const b = form.features_en[i] ?? ''
    const c = form.features_zh[i] ?? ''
    if (!stripInnerText(a) && !stripInnerText(b) && !stripInnerText(c)) continue
    fr.push(a)
    en.push(b)
    zh.push(c)
  }
  return { features_fr: fr, features_en: en, features_zh: zh }
}

onMounted(async () => {
  await store.fetchAdmin()
  await nextTick()
  getBsModal()
})

const openModal = async (row?: GuideAccompanimentServiceRow) => {
  if (row) {
    editing.value = row
    form.slug = row.slug
    form.icon = row.icon || ''
    form.title_fr = row.title_fr || ''
    form.title_en = row.title_en || ''
    form.title_zh = row.title_zh || ''
    form.description_fr = row.description_fr || ''
    form.description_en = row.description_en || ''
    form.description_zh = row.description_zh || ''
    form.features_fr = Array.isArray(row.features_fr) && row.features_fr.length ? [...row.features_fr] : ['']
    form.features_en = Array.isArray(row.features_en) && row.features_en.length ? [...row.features_en] : ['']
    form.features_zh = Array.isArray(row.features_zh) && row.features_zh.length ? [...row.features_zh] : ['']
    normalizeFeatureArrays()
    form.display_order = row.display_order ?? 0
    form.is_active = !!row.is_active
  } else {
    editing.value = null
    Object.assign(form, emptyForm())
    form.display_order = (store.adminItems.reduce((m, r) => Math.max(m, r.display_order ?? 0), 0) || 0) + 10
    normalizeFeatureArrays()
  }
  await nextTick()
  getBsModal()?.show()
}

const addFeatureRow = () => {
  form.features_fr.push('')
  form.features_en.push('')
  form.features_zh.push('')
}

const removeFeatureRow = (idx: number) => {
  form.features_fr.splice(idx, 1)
  form.features_en.splice(idx, 1)
  form.features_zh.splice(idx, 1)
  if (form.features_fr.length === 0) {
    form.features_fr.push('')
    form.features_en.push('')
    form.features_zh.push('')
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  const { features_fr, features_en, features_zh } = packFeatures()
  try {
    if (editing.value) {
      await store.update(editing.value.id, {
        icon: form.icon || null,
        title_fr: form.title_fr || null,
        title_en: form.title_en || null,
        title_zh: form.title_zh || null,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        description_zh: form.description_zh || null,
        features_fr,
        features_en,
        features_zh,
        display_order: form.display_order,
        is_active: form.is_active
      })
      success(t('admin.homeServices.updated'))
    } else {
      await store.create({
        slug: form.slug.trim(),
        icon: form.icon || null,
        title_fr: form.title_fr || null,
        title_en: form.title_en || null,
        title_zh: form.title_zh || null,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        description_zh: form.description_zh || null,
        features_fr,
        features_en,
        features_zh,
        display_order: form.display_order,
        is_active: form.is_active
      })
      success(t('admin.homeServices.created'))
    }
    getBsModal()?.hide()
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || "Erreur lors de l'enregistrement")
  } finally {
    saving.value = false
  }
}

const remove = async (row: GuideAccompanimentServiceRow) => {
  if (deletingId.value) return
  if (!await useSwal().confirmDelete(`Supprimer la carte « ${row.slug} » ?`)) return
  deletingId.value = row.id
  try {
    await store.remove(row.id)
    success(t('admin.homeServices.deleted'))
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || 'Erreur suppression')
  } finally {
    deletingId.value = null
  }
}
</script>

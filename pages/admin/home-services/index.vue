<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Services (page d'accueil)</h4>
        <p class="text-muted mb-0">{{ rows.length }} carte(s) — contenu multilingue FR / EN (éditeur riche)</p>
      </div>
      <button v-can="['create', 'home-services']" type="button" class="btn btn-primary" @click="openModal()">
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
                    v-can="['update', 'home-services']"
                    type="button"
                    class="btn btn-outline-primary btn-sm me-2"
                    title="Modifier"
                    @click="openModal(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'home-services']"
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    title="Supprimer"
                    @click="remove(row)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="homeServiceModal" class="modal fade" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Modifier la carte' : 'Nouvelle carte' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body">
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label">Slug * <small class="text-muted">(unique, non modifiable après création)</small></label>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="form-control"
                    placeholder="personal-shopping"
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    :disabled="!!editing"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Icône Bootstrap</label>
                  <input v-model="form.icon" type="text" class="form-control" placeholder="bi-bag-check" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Ordre</label>
                  <input v-model.number="form.display_order" type="number" min="0" class="form-control" />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <div class="form-check">
                    <input id="hs-active" v-model="form.is_active" class="form-check-input" type="checkbox" />
                    <label class="form-check-label" for="hs-active">Actif</label>
                  </div>
                </div>
              </div>

              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#hs-fr">Français</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#hs-en">English</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div id="hs-fr" class="tab-pane fade show active">
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
                <div id="hs-en" class="tab-pane fade">
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
              </div>

              <div class="border rounded p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-semibold mb-0">Points clés (liste à puces sur le site)</label>
                  <button type="button" class="btn btn-sm btn-outline-primary" @click="addFeatureRow">
                    <i class="bi bi-plus-lg"></i> Ligne
                  </button>
                </div>
                <p class="small text-muted mb-3">Une ligne = une puce FR à gauche et EN à droite (éditeur riche).</p>
                <div v-for="(_, idx) in form.features_fr" :key="'feat-' + idx" class="row g-2 mb-3 align-items-start border-bottom pb-3">
                  <div class="col-md-6">
                    <span class="small text-muted">FR {{ idx + 1 }}</span>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.features_fr[idx]!" height="100px" />
                    </ClientOnly>
                  </div>
                  <div class="col-md-5">
                    <span class="small text-muted">EN {{ idx + 1 }}</span>
                    <ClientOnly>
                      <WysiwygEditor v-model="form.features_en[idx]!" height="100px" />
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
import { computed, reactive, ref, onMounted } from 'vue'
import { useHomeServicesStore, type HomeServiceRow } from '~/stores/homeServices'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const store = useHomeServicesStore()
const { success, error } = useNotification()

const rows = computed(() =>
  [...store.adminItems].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.slug).localeCompare(String(b.slug)))
)

const editing = ref<HomeServiceRow | null>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const emptyForm = () => ({
  slug: '',
  icon: 'bi-grid',
  title_fr: '',
  title_en: '',
  description_fr: '',
  description_en: '',
  features_fr: [''],
  features_en: [''],
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
  const n = Math.max(form.features_fr.length, form.features_en.length, 1)
  while (form.features_fr.length < n) form.features_fr.push('')
  while (form.features_en.length < n) form.features_en.push('')
}

const packFeatures = () => {
  const fr: string[] = []
  const en: string[] = []
  const len = Math.max(form.features_fr.length, form.features_en.length)
  for (let i = 0; i < len; i++) {
    const a = form.features_fr[i] ?? ''
    const b = form.features_en[i] ?? ''
    if (!stripInnerText(a) && !stripInnerText(b)) continue
    fr.push(a)
    en.push(b)
  }
  return { features_fr: fr, features_en: en }
}

onMounted(async () => {
  await store.fetchAdmin()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (row?: HomeServiceRow) => {
  if (row) {
    editing.value = row
    form.slug = row.slug
    form.icon = row.icon || ''
    form.title_fr = row.title_fr || ''
    form.title_en = row.title_en || ''
    form.description_fr = row.description_fr || ''
    form.description_en = row.description_en || ''
    form.features_fr = Array.isArray(row.features_fr) && row.features_fr.length ? [...row.features_fr] : ['']
    form.features_en = Array.isArray(row.features_en) && row.features_en.length ? [...row.features_en] : ['']
    normalizeFeatureArrays()
    form.display_order = row.display_order ?? 0
    form.is_active = !!row.is_active
  } else {
    editing.value = null
    Object.assign(form, emptyForm())
    form.display_order = (store.adminItems.reduce((m, r) => Math.max(m, r.display_order ?? 0), 0) || 0) + 10
    normalizeFeatureArrays()
  }
  modalInstance?.show()
}

const addFeatureRow = () => {
  form.features_fr.push('')
  form.features_en.push('')
}

const removeFeatureRow = (idx: number) => {
  form.features_fr.splice(idx, 1)
  form.features_en.splice(idx, 1)
  if (form.features_fr.length === 0) {
    form.features_fr.push('')
    form.features_en.push('')
  }
}

const save = async () => {
  const { features_fr, features_en } = packFeatures()
  try {
    if (editing.value) {
      await store.update(editing.value.id, {
        icon: form.icon || null,
        title_fr: form.title_fr || null,
        title_en: form.title_en || null,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        features_fr,
        features_en,
        display_order: form.display_order,
        is_active: form.is_active
      })
      success('Carte mise à jour')
    } else {
      await store.create({
        slug: form.slug.trim(),
        icon: form.icon || null,
        title_fr: form.title_fr || null,
        title_en: form.title_en || null,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        features_fr,
        features_en,
        display_order: form.display_order,
        is_active: form.is_active
      })
      success('Carte créée')
    }
    modalInstance?.hide()
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || "Erreur lors de l'enregistrement")
  }
}

const remove = async (row: HomeServiceRow) => {
  if (!confirm(`Supprimer la carte « ${row.slug} » ?`)) return
  try {
    await store.remove(row.id)
    success('Carte supprimée')
    await store.fetchAdmin()
  } catch (e: any) {
    error(e?.message || 'Erreur suppression')
  }
}
</script>

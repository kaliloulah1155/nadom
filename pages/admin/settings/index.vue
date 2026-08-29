<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.settings.title') }}</h4>
        <p class="text-muted mb-0">{{ items.length }} paramètres configurés</p>
      </div>
      <div class="d-flex gap-2">
        <button v-can="['update', 'global-settings']" class="btn btn-outline-primary" @click="openMarqueeEditor">
          <i class="bi bi-megaphone me-2"></i>{{ t('admin.settings.editMarquee') }}
        </button>
        <button v-can="['create', 'global-settings']" class="btn btn-primary" @click="openModal()">
          <i class="bi bi-plus-lg me-2"></i>Nouveau paramètre
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 border-start border-primary border-4">
          <div class="card-body">
            <small class="text-muted d-block">Total paramètres</small>
            <h3 class="fw-bold mb-0">{{ items.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 border-start border-success border-4">
          <div class="card-body">
            <small class="text-muted d-block">Actifs</small>
            <h3 class="fw-bold mb-0 text-success">{{ activeCount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 border-start border-warning border-4">
          <div class="card-body">
            <small class="text-muted d-block">Marquee</small>
            <h6 class="fw-bold mb-0 text-truncate" :title="marqueeText">{{ marqueeText || '—' }}</h6>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 border-start border-info border-4">
          <div class="card-body">
            <small class="text-muted d-block">Inactifs</small>
            <h3 class="fw-bold mb-0 text-muted">{{ items.length - activeCount }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="settingsStore.loading && items.length === 0" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3 mb-0">{{ t('admin.common.loading') }}</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Clé</th>
                <th>Slug</th>
                <th>Valeur</th>
                <th>Description</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-gear fs-1 d-block mb-2"></i>
                  Aucun paramètre configuré
                </td>
              </tr>
              <tr v-for="s in items" :key="s.uuid">
                <td><code class="small">{{ s.kkey }}</code></td>
                <td><span class="badge bg-secondary-subtle text-secondary">{{ s.slug }}</span></td>
                <td class="text-truncate" style="max-width: 280px;" :title="s.vvalue">{{ s.vvalue }}</td>
                <td class="text-muted small text-truncate" style="max-width: 200px;" :title="s.description || ''">{{ s.description || '—' }}</td>
                <td>
                  <span :class="['badge', Number(s.status) === 1 ? 'bg-success' : 'bg-secondary']">
                    {{ Number(s.status) === 1 ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="d-flex gap-1 justify-content-end">
                    <button v-can="['update', 'global-settings']" class="btn btn-sm btn-outline-primary" @click="openModal(s)" :title="t('admin.common.edit')">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button v-can="['delete', 'global-settings']" class="btn btn-sm btn-outline-danger" @click="confirmDelete(s)" :title="t('admin.common.delete')">
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

    <!-- Edit Modal -->
    <div class="modal fade" id="settingModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Modifier' : 'Nouveau' }} paramètre</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Clé (kkey) *</label>
                  <input
                    v-model="form.kkey"
                    type="text"
                    class="form-control"
                    placeholder="HOME_MARQUEE"
                    required
                    :disabled="!!editing"
                  />
                  <small v-if="editing" class="text-muted">Clé non modifiable</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Slug *</label>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="form-control"
                    placeholder="home_marquee"
                    required
                    :disabled="marqueeSlugLocked"
                  />
                  <small v-if="marqueeSlugLocked" class="text-muted">Slug non modifiable (référence du marquee sur l'accueil)</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Valeur (vvalue) *</label>
                  <WysiwygEditor
                    v-model="form.vvalue"
                    height="160px"
                    placeholder="Saisissez la valeur (emojis OK : 🎉 ✨ 🚀)"
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <WysiwygEditor
                    v-model="form.description"
                    height="120px"
                    placeholder="À quoi sert ce paramètre ?"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Statut</label>
                  <select v-model.number="form.status" class="form-select">
                    <option :value="1">Actif</option>
                    <option :value="0">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Enregistrer
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

import { ref, reactive, computed, onMounted } from 'vue'
import { useGlobalSettingsStore } from '~/stores/globalSettings'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const settingsStore = useGlobalSettingsStore()
const { success, error: notifyError } = useNotification()

const items = computed(() => settingsStore.items)
const activeCount = computed(() => items.value.filter(i => Number(i.status) === 1).length)
const marqueeText = computed(() => settingsStore.getValue('home_marquee', ''))

/** Slug technique fixe pour le marquee — aligné sur la page d'accueil (`getValue('home_marquee')`). */
const marqueeSlugLocked = computed(() => {
  if (form.slug === 'home_marquee') return true
  if (editing.value && form.kkey === 'HOME_MARQUEE') return true
  return false
})

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const editing = ref<any>(null)
const saving = ref(false)

const form = reactive({
  kkey: '',
  vvalue: '',
  slug: '',
  description: '',
  status: 1,
})

const resetForm = () => {
  form.kkey = ''
  form.vvalue = ''
  form.slug = ''
  form.description = ''
  form.status = 1
}

const openModal = (s?: any) => {
  if (s) {
    editing.value = s
    form.kkey = s.kkey || ''
    form.vvalue = s.vvalue || ''
    form.slug = s.slug || ''
    form.description = s.description || ''
    form.status = Number(s.status) || 0
  } else {
    editing.value = null
    resetForm()
  }
  modalInstance?.show()
}

const openMarqueeEditor = () => {
  const existing = items.value.find(i => i.slug === 'home_marquee' || i.kkey === 'HOME_MARQUEE')
  if (existing) {
    openModal(existing)
  } else {
    editing.value = null
    resetForm()
    form.kkey = 'HOME_MARQUEE'
    form.slug = 'home_marquee'
    form.description = "Texte défilant affiché sur la page d'accueil"
    modalInstance?.show()
  }
}

const save = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await settingsStore.update(editing.value.uuid, {
        vvalue: form.vvalue,
        slug: form.slug,
        description: form.description,
        status: form.status,
      } as any)
      success('Paramètre mis à jour')
    } else {
      await settingsStore.create({
        kkey: form.kkey,
        vvalue: form.vvalue,
        slug: form.slug,
        description: form.description,
        status: form.status,
      } as any)
      success('Paramètre créé')
    }
    modalInstance?.hide()
    await settingsStore.fetchAll()
  } catch (err: any) {
    notifyError(err.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (s: any) => {
  if (!await useSwal().confirmDelete(`Supprimer le paramètre "${s.kkey}" ?`)) return
  try {
    await settingsStore.remove(s.uuid)
    success('Paramètre supprimé')
  } catch (err: any) {
    notifyError(err.message || 'Erreur lors de la suppression')
  }
}

onMounted(async () => {
  await settingsStore.fetchAll()
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})
</script>

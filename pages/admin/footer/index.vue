<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.footerAdmin.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.footerAdmin.subtitle') }}</p>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link"
          role="tab"
          :aria-selected="mainSection === 'pres'"
          :class="{ active: mainSection === 'pres' }"
          @click="mainSection = 'pres'"
        >
          {{ t('admin.footerAdmin.textUnderLogo') }}
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link"
          role="tab"
          :aria-selected="mainSection === 'social'"
          :class="{ active: mainSection === 'social' }"
          @click="mainSection = 'social'"
        >
          {{ t('admin.footerAdmin.socialNetworks') }}
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link"
          role="tab"
          :aria-selected="mainSection === 'contact'"
          :class="{ active: mainSection === 'contact' }"
          @click="mainSection = 'contact'"
        >
          {{ t('admin.footerAdmin.contactBlocks') }}
        </button>
      </li>
    </ul>

    <!-- Présentation -->
    <div v-show="mainSection === 'pres'" class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>{{ t('admin.footerAdmin.textUnderLogo') }}</strong>
        <button
          v-can="['update', 'site-footer']"
          type="button"
          class="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
          :disabled="savingSettings"
          @click="savePresentation"
        >
          <span
            v-if="savingSettings"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          {{ savingSettings ? t('admin.countries.saving') : t('admin.footerAdmin.saveText') }}
        </button>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap gap-2 mb-3" role="tablist">
          <button
            type="button"
            class="btn btn-sm"
            role="tab"
            :aria-selected="aboutLang === 'fr'"
            :class="aboutLang === 'fr' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="aboutLang = 'fr'"
          >
            Français
          </button>
          <button
            type="button"
            class="btn btn-sm"
            role="tab"
            :aria-selected="aboutLang === 'en'"
            :class="aboutLang === 'en' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="aboutLang = 'en'"
          >
            English
          </button>
          <button
            type="button"
            class="btn btn-sm"
            role="tab"
            :aria-selected="aboutLang === 'zh'"
            :class="aboutLang === 'zh' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="aboutLang = 'zh'"
          >
            {{ t('admin.common.chinese') }}
          </button>
        </div>
        <div v-show="aboutLang === 'fr'">
          <label class="form-label fw-semibold">{{ t('admin.common.french') }}</label>
          <ClientOnly>
            <WysiwygEditor v-model="aboutFr" height="120px" />
          </ClientOnly>
        </div>
        <div v-show="aboutLang === 'en'">
          <label class="form-label fw-semibold">{{ t('admin.common.english') }}</label>
          <ClientOnly>
            <WysiwygEditor v-model="aboutEn" height="120px" />
          </ClientOnly>
        </div>
        <div v-show="aboutLang === 'zh'">
          <label class="form-label fw-semibold">{{ t('admin.common.chinese') }}</label>
          <ClientOnly>
            <WysiwygEditor v-model="aboutZh" height="120px" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Réseaux -->
    <div v-show="mainSection === 'social'" class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>{{ t('admin.footerAdmin.socialNetworks') }}</strong>
        <button v-can="['create', 'site-footer']" type="button" class="btn btn-sm btn-outline-primary" @click="openSocial()">
          <i class="bi bi-plus-lg me-1"></i>Ajouter
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Icône</th>
                <th>Réseau</th>
                <th>URL</th>
                <th class="text-center">Ordre</th>
                <th class="text-center">Actif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="socialRows.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">{{ t('admin.footerAdmin.noSocialLinks') }}</td>
              </tr>
              <tr v-for="row in socialRows" :key="row.id">
                <td><i :class="row.icon_class"></i></td>
                <td>{{ row.label || row.platform_code }}</td>
                <td style="max-width: 260px;"><code class="small text-break">{{ row.url }}</code></td>
                <td class="text-center">{{ row.display_order }}</td>
                <td class="text-center">
                  <span class="badge" :class="row.is_active ? 'bg-success' : 'bg-secondary'">{{ row.is_active ? 'Oui' : 'Non' }}</span>
                </td>
                <td class="text-nowrap">
                  <button
                    v-can="['update', 'site-footer']"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1 d-inline-flex align-items-center justify-content-center"
                    style="min-width: 2.25rem"
                    :disabled="deletingSocialId === row.id"
                    @click="openSocial(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'site-footer']"
                    type="button"
                    class="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                    style="min-width: 2.25rem"
                    :disabled="deletingSocialId === row.id"
                    @click="delSocial(row)"
                  >
                    <span
                      v-if="deletingSocialId === row.id"
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div v-show="mainSection === 'contact'" class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>{{ t('admin.footerAdmin.contactBlocks') }}</strong>
        <button v-can="['create', 'site-footer']" type="button" class="btn btn-sm btn-outline-primary" @click="openContact()">
          <i class="bi bi-plus-lg me-1"></i>Ajouter
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Type</th>
                <th>Contenu (FR / EN / 中文)</th>
                <th class="text-center">Ordre</th>
                <th class="text-center">Actif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="contactRows.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">{{ t('admin.footerAdmin.noContactBlocks') }}</td>
              </tr>
              <tr v-for="row in contactRows" :key="row.id">
                <td>{{ kindLabel(row.kind) }}</td>
                <td>
                  <div class="small text-body-secondary mb-1">FR</div>
                  <div class="small text-break fr-en-cell">{{ row.body_fr || '—' }}</div>
                  <div class="small text-body-secondary mt-2 mb-1">EN</div>
                  <div class="small text-break fr-en-cell">{{ row.body_en || '—' }}</div>
                  <div class="small text-body-secondary mt-2 mb-1">中文</div>
                  <div class="small text-break fr-en-cell">{{ row.body_zh || '—' }}</div>
                </td>
                <td class="text-center">{{ row.display_order }}</td>
                <td class="text-center">
                  <span class="badge" :class="row.is_active ? 'bg-success' : 'bg-secondary'">{{ row.is_active ? 'Oui' : 'Non' }}</span>
                </td>
                <td class="text-nowrap">
                  <button
                    v-can="['update', 'site-footer']"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1 d-inline-flex align-items-center justify-content-center"
                    style="min-width: 2.25rem"
                    :disabled="deletingContactId === row.id"
                    @click="openContact(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'site-footer']"
                    type="button"
                    class="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                    style="min-width: 2.25rem"
                    :disabled="deletingContactId === row.id"
                    @click="delContact(row)"
                  >
                    <span
                      v-if="deletingContactId === row.id"
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal réseau -->
    <div id="footerSocialModal" ref="socModalEl" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ socEditing ? t('admin.footerAdmin.editSocial') : t('admin.footerAdmin.newSocialLink') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveSocial">
            <div class="modal-body">
              <div class="mb-3" v-if="!socEditing">
                <label class="form-label">Plateforme *</label>
                <select v-model="socForm.platform_code" class="form-select" required>
                  <option v-for="(meta, code) in platformOptions" :key="code" :value="code">
                    {{ meta.label }}
                  </option>
                </select>
              </div>
              <div class="mb-3" v-else>
                <label class="form-label">Plateforme</label>
                <input type="text" class="form-control" :value="platformOptions[socForm.platform_code]?.label || socForm.platform_code" disabled />
              </div>
              <div class="mb-3">
                <label class="form-label">URL *</label>
                <input v-model="socForm.url" type="url" class="form-control" placeholder="https://..." required />
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Ordre</label>
                  <input v-model.number="socForm.display_order" type="number" min="0" class="form-control" />
                </div>
                <div class="col-6 mb-3 d-flex align-items-end">
                  <div class="form-check">
                    <input id="socAct" v-model="socForm.is_active" type="checkbox" class="form-check-input" />
                    <label class="form-check-label" for="socAct">Actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="savingSocialSubmit">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary d-inline-flex align-items-center gap-2" :disabled="savingSocialSubmit">
                <span v-if="savingSocialSubmit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                {{ t('admin.common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal contact -->
    <div id="footerContactModal" ref="cntModalEl" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ cntEditing ? t('admin.footerAdmin.editContactBlock') : t('admin.footerAdmin.newContactBlock') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveContact">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Type *</label>
                <select v-model="cntForm.kind" class="form-select" :disabled="!!cntEditing">
                  <option value="address">Adresse(s)</option>
                  <option value="phone">Téléphone(s)</option>
                  <option value="email">E-mail(s)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Texte français</label>
                <textarea v-model="cntForm.body_fr" class="form-control" rows="4" placeholder="Une ligne ou plusieurs lignes"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Texte anglais</label>
                <textarea v-model="cntForm.body_en" class="form-control" rows="4"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">中文</label>
                <textarea v-model="cntForm.body_zh" class="form-control" rows="4"></textarea>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Ordre</label>
                  <input v-model.number="cntForm.display_order" type="number" min="0" class="form-control" />
                </div>
                <div class="col-6 mb-3 d-flex align-items-end">
                  <div class="form-check">
                    <input id="cntAct" v-model="cntForm.is_active" type="checkbox" class="form-check-input" />
                    <label class="form-check-label" for="cntAct">Actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="savingContactSubmit">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary d-inline-flex align-items-center gap-2" :disabled="savingContactSubmit">
                <span v-if="savingContactSubmit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
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
import { useSiteFooterStore, type FooterContactDto, type FooterPlatformsMap, type FooterSocialDto } from '~/stores/siteFooter'
import { useNotification } from '~/composables/useNotification'

definePageMeta({ layout: 'admin' })

const store = useSiteFooterStore()
const { success, error } = useNotification()

const socModalEl = ref<HTMLElement | null>(null)
const cntModalEl = ref<HTMLElement | null>(null)

function getModal(el: HTMLElement | null) {
  if (typeof window === 'undefined' || !el) return null
  const B = (window as any).bootstrap
  const Modal = B?.Modal
  if (!Modal) return null
  try {
    return typeof Modal.getOrCreateInstance === 'function' ? Modal.getOrCreateInstance(el) : Modal.getInstance(el) ?? new Modal(el)
  } catch {
    return new Modal(el)
  }
}

const aboutFr = ref('')
const aboutEn = ref('')
const aboutZh = ref('')
const savingSettings = ref(false)
const savingSocialSubmit = ref(false)
const savingContactSubmit = ref(false)
const deletingSocialId = ref<string | null>(null)
const deletingContactId = ref<string | null>(null)
/** Réduit le scroll : une section + une langue à la fois. */
const mainSection = ref<'pres' | 'social' | 'contact'>('pres')
const aboutLang = ref<'fr' | 'en' | 'zh'>('fr')

const socialRows = computed(() => {
  const list = [...(store.adminBundle?.socials ?? [])]
  list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  return list
})

const contactRows = computed(() => {
  const list = [...(store.adminBundle?.contacts ?? [])]
  list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  return list
})

const platformOptions = computed((): FooterPlatformsMap => store.adminBundle?.platforms ?? {})

function hydrateTexts() {
  const s = store.adminBundle?.settings
  aboutFr.value = s?.about_fr || ''
  aboutEn.value = s?.about_en || ''
  aboutZh.value = s?.about_zh || ''
}

async function reload() {
  await store.fetchAdminBundle()
  hydrateTexts()
}

onMounted(async () => {
  await reload()
  await nextTick()
  getModal(socModalEl.value)
  getModal(cntModalEl.value)
})

async function savePresentation() {
  savingSettings.value = true
  try {
    await store.saveSettings({
      about_fr: aboutFr.value || null,
      about_en: aboutEn.value || null,
      about_zh: aboutZh.value || null
    })
    hydrateTexts()
    success(t('admin.footerAdmin.presentationSaved'))
  } catch (e: any) {
    error(e?.message || t('admin.messages.genericError'))
  } finally {
    savingSettings.value = false
  }
}

const socEditing = ref<FooterSocialDto | null>(null)
const socForm = reactive({
  platform_code: 'facebook',
  url: '',
  display_order: 0,
  is_active: true
})

async function openSocial(row?: FooterSocialDto) {
  socEditing.value = row ?? null
  if (row) {
    socForm.platform_code = row.platform_code
    socForm.url = row.url
    socForm.display_order = row.display_order ?? 0
    socForm.is_active = !!row.is_active
  } else {
    const keys = Object.keys(platformOptions.value)
    socForm.platform_code = keys[0] ?? 'facebook'
    socForm.url = 'https://'
    socForm.display_order = Math.max(0, ...socialRows.value.map(r => Number(r.display_order || 0))) + 10
    socForm.is_active = true
  }
  await nextTick()
  getModal(socModalEl.value)?.show()
}

async function saveSocial() {
  savingSocialSubmit.value = true
  try {
    if (socEditing.value) {
      await store.updateSocial(socEditing.value.id, {
        url: socForm.url,
        display_order: socForm.display_order,
        is_active: socForm.is_active
      })
      success(t('admin.footerAdmin.linkUpdated'))
    } else {
      await store.createSocial({
        platform_code: socForm.platform_code,
        url: socForm.url,
        display_order: socForm.display_order,
        is_active: socForm.is_active
      })
      success(t('admin.footerAdmin.linkCreated'))
    }
    getModal(socModalEl.value)?.hide()
    hydrateTexts()
  } catch (e: any) {
    error(e?.message || t('admin.messages.genericError'))
  } finally {
    savingSocialSubmit.value = false
  }
}

async function delSocial(row: FooterSocialDto) {
  if (!confirm(t('admin.confirm.deleteSocialLink'))) return
  deletingSocialId.value = row.id
  try {
    await store.deleteSocial(row.id)
    success(t('admin.footerAdmin.linkDeleted'))
    hydrateTexts()
  } catch (e: any) {
    error(e?.message || t('admin.messages.genericError'))
  } finally {
    deletingSocialId.value = null
  }
}

const cntEditing = ref<FooterContactDto | null>(null)
const cntForm = reactive({
  kind: 'address' as 'address' | 'phone' | 'email',
  body_fr: '',
  body_en: '',
  body_zh: '',
  display_order: 0,
  is_active: true
})

function kindLabel(k: string) {
  if (k === 'address') return 'Adresse'
  if (k === 'phone') return 'Téléphone'
  if (k === 'email') return 'E-mail'
  return k
}

async function openContact(row?: FooterContactDto) {
  cntEditing.value = row ?? null
  if (row) {
    cntForm.kind = row.kind as typeof cntForm.kind
    cntForm.body_fr = row.body_fr || ''
    cntForm.body_en = row.body_en || ''
    cntForm.body_zh = row.body_zh || ''
    cntForm.display_order = row.display_order ?? 0
    cntForm.is_active = !!row.is_active
  } else {
    cntForm.kind = 'address'
    cntForm.body_fr = ''
    cntForm.body_en = ''
    cntForm.body_zh = ''
    cntForm.display_order = Math.max(0, ...contactRows.value.map(r => Number(r.display_order || 0))) + 10
    cntForm.is_active = true
  }
  await nextTick()
  getModal(cntModalEl.value)?.show()
}

async function saveContact() {
  savingContactSubmit.value = true
  try {
    const payload = {
      kind: cntForm.kind,
      body_fr: cntForm.body_fr || null,
      body_en: cntForm.body_en || null,
      body_zh: cntForm.body_zh || null,
      display_order: cntForm.display_order,
      is_active: cntForm.is_active
    }
    if (cntEditing.value) {
      await store.updateContact(cntEditing.value.id, payload)
      success(t('admin.footerAdmin.blockUpdated'))
    } else {
      await store.createContact(payload)
      success(t('admin.footerAdmin.blockCreated'))
    }
    getModal(cntModalEl.value)?.hide()
    hydrateTexts()
  } catch (e: any) {
    error(e?.message || t('admin.messages.genericError'))
  } finally {
    savingContactSubmit.value = false
  }
}

async function delContact(row: FooterContactDto) {
  if (!confirm(t('admin.confirm.deleteContactBlock'))) return
  deletingContactId.value = row.id
  try {
    await store.deleteContact(row.id)
    success(t('admin.footerAdmin.blockDeleted'))
    hydrateTexts()
  } catch (e: any) {
    error(e?.message || t('admin.messages.genericError'))
  } finally {
    deletingContactId.value = null
  }
}
</script>

<style scoped>
.fr-en-cell {
  max-width: 360px;
  white-space: pre-line;
}
</style>

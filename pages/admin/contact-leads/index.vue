<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="mb-1">Demandes contact (site)</h4>
        <p class="text-muted mb-0">
          Messages du formulaire public. WhatsApp ouvre une conversation avec le numéro fourni et le texte du message prérempli (indiquez le numéro au format international dans le formulaire).
        </p>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label class="form-label small text-muted mb-1">Recherche</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="Nom, e-mail, sujet, message…"
              @input="debouncedFetch"
            >
          </div>
          <div class="col-md-4">
            <button type="button" class="btn btn-outline-secondary" :disabled="!filters.search" @click="clearSearch">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Date</th>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Téléphone</th>
                <th>Sujet</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rows.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">Aucune demande</td>
              </tr>
              <tr v-for="row in rows" :key="row.id">
                <td><small>{{ formatDate(row.created_at) }}</small></td>
                <td>{{ row.name }}</td>
                <td><span class="small">{{ row.email }}</span></td>
                <td>
                  <span v-if="row.phone" class="small">{{ row.phone }}</span>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 220px;">{{ row.subject }}</div>
                </td>
                <td class="text-end text-nowrap">
                  <a
                    v-if="whatsappHref(row)"
                    v-can="['view', 'contact-leads']"
                    class="btn btn-sm btn-success me-1"
                    :href="whatsappHref(row)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ouvrir WhatsApp avec le message"
                  >
                    <i class="bi bi-whatsapp me-1"></i>WhatsApp
                  </a>
                  <button
                    v-can="['view', 'contact-leads']"
                    type="button"
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openDetail(row)"
                  >
                    Détail
                  </button>
                  <button
                    v-can="['delete', 'contact-leads']"
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="remove(row.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="total"
          @update:current-page="(p: number) => goToPage(p)"
          @update:limit="(l: number) => goToPage(1, l)"
        />
      </div>
    </div>

    <div id="leadDetailModal" ref="detailModalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Demande contact #{{ detail?.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div v-if="detail" class="modal-body">
            <dl class="row small mb-0">
              <dt class="col-sm-3">Reçu le</dt>
              <dd class="col-sm-9">{{ formatDate(detail.created_at) }}</dd>
              <dt class="col-sm-3">Nom</dt>
              <dd class="col-sm-9">{{ detail.name }}</dd>
              <dt class="col-sm-3">E-mail</dt>
              <dd class="col-sm-9"><a :href="'mailto:' + detail.email">{{ detail.email }}</a></dd>
              <dt class="col-sm-3">Téléphone</dt>
              <dd class="col-sm-9">{{ detail.phone || '—' }}</dd>
              <dt class="col-sm-3">Sujet</dt>
              <dd class="col-sm-9">{{ detail.subject }}</dd>
              <dt class="col-sm-3">Adresse IP</dt>
              <dd class="col-sm-9 font-monospace small">{{ detail.ip_address || '—' }}</dd>
              <dt class="col-sm-3">Navigateur</dt>
              <dd class="col-sm-9">
                <span v-if="detail.user_agent">
                  <span class="badge bg-secondary me-1">{{ parsedBrowser(detail.user_agent).browser }}</span>
                  <span class="badge bg-light text-dark me-1">{{ parsedBrowser(detail.user_agent).os }}</span>
                  <br>
                  <span class="text-muted small d-block mt-1" style="word-break: break-all;">{{ detail.user_agent }}</span>
                </span>
                <span v-else class="text-muted">—</span>
              </dd>
              <dt class="col-sm-3">Message</dt>
              <dd class="col-sm-9">
                <div class="border rounded p-3 bg-light message-plain">{{ plainBody(detail.message) }}</div>
              </dd>
            </dl>
          </div>
          <div class="modal-footer flex-wrap gap-2">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            <a
              v-if="detail && whatsappHref(detail)"
              class="btn btn-success"
              :href="whatsappHref(detail)!"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="bi bi-whatsapp me-1"></i>WhatsApp
            </a>
            <a
              v-if="detail"
              class="btn btn-outline-primary"
              :href="'mailto:' + detail.email + '?subject=' + encodeURIComponent('Re: ' + detail.subject)"
            >
              <i class="bi bi-envelope me-1"></i>E-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'

definePageMeta({ layout: 'admin' })

const api = useApi()
const { success, error } = useNotification()

const rows = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const perPage = ref(20)
const loading = ref(false)

const filters = reactive({
  search: '',
})

const detail = ref<any | null>(null)
const detailModalRef = ref<HTMLElement | null>(null)
let detailModal: any = null

function plainBody(html: string) {
  if (!html) return ''
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsedBrowser(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: 'Inconnu', os: 'Inconnu' }
  let browser = 'Autre'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/MSIE|Trident/.test(ua)) browser = 'IE'
  let os = 'Autre'
  if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'
  return { browser, os }
}

/**
 * wa.me attend le numéro sans +, avec indicatif pays (ex. 22507…).
 * Si le numéro est saisi en local CI (10 chiffres commençant par 0), on convertit en 225 + 9 chiffres.
 */
function whatsappE164ish(phone: string | null | undefined): string | null {
  if (!phone) return null
  let d = phone.replace(/\D/g, '')
  if (!d.length) return null
  if (d.startsWith('0') && d.length === 10) {
    d = '225' + d.slice(1)
  }
  return d
}

function whatsappBody(row: { name?: string; subject?: string; message?: string }) {
  const who = String(row.name || '').trim() || 'Madame, Monsieur'
  const subject = String(row.subject || '')
  const body = plainBody(String(row.message || '')).slice(0, 1800)
  return `Bonjour ${who},\n\nRéférence : « ${subject} »\n\n${body}`
}

function whatsappHref(row: { phone?: string | null; name?: string; subject?: string; message?: string }) {
  const digits = whatsappE164ish(row.phone ?? null)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappBody(row))}`
}

const formatDate = (d: string) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

async function load() {
  loading.value = true
  try {
    const res = await api.post<any>('/contact-leads/all', {
      page: currentPage.value,
      limit: perPage.value,
      search: filters.search.trim() || undefined,
    })
    if (res.success) {
      const p = res.data
      rows.value = p?.data ?? []
      total.value = p?.total ?? 0
      currentPage.value = p?.current_page ?? currentPage.value
    } else {
      rows.value = []
      error(res.message || 'Erreur')
    }
  } catch {
    rows.value = []
    error('Erreur de chargement')
  } finally {
    loading.value = false
  }
}

function goToPage(p: number, l?: number) {
  if (typeof l === 'number') perPage.value = l
  currentPage.value = p
  load()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => goToPage(1), 400)
}

function clearSearch() {
  filters.search = ''
  goToPage(1)
}

function openDetail(row: any) {
  detail.value = row
  detailModal?.show()
}

async function remove(id: number) {
  if (!confirm('Supprimer cette demande ?')) return
  try {
    const res = await api.delete(`/contact-leads/${id}`)
    if (res.success) {
      success('Demande supprimée')
      await load()
    } else {
      error(res.message || 'Erreur')
    }
  } catch (e: any) {
    error(e?.message || 'Suppression impossible')
  }
}

onMounted(async () => {
  await load()
  if (typeof window !== 'undefined' && (window as any).bootstrap && detailModalRef.value) {
    detailModal = new (window as any).bootstrap.Modal(detailModalRef.value, { focus: false })
  }
})

onBeforeUnmount(() => {
  detailModal?.dispose?.()
})
</script>

<style scoped>
.message-plain {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

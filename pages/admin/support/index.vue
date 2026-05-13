<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Support client</h4>
        <p class="text-muted mb-0">{{ ticketsStore.total }} tickets</p>
      </div>
      <button type="button" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau ticket
      </button>
    </div>

    <!-- Statistiques -->
    <div v-if="ticketsStore.statsLoading" class="row g-3 mb-4">
      <div v-for="n in 4" :key="n" class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body py-3">
            <div class="placeholder-glow"><span class="placeholder col-8"></span></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="ticketsStore.stats" class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Total</div>
            <div class="fs-3 fw-bold text-primary">{{ ticketsStore.stats.total }}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 border-start border-primary border-3">
          <div class="card-body">
            <div class="text-muted small">Actifs (ouverts / en cours / attente)</div>
            <div class="fs-3 fw-bold">{{ ticketsStore.stats.summary.active }}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 border-start border-success border-3">
          <div class="card-body">
            <div class="text-muted small">Résolus &amp; fermés</div>
            <div class="fs-3 fw-bold text-success">{{ ticketsStore.stats.summary.resolved_closed }}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small mb-2">Par statut</div>
            <div class="d-flex flex-wrap gap-1 small">
              <span v-for="(st, key) in statusOrder" :key="key" class="badge bg-light text-dark border">
                {{ st.label }}: {{ ticketsStore.stats.by_status[st.code] ?? 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Recherche</label>
            <input v-model="filters.search" type="text" class="form-control" placeholder="Sujet, n° ticket…" @input="debouncedFetch">
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Statut</label>
            <select v-model="filters.status" class="form-select" @change="fetchTickets(1)">
              <option value="">Tous</option>
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="pending">En attente</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Priorité</label>
            <select v-model="filters.priority" class="form-select" @change="fetchTickets(1)">
              <option value="">Toutes</option>
              <option value="low">Basse</option>
              <option value="medium">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Créé du</label>
            <input v-model="filters.dateFrom" type="date" class="form-control" @change="fetchTickets(1)">
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Au</label>
            <input v-model="filters.dateTo" type="date" class="form-control" @change="fetchTickets(1)">
          </div>
          <div class="col-md-1">
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              title="Réinitialiser les dates"
              :disabled="!filters.dateFrom && !filters.dateTo"
              @click="clearDateFilters"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="card border-0 shadow-sm">
      <div v-if="ticketsStore.loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Expédition</th>
                <th>Sujet</th>
                <th>Contact ticket</th>
                <th>Catégorie</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tickets.length === 0">
                <td colspan="10" class="text-center py-4 text-muted">
                  Aucun ticket trouvé
                </td>
              </tr>
              <tr v-for="ticket in tickets" :key="ticket.id">
                <td><code>{{ ticket.ticket_number }}</code></td>
                <td>
                  <div v-if="ticket.user" class="d-flex align-items-center">
                    <img
                      :src="resolveAvatar(ticket.user)"
                      class="rounded-circle me-2"
                      width="32"
                      height="32"
                      style="object-fit: cover;"
                      alt="Avatar"
                    >
                    <div>
                      <div class="fw-medium">{{ ticket.user.firstname }} {{ ticket.user.lastname }}</div>
                      <small class="text-muted d-block">{{ ticket.user.email }}</small>
                    </div>
                  </div>
                  <div v-else class="text-muted">Client #{{ ticket.user_id }}</div>
                </td>
                <td>
                  <template v-if="ticket.shipment">
                    <code class="small">{{ ticket.shipment.tracking_number || ticket.shipment.id?.slice(0, 12) }}</code>
                    <div class="small text-muted text-truncate" style="max-width: 140px;">
                      {{ ticket.shipment.destination_city || '—' }} · {{ ticket.shipment.destination_country || '' }}
                    </div>
                  </template>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 200px;">{{ ticket.subject }}</div>
                </td>
                <td class="small">
                  <div v-if="ticket.contact_email">{{ ticket.contact_email }}</div>
                  <div v-if="ticket.contact_phone">{{ ticket.contact_phone }}</div>
                  <span v-if="!ticket.contact_email && !ticket.contact_phone" class="text-muted">—</span>
                </td>
                <td><span class="badge bg-secondary">{{ ticket.category }}</span></td>
                <td>
                  <span :class="['badge', getPriorityBadgeClass(ticket.priority)]">
                    {{ getPriorityLabel(ticket.priority) }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', getStatusBadgeClass(ticket.status)]">
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </td>
                <td><small>{{ formatDate(ticket.created_at) }}</small></td>
                <td>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="openModal(ticket)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="deleteTicket(ticket.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="ticketsStore.currentPage"
          v-model:limit="ticketsStore.perPage"
          :total-items="ticketsStore.total"
          @update:current-page="(p: number) => fetchTickets(p)"
          @update:limit="(l: number) => fetchTickets(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div id="ticketModal" ref="modalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingTicket ? 'Modifier' : 'Nouveau' }} ticket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveTicket">
            <div class="modal-body">
              <!-- ── Bloc client / expédition / contacts (unifié création + édition) ── -->
              <div class="row g-3 mb-3 pb-3 border-bottom">

                <!-- Client -->
                <div class="col-12">
                  <label class="form-label">Client concerné *</label>
                  <!-- Édition : lecture seule -->
                  <div v-if="editingTicket" class="form-control bg-light d-flex align-items-center gap-2" style="min-height:38px;">
                    <i class="bi bi-person-circle text-muted"></i>
                    <span>
                      {{ editingTicket.user
                          ? ([editingTicket.user.firstname, editingTicket.user.lastname].filter(Boolean).join(' ') || editingTicket.user.email)
                          : `Client #${editingTicket.user_id}` }}
                    </span>
                  </div>
                  <!-- Création sans expédition : sélection manuelle -->
                  <select
                    v-else-if="!form.shipment_id"
                    v-model.number="form.user_id"
                    class="form-select"
                    required
                  >
                    <option :value="0" disabled>Choisir un client…</option>
                    <option v-for="u in clientUsers" :key="u.id" :value="u.id">
                      {{ [u.firstname, u.lastname].filter(Boolean).join(' ') || u.email }} — {{ u.email }}
                    </option>
                  </select>
                  <!-- Création avec expédition : client déduit automatiquement -->
                  <div v-else class="form-control bg-light text-muted" style="min-height:38px;">
                    <i class="bi bi-link-45deg me-1"></i>Rattaché automatiquement à l'expédition
                  </div>
                </div>

                <!-- Expédition -->
                <div class="col-12">
                  <label class="form-label d-flex align-items-center gap-2">
                    Expédition concernée
                    <span v-if="shipmentsLoading || shipmentsPickerLoading" class="spinner-border spinner-border-sm text-primary" style="width:.75rem;height:.75rem;"></span>
                  </label>
                  <!-- Édition : expéditions du client du ticket -->
                  <select
                    v-if="editingTicket"
                    v-model="form.shipment_id"
                    class="form-select"
                    :disabled="shipmentsLoading"
                  >
                    <option value="">— Aucune —</option>
                    <option v-for="s in clientShipments" :key="s.id" :value="String(s.id)">
                      {{ s.tracking_number || s.id }} · {{ s.destination_city || '?' }} · {{ shipmentStatusLabel(s.status) }}
                    </option>
                  </select>
                  <!-- Création : toutes les expéditions -->
                  <select
                    v-else
                    v-model="form.shipment_id"
                    class="form-select"
                    :disabled="shipmentsPickerLoading"
                    @change="onNewTicketShipmentChange"
                  >
                    <option value="">— Aucune / hors expédition —</option>
                    <option v-for="s in shipmentPickerList" :key="s.id" :value="s.id">
                      {{ formatShipmentPickerLabel(s) }}
                    </option>
                  </select>
                  <small v-if="!editingTicket" class="text-muted d-block">
                    Sélectionnez d'abord une expédition pour rattacher automatiquement le client.
                  </small>
                </div>

                <!-- Contacts -->
                <div class="col-md-6">
                  <label class="form-label">Contact e-mail</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-envelope text-muted"></i></span>
                    <input v-model="form.contact_email" type="email" class="form-control" placeholder="ex@domaine.com" autocomplete="off">
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contact téléphone</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-telephone text-muted"></i></span>
                    <input v-model="form.contact_phone" type="text" class="form-control" placeholder="+225…" maxlength="40" autocomplete="off">
                  </div>
                </div>

              </div>

              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Sujet *</label>
                  <input v-model="form.subject" type="text" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label">Description *</label>
                  <div v-if="!wysiwygInModal" class="rounded border bg-light text-muted small p-3" style="min-height: 180px">
                    Ouverture de l'éditeur…
                  </div>
                  <WysiwygEditor v-else v-model="form.description" height="180px" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Catégorie</label>
                  <select v-model="form.category" class="form-select">
                    <option value="general">Général</option>
                    <option value="technical">Technique</option>
                    <option value="billing">Facturation</option>
                    <option value="shipping">Expédition</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Priorité</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="low">Basse</option>
                    <option value="medium">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div v-if="editingTicket" class="col-12">
                  <label class="form-label">Statut</label>
                  <select v-model="form.status" class="form-select">
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="pending">En attente</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useTicketsStore } from '~/stores/tickets'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const ticketsStore = useTicketsStore()
const api = useApi()
const { success, error } = useNotification()
const config = useRuntimeConfig()

const statusOrder = [
  { code: 'open', label: 'Ouvert' },
  { code: 'in_progress', label: 'En cours' },
  { code: 'pending', label: 'Attente' },
  { code: 'resolved', label: 'Résolu' },
  { code: 'closed', label: 'Fermé' },
]

const resolveAvatar = (user: any) => {
  if (!user) return 'https://ui-avatars.com/api/?name=U&background=random&color=fff'
  if (user.picture_url) {
    return /^https?:\/\//i.test(user.picture_url)
      ? user.picture_url
      : `${(config.public.apiBase as string).replace('/api', '')}${user.picture_url}`
  }
  if (user.picture) {
    return `${(config.public.apiBase as string).replace('/api', '')}/storage/${user.picture}`
  }
  const name = `${user.firstname || ''}+${user.lastname || ''}`.trim() || 'U'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
}

const tickets = computed(() => ticketsStore.tickets)

const filters = reactive({
  search: '',
  status: '',
  priority: '',
  dateFrom: '',
  dateTo: '',
})

const wysiwygInModal = ref(false)

function clearDateFilters() {
  filters.dateFrom = ''
  filters.dateTo = ''
  fetchTickets(1)
}

const editingTicket = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const saving = ref(false)

const clientUsers = ref<Array<{ id: number; firstname: string; lastname: string; email: string; phone?: string }>>([])
const clientShipments = ref<Array<{ id: string; tracking_number?: string | null; status?: string; destination_city?: string | null; destination_country?: string | null }>>([])
const shipmentsLoading = ref(false)
const shipmentPickerList = ref<
  Array<{
    id: string
    user_id?: number
    tracking_number?: string | null
    status?: string
    destination_city?: string | null
    user?: { id?: number; firstname?: string | null; lastname?: string | null; email?: string | null; phone?: string | null }
  }>
>([])
const shipmentsPickerLoading = ref(false)

const form = reactive({
  user_id: 0,
  shipment_id: '' as string,
  contact_email: '',
  contact_phone: '',
  subject: '',
  description: '',
  category: 'general',
  priority: 'medium' as string,
  status: 'open' as string,
})

const fetchTickets = async (page?: number, limit?: number) => {
  await ticketsStore.fetchTickets({
    page: page ?? ticketsStore.currentPage,
    limit: limit ?? ticketsStore.perPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    date_from: filters.dateFrom || undefined,
    date_to: filters.dateTo || undefined,
  })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchTickets(1), 400)
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

const getPriorityBadgeClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-secondary',
    medium: 'bg-info',
    high: 'bg-warning',
    urgent: 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Basse',
    medium: 'Normale',
    high: 'Haute',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-primary',
    in_progress: 'bg-info',
    pending: 'bg-warning',
    resolved: 'bg-success',
    closed: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    pending: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return labels[status] || status
}

const shipmentStatusLabel = (s: string | undefined) => {
  const m: Record<string, string> = {
    pending: 'En attente',
    picked_up: 'Collecté',
    in_transit: 'Transit',
    in_customs: 'Douane',
    out_for_delivery: 'Livraison',
    delivered: 'Livré'
  }
  return m[s || ''] || s || ''
}

async function loadClientUsers() {
  try {
    const res = await api.post<any>('/user/all', { page: 1, limit: 500, role: 'client' })
    if (res.success && res.data?.data) {
      clientUsers.value = res.data.data
    }
  } catch {
    clientUsers.value = []
  }
}

async function loadShipmentsForUser(uid: number) {
  if (!uid) {
    clientShipments.value = []
    return
  }
  shipmentsLoading.value = true
  try {
    const res = await api.post<any>('/shipments/all', { page: 1, limit: 100, user_id: uid })
    if (res.success) {
      const rows = res.data?.data ?? res.data ?? []
      clientShipments.value = Array.isArray(rows) ? rows : []
    } else {
      clientShipments.value = []
    }
  } catch {
    clientShipments.value = []
  } finally {
    shipmentsLoading.value = false
  }
}

async function loadShipmentPicker() {
  shipmentsPickerLoading.value = true
  try {
    const res = await api.get<any>('/shipments/all')
    if (res.success && res.data != null) {
      const rows = Array.isArray(res.data) ? res.data : []
      shipmentPickerList.value = rows
    } else {
      shipmentPickerList.value = []
    }
  } catch {
    shipmentPickerList.value = []
  } finally {
    shipmentsPickerLoading.value = false
  }
}

function formatShipmentPickerLabel(s: (typeof shipmentPickerList.value)[0]) {
  const u = s.user
  const name = u ? `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() : ''
  const client = name || (s.user_id ? `Client #${s.user_id}` : '—')
  return `${s.tracking_number || s.id} · ${client} · ${s.destination_city || '?'} · ${shipmentStatusLabel(s.status)}`
}

function onNewTicketShipmentChange() {
  const id = form.shipment_id
  if (!id) {
    form.user_id = 0
    form.contact_email = ''
    form.contact_phone = ''
    return
  }
  const s = shipmentPickerList.value.find((x) => x.id === id)
  if (!s) return
  const uid = Number(s.user_id)
  if (uid > 0) {
    form.user_id = uid
    const u = s.user
    if (u) {
      form.contact_email = u.email ?? ''
      form.contact_phone = u.phone ?? ''
      // Garantit que l'option existe dans la liste même si le rôle n'est pas "client"
      if (!clientUsers.value.find((c) => c.id === uid)) {
        clientUsers.value.push({
          id: uid,
          firstname: u.firstname ?? '',
          lastname: u.lastname ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
        })
      }
    }
  }
}

watch(
  () => editingTicket.value?.user_id,
  (uid) => {
    if (uid && editingTicket.value) {
      loadShipmentsForUser(Number(uid))
    }
  }
)

function onTicketModalShown() {
  wysiwygInModal.value = true
}

function onTicketModalHidden() {
  wysiwygInModal.value = false
}

onMounted(async () => {
  await Promise.all([
    ticketsStore.fetchTicketStats(),
    fetchTickets(1),
    loadClientUsers(),
  ])
  await nextTick()
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value, {
      focus: false,
    })
    modalRef.value.addEventListener('shown.bs.modal', onTicketModalShown)
    modalRef.value.addEventListener('hidden.bs.modal', onTicketModalHidden)
  }
})

onBeforeUnmount(() => {
  modalRef.value?.removeEventListener('shown.bs.modal', onTicketModalShown)
  modalRef.value?.removeEventListener('hidden.bs.modal', onTicketModalHidden)
})

const openModal = async (ticket?: any) => {
  if (ticket) {
    editingTicket.value = ticket
    form.user_id = ticket.user_id
    form.shipment_id = ticket.shipment_id ? String(ticket.shipment_id) : ''
    form.contact_email = ticket.contact_email || ''
    form.contact_phone = ticket.contact_phone || ''
    form.subject = ticket.subject
    form.description = ticket.description
    form.category = ticket.category
    form.priority = ticket.priority
    form.status = ticket.status
    await loadShipmentsForUser(ticket.user_id)
  } else {
    editingTicket.value = null
    form.user_id = 0
    form.shipment_id = ''
    form.contact_email = ''
    form.contact_phone = ''
    form.subject = ''
    form.description = ''
    form.category = 'general'
    form.priority = 'medium'
    form.status = 'open'
    clientShipments.value = []
    await loadShipmentPicker()
  }
  modalInstance?.show()
}

const saveTicket = async () => {
  saving.value = true
  try {
    if (editingTicket.value) {
      await ticketsStore.updateTicket(editingTicket.value.id, {
        subject: form.subject,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: form.status,
        shipment_id: form.shipment_id || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
      })
      success('Ticket modifié')
    } else {
      if (!form.user_id && !form.shipment_id) {
        error('Choisissez un client ou une expédition.')
        return
      }
      await ticketsStore.createTicket({
        user_id: form.user_id,
        subject: form.subject,
        description: form.description,
        category: form.category,
        priority: form.priority,
        shipment_id: form.shipment_id || undefined,
        contact_email: form.contact_email || undefined,
        contact_phone: form.contact_phone || undefined,
      })
      success('Ticket créé')
    }
    modalInstance?.hide()
    await Promise.all([fetchTickets(ticketsStore.currentPage), ticketsStore.fetchTicketStats()])
  } catch (err: any) {
    error(err.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

const deleteTicket = async (id: number) => {
  if (confirm('Supprimer ce ticket ?')) {
    await ticketsStore.deleteTicket(id)
    success('Ticket supprimé')
    await Promise.all([fetchTickets(ticketsStore.currentPage), ticketsStore.fetchTicketStats()])
  }
}
</script>

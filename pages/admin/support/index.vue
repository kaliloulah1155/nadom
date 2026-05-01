<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Support client</h4>
        <p class="text-muted mb-0">{{ ticketsStore.total }} tickets</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau ticket
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input v-model="filters.search" type="text" class="form-control" placeholder="Rechercher..." @input="debouncedFetch" />
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="fetchTickets(1)">
              <option value="">Tous les statuts</option>
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="pending">En attente</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.priority" class="form-select" @change="fetchTickets(1)">
              <option value="">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
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
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Sujet</th>
                <th>Catégorie</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tickets.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
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
                    />
                    <div>
                      <div class="fw-medium">{{ ticket.user.firstname }} {{ ticket.user.lastname }}</div>
                      <small class="text-muted d-block">{{ ticket.user.email }}</small>
                      <small v-if="ticket.user.phone" class="text-muted">{{ ticket.user.phone }}</small>
                    </div>
                  </div>
                  <div v-else class="text-muted">Client #{{ ticket.user_id }}</div>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 250px;">{{ ticket.subject }}</div>
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
                    <button class="btn btn-sm btn-outline-primary" @click="openModal(ticket)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteTicket(ticket.id)">
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
    <div class="modal fade" id="ticketModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingTicket ? 'Modifier' : 'Nouveau' }} ticket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveTicket">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Sujet *</label>
                  <input v-model="form.subject" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Description *</label>
                  <WysiwygEditor v-model="form.description" height="180px" />
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
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTicketsStore } from '~/stores/tickets'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const ticketsStore = useTicketsStore()
const { success, error } = useNotification()
const config = useRuntimeConfig()

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
  priority: ''
})

const editingTicket = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  subject: '',
  description: '',
  category: 'general',
  priority: 'medium',
  status: 'open'
})

const fetchTickets = async (page?: number, limit?: number) => {
  await ticketsStore.fetchTickets({
    page: page ?? ticketsStore.currentPage,
    limit: limit ?? ticketsStore.perPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchTickets(1), 400)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

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

onMounted(async () => {
  await fetchTickets(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (ticket?: any) => {
  if (ticket) {
    editingTicket.value = ticket
    form.subject = ticket.subject
    form.description = ticket.description
    form.category = ticket.category
    form.priority = ticket.priority
    form.status = ticket.status
  } else {
    editingTicket.value = null
    form.subject = ''
    form.description = ''
    form.category = 'general'
    form.priority = 'medium'
    form.status = 'open'
  }
  modalInstance?.show()
}

const saveTicket = async () => {
  try {
    if (editingTicket.value) {
      await ticketsStore.updateTicket(editingTicket.value.id, { ...form })
      success('Ticket modifié')
    } else {
      await ticketsStore.createTicket({ ...form })
      success('Ticket créé')
    }
    modalInstance?.hide()
    await fetchTickets(ticketsStore.currentPage)
  } catch (err: any) {
    error(err.message)
  }
}

const deleteTicket = async (id: number) => {
  if (confirm('Supprimer ce ticket ?')) {
    await ticketsStore.deleteTicket(id)
    success('Ticket supprimé')
  }
}
</script>
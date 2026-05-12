import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface Ticket {
  id: number
  uuid: string
  ticket_number: string
  user_id: number
  assigned_to: number | null
  shipment_id?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  user?: {
    id: number
    firstname: string
    lastname: string
    email: string
    phone?: string
  }
  assignedTo?: {
    id: number
    firstname: string
    lastname: string
  }
  shipment?: {
    id: string
    tracking_number?: string | null
    status?: string
    destination_country?: string | null
    destination_city?: string | null
  } | null
}

export interface TicketStats {
  total: number
  by_status: Record<string, number>
  summary: {
    active: number
    resolved_closed: number
  }
}

interface TicketsState {
  tickets: Ticket[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  loading: boolean
  error: string | null
  stats: TicketStats | null
  statsLoading: boolean
}

export const useTicketsStore = defineStore('tickets', {
  state: (): TicketsState => ({
    tickets: [],
    total: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
    loading: false,
    error: null,
    stats: null,
    statsLoading: false,
  }),

  getters: {
    openTickets: (state) => state.tickets.filter(t => t.status === 'open'),
    pendingTickets: (state) => state.tickets.filter(t => t.status === 'pending'),
    resolvedTickets: (state) => state.tickets.filter(t => t.status === 'resolved' || t.status === 'closed'),
  },

  actions: {
    async fetchTicketStats() {
      this.statsLoading = true
      try {
        const api = useApi()
        const res = await api.get<TicketStats>('/ticket/stats')
        if (res.success && res.data) {
          this.stats = res.data
        } else {
          this.stats = null
        }
      } catch {
        this.stats = null
      } finally {
        this.statsLoading = false
      }
      return this.stats
    },

    async fetchTickets(
      params: {
        page?: number
        limit?: number
        status?: string
        priority?: string
        search?: string
        date_from?: string
        date_to?: string
      } = {}
    ) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.currentPage
        const limit = params.limit ?? this.perPage
        const body: Record<string, any> = { page, limit }
        if (params.status) body.status = params.status
        if (params.priority) body.priority = params.priority
        if (params.search) body.search = params.search
        if (params.date_from) body.date_from = params.date_from
        if (params.date_to) body.date_to = params.date_to
        const res = await api.post<any>('/ticket/all', body)
        if (res.success) {
          const paginated = res.data
          this.tickets = paginated?.data ?? paginated ?? []
          this.total = paginated?.total ?? this.tickets.length
          this.currentPage = paginated?.current_page ?? page
          this.lastPage = paginated?.last_page ?? 1
          if (params.limit != null) this.perPage = limit
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des tickets'
      } finally {
        this.loading = false
      }
      return this.tickets
    },

    async createTicket(ticketData: Record<string, any>) {
      const api = useApi()
      const res = await api.post<Ticket>('/ticket', ticketData)
      if (res.success && res.data) {
        this.tickets.unshift(res.data)
        this.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateTicket(id: number, ticketData: Record<string, any>) {
      const api = useApi()
      const res = await api.put<Ticket>(`/ticket/${id}`, ticketData)
      if (res.success && res.data) {
        const idx = this.tickets.findIndex(t => t.id === id)
        if (idx !== -1) this.tickets[idx] = res.data
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteTicket(id: number) {
      const api = useApi()
      const res = await api.delete(`/ticket/${id}`)
      if (res.success) {
        this.tickets = this.tickets.filter(t => t.id !== id)
        this.total = Math.max(0, this.total - 1)
        return true
      }
      throw new Error(res.message)
    }
  }
})

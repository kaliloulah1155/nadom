import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface Ticket {
  id: number
  uuid: string
  ticket_number: string
  user_id: number
  assigned_to: number | null
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
  }
  assignedTo?: {
    id: number
    firstname: string
    lastname: string
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
}

export const useTicketsStore = defineStore('tickets', {
  state: (): TicketsState => ({
    tickets: [],
    total: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
    loading: false,
    error: null
  }),

  getters: {
    openTickets: (state) => state.tickets.filter(t => t.status === 'open'),
    pendingTickets: (state) => state.tickets.filter(t => t.status === 'pending'),
    resolvedTickets: (state) => state.tickets.filter(t => t.status === 'resolved' || t.status === 'closed'),
  },

  actions: {
    async fetchTickets(params: { page?: number; limit?: number; status?: string; priority?: string; search?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging = params.page || params.limit || params.status || params.priority || params.search
        if (hasPaging) {
          const page = params.page ?? this.currentPage
          const limit = params.limit ?? this.perPage
          const body: Record<string, any> = { page, limit }
          if (params.status) body.status = params.status
          if (params.priority) body.priority = params.priority
          if (params.search) body.search = params.search
          const res = await api.post<any>('/ticket/all', body, { query: { page, limit } })
          if (res.success) {
            this.tickets = res.data.data || res.data || []
            this.total = res.data.total || this.tickets.length
            this.currentPage = res.data.current_page || page
            this.lastPage = res.data.last_page || 1
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Ticket[]>('/ticket/all')
          if (res.success) {
            this.tickets = res.data || []
            this.total = this.tickets.length
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des tickets'
      } finally {
        this.loading = false
      }
      return this.tickets
    },

    async createTicket(ticketData: Partial<Ticket>) {
      const api = useApi()
      const res = await api.post<Ticket>('/ticket', ticketData)
      if (res.success && res.data) {
        this.tickets.unshift(res.data)
        this.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateTicket(id: number, ticketData: Partial<Ticket>) {
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
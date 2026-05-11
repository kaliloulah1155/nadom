import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface ActivityLogUser {
  id?: number
  uuid?: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
}

export interface ActivityLogRow {
  id: string
  user_id: number | null
  user?: ActivityLogUser | null
  action: string | null
  entity_type: string | null
  entity_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string | null
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  user_id?: number | null
  action?: string | null
  entity_type?: string | null
  search?: string | null
  from?: string | null
  to?: string | null
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 15): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface State {
  items: ActivityLogRow[]
  meta: Meta
  loading: boolean
  error: string | null
}

export const useActivityLogsStore = defineStore('activityLogs', {
  state: (): State => ({
    items: [],
    meta: newMeta(15),
    loading: false,
    error: null,
  }),

  actions: {
    async fetch(filters: ActivityLogFilters = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = filters.page ?? this.meta.currentPage
        const limit = filters.limit ?? this.meta.perPage
        const body: Record<string, unknown> = { page, limit }
        if (filters.user_id) body.user_id = filters.user_id
        if (filters.action) body.action = filters.action
        if (filters.entity_type) body.entity_type = filters.entity_type
        if (filters.search) body.search = filters.search
        if (filters.from) body.from = filters.from
        if (filters.to) body.to = filters.to

        const res = await api.post<any>('/activity-logs/all', body, { query: { page, limit } })
        if (res.success && res.data) {
          const d = res.data
          if (d && typeof d === 'object' && Array.isArray(d.data)) {
            this.items = d.data
            this.meta.total = d.total ?? d.data.length
            this.meta.currentPage = d.current_page ?? page
            this.meta.perPage = d.per_page ?? limit
            this.meta.lastPage = d.last_page ?? 1
          } else if (Array.isArray(d)) {
            this.items = d
            this.meta.total = d.length
            this.meta.currentPage = 1
            this.meta.perPage = limit
            this.meta.lastPage = 1
          } else {
            this.items = []
            this.meta.total = 0
            this.meta.lastPage = 1
          }
        } else {
          this.error = res.message || 'Erreur lors du chargement des logs'
        }
      } catch (err: any) {
        this.error = err?.message || 'Erreur lors du chargement des logs'
      } finally {
        this.loading = false
      }
    },

    async show(id: string) {
      const api = useApi()
      const res = await api.get<ActivityLogRow>(`/activity-logs/${id}`)
      return res.success ? res.data : null
    },
  },
})

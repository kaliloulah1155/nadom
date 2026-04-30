import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface Report {
  id: number
  uuid: string
  user_id: number | null
  title: string
  description: string | null
  type: string
  format: string
  filters: any | null
  date_from: string | null
  date_to: string | null
  status: string
  file_url: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    firstname: string
    lastname: string
  }
}

export interface KpiValue {
  current: number
  previous: number
  percent_change: number
  trend: 'up' | 'down' | 'stable'
}

export interface OverviewStats {
  revenue: KpiValue
  requests_handled: KpiValue
  new_clients: KpiValue
  satisfaction: { rate: number; scale: number; label: string }
}

export interface MonthlyEvolution {
  labels: string[]
  data: number[]
}

export interface TopDestination {
  name: string
  count: number
  percent: number
}

interface ReportsState {
  reports: Report[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  loading: boolean
  error: string | null
  overview: OverviewStats | null
  monthly: MonthlyEvolution | null
  destinations: TopDestination[]
  statsLoading: boolean
  exporting: boolean
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    reports: [],
    total: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
    loading: false,
    error: null,
    overview: null,
    monthly: null,
    destinations: [],
    statsLoading: false,
    exporting: false
  }),

  getters: {
    getReportsByType: (state) => (type: string) => state.reports.filter(r => r.type === type),
  },

  actions: {
    async fetchReports(params: { page?: number; limit?: number; type?: string; status?: string; search?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging = params.page || params.limit || params.type || params.status || params.search
        if (hasPaging) {
          const page = params.page ?? this.currentPage
          const limit = params.limit ?? this.perPage
          const body: Record<string, any> = { page, limit }
          if (params.type) body.type = params.type
          if (params.status) body.status = params.status
          if (params.search) body.search = params.search
          const res = await api.post<any>('/report/all', body, { query: { page, limit } })
          if (res.success) {
            this.reports = res.data.data || res.data || []
            this.total = res.data.total || this.reports.length
            this.currentPage = res.data.current_page || page
            this.lastPage = res.data.last_page || 1
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Report[]>('/report/all')
          if (res.success) {
            this.reports = res.data || []
            this.total = this.reports.length
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des rapports'
      } finally {
        this.loading = false
      }
      return this.reports
    },

    async createReport(reportData: Partial<Report>) {
      const api = useApi()
      const res = await api.post<Report>('/report', reportData)
      if (res.success && res.data) {
        this.reports.unshift(res.data)
        this.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateReport(id: number, reportData: Partial<Report>) {
      const api = useApi()
      const res = await api.put<Report>(`/report/${id}`, reportData)
      if (res.success && res.data) {
        const idx = this.reports.findIndex(r => r.id === id)
        if (idx !== -1) this.reports[idx] = res.data
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteReport(id: number) {
      const api = useApi()
      const res = await api.delete(`/report/${id}`)
      if (res.success) {
        this.reports = this.reports.filter(r => r.id !== id)
        this.total = Math.max(0, this.total - 1)
        return true
      }
      throw new Error(res.message)
    },

    async fetchStats(months = 12) {
      this.statsLoading = true
      this.error = null
      try {
        const api = useApi()
        const [overview, monthly, destinations] = await Promise.all([
          api.get<OverviewStats>('/admin/stats/overview'),
          api.get<MonthlyEvolution>('/admin/stats/monthly-evolution', { query: { months } }),
          api.get<{ destinations: TopDestination[] }>('/admin/stats/top-destinations'),
        ])

        if (overview.success) this.overview = overview.data
        if (monthly.success) this.monthly = monthly.data
        if (destinations.success) this.destinations = destinations.data?.destinations || []

        if (!overview.success) this.error = overview.message
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des statistiques'
      } finally {
        this.statsLoading = false
      }
    },

    async exportStats(format: 'excel' | 'pdf' = 'excel') {
      this.exporting = true
      try {
        const config = useRuntimeConfig()
        const baseURL = (config.public.apiBase as string).replace(/\/$/, '')
        const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('nadom_token') : null
        const url = `${baseURL}/admin/stats/export?format=${format}`
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) throw new Error(`Export ${format} échoué (${res.status})`)
        const blob = await res.blob()
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        const ext = format === 'pdf' ? 'pdf' : 'xlsx'
        a.download = `rapport-statistiques-${new Date().toISOString().slice(0, 10)}.${ext}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(downloadUrl)
      } finally {
        this.exporting = false
      }
    }
  }
})
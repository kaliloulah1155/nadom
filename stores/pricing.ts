import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface PricingService {
  id: number
  uuid: string
  key: string
  value: string
  slug: string
  description: string | null
  status: number
  created_at: string
  updated_at: string
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 12): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface PricingState {
  services: PricingService[]
  servicesMeta: Meta
  loading: boolean
  error: string | null
}

function applyPaginator<T>(res: any, items: T[], meta: Meta) {
  const d = res.data
  if (d && typeof d === 'object' && Array.isArray(d.data)) {
    items.splice(0, items.length, ...d.data)
    meta.total = d.total ?? d.data.length
    meta.currentPage = d.current_page ?? meta.currentPage
    meta.perPage = d.per_page ?? meta.perPage
    meta.lastPage = d.last_page ?? 1
  } else if (Array.isArray(d)) {
    items.splice(0, items.length, ...d)
    meta.total = d.length
    meta.currentPage = 1
    meta.lastPage = 1
  } else {
    items.splice(0, items.length)
    meta.total = 0
    meta.lastPage = 1
  }
}

export const usePricingStore = defineStore('pricing', {
  state: (): PricingState => ({
    services: [],
    servicesMeta: newMeta(12),
    loading: false,
    error: null
  }),

  getters: {
    total: (state) => state.servicesMeta.total
  },

  actions: {
    async fetchServices(params: { page?: number; limit?: number; search?: string; status?: number } = {}) {
      this.loading = true
      this.error = null
      try {
        // Use PublicApi pour les endpoints publics (pas d'authentification requise)
        const api = usePublicApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.search || params.status !== undefined
        if (hasPaging) {
          const page = params.page ?? this.servicesMeta.currentPage
          const limit = params.limit ?? this.servicesMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.search) body.search = params.search
          if (params.status !== undefined) body.status = params.status
          const res = await api.post<any>('/pricing/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.services, this.servicesMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<PricingService[]>('/pricing/all')
          if (res.success) {
            this.services = res.data || []
            this.servicesMeta.total = this.services.length
            this.servicesMeta.lastPage = 1
            this.servicesMeta.currentPage = 1
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des services'
      } finally {
        this.loading = false
      }
      return this.services
    },

    async createService(serviceData: Partial<PricingService>) {
      const api = useApi()
      const res = await api.post<PricingService>('/pricing', serviceData)
      if (res.success && res.data) {
        this.services.unshift(res.data)
        this.servicesMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateService(id: number, serviceData: Partial<PricingService>) {
      const api = useApi()
      const res = await api.put<PricingService>(`/pricing/${id}`, serviceData)
      if (res.success && res.data) {
        const idx = this.services.findIndex(s => s.id === id)
        if (idx !== -1) this.services[idx] = res.data
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteService(id: number) {
      const api = useApi()
      const res = await api.delete(`/pricing/${id}`)
      if (res.success) {
        this.services = this.services.filter(s => s.id !== id)
        this.servicesMeta.total = Math.max(0, this.servicesMeta.total - 1)
        return true
      }
      throw new Error(res.message)
    }
  }
})

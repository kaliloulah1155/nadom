import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface AdminDestinationRow {
  id: string
  country: string | null
  continent: string | null
  city: string | null
  flag: string | null
  currency_code?: string | null
  is_active: boolean
  shipping_modes?: unknown[]
}

export interface AdminShippingModeRow {
  id: string
  destination_id: string | null
  mode: string
  duration: string | null
  cost_per_kg: string | number | null
  destination?: AdminDestinationRow | null
}

interface PaginatedMeta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

function applyPaginator<T>(res: any, items: T[], meta: PaginatedMeta) {
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

const metaDest = (): PaginatedMeta => ({ total: 0, currentPage: 1, perPage: 15, lastPage: 1 })
const metaModes = (): PaginatedMeta => ({ total: 0, currentPage: 1, perPage: 15, lastPage: 1 })

export const useShippingConfigStore = defineStore('shippingConfig', {
  state: () => ({
    destinations: [] as AdminDestinationRow[],
    destinationsMeta: metaDest(),
    modes: [] as AdminShippingModeRow[],
    modesMeta: metaModes(),
    loadingDestinations: false,
    loadingModes: false,
    error: null as string | null,
  }),

  actions: {
    async fetchDestinations(params: {
      page?: number
      limit?: number
      country?: string | null
      continent?: string | null
      is_active?: boolean | null
    } = {}) {
      this.loadingDestinations = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.destinationsMeta.currentPage
        const limit = params.limit ?? this.destinationsMeta.perPage
        const body: Record<string, unknown> = { page, limit }
        if (params.country) body.country = params.country
        if (params.continent) body.continent = params.continent
        if (params.is_active !== undefined && params.is_active !== null) body.is_active = params.is_active

        const res = await api.post<any>('/destinations/all', body, { query: { page, limit } })
        if (res.success && res.data) {
          applyPaginator(res, this.destinations, this.destinationsMeta)
        } else {
          this.error = res.message || 'Erreur destinations'
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur destinations'
      } finally {
        this.loadingDestinations = false
      }
    },

    async createDestination(payload: Partial<AdminDestinationRow>) {
      const api = useApi()
      const res = await api.post<AdminDestinationRow>('/destinations', payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    async updateDestination(id: string, payload: Partial<AdminDestinationRow>) {
      const api = useApi()
      const res = await api.put<AdminDestinationRow>(`/destinations/${id}`, payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    async deleteDestination(id: string) {
      const api = useApi()
      const res = await api.delete(`/destinations/${id}`)
      if (!res.success) throw new Error(res.message)
    },

    async fetchModes(params: {
      page?: number
      limit?: number
      destination_id?: string | null
      mode?: string | null
    } = {}) {
      this.loadingModes = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.modesMeta.currentPage
        const limit = params.limit ?? this.modesMeta.perPage
        const body: Record<string, unknown> = { page, limit }
        if (params.destination_id) body.destination_id = params.destination_id
        if (params.mode) body.mode = params.mode

        const res = await api.post<any>('/shipping-modes/all', body, { query: { page, limit } })
        if (res.success && res.data) {
          applyPaginator(res, this.modes, this.modesMeta)
        } else {
          this.error = res.message || 'Erreur modes'
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur modes'
      } finally {
        this.loadingModes = false
      }
    },

    async createMode(payload: {
      destination_id: string
      mode: string
      duration?: string | null
      cost_per_kg?: number | null
    }) {
      const api = useApi()
      const res = await api.post<AdminShippingModeRow>('/shipping-modes', payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    async updateMode(
      id: string,
      payload: Partial<{ destination_id: string; mode: string; duration: string | null; cost_per_kg: number | null }>
    ) {
      const api = useApi()
      const res = await api.put<AdminShippingModeRow>(`/shipping-modes/${id}`, payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },

    async deleteMode(id: string) {
      const api = useApi()
      const res = await api.delete(`/shipping-modes/${id}`)
      if (!res.success) throw new Error(res.message)
    },

    /** Liste pour selects admin — GET sans pagination (toutes les lignes `destinations`). */
    async fetchAllDestinationsForSelect(): Promise<AdminDestinationRow[]> {
      const api = useApi()
      const res = await api.get<AdminDestinationRow[]>('/admin/destinations/select-options')
      if (!res.success || res.data == null) return []
      return Array.isArray(res.data) ? res.data : []
    },
  },
})

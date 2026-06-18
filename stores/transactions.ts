import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface TransactionUser {
  id?: string
  firstname?: string | null
  lastname?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface TransactionRow {
  id: string
  platform: string | null
  reference: string | null
  payable_type: string | null
  payable_id: string | null
  payable_kind: string | null
  user_id: string | null
  user?: TransactionUser | null
  type: 'payment' | 'refund' | 'reversement'
  direction: 'in' | 'out'
  status: number
  status_label?: string
  reversed?: boolean
  reversed_at?: string | null
  amount_net: string | number
  amount_public: string | number
  commission: string | number
  currency: string
  payment_method: string | null
  phone: string | null
  checkout_url: string | null
  metadata: Record<string, any> | null
  created_at: string | null
}

export interface TransactionFilters {
  page?: number
  per_page?: number
  type?: string | null
  kind?: string | null
  status?: number | null
  search?: string | null
  date_from?: string | null
  date_to?: string | null
}

interface Meta { total: number; currentPage: number; perPage: number; lastPage: number }
const newMeta = (perPage = 20): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface State {
  items: TransactionRow[]
  meta: Meta
  loading: boolean
  error: string | null
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): State => ({
    items: [],
    meta: newMeta(20),
    loading: false,
    error: null,
  }),

  actions: {
    async fetch(filters: TransactionFilters = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = filters.page ?? this.meta.currentPage
        const perPage = filters.per_page ?? this.meta.perPage
        const body: Record<string, unknown> = { page, per_page: perPage }
        if (filters.type) body.type = filters.type
        if (filters.kind) body.kind = filters.kind
        if (filters.date_from) body.date_from = filters.date_from
        if (filters.date_to) body.date_to = filters.date_to
        if (filters.status !== null && filters.status !== undefined) body.status = filters.status
        if (filters.search) body.search = filters.search

        const res = await api.post<any>('/payments/all', body, { query: { page, per_page: perPage } })
        if (res.success && res.data) {
          const d = res.data
          if (d && typeof d === 'object' && Array.isArray(d.data)) {
            this.items = d.data
            this.meta.total = d.total ?? d.data.length
            this.meta.currentPage = d.current_page ?? page
            this.meta.perPage = d.per_page ?? perPage
            this.meta.lastPage = d.last_page ?? 1
          } else if (Array.isArray(d)) {
            this.items = d
            this.meta.total = d.length
            this.meta.lastPage = 1
          }
        } else {
          this.error = res.message || 'Erreur lors du chargement des transactions'
        }
      } catch (err: any) {
        this.error = err?.message || 'Erreur lors du chargement des transactions'
      } finally {
        this.loading = false
      }
    },

    async refund(reference: string, payload: { amount?: number; reason?: string } = {}) {
      const api = useApi()
      return api.post<any>(`/payments/${reference}/refund`, payload)
    },

    async reverser(reference: string) {
      const api = useApi()
      return api.post<any>(`/payments/${reference}/reversement`, {})
    },

    async confirmManually(reference: string) {
      const api = useApi()
      return api.post<any>(`/payments/${reference}/confirm`, {})
    },

    async balance() {
      const api = useApi()
      return api.get<any>('/payments/balance')
    },
  },
})

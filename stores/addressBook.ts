import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface SavedAddress {
  id: string
  user_id: number
  type: 'origin' | 'destination'
  fullname: string | null
  phone: string | null
  email: string | null
  country: string | null
  city: string | null
  address: string | null
}

/** Un client du repertoire admin, avec son carnet d'adresses. */
export interface DirectoryClient {
  id: number
  uuid: string
  firstname: string | null
  lastname: string | null
  email: string | null
  phone: string | null
  status: number
  country: string | null
  city: string | null
  created_at: string
  addresses: SavedAddress[]
}

interface DirectoryMeta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newDirectoryMeta = (perPage = 15): DirectoryMeta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

export const useAddressBookStore = defineStore('addressBook', {
  state: () => ({
    addresses: [] as SavedAddress[],
    loading: false,
    loaded: false,
    // Repertoire admin (tous les clients) — distinct de `addresses`, qui ne
    // porte que le carnet du client connecte.
    directory: [] as DirectoryClient[],
    directoryMeta: newDirectoryMeta(15),
    directoryLoading: false,
  }),

  getters: {
    origins: (state) => state.addresses.filter((a) => a.type === 'origin'),
    destinations: (state) => state.addresses.filter((a) => a.type === 'destination'),
  },

  actions: {
    async fetchDirectory(params: { page?: number; limit?: number; search?: string } = {}) {
      this.directoryLoading = true
      try {
        const api = useApi()
        const page = params.page ?? this.directoryMeta.currentPage
        const limit = params.limit ?? this.directoryMeta.perPage
        const res = await api.get<any>('/address-book', { query: { page, limit, search: params.search ?? '' } })
        if (res.success && res.data) {
          const d = res.data
          this.directory = Array.isArray(d.data) ? d.data : []
          this.directoryMeta.total = d.total ?? this.directory.length
          this.directoryMeta.currentPage = d.current_page ?? page
          this.directoryMeta.perPage = d.per_page ?? limit
          this.directoryMeta.lastPage = d.last_page ?? 1
        }
        return this.directory
      } catch {
        return []
      } finally {
        this.directoryLoading = false
      }
    },

    async fetchAll(force = false) {
      if (this.loaded && !force) return this.addresses
      this.loading = true
      try {
        const api = useApi()
        const res = await api.get<SavedAddress[]>('/user-addresses')
        if (res.success && res.data) {
          this.addresses = res.data
          this.loaded = true
        }
        return this.addresses
      } catch {
        return []
      } finally {
        this.loading = false
      }
    },

    async remove(id: string) {
      const api = useApi()
      const res = await api.delete<null>(`/user-addresses/${id}`)
      if (res.success) {
        this.addresses = this.addresses.filter((a) => a.id !== id)
      }
      return res.success
    },
  },
})

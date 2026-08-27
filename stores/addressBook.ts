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
  person_type: 'individual' | 'company' | null
  company: string | null
}

export const useAddressBookStore = defineStore('addressBook', {
  state: () => ({
    addresses: [] as SavedAddress[],
    loading: false,
    loaded: false,
  }),

  getters: {
    origins: (state) => state.addresses.filter((a) => a.type === 'origin'),
    destinations: (state) => state.addresses.filter((a) => a.type === 'destination'),
  },

  actions: {
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

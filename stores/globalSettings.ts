import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface GlobalSetting {
  uuid?: string
  kkey?: string
  key?: string
  vvalue?: string
  value?: string
  slug?: string
  description?: string | null
  status?: number
}

interface State {
  items: GlobalSetting[]
  bySlug: Record<string, GlobalSetting>
  loading: boolean
  error: string | null
}

export const useGlobalSettingsStore = defineStore('globalSettings', {
  state: (): State => ({
    items: [],
    bySlug: {},
    loading: false,
    error: null,
  }),

  getters: {
    getValue: (state) => (slug: string, fallback = '') => {
      const s = state.bySlug[slug] || state.items.find(i => i.slug === slug)
      return s?.vvalue ?? s?.value ?? fallback
    },
    getDescription: (state) => (slug: string, fallback = '') => {
      const s = state.bySlug[slug] || state.items.find(i => i.slug === slug)
      return s?.description ?? fallback
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const res = await api.get<GlobalSetting[]>('/global-settings/all')
        if (res.success && Array.isArray(res.data)) {
          this.items = res.data
          this.bySlug = res.data.reduce((acc: Record<string, GlobalSetting>, s: any) => {
            if (s.slug) acc[s.slug] = s
            return acc
          }, {})
        } else if (!res.success) {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err?.message || 'Erreur lors du chargement des paramètres'
      } finally {
        this.loading = false
      }
      return this.items
    },

    async fetchBySlug(slug: string) {
      try {
        const api = useApi()
        const res = await api.get<GlobalSetting[]>(`/global-setting/slug/${encodeURIComponent(slug)}`)
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const setting = res.data[0]
          this.bySlug[slug] = setting
          const idx = this.items.findIndex(i => i.slug === slug)
          if (idx === -1) this.items.push(setting)
          else this.items[idx] = setting
          return setting
        }
      } catch (_) {
        // silent
      }
      return null
    },

    async update(uuid: string, payload: Partial<GlobalSetting>) {
      const api = useApi()
      const res = await api.put<GlobalSetting>(`/global-setting/${uuid}`, payload)
      if (res.success && res.data) {
        const idx = this.items.findIndex(i => i.uuid === uuid)
        if (idx !== -1) this.items[idx] = res.data as any
        if (res.data.slug) this.bySlug[res.data.slug] = res.data as any
        return res.data
      }
      throw new Error(res.message)
    },

    async create(payload: Partial<GlobalSetting>) {
      const api = useApi()
      const res = await api.post<GlobalSetting>('/global-setting', payload)
      if (res.success && res.data) {
        this.items.unshift(res.data as any)
        if (res.data.slug) this.bySlug[res.data.slug] = res.data as any
        return res.data
      }
      throw new Error(res.message)
    },

    async remove(uuid: string) {
      const api = useApi()
      const res = await api.delete(`/global-setting/${uuid}`)
      if (res.success) {
        this.items = this.items.filter(i => i.uuid !== uuid)
        // Reconstruire bySlug
        const next: Record<string, any> = {}
        this.items.forEach(i => { if (i.slug) next[i.slug] = i })
        this.bySlug = next
        return true
      }
      throw new Error(res.message)
    },
  },
})

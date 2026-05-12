import { defineStore } from 'pinia'
import { usePublicApi } from '~/composables/usePublicApi'
import { useApi } from '~/composables/useApi'

function unwrap<D>(raw: unknown): D | null {
  if (raw == null) return null
  if (typeof raw !== 'object') return null
  const inner = (raw as Record<string, unknown>).data
  if (inner && typeof inner === 'object') {
    return inner as D
  }
  return raw as D
}

export const useSiteStaticPagesStore = defineStore('siteStaticPages', {
  state: () => ({
    publicPages: {} as Record<string, Record<string, unknown>>,
    publicLoaded: false,
    publicFailed: false,
    adminPages: {} as Record<string, Record<string, unknown>>,
    adminEditableCodes: [] as string[],
    adminLoading: false
  }),

  getters: {
    contactPayload(state): Record<string, unknown> {
      return state.publicPages.contact_us ?? {}
    },
    aboutPayload(state): Record<string, unknown> {
      return state.publicPages.about_us ?? {}
    }
  },

  actions: {
    async fetchPublic(): Promise<void> {
      const api = usePublicApi()
      const res = await api.get<{ pages?: Record<string, Record<string, unknown>> }>(
        '/site-static-pages/public'
      )
      this.publicLoaded = true
      const body = unwrap<{ pages?: Record<string, Record<string, unknown>> }>(res.data) ?? res.data
      const pages = body?.pages
      if (res.success && pages && typeof pages === 'object') {
        this.publicPages = pages
        this.publicFailed = false
      } else {
        this.publicPages = {}
        this.publicFailed = true
      }
    },

    async fetchAdminBundle(): Promise<void> {
      this.adminLoading = true
      try {
        const api = useApi()
        const res = await api.get<{
          pages?: Record<string, Record<string, unknown>>
          editable_codes?: string[]
        }>('/site-static-pages/admin/bundle')
        const body = unwrap(res.data) ?? res.data
        if (res.success && body?.pages && typeof body.pages === 'object') {
          this.adminPages = body.pages
          this.adminEditableCodes = body.editable_codes ?? ['about_us', 'contact_us']
        } else {
          this.adminPages = {}
          this.adminEditableCodes = ['about_us', 'contact_us']
        }
      } finally {
        this.adminLoading = false
      }
    },

    async savePage(pageCode: string, payload: Record<string, unknown>): Promise<void> {
      const api = useApi()
      const res = await api.post<{ page_code?: string }>(`/site-static-pages/${pageCode}`, {
        payload
      })
      if (!res.success) throw new Error((res.message as string) || 'Erreur sauvegarde')
      await this.fetchAdminBundle()
      await this.fetchPublic()
    }
  }
})

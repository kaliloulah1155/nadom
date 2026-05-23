import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface FooterPlatformsMap {
  [code: string]: { label: string; icon: string }
}

export interface FooterSocialDto {
  id: string
  platform_code: string
  url: string
  display_order?: number
  is_active?: boolean
  label?: string
  icon_class?: string
}

export interface FooterContactDto {
  id: string
  kind: string
  body_fr: string | null
  body_en: string | null
  body_zh: string | null
  display_order?: number
  is_active?: boolean
}

export interface FooterBundle {
  settings: {
    about_fr: string | null
    about_en: string | null
    about_zh: string | null
  }
  platforms?: FooterPlatformsMap
  socials: FooterSocialDto[]
  contacts: FooterContactDto[]
}

function unwrap<D>(raw: unknown): D | null {
  if (raw == null) return null
  if (typeof raw !== 'object') return null
  const inner = (raw as Record<string, unknown>).data
  if (inner && typeof inner === 'object') {
    return inner as D
  }
  return raw as D
}

export const useSiteFooterStore = defineStore('siteFooter', {
  state: () => ({
    publicLoaded: false,
    publicFailed: false,
    publicPayload: null as FooterBundle | null,
    adminBundle: null as FooterBundle | null,
    adminLoading: false
  }),

  getters: {
    activeSocials: (state) => state.publicPayload?.socials ?? [],
    activeContacts: (state) => state.publicPayload?.contacts ?? [],
    footerSettings: (state) => state.publicPayload?.settings
  },

  actions: {
    async fetchPublic(): Promise<void> {
      const api = usePublicApi()
      const res = await api.get<FooterBundle>('/footer/public')
      this.publicLoaded = true
      const bundle = unwrap<FooterBundle>(res.data)
      if (res.success && bundle?.settings !== undefined && Array.isArray(bundle.socials) && Array.isArray(bundle.contacts)) {
        this.publicPayload = bundle
        this.publicFailed = false
      } else {
        this.publicPayload = null
        this.publicFailed = true
      }
    },

    async fetchAdminBundle(): Promise<void> {
      this.adminLoading = true
      try {
        const api = useApi()
        const res = await api.get<FooterBundle>('/footer/admin/bundle')
        const bundle = unwrap<FooterBundle>(res.data)
        if (res.success && bundle) this.adminBundle = bundle
        else this.adminBundle = null
      } finally {
        this.adminLoading = false
      }
    },

    async saveSettings(payload: { about_fr?: string | null; about_en?: string | null; about_zh?: string | null }) {
      const api = useApi()
      // POST : certains environnements vident le corps des requêtes PUT.
      const res = await api.post<{ about_fr?: string | null; about_en?: string | null; about_zh?: string | null }>('/footer/settings', payload)
      if (!res.success) throw new Error(res.message || 'Erreur sauvegarde')
      await this.fetchAdminBundle()
      await this.fetchPublic()
    },

    async createSocial(payload: Record<string, unknown>) {
      const api = useApi()
      const res = await api.post<FooterSocialDto>('/footer/social-links', payload)
      if (!res.success) throw new Error(res.message || 'Erreur création')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return res.data
    },

    async updateSocial(id: string, payload: Record<string, unknown>) {
      const api = useApi()
      const res = await api.post<FooterSocialDto>(`/footer/social-links/${id}`, payload)
      if (!res.success) throw new Error(res.message || 'Erreur mise à jour')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return res.data
    },

    async deleteSocial(id: string) {
      const api = useApi()
      const res = await api.delete(`/footer/social-links/${id}`)
      if (!res.success) throw new Error(res.message || 'Erreur suppression')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return true
    },

    async createContact(payload: Record<string, unknown>) {
      const api = useApi()
      const res = await api.post<FooterContactDto>('/footer/contact-entries', payload)
      if (!res.success) throw new Error(res.message || 'Erreur création')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return res.data
    },

    async updateContact(id: string, payload: Record<string, unknown>) {
      const api = useApi()
      const res = await api.post<FooterContactDto>(`/footer/contact-entries/${id}`, payload)
      if (!res.success) throw new Error(res.message || 'Erreur mise à jour')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return res.data
    },

    async deleteContact(id: string) {
      const api = useApi()
      const res = await api.delete(`/footer/contact-entries/${id}`)
      if (!res.success) throw new Error(res.message || 'Erreur suppression')
      await this.fetchAdminBundle()
      await this.fetchPublic()
      return true
    }
  }
})

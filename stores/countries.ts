import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface City {
  id: number
  uuid: string
  label: string
  code?: string
  country_id?: number
  status?: number
}

export interface Country {
  id: number
  uuid: string
  label: string
  code: string
  name_fr?: string
  name_en?: string
  name_zh?: string
  phone_code?: string
  /** ISO 4217 (colonne DB `currency_code`) */
  currency_code?: string | null
  continent?: string | null
  flag_emoji?: string | null
  sort_order?: number
  status?: number
  cities?: City[]
}

interface CountriesState {
  countries: Country[]
  loading: boolean
  loaded: boolean
  error: string | null
  citiesByCountry: Record<string, City[]>
}

export const useCountriesStore = defineStore('countries', {
  state: (): CountriesState => ({
    countries: [],
    loading: false,
    loaded: false,
    error: null,
    citiesByCountry: {}
  }),

  getters: {
    activeCountries: (state) =>
      state.countries
        .filter((c: any) => {
          const s = c.status
          return s == null || s === 1 || s === '1' || Number(s) === 1
        })
        // Tri alphabétique demandé par la cliente, à la place de l'ordre curaté
        // `sort_order`. `localeCompare` en français pour que les accents se classent
        // correctement (Bénin avant Burkina Faso, Égypte parmi les E).
        .sort((a, b) => (a.label || '').localeCompare(b.label || '', 'fr', { sensitivity: 'base' })),

    getByUuid: (state) => (uuid: string) =>
      state.countries.find(c => c.uuid === uuid),

    getByCode: (state) => (code: string) =>
      state.countries.find(c => c.code?.toLowerCase() === code.toLowerCase()),

    getByLabel: (state) => (label: string) =>
      state.countries.find(c => c.label?.toLowerCase() === label.toLowerCase()),

    /** Code ISO alpha-2 pour un libellé affiché sur une destination (name_fr / name_en / label). */
    iso3166FromCountryField: (state) => (displayName: string | null | undefined) => {
      const n = (displayName || '').trim().toLowerCase()
      if (!n) return ''
      const hit = state.countries.find(
        c =>
          (c.name_fr && c.name_fr.toLowerCase() === n) ||
          (c.name_en && c.name_en.toLowerCase() === n) ||
          (c.label && c.label.toLowerCase() === n)
      )
      return (hit?.code || '').trim()
    },
  },

  actions: {
    async fetchAll(force = false) {
      if (this.loaded && !force) return this.countries
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const res = await api.get<Country[]>('/country/all')
        if (res.success && res.data) {
          this.countries = res.data
          this.loaded = true
        } else {
          this.error = res.message
        }
        return this.countries
      } catch (err: any) {
        this.error = err?.message || 'Erreur lors du chargement des pays'
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchCities(countryUuid: string) {
      if (this.citiesByCountry[countryUuid]) return this.citiesByCountry[countryUuid]
      try {
        const api = useApi()
        const res = await api.get<City[]>(`/country/${countryUuid}/cities`)
        if (res.success && res.data) {
          this.citiesByCountry[countryUuid] = res.data
          return res.data
        }
      } catch (err) {
        // ignore
      }
      this.citiesByCountry[countryUuid] = []
      return []
    }
  }
})

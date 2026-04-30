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
  phone_code?: string
  currency?: string
  continent?: string
  flag_emoji?: string
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
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.label || '').localeCompare(b.label || '')),

    getByUuid: (state) => (uuid: string) =>
      state.countries.find(c => c.uuid === uuid),

    getByCode: (state) => (code: string) =>
      state.countries.find(c => c.code?.toLowerCase() === code.toLowerCase()),

    getByLabel: (state) => (label: string) =>
      state.countries.find(c => c.label?.toLowerCase() === label.toLowerCase())
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

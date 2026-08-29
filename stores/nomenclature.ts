import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface PackageShipment {
  id: string
  tracking_number: string
  status: string
  destination_country: string | null
  destination_city: string | null
  weight: number | string | null
  request_id: string | null
  /** Conteneur (BL) du colis. Rattachement propre à chaque colis : un conteneur
   *  peut embarquer des envois de journées — donc de packages — différentes. */
  container_id?: string | null
  container?: { id: string; code: string } | null
}

export interface Package {
  id: string
  code: string
  package_date: string
  status: 'open' | 'closed' | 'shipped'
  container_id: string | null
  shipments_count?: number
  container?: Container | null
  shipments?: PackageShipment[]
}

export interface Container {
  id: string
  code: string
  container_number: number
  lot_number: number
  status: 'loading' | 'in_transit' | 'arrived'
  etd: string | null
  eta: string | null
  packages_count?: number
  packages?: Package[]
  /** Colis rattachés directement au BL — sa composition réelle. */
  shipments_count?: number
  shipments?: (PackageShipment & { package?: { id: string; code: string } | null })[]
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 15): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

function applyPaginator<T>(res: any, items: T[], meta: Meta) {
  const d = res.data
  if (d && typeof d === 'object' && Array.isArray(d.data)) {
    items.splice(0, items.length, ...d.data)
    meta.total = d.total ?? d.data.length
    meta.currentPage = d.current_page ?? meta.currentPage
    meta.perPage = d.per_page ?? meta.perPage
    meta.lastPage = d.last_page ?? 1
  } else {
    items.splice(0, items.length)
    meta.total = 0
    meta.lastPage = 1
  }
}

export const useNomenclatureStore = defineStore('nomenclature', {
  state: () => ({
    packages: [] as Package[],
    packagesMeta: newMeta(),
    containers: [] as Container[],
    containersMeta: newMeta(),
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPackages(params: { page?: number; limit?: number; status?: string; unassigned?: boolean } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.packagesMeta.currentPage
        const limit = params.limit ?? this.packagesMeta.perPage
        const body: Record<string, any> = { page, limit }
        if (params.status) body.status = params.status
        if (params.unassigned) body.unassigned = true

        const res = await api.post<any>('/packages/all', body, { query: { page, limit } })
        if (res.success) {
          applyPaginator(res, this.packages, this.packagesMeta)
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des packages'
      } finally {
        this.loading = false
      }
    },

    async fetchContainers(params: { page?: number; limit?: number; status?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.containersMeta.currentPage
        const limit = params.limit ?? this.containersMeta.perPage
        const body: Record<string, any> = { page, limit }
        if (params.status) body.status = params.status

        const res = await api.post<any>('/containers/all', body, { query: { page, limit } })
        if (res.success) {
          applyPaginator(res, this.containers, this.containersMeta)
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des conteneurs'
      } finally {
        this.loading = false
      }
    },

    async fetchContainerById(id: string): Promise<Container | null> {
      const api = useApi()
      const res = await api.get<Container>(`/containers/${id}`)
      if (res.success && res.data) {
        const idx = this.containers.findIndex(c => c.id === id)
        if (idx !== -1) this.containers[idx] = res.data
        return res.data
      }
      return null
    },

    async fetchPackageById(id: string): Promise<Package | null> {
      const api = useApi()
      const res = await api.get<Package>(`/packages/${id}`)
      if (res.success && res.data) {
        const idx = this.packages.findIndex(p => p.id === id)
        if (idx !== -1) this.packages[idx] = { ...this.packages[idx], ...res.data }
        return res.data
      }
      return null
    },

    /** Crée un nouveau conteneur (ou un nouveau lot si containerNumber est fourni). */
    async createContainer(containerNumber?: number | null): Promise<Container | null> {
      const api = useApi()
      const res = await api.post<Container>('/containers', { container_number: containerNumber ?? null })
      if (res.success && res.data) {
        this.containers.unshift(res.data)
        this.containersMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateContainer(id: string, updates: Partial<Pick<Container, 'status' | 'etd' | 'eta' | 'container_number' | 'lot_number'>>): Promise<Container | null> {
      const api = useApi()
      const res = await api.put<Container>(`/containers/${id}`, updates)
      if (res.success && res.data) {
        const idx = this.containers.findIndex(c => c.id === id)
        if (idx !== -1) this.containers[idx] = res.data
        return res.data
      }
      return null
    },

    /** Assigne un Package (jour) à un Conteneur — "constitution du BL". */
    async assignPackage(containerId: string, packageId: string): Promise<Container | null> {
      const api = useApi()
      const res = await api.put<Container>(`/containers/${containerId}/assign-package`, { package_id: packageId })
      if (res.success && res.data) {
        const idx = this.containers.findIndex(c => c.id === containerId)
        if (idx !== -1) this.containers[idx] = res.data
        // Met à jour le package localement (rattaché au conteneur, statut closed)
        const pkgIdx = this.packages.findIndex(p => p.id === packageId)
        if (pkgIdx !== -1) {
          this.packages[pkgIdx] = { ...this.packages[pkgIdx], container_id: containerId, status: 'closed' }
        }
        return res.data
      }
      throw new Error(res.message)
    },

    /** Retire un Package de son conteneur (annule l'assignation). */
    async unassignPackage(containerId: string, packageId: string): Promise<void> {
      const api = useApi()
      const res = await api.delete<Container>(`/containers/${containerId}/packages/${packageId}`)
      if (!res.success) throw new Error(res.message)
      const idx = this.containers.findIndex(c => c.id === containerId)
      if (idx !== -1 && res.data) this.containers[idx] = res.data
      const pkgIdx = this.packages.findIndex(p => p.id === packageId)
      if (pkgIdx !== -1) {
        this.packages[pkgIdx] = { ...this.packages[pkgIdx], container_id: null, status: 'open' }
      }
    },

    /**
     * Rattache un colis à un conteneur, ou l'en détache si `containerId` est
     * vide. L'affectation se décide colis par colis : deux envois de dates
     * différentes peuvent partir dans le même BL.
     */
    async setShipmentContainer(
      shipmentId: string,
      containerId: string | null,
      ancienContainerId?: string | null,
    ): Promise<void> {
      const api = useApi()
      if (containerId) {
        const res = await api.put(`/containers/${containerId}/assign-shipment`, { shipment_id: shipmentId })
        if (!res.success) throw new Error(res.message)
      } else {
        if (!ancienContainerId) return
        const res = await api.delete(`/containers/${ancienContainerId}/shipments/${shipmentId}`)
        if (!res.success) throw new Error(res.message)
      }
    },

    async deleteContainer(id: string): Promise<void> {
      const api = useApi()
      const res = await api.delete<null>(`/containers/${id}`)
      if (!res.success) throw new Error(res.message)
      this.containers = this.containers.filter(c => c.id !== id)
      this.containersMeta.total = Math.max(0, this.containersMeta.total - 1)
    },

    async deletePackage(id: string): Promise<void> {
      const api = useApi()
      const res = await api.delete<null>(`/packages/${id}`)
      if (!res.success) throw new Error(res.message)
      this.packages = this.packages.filter(p => p.id !== id)
      this.packagesMeta.total = Math.max(0, this.packagesMeta.total - 1)
    },
  },
})

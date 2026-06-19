import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'
import { usePersonalShoppingStore } from './personalShopping'

export type ShippingMode = 'air_normal' | 'air_express' | 'sea'
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'in_customs' | 'out_for_delivery' | 'delivered'

export interface TimelineEvent {
  id: string | number
  date?: string
  sdate?: string
  status: string
  location: string
  description: string
}

export interface Shipment {
  id: number
  tracking_number: string
  user_id: number
  request_id: number | null
  destination_country: string | null
  destination_city: string | null
  shipping_mode: ShippingMode
  status: ShipmentStatus
  weight: number | null
  dimensions: string | null
  declared_value: number | null
  shipping_cost: number | null
  current_location: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  timeline: TimelineEvent[]
  created_at?: string
  updated_at?: string
}

export interface ShippingModeInfo {
  mode: ShippingMode
  duration: string
  costPerKg: number
}

export interface ShippingCalculateResult {
  destination?: Record<string, unknown> | null
  mode: string
  duration?: string | null
  cost_per_kg: number
  weight: number
  cost: number
  /** ISO 4217 — renvoyé par l’API selon la destination */
  currency_code?: string
}

export interface Destination {
  id: string
  country: string | null
  continent: string | null
  city: string | null
  flag: string | null
  /** ISO 4217 — défini en back-office par destination */
  currency_code?: string | null
  is_active: boolean
  shipping_modes: ShippingModeInfo[]
  created_at?: string
  updated_at?: string
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 15): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface ShippingState {
  shipments: Shipment[]
  shipmentsMeta: Meta
  destinations: Destination[]
  loading: boolean
  loadingDestinations: boolean
  error: string | null
}

function applyPaginator<T>(res: any, items: T[], meta: Meta) {
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

export const useShippingStore = defineStore('shipping', {
  state: (): ShippingState => ({
    shipments: [],
    shipmentsMeta: newMeta(10),
    destinations: [],
    loading: false,
    loadingDestinations: false,
    error: null
  }),

  getters: {
    getShipmentByTracking: (state) => (tracking: string) =>
      state.shipments.find(s => s.tracking_number === tracking),
    getShipmentById: (state) => (id: string | number) => state.shipments.find(s => String(s.id) === String(id)),
    getShipmentsByUser: (state) => (userId: number) => state.shipments.filter(s => s.user_id === userId),
    getShipmentsByStatus: (state) => (status: ShipmentStatus) => state.shipments.filter(s => s.status === status),
    getInTransitShipments: (state) => state.shipments.filter(s =>
      ['picked_up', 'in_transit', 'in_customs', 'out_for_delivery'].includes(s.status)
    ),
    getDestinationByCountry: (state) => (country: string) => state.destinations.find(d => d.country === country),
    getShippingModesByDestinationId: (state) => (destinationId: string) => {
      const dest = state.destinations.find(d => String(d.id) === String(destinationId))
      return ((dest as any)?.shipping_modes || (dest as any)?.shippingModes || []) as ShippingModeInfo[]
    },
    totalShipments: (state) => state.shipmentsMeta.total,
    getShippingModeLabel: () => (mode: ShippingMode) => {
      const labels: Record<ShippingMode, string> = {
        'air_normal': 'Fret Aérien Standard',
        'air_express': 'Fret Aérien Express',
        'sea': 'Fret Maritime'
      }
      return labels[mode] || mode
    },
    getStatusLabel: () => (status: ShipmentStatus) => {
      const labels: Record<ShipmentStatus, string> = {
        'pending': 'En attente',
        'picked_up': 'Collecté',
        'in_transit': 'En transit',
        'in_customs': 'En douane',
        'out_for_delivery': 'En livraison',
        'delivered': 'Livré'
      }
      return labels[status] || status
    }
  },

  actions: {
    async fetchShipments(params: {
      page?: number
      limit?: number
      status?: string
      shipping_mode?: string
      tracking_number?: string
      user_id?: number
    } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.status || params.shipping_mode || params.tracking_number || params.user_id !== undefined
        if (hasPaging) {
          const page = params.page ?? this.shipmentsMeta.currentPage
          const limit = params.limit ?? this.shipmentsMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.status) body.status = params.status
          if (params.shipping_mode) body.shipping_mode = params.shipping_mode
          if (params.tracking_number) body.tracking_number = params.tracking_number
          if (params.user_id) body.user_id = params.user_id

          const res = await api.post<any>('/shipments/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.shipments, this.shipmentsMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Shipment[]>('/shipments/all')
          if (res.success) {
            this.shipments = res.data || []
            this.shipmentsMeta.total = this.shipments.length
            this.shipmentsMeta.lastPage = 1
            this.shipmentsMeta.currentPage = 1
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des colis'
      } finally {
        this.loading = false
      }
    },

    async fetchDestinations() {
      this.loadingDestinations = true
      try {
        const api = useApi()
        const res = await api.get<Destination[]>('/destinations/all')
        if (res.success) {
          const list = (res.data || []).map((d: any) => {
            const modes = (d.shipping_modes || d.shippingModes || []).map((m: any) => ({
              ...m,
              mode: m.mode,
              duration: m.duration,
              costPerKg: Number(m.cost_per_kg ?? m.costPerKg) || 0,
              cost_per_kg: Number(m.cost_per_kg ?? m.costPerKg) || 0
            }))
            return {
              ...d,
              currency_code: d.currency_code != null && d.currency_code !== '' ? String(d.currency_code).toUpperCase() : null,
              shippingModes: modes,
              shipping_modes: modes,
            }
          })
          this.destinations = list
        }
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loadingDestinations = false
      }
      return this.destinations
    },

    /**
     * Tarif expedition aligne sur POST /api/shipping/calculate (source de verite backend).
     */
    async calculateShippingQuote(payload: {
      destination_id: string
      mode: ShippingMode
      weight: number
      declared_value?: number | null
    }) {
      const api = usePublicApi()
      const body: Record<string, unknown> = {
        destination_id: payload.destination_id,
        mode: payload.mode,
        weight: payload.weight,
      }
      if (payload.declared_value != null && payload.declared_value !== undefined) {
        body.declared_value = payload.declared_value
      }
      return api.post<ShippingCalculateResult>('/shipping/calculate', body)
    },

    calculateShippingCost(destination: string, weight: number, mode: ShippingMode): number {
      const dest = this.destinations.find(d => d.country === destination)
      if (!dest) return 0
      const list: any[] = (dest as any).shipping_modes || (dest as any).shippingModes || []
      const shippingMode = list.find((m: any) => m.mode === mode)
      const cost = Number(shippingMode?.cost_per_kg ?? shippingMode?.costPerKg) || 0
      return cost * weight
    },

    getShippingModes(destination: string): ShippingModeInfo[] {
      const dest = this.destinations.find(d => d.country === destination)
      return ((dest as any)?.shipping_modes || (dest as any)?.shippingModes || []) as ShippingModeInfo[]
    },

    async createShipment(shipmentData: Partial<Shipment> & Record<string, any>) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.post<Shipment>('/shipments', shipmentData)
        if (res.success && res.data) {
          this.shipments.unshift(res.data)
          this.shipmentsMeta.total++

          const requestId = (shipmentData as any).request_id ?? (shipmentData as any).requestId
          if (requestId) {
            const psStore = usePersonalShoppingStore()
            const created: any = res.data
            await psStore.updateRequest(requestId, {
              status: 'shipped',
              trackingNumber: created.tracking_number || created.trackingNumber,
              shipmentId: created.id,
            } as any)
          }

          return res.data
        }
        throw new Error(res.message)
      } finally {
        this.loading = false
      }
    },

    async updateShipment(id: string, updates: Partial<Shipment> & Record<string, any>) {
      const api = useApi()
      const res = await api.put<Shipment>(`/shipments/${id}`, updates)
      if (res.success && res.data) {
        const idx = this.shipments.findIndex(s => String(s.id) === String(id))
        if (idx !== -1) this.shipments[idx] = res.data
        const requestId = (updates as any).request_id ?? (updates as any).requestId
        if (requestId) {
          const psStore = usePersonalShoppingStore()
          const updated: any = res.data
          await psStore.updateRequest(requestId, {
            shipmentId: updated.id,
            trackingNumber: updated.tracking_number || updated.trackingNumber,
          } as any)
        }
        return res.data
      }
      return null
    },

    async updateShipmentStatus(id: string, status: ShipmentStatus, location: string, description: string) {
      const api = useApi()
      const res = await api.put<Shipment>(`/shipments/${id}/status`, { status, location, description })
      if (res.success && res.data) {
        const idx = this.shipments.findIndex(s => String(s.id) === String(id))
        if (idx !== -1) this.shipments[idx] = res.data
        return res.data
      }
      return null
    },

    async fetchShipmentById(id: string) {
      const api = useApi()
      const res = await api.get<Shipment>(`/shipments/${id}`)
      if (res.success && res.data) {
        const idx = this.shipments.findIndex(s => String(s.id) === String(id))
        if (idx !== -1) {
          this.shipments[idx] = res.data
        } else {
          this.shipments.unshift(res.data)
        }
        return res.data
      }
      return null
    },

    async updateTimelineEvent(id: string, shipmentId: string, eventData: Partial<TimelineEvent>) {
      const api = useApi()
      const res = await api.put<any>(`/shipment-timeline/${id}`, eventData)
      if (res.success) {
        await this.fetchShipmentById(shipmentId)
        return true
      }
      return false
    },

    async deleteTimelineEvent(id: string, shipmentId: string) {
      const api = useApi()
      const res = await api.delete(`/shipment-timeline/${id}`)
      if (res.success) {
        await this.fetchShipmentById(shipmentId)
        return true
      }
      return false
    },

    async trackShipment(trackingNumber: string) {
      const api = useApi()
      const res = await api.get<Shipment>(`/shipments/track/${trackingNumber}`)
      return res.success ? res.data : null
    },

    getShipmentsStats() {
      return {
        total: this.shipmentsMeta.total,
        pending: this.shipments.filter(s => s.status === 'pending').length,
        inTransit: this.getInTransitShipments.length,
        delivered: this.shipments.filter(s => s.status === 'delivered').length
      }
    }
  }
})

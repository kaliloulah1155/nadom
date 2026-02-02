import { defineStore } from 'pinia'
import { FAKE_SHIPMENTS, FAKE_DESTINATIONS } from '~/utils/data/fakeData'

export type ShippingMode = 'air_normal' | 'air_express' | 'sea'
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'in_customs' | 'out_for_delivery' | 'delivered'

export interface TimelineEvent {
  date: string
  status: string
  location: string
  description: string
}

export interface Shipment {
  id: string
  trackingNumber: string
  userId: string
  requestId?: string
  destinationCountry: string
  destinationCity: string
  shippingMode: ShippingMode
  status: ShipmentStatus
  weight: number
  dimensions: string
  declaredValue: number
  shippingCost: number
  timeline: TimelineEvent[]
  currentLocation: string
  estimatedDelivery: string
  actualDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface ShippingModeInfo {
  mode: ShippingMode
  duration: string
  costPerKg: number
}

export interface Destination {
  id: string
  country: string
  continent: string
  city: string
  flag: string
  shippingModes: ShippingModeInfo[]
}

interface ShippingState {
  shipments: Shipment[]
  destinations: Destination[]
  loading: boolean
  error: string | null
}

export const useShippingStore = defineStore('shipping', {
  state: (): ShippingState => ({
    shipments: [],
    destinations: [],
    loading: false,
    error: null
  }),

  getters: {
    getShipmentByTracking: (state) => (tracking: string) => {
      return state.shipments.find(s => s.trackingNumber === tracking)
    },

    getShipmentById: (state) => (id: string) => {
      return state.shipments.find(s => s.id === id)
    },

    getShipmentsByUser: (state) => (userId: string) => {
      return state.shipments.filter(s => s.userId === userId)
    },

    getShipmentsByStatus: (state) => (status: ShipmentStatus) => {
      return state.shipments.filter(s => s.status === status)
    },

    getInTransitShipments: (state) => {
      return state.shipments.filter(s =>
        ['picked_up', 'in_transit', 'in_customs', 'out_for_delivery'].includes(s.status)
      )
    },

    getDestinationByCountry: (state) => (country: string) => {
      return state.destinations.find(d => d.country === country)
    },

    totalShipments: (state) => state.shipments.length,

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
    async fetchShipments() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('shipments')
          this.shipments = saved ? JSON.parse(saved) : [...FAKE_SHIPMENTS]
        } else {
          this.shipments = [...FAKE_SHIPMENTS]
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement des colis'
      } finally {
        this.loading = false
      }
    },

    async fetchDestinations() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('destinations')
        this.destinations = saved ? JSON.parse(saved) : (FAKE_DESTINATIONS as Destination[])
      } else {
        this.destinations = FAKE_DESTINATIONS as Destination[]
      }
      return this.destinations
    },

    calculateShippingCost(destination: string, weight: number, mode: ShippingMode): number {
      const dest = this.destinations.find(d => d.country === destination)
      if (!dest) return 0

      const shippingMode = dest.shippingModes.find(m => m.mode === mode)
      if (!shippingMode) return 0

      return shippingMode.costPerKg * weight
    },

    getShippingModes(destination: string): ShippingModeInfo[] {
      const dest = this.destinations.find(d => d.country === destination)
      return dest?.shippingModes || []
    },

    async createShipment(shipmentData: Partial<Shipment>) {
      this.loading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const trackingNumber = `TRK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

        const newShipment: Shipment = {
          id: `ship_${Date.now()}`,
          trackingNumber,
          userId: shipmentData.userId || '',
          requestId: shipmentData.requestId,
          destinationCountry: shipmentData.destinationCountry || '',
          destinationCity: shipmentData.destinationCity || '',
          shippingMode: shipmentData.shippingMode || 'air_normal',
          status: 'pending',
          weight: shipmentData.weight || 0,
          dimensions: shipmentData.dimensions || '',
          declaredValue: shipmentData.declaredValue || 0,
          shippingCost: shipmentData.shippingCost || 0,
          timeline: [{
            date: new Date().toISOString(),
            status: 'order_placed',
            location: 'Guangzhou, Chine',
            description: 'Commande créée'
          }],
          currentLocation: 'Entrepôt Guangzhou',
          estimatedDelivery: this.calculateEstimatedDelivery(shipmentData.shippingMode || 'air_normal'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.shipments.unshift(newShipment)
        this.saveToLocalStorage()

        return newShipment
      } finally {
        this.loading = false
      }
    },

    async updateShipmentStatus(id: string, status: ShipmentStatus, location: string, description: string) {
      const shipment = this.shipments.find(s => s.id === id)

      if (shipment) {
        shipment.status = status
        shipment.currentLocation = location
        shipment.timeline.push({
          date: new Date().toISOString(),
          status,
          location,
          description
        })
        shipment.updatedAt = new Date().toISOString()

        if (status === 'delivered') {
          shipment.actualDelivery = new Date().toISOString().split('T')[0]
        }

        this.saveToLocalStorage()
        return shipment
      }

      return null
    },

    async trackShipment(trackingNumber: string) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return this.getShipmentByTracking(trackingNumber)
    },

    calculateEstimatedDelivery(mode: ShippingMode): string {
      const today = new Date()
      let daysToAdd = 15

      switch (mode) {
        case 'air_express':
          daysToAdd = 5
          break
        case 'air_normal':
          daysToAdd = 18
          break
        case 'sea':
          daysToAdd = 45
          break
      }

      today.setDate(today.getDate() + daysToAdd)
      return today.toISOString().split('T')[0]
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shipments', JSON.stringify(this.shipments))
      }
    },

    getShipmentsStats() {
      return {
        total: this.shipments.length,
        pending: this.shipments.filter(s => s.status === 'pending').length,
        inTransit: this.getInTransitShipments.length,
        delivered: this.shipments.filter(s => s.status === 'delivered').length
      }
    }
  }
})

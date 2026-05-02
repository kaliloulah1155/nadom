import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export type RequestStatus = 'pending' | 'searching' | 'negotiating' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'

export interface QuotedDetails {
  productCost: number
  serviceFee: number
  inspectionFee: number
  packagingFee: number
  shippingCost: number
  totalPrice: number
}

export interface RequestItem {
  productId: string
  name_fr: string
  name_en: string
  price: number
  quantity: number
  image: string
}

export interface PersonalShoppingRequest {
  id: string
  userId: string
  user?: {
    id?: number | string
    firstname?: string
    lastname?: string
    phone?: string
    email?: string
  }
  contactNumber?: string
  contactFullname?: string
  contactEmail?: string
  status: RequestStatus
  category: string
  title: string
  description: string
  images: string[]
  items?: RequestItem[]
  budgetEstimated: number
  currency?: string
  quantity: number
  quotedPrice?: number
  quotedDetails?: QuotedDetails
  assignedAgent?: string
  whatsappMessages: number
  trackingNumber?: string
  shipmentId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  uuid: string
  label: string
  status: string
  slug: string
  code: string | null
  description?: string | null
  icon?: string | null
  sort_order: number | null
  parent_id: number | null
  created_by: string | null
  updated_by: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: number
  category_id: string | null
  name_fr: string | null
  name_en: string | null
  description_fr: string | null
  description_en: string | null
  price: number
  currency?: string
  image: string | null
  is_active: boolean
  stock_status: 'in_stock' | 'out_of_stock' | 'on_demand'
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

interface PersonalShoppingState {
  requests: PersonalShoppingRequest[]
  requestsMeta: Meta
  categories: Category[]
  categoriesMeta: Meta
  products: Product[]
  productsMeta: Meta
  loading: boolean
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

// Normalise un request raw (snake_case backend) en exposant les alias camelCase
// Force Number() pour les decimaux (Laravel `decimal:2` renvoie une string).
function toNum(v: any): number {
  if (v == null || v === '') return 0
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeItem(item: any): RequestItem {
  const prod = item.product ?? {}
  return {
    productId: item.productId ?? item.product_id ?? prod.id,
    name_fr:   item.name_fr  ?? prod.name_fr  ?? item.name ?? '',
    name_en:   item.name_en  ?? prod.name_en  ?? item.name ?? '',
    price:     toNum(item.price ?? prod.price),
    quantity:  item.quantity ?? 1,
    image:     item.image    ?? prod.image    ?? '',
  }
}

function normalizeRequest(r: any) {
  if (!r || typeof r !== 'object') return r
  const rawDetails = r.quoted_details ?? r.quotedDetails
  return Object.assign(r, {
    userId: r.userId ?? r.user_id,
    contactNumber: r.contactNumber ?? r.contact_number,
    contactFullname: r.contactFullname ?? r.contact_fullname,
    contactEmail: r.contactEmail ?? r.contact_email,
    // budget_estimated arrive en string ("10200.00") via le cast decimal:2 Laravel
    budgetEstimated: toNum(r.budget_estimated ?? r.budgetEstimated),
    quotedPrice: r.quoted_price != null || r.quotedPrice != null
      ? toNum(r.quoted_price ?? r.quotedPrice)
      : null,
    quotedDetails: rawDetails
      ? {
          productCost: toNum(rawDetails.product_cost ?? rawDetails.productCost),
          serviceFee: toNum(rawDetails.service_fee ?? rawDetails.serviceFee),
          inspectionFee: toNum(rawDetails.inspection_fee ?? rawDetails.inspectionFee),
          packagingFee: toNum(rawDetails.packaging_fee ?? rawDetails.packagingFee),
          shippingCost: toNum(rawDetails.shipping_cost ?? rawDetails.shippingCost),
          totalPrice: toNum(rawDetails.total_price ?? rawDetails.totalPrice),
        }
      : undefined,
    items: Array.isArray(r.items) ? r.items.map(normalizeItem) : (r.items ?? []),
    trackingNumber: r.trackingNumber ?? r.tracking_number,
    shipmentId: r.shipmentId ?? r.shipment_id,
    whatsappMessages: r.whatsappMessages ?? r.whatsapp_messages ?? 0,
    createdAt: r.createdAt ?? r.created_at,
    updatedAt: r.updatedAt ?? r.updated_at,
    currency: r.currency || 'XOF',
  })
}

function normalizeRequests(list: any[]) {
  return (list || []).map(normalizeRequest)
}

export const usePersonalShoppingStore = defineStore('personalShopping', {
  state: (): PersonalShoppingState => ({
    requests: [],
    requestsMeta: newMeta(15),
    categories: [],
    categoriesMeta: newMeta(10),
    products: [],
    productsMeta: newMeta(12),
    loading: false,
    error: null
  }),

  getters: {
    getRequestById: (state) => (id: string) => state.requests.find(r => r.id === id),
    getRequestsByUser: (state) => (userId: string) => state.requests.filter(r => r.userId === userId),
    getRequestsByStatus: (state) => (status: RequestStatus) => state.requests.filter(r => r.status === status),
    getPendingRequests: (state) => state.requests.filter(r => r.status === 'pending'),
    getActiveRequests: (state) => {
      const active: RequestStatus[] = ['searching', 'negotiating', 'confirmed', 'preparing']
      return state.requests.filter(r => active.includes(r.status))
    },
    getCompletedRequests: (state) => state.requests.filter(r => r.status === 'delivered'),
    totalRequests: (state) => state.requestsMeta.total,
    totalRevenue: (state) => state.requests.reduce((t, r) => t + (r.quotedPrice || 0), 0),
    getProductsByCategory: (state) => (categoryId: string) => state.products.filter((p: any) => (p.category_id ?? p.categoryId) === categoryId),
    getProductById: (state) => (id: string | number) => state.products.find((p: any) => String(p.id) === String(id))
  },

  actions: {
    async fetchRequests(params: {
      page?: number
      limit?: number
      search?: string
      status?: string
      category?: string
      user_id?: string
      assigned_agent_id?: string
    } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.search || params.status || params.category || params.user_id || params.assigned_agent_id
        if (hasPaging) {
          const page = params.page ?? this.requestsMeta.currentPage
          const limit = params.limit ?? this.requestsMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.search) body.search = params.search
          if (params.status) body.status = params.status
          if (params.category) body.category = params.category
          if (params.user_id) body.user_id = params.user_id
          if (params.assigned_agent_id) body.assigned_agent_id = params.assigned_agent_id

          const res = await api.post<any>('/personal-shopping-requests/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.requests, this.requestsMeta)
            this.requests = normalizeRequests(this.requests)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<PersonalShoppingRequest[]>('/personal-shopping-requests/all')
          if (res.success) {
            this.requests = normalizeRequests(res.data || []) as any
            this.requestsMeta.total = this.requests.length
            this.requestsMeta.lastPage = 1
            this.requestsMeta.currentPage = 1
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des demandes'
      } finally {
        this.loading = false
      }
    },

    async fetchCategories(params: { page?: number; limit?: number; slug?: string } = {}) {
      try {
        // Use PublicApi pour les endpoints publics (pas d'authentification requise)
        const api = usePublicApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.slug !== undefined
        if (hasPaging) {
          const page = params.page ?? this.categoriesMeta.currentPage
          const limit = params.limit ?? this.categoriesMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.slug) body.slug = params.slug
          const res = await api.post<any>('/category/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.categories, this.categoriesMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Category[]>('/category/all')
          if (res.success) {
            this.categories = res.data || []
            this.categoriesMeta.total = this.categories.length
            this.categoriesMeta.lastPage = 1
            this.categoriesMeta.currentPage = 1
          }
        }
      } catch (err: any) {
        this.error = err.message
      }
      return this.categories
    },

    async addCategory(category: Partial<Category>) {
      const api = useApi()
      const res = await api.post<Category>('/category', category)
      if (res.success && res.data) {
        this.categories.unshift(res.data)
        this.categoriesMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateCategory(uuid: string, updates: Partial<Category>) {
      const api = useApi()
      const res = await api.put<Category>(`/category/${uuid}`, updates)
      if (res.success && res.data) {
        const idx = this.categories.findIndex(c => c.uuid === uuid)
        if (idx !== -1) this.categories[idx] = res.data
      }
    },

    async deleteCategory(uuid: string) {
      const api = useApi()
      const res = await api.delete(`/category/${uuid}`)
      if (res.success) {
        this.categories = this.categories.filter(c => c.uuid !== uuid)
        this.categoriesMeta.total = Math.max(0, this.categoriesMeta.total - 1)
      }
    },

    async fetchProducts(params: {
      page?: number
      limit?: number
      search?: string
      category_id?: string
    } = {}) {
      this.loading = true
      try {
        // Use PublicApi pour les endpoints publics (pas d'authentification requise)
        const api = usePublicApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.search || params.category_id
        if (hasPaging) {
          const page = params.page ?? this.productsMeta.currentPage
          const limit = params.limit ?? this.productsMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.search) body.search = params.search
          if (params.category_id) body.category_id = params.category_id
          const res = await api.post<any>('/products/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.products, this.productsMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Product[]>('/products/all')
          if (res.success) {
            this.products = res.data || []
            this.productsMeta.total = this.products.length
            this.productsMeta.lastPage = 1
            this.productsMeta.currentPage = 1
          }
        }
      } catch (err: any) {
        this.error = 'Erreur lors du chargement des produits'
      } finally {
        this.loading = false
      }
    },

    async createProduct(productData: Partial<Product>) {
      const api = useApi()
      const res = await api.post<Product>('/products', productData)
      if (res.success && res.data) {
        this.products.unshift(res.data)
        this.productsMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateProduct(id: string, updates: Partial<Product>) {
      const api = useApi()
      const res = await api.put<Product>(`/products/${id}`, updates)
      if (res.success && res.data) {
        const idx = this.products.findIndex(p => p.id === id)
        if (idx !== -1) this.products[idx] = res.data
      }
    },

    async deleteProduct(id: string) {
      const api = useApi()
      const res = await api.delete(`/products/${id}`)
      if (res.success) {
        this.products = this.products.filter(p => p.id !== id)
        this.productsMeta.total = Math.max(0, this.productsMeta.total - 1)
      }
    },

    async createRequest(requestData: Partial<PersonalShoppingRequest> & Record<string, any>) {
      this.loading = true
      this.error = null
      try {
        // Soumission publique (visiteur non connecté autorisé)
        const api = usePublicApi()
        const map: Record<string, string> = {
          budgetEstimated: 'budget_estimated',
          contactNumber: 'contact_number',
          contactFullname: 'contact_fullname',
          contactEmail: 'contact_email',
          trackingNumber: 'tracking_number',
          shipmentId: 'shipment_id',
          assignedAgentId: 'assigned_agent_id',
          quotedPrice: 'quoted_price',
          currency: 'currency'
        }
        const payload: Record<string, any> = {}
        for (const [k, v] of Object.entries(requestData)) {
          if (k === 'userId' || k === 'createdAt' || k === 'updatedAt') continue
          if (v === undefined || v === null) continue
          payload[map[k] ?? k] = v
        }
        const res = await api.post<PersonalShoppingRequest>('/personal-shopping-requests', payload)
        if (res.success && res.data) {
          const normalized = normalizeRequest(res.data) as PersonalShoppingRequest
          this.requests.unshift(normalized)
          this.requestsMeta.total++
          return normalized
        }
        throw new Error(res.message)
      } catch (err: any) {
        this.error = err.message || 'Erreur lors de la création de la demande'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateRequest(id: string, updates: Partial<PersonalShoppingRequest>) {
      const api = useApi()
      const map: Record<string, string> = {
        shipmentId: 'shipment_id',
        assignedAgentId: 'assigned_agent_id',
        budgetEstimated: 'budget_estimated',
        quotedPrice: 'quoted_price',
        contactNumber: 'contact_number',
        contactFullname: 'contact_fullname',
        contactEmail: 'contact_email',
        trackingNumber: 'tracking_number'
      }
      const payload: Record<string, any> = {}
      for (const [k, v] of Object.entries(updates as Record<string, any>)) {
        payload[map[k] ?? k] = v
      }
      const res = await api.put<PersonalShoppingRequest>(`/personal-shopping-requests/${id}`, payload)
      if (res.success && res.data) {
        const normalized = normalizeRequest(res.data) as PersonalShoppingRequest
        const idx = this.requests.findIndex(r => r.id === id)
        if (idx !== -1) this.requests[idx] = normalized
        return normalized
      }
      return null
    },

    async updateRequestStatus(id: string, status: RequestStatus) {
      const api = useApi()
      const res = await api.put<PersonalShoppingRequest>(`/personal-shopping-requests/${id}/status`, { status })
      if (res.success && res.data) {
        const normalized = normalizeRequest(res.data) as PersonalShoppingRequest
        const idx = this.requests.findIndex(r => r.id === id)
        if (idx !== -1) this.requests[idx] = normalized
        return normalized
      }
      return null
    },

    async addQuotation(id: string, quotedPrice: number, quotedDetails: QuotedDetails) {
      const api = useApi()
      const payload = {
        quoted_price: quotedPrice,
        product_cost: quotedDetails.productCost,
        service_fee: quotedDetails.serviceFee,
        inspection_fee: quotedDetails.inspectionFee,
        packaging_fee: quotedDetails.packagingFee,
        shipping_cost: quotedDetails.shippingCost
      }
      const res = await api.put<PersonalShoppingRequest>(`/personal-shopping-requests/${id}/quotation`, payload)
      if (res.success && res.data) {
        const normalized = normalizeRequest(res.data) as PersonalShoppingRequest
        const idx = this.requests.findIndex(r => r.id === id)
        if (idx !== -1) this.requests[idx] = normalized
        return normalized
      }
      return null
    },

    async assignAgent(id: string, agentId: string) {
      const api = useApi()
      const res = await api.put<PersonalShoppingRequest>(`/personal-shopping-requests/${id}/assign-agent`, { agent_id: agentId })
      if (res.success && res.data) {
        const idx = this.requests.findIndex(r => r.id === id)
        if (idx !== -1) this.requests[idx] = res.data
        return res.data
      }
      return null
    },

    async deleteRequest(id: string) {
      const api = useApi()
      const res = await api.delete(`/personal-shopping-requests/${id}`)
      if (res.success) {
        this.requests = this.requests.filter(r => r.id !== id)
        this.requestsMeta.total = Math.max(0, this.requestsMeta.total - 1)
      }
    },

    getRequestsStats() {
      const stats = {
        total: this.requests.length,
        pending: 0, searching: 0, negotiating: 0, confirmed: 0,
        preparing: 0, shipped: 0, delivered: 0, cancelled: 0
      }
      this.requests.forEach(r => { stats[r.status]++ })
      return stats
    },

    pushFromBroadcast(request: any) {
      // Normalize field names from backend
      const normalized = {
        id: request.id,
        userId: request.user_id,
        status: request.status || 'pending',
        category: request.category,
        title: request.title,
        description: request.description,
        images: request.images || [],
        items: request.items || [],
        budgetEstimated: request.budget_estimated || request.budgetEstimated,
        currency: request.currency || 'XOF',
        quantity: request.quantity,
        quotedPrice: request.quoted_price || request.quotedPrice,
        quotedDetails: request.quoted_details || request.quotedDetails,
        whatsappMessages: request.whatsapp_messages || request.whatsappMessages || 0,
        trackingNumber: request.tracking_number || request.trackingNumber,
        shipmentId: request.shipment_id || request.shipmentId,
        createdAt: request.created_at || request.createdAt,
        updatedAt: request.updated_at || request.updatedAt,
        ...request
      }
      const existing = this.requests.find(r => r.id === normalized.id)
      if (!existing) {
        this.requests.unshift(normalized)
        this.requestsMeta.total++
      }
    },

    bindRealtime() {
      const { $echo } = useNuxtApp() as any
      if (!$echo) return
      try {
        // Listen for new personal shopping requests via the admin public channel
        $echo.channel('admin-notifications').listen('.notification', (e: any) => {
          if (e.type === 'request.created' || e.meta?.request_id) {
            this.fetchRequests()
          }
        })
        // Also listen on public channel
        $echo.channel('public-notifications').listen('.notification', (e: any) => {
          if (e.type === 'request.created' || e.meta?.request_id) {
            this.fetchRequests()
          }
        })
      } catch (_) {
        // ignore subscription errors
      }
    }
  }
})

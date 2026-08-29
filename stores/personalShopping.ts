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
  /** Envoi de colis uniquement : dédouanement à destination. */
  customsFee?: number
  /** Envoi de colis uniquement : acheminement local jusqu'au destinataire. */
  localDeliveryFee?: number
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

export type RequestType = 'personal_shopping' | 'package_sending'

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
  requestType: RequestType
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
  /** Envoi de colis (Phase 1) */
  ctnCount?: number | null
  cbm?: number | null
  declaredWeight?: number | null
  declaredValue?: number | null
  destinationId?: string | null
  shippingModeId?: string | null
  destination?: Record<string, any> | null
  shippingMode?: Record<string, any> | null
  originCountry?: string | null
  originCity?: string | null
  originAddress?: string | null
  destinationAddress?: string | null
  senderFullname?: string | null
  senderNumber?: string | null
  senderEmail?: string | null
  senderType?: 'individual' | 'company' | null
  senderCompany?: string | null
  contactType?: 'individual' | 'company' | null
  contactCompany?: string | null
  packageItems?: Array<{ quantity: number; weight: number | null; length: number | null; width: number | null; height: number | null; description?: string | null; images?: string[] }> | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  uuid: string
  label: string
  label_fr?: string | null
  label_en?: string | null
  label_zh?: string | null
  status: string
  slug: string
  code: string | null
  description?: string | null
  description_fr?: string | null
  description_en?: string | null
  description_zh?: string | null
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
  /** Nombre de demandes « en attente » (badge sidebar) — indépendant de la liste paginée. */
  pendingCount: number
  categories: Category[]
  categoriesMeta: Meta
  /** Devises (catégories slug DVS) — cache dédié, chargement léger. */
  currencies: Category[]
  currenciesFetched: boolean
  currenciesLoading: boolean
  products: Product[]
  productsMeta: Meta
  loading: boolean
  error: string | null
}

/** Évite les appels API en double si le panier et le plugin préchargent en même temps. */
let currenciesFetchInFlight: Promise<Category[]> | null = null

export const DEFAULT_CART_CURRENCIES: { id: string; code: string; label: string }[] = [
  { id: 'xof', code: 'XOF', label: 'CFA (FCFA)' },
  { id: 'usd', code: 'USD', label: 'USD' },
  { id: 'eur', code: 'EUR', label: 'EUR' },
  { id: 'cny', code: 'CNY', label: 'CNY' },
]

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
  const prod = item.product ?? item.Product ?? {}
  const fromProd =
    (typeof prod.image === 'string' && prod.image.trim()) ||
    (typeof prod.image_url === 'string' && prod.image_url.trim()) ||
    (Array.isArray(prod.images) && typeof prod.images[0] === 'string' ? prod.images[0].trim() : '')
  const fromItem = typeof item.image === 'string' ? item.image.trim() : ''
  return {
    productId: item.productId ?? item.product_id ?? prod.id,
    name_fr: item.name_fr ?? prod.name_fr ?? item.name ?? '',
    name_en: item.name_en ?? prod.name_en ?? item.name ?? '',
    price: toNum(item.price ?? prod.price),
    quantity: item.quantity ?? 1,
    image: fromItem || fromProd || '',
  }
}

function normalizeRequest(r: any) {
  if (!r || typeof r !== 'object') return r
  const rawDetails = r.quoted_details ?? r.quotedDetails
  return Object.assign(r, {
    userId: r.userId ?? r.user_id,
    requestType: r.requestType ?? r.request_type ?? 'personal_shopping',
    contactNumber: r.contactNumber ?? r.contact_number,
    contactFullname: r.contactFullname ?? r.contact_fullname,
    contactEmail: r.contactEmail ?? r.contact_email,
    ctnCount: r.ctnCount ?? r.ctn_count ?? null,
    cbm: r.cbm != null ? toNum(r.cbm) : null,
    declaredWeight: r.declaredWeight ?? (r.declared_weight != null ? toNum(r.declared_weight) : null),
    declaredValue: r.declaredValue ?? (r.declared_value != null ? toNum(r.declared_value) : null),
    destinationId: r.destinationId ?? r.destination_id ?? null,
    shippingModeId: r.shippingModeId ?? r.shipping_mode_id ?? null,
    destination: r.destination ?? null,
    shippingMode: r.shippingMode ?? r.shipping_mode ?? null,
    originCountry: r.originCountry ?? r.origin_country ?? null,
    originCity: r.originCity ?? r.origin_city ?? null,
    originAddress: r.originAddress ?? r.origin_address ?? null,
    destinationAddress: r.destinationAddress ?? r.destination_address ?? null,
    senderFullname: r.senderFullname ?? r.sender_fullname ?? null,
    senderNumber: r.senderNumber ?? r.sender_number ?? null,
    senderEmail: r.senderEmail ?? r.sender_email ?? null,
    senderType: r.senderType ?? r.sender_type ?? null,
    senderCompany: r.senderCompany ?? r.sender_company ?? null,
    contactType: r.contactType ?? r.contact_type ?? null,
    contactCompany: r.contactCompany ?? r.contact_company ?? null,
    packageItems: r.packageItems ?? r.package_items ?? null,
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
          customsFee: toNum(rawDetails.customs_fee ?? rawDetails.customsFee),
          localDeliveryFee: toNum(rawDetails.local_delivery_fee ?? rawDetails.localDeliveryFee),
          totalPrice: toNum(rawDetails.total_price ?? rawDetails.totalPrice),
        }
      : undefined,
    items: Array.isArray(r.items) ? r.items.map(normalizeItem) : (r.items ?? []),
    /** Laravel peut renvoyer null ; éviter TypeError sur `images[0]` dans les vues */
    images: Array.isArray(r.images) ? r.images : [],
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
    requestsMeta: newMeta(10),
    pendingCount: 0,
    categories: [],
    categoriesMeta: newMeta(10),
    currencies: [],
    currenciesFetched: false,
    currenciesLoading: false,
    products: [],
    productsMeta: newMeta(12),
    loading: false,
    error: null
  }),

  getters: {
    getRequestById: (state) => (id: string) => state.requests.find(r => r.id === id),
    getRequestsByUser: (state) => (userId: string | number) =>
      state.requests.filter((r: any) => String(r.userId ?? r.user_id ?? '') === String(userId)),
    getRequestsByStatus: (state) => (status: RequestStatus) => state.requests.filter(r => r.status === status),
    getPendingRequests: (state) => state.requests.filter(r => r.status === 'pending'),
    getActiveRequests: (state) => {
      const active: RequestStatus[] = ['searching', 'negotiating', 'confirmed', 'preparing']
      return state.requests.filter(r => active.includes(r.status))
    },
    getCompletedRequests: (state) => state.requests.filter(r => r.status === 'delivered'),
    totalRequests: (state) => state.requestsMeta.total,
    totalRevenue: (state) => state.requests.reduce((t, r) => t + (r.quotedPrice || 0), 0),
    getProductsByCategory: (state) => (categoryId: string | number | null | undefined) => {
      const id = categoryId === null || categoryId === undefined ? '' : String(categoryId)
      return state.products.filter((p: any) => String(p.category_id ?? p.categoryId ?? '') === id)
    },
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
      request_type?: RequestType
    } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.search || params.status || params.category || params.user_id || params.assigned_agent_id || params.request_type
        if (hasPaging) {
          const page = params.page ?? this.requestsMeta.currentPage
          const limit = params.limit ?? this.requestsMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.search) body.search = params.search
          if (params.status) body.status = params.status
          if (params.category) body.category = params.category
          if (params.user_id) body.user_id = params.user_id
          if (params.assigned_agent_id) body.assigned_agent_id = params.assigned_agent_id
          if (params.request_type) body.request_type = params.request_type

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

    /**
     * Récupère UNE demande par son identifiant, directement auprès de l'API.
     *
     * Indispensable pour la fiche de détail : se contenter de chercher la demande
     * dans `this.requests` ne fonctionne que si elle figure dans la page de liste
     * actuellement chargée. Dès qu'elle est sur une autre page, qu'un filtre est
     * actif, ou que la liste n'a pas encore été chargée (accès direct à l'URL,
     * rafraîchissement), la recherche échoue et la fiche affiche à tort
     * « Demande non trouvée ».
     *
     * La demande récupérée est fusionnée dans `this.requests` pour que les vues
     * qui lisent le store y trouvent la version à jour.
     */
    async fetchRequestById(id: string) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const res = await api.get<PersonalShoppingRequest>(`/personal-shopping-requests/${id}`)
        if (res.success && res.data) {
          const normalized = normalizeRequest(res.data) as PersonalShoppingRequest
          const idx = this.requests.findIndex((r) => r.id === id)
          if (idx !== -1) this.requests[idx] = normalized
          else this.requests.push(normalized)
          return normalized
        }
        return null
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement de la demande'
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Compte les demandes « en attente » pour le badge sidebar SANS charger
     * la liste complète (évite d'écraser la liste paginée du tableau).
     * Lit uniquement le `total` du paginator filtré par statut.
     */
    async fetchPendingCount() {
      try {
        const api = useApi()
        const res = await api.post<any>(
          '/personal-shopping-requests/all',
          { page: 1, limit: 1, status: 'pending' },
          { query: { page: 1, limit: 1 } },
        )
        if (res.success) {
          const d = res.data
          this.pendingCount = (d && typeof d === 'object' && typeof d.total === 'number')
            ? d.total
            : (Array.isArray(d) ? d.length : 0)
        }
      } catch {
        /* badge non critique : on ignore les erreurs */
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

    /** Devises uniquement (GET /category/slug/DVS) — rapide, mis en cache. */
    async fetchCurrencies(force = false): Promise<Category[]> {
      if (!force && this.currenciesFetched && this.currencies.length > 0) {
        return this.currencies
      }
      if (currenciesFetchInFlight) {
        return currenciesFetchInFlight
      }

      this.currenciesLoading = true
      currenciesFetchInFlight = (async () => {
        try {
          const api = usePublicApi()
          const res = await api.get<Category[]>('/category/slug/DVS')
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            this.currencies = res.data
            this.currenciesFetched = true
          }
          return this.currencies
        } catch {
          return this.currencies
        } finally {
          this.currenciesLoading = false
          currenciesFetchInFlight = null
        }
      })()

      return currenciesFetchInFlight
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
          currency: 'currency',
          requestType: 'request_type',
          ctnCount: 'ctn_count',
          cbm: 'cbm',
          declaredWeight: 'declared_weight',
          declaredValue: 'declared_value',
          destinationId: 'destination_id',
          shippingModeId: 'shipping_mode_id',
          originCountry: 'origin_country',
          originCity: 'origin_city',
          originAddress: 'origin_address',
          destinationAddress: 'destination_address',
          senderFullname: 'sender_fullname',
          senderNumber: 'sender_number',
          senderEmail: 'sender_email',
          senderType: 'sender_type',
          senderCompany: 'sender_company',
          contactType: 'contact_type',
          contactCompany: 'contact_company',
          packageItems: 'package_items',
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
        trackingNumber: 'tracking_number',
        originCountry: 'origin_country',
        originCity: 'origin_city',
        originAddress: 'origin_address',
        destinationAddress: 'destination_address',
        senderFullname: 'sender_fullname',
        senderNumber: 'sender_number',
        senderEmail: 'sender_email',
        senderType: 'sender_type',
        senderCompany: 'sender_company',
        contactType: 'contact_type',
        contactCompany: 'contact_company',
        // Champs « Envoi de colis » : absents de cette table, ils partaient en
        // camelCase et étaient silencieusement ignorés par l'API (le DTO attend du
        // snake_case). Une correction des colis par l'agent semblait alors
        // enregistrée sans que rien ne change en base.
        requestType: 'request_type',
        ctnCount: 'ctn_count',
        declaredWeight: 'declared_weight',
        declaredValue: 'declared_value',
        destinationId: 'destination_id',
        shippingModeId: 'shipping_mode_id',
        packageItems: 'package_items',
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
        // Entrer ou sortir de « en attente » change le badge de la barre latérale.
        this.fetchPendingCount().catch(() => {})
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
        shipping_cost: quotedDetails.shippingCost,
        customs_fee: quotedDetails.customsFee,
        local_delivery_fee: quotedDetails.localDeliveryFee,
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
        // Le badge « en attente » de la barre latérale vit sur un compteur distinct :
        // sans ce rafraîchissement, il continuait d'annoncer des demandes supprimées.
        this.fetchPendingCount().catch(() => {})
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
            // Rafraîchit la page courante paginée (sans charger toute la liste)
            this.fetchRequests({ page: this.requestsMeta.currentPage, limit: this.requestsMeta.perPage })
            this.fetchPendingCount()
          }
        })
        // Also listen on public channel
        $echo.channel('public-notifications').listen('.notification', (e: any) => {
          if (e.type === 'request.created' || e.meta?.request_id) {
            // Rafraîchit la page courante paginée (sans charger toute la liste)
            this.fetchRequests({ page: this.requestsMeta.currentPage, limit: this.requestsMeta.perPage })
            this.fetchPendingCount()
          }
        })
      } catch (_) {
        // ignore subscription errors
      }
    }
  }
})

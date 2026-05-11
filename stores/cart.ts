import { defineStore } from 'pinia'
import { useApi, getToken } from '~/composables/useApi'

export interface CartProduct {
    id: string | number
    name_fr?: string | null
    name_en?: string | null
    description_fr?: string | null
    description_en?: string | null
    price: number
    image?: string | null
    is_active?: boolean
    stock_status?: 'in_stock' | 'out_of_stock' | 'on_demand'
    [key: string]: any
}

export interface CartItem {
    id?: string
    product: CartProduct
    quantity: number
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
    loading: boolean
    adding: boolean
    error: string | null
}

const LOCAL_KEY = 'nadom_cart'

export const useCartStore = defineStore('cart', {
    state: (): CartState => ({
        items: [],
        isOpen: false,
        loading: false,
        adding: false,
        error: null
    }),

    getters: {
        totalItems: (state) => state.items.reduce((t, i) => t + i.quantity, 0),
        totalPrice: (state) => state.items.reduce((t, i) => t + (i.product.price * i.quantity), 0),
        isEmpty: (state) => state.items.length === 0
    },

    actions: {
        async fetchCart() {
            if (!getToken()) {
                this.loadFromLocalStorage()
                return
            }
            this.loading = true
            try {
                const api = useApi()
                const res = await api.get<any[]>('/cart')
                if (res.success) {
                    this.items = (res.data || []).map((item: any) => ({
                        id: item.id,
                        product: item.product,
                        quantity: item.quantity
                    }))
                }
            } catch (err: any) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        async addItem(product: CartProduct | any, quantity = 1) {
            const safeProduct: CartProduct = {
                id: product.id || product.productId || product.product_id || String(Date.now()),
                name_fr: product.name_fr || product.title || '',
                name_en: product.name_en || product.title || '',
                price: Number(product.price) || 0,
                image: product.image || null,
                currency: product.currency || null,
            }

            // Étape 1 (synchrone) : pousser immédiatement dans le panier local pour que l'UI réagisse.
            // L'utilisateur voit le produit dès le clic, indépendamment de la latence API.
            const existing = this.items.find(i => String(i.product.id) === String(safeProduct.id))
            if (existing) {
                existing.quantity += quantity
            } else {
                this.items.push({ product: safeProduct, quantity })
            }
            this.saveToLocalStorage()

            // Étape 2 : si invité, on s'arrête là.
            if (!getToken()) return

            // Étape 3 : si connecté, on synchronise avec l'API en arrière-plan.
            this.adding = true
            try {
                const api = useApi()
                const res = await api.post<any>('/cart/items', {
                    product_id: safeProduct.id,
                    quantity
                })
                if (res.success && res.data) {
                    // Mettre à jour l'ID serveur et la quantité (l'API peut avoir mergé des doublons).
                    const local = this.items.find(i => String(i.product.id) === String(safeProduct.id))
                    if (local) {
                        local.quantity = res.data.quantity ?? local.quantity
                        local.id = res.data.id
                    }
                }
                // Si !success, on garde l'item local — l'utilisateur n'est pas pénalisé par un échec API.
            } catch (_) {
                // L'item est déjà dans le panier local → rien à faire.
            } finally {
                this.adding = false
            }
        },

        async removeItem(productId: string) {
            const item = this.items.find(i => i.product.id === productId)
            if (!item) return

            if (getToken() && item.id) {
                const api = useApi()
                await api.delete(`/cart/items/${item.id}`)
            }
            this.items = this.items.filter(i => i.product.id !== productId)
            this.saveToLocalStorage()
        },

        async updateQuantity(productId: string, quantity: number) {
            if (quantity <= 0) return this.removeItem(productId)

            const item = this.items.find(i => i.product.id === productId)
            if (!item) return

            if (getToken() && item.id) {
                const api = useApi()
                const res = await api.put<any>(`/cart/items/${item.id}`, { quantity })
                if (res.success) item.quantity = quantity
            } else {
                item.quantity = quantity
                this.saveToLocalStorage()
            }
        },

        async clearCart() {
            if (getToken()) {
                const api = useApi()
                await api.delete('/cart')
            }
            this.items = []
            this.saveToLocalStorage()
        },

        saveToLocalStorage() {
            if (typeof window !== 'undefined') {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(this.items))
            }
        },

        loadFromLocalStorage() {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(LOCAL_KEY)
                if (saved) {
                    try { this.items = JSON.parse(saved) } catch { /* ignore */ }
                }
            }
        },

        toggleCart() { this.isOpen = !this.isOpen },
        openCart() { this.isOpen = true },
        closeCart() { this.isOpen = false }
    }
})

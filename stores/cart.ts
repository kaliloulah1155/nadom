import { defineStore } from 'pinia'
import type { Product } from './personalShopping'

export interface CartItem {
    product: Product
    quantity: number
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
}

export const useCartStore = defineStore('cart', {
    state: (): CartState => ({
        items: [],
        isOpen: false
    }),

    getters: {
        totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: (state) => state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        isEmpty: (state) => state.items.length === 0
    },

    actions: {
        addItem(product: Product, quantity = 1) {
            const existing = this.items.find(item => item.product.id === product.id)
            if (existing) {
                existing.quantity += quantity
            } else {
                this.items.push({ product, quantity })
            }
            this.saveToLocalStorage()
        },

        removeItem(productId: string) {
            this.items = this.items.filter(item => item.product.id !== productId)
            this.saveToLocalStorage()
        },

        updateQuantity(productId: string, quantity: number) {
            const item = this.items.find(i => i.product.id === productId)
            if (item) {
                item.quantity = quantity
                if (item.quantity <= 0) {
                    this.removeItem(productId)
                }
            }
            this.saveToLocalStorage()
        },

        clearCart() {
            this.items = []
            this.saveToLocalStorage()
        },

        saveToLocalStorage() {
            if (typeof window !== 'undefined') {
                localStorage.setItem('nadom_cart', JSON.stringify(this.items))
            }
        },

        loadFromLocalStorage() {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('nadom_cart')
                if (saved) {
                    this.items = JSON.parse(saved)
                }
            }
        },

        toggleCart() {
            this.isOpen = !this.isOpen
        },

        openCart() {
            this.isOpen = true
        },

        closeCart() {
            this.isOpen = false
        }
    }
})

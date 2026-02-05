<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="cartSidebar" ref="cartRef">
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title fw-bold">
        <i class="bi bi-cart3 me-2"></i>Mon Panier
      </h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" @click="cartStore.closeCart"></button>
    </div>
    <div class="offcanvas-body">
      <div v-if="cartStore.isEmpty" class="text-center py-5">
        <i class="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
        <h6>Votre panier est vide</h6>
        <button class="btn btn-outline-primary btn-sm mt-3" @click="cartStore.closeCart">
          Continuer mes achats
        </button>
      </div>
      <div v-else>
        <div v-for="item in cartStore.items" :key="item.product.id" class="cart-item border-bottom py-3">
          <div class="d-flex gap-3">
            <img :src="item.product.image || 'https://placehold.co/80?text=No+Img'" class="rounded border" width="60" height="60" style="object-fit: cover;" />
            <div class="flex-grow-1">
              <h6 class="mb-1 small fw-bold">{{ item.product[`name_${locale}` as keyof typeof item.product] || item.product.name_fr }}</h6>
              <p class="mb-2 small text-primary fw-bold">{{ item.product.price.toLocaleString() }} FCFA</p>
              <div class="d-flex align-items-center justify-content-between">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                  <span class="btn btn-outline-secondary disabled py-0 px-3">{{ item.quantity }}</span>
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                </div>
                <button class="btn btn-link text-danger p-0" @click="cartStore.removeItem(item.product.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!cartStore.isEmpty" class="offcanvas-footer border-top p-3 bg-light">
      <div class="mb-3">
        <label class="form-label small fw-bold">Votre numéro de contact (WhatsApp)</label>
        <div class="input-group input-group-sm">
          <span class="input-group-text"><i class="bi bi-telephone"></i></span>
          <input v-model="contactNumber" type="text" class="form-control" placeholder="Ex: +225 07..." />
        </div>
        <div v-if="showContactError" class="text-danger x-small mt-1">Le numéro est requis pour valider directement.</div>
      </div>

      <div class="d-flex justify-content-between mb-3">
        <span class="fw-bold">Total estimé</span>
        <span class="fw-bold text-primary fs-5">{{ cartStore.totalPrice.toLocaleString() }} FCFA</span>
      </div>

      <div class="d-grid gap-2">
        <button class="btn btn-primary" @click="checkout">
          <i class="bi bi-check-circle me-2"></i>Valider ma commande
        </button>
        <button class="btn btn-success" @click="contactWhatsApp">
          <i class="bi bi-whatsapp me-2"></i>Commander via WhatsApp
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="cartStore.clearCart">
          Vider le panier
        </button>
      </div>
      <p class="text-muted x-small mt-3 mb-0 text-center">
        * Les frais de service et d'expédition seront calculés après validation.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useNotification } from '~/composables/useNotification'

const { locale } = useI18n()
const cartStore = useCartStore()
const { success, error } = useNotification()
const config = useRuntimeConfig()

const contactNumber = ref('')
const showContactError = ref(false)
const cartRef = ref<HTMLElement | null>(null)
let cartOffcanvas: any = null

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    cartOffcanvas = new (window as any).bootstrap.Offcanvas(cartRef.value)
    
    // Listen for hidden event to sync back to store
    cartRef.value?.addEventListener('hidden.bs.offcanvas', () => {
      cartStore.closeCart()
    })
  }
})

// Sync isOpen state with Bootstrap offcanvas
watch(() => cartStore.isOpen, (newVal) => {
  if (newVal) {
    cartOffcanvas?.show()
  } else {
    cartOffcanvas?.hide()
  }
})

const contactWhatsApp = () => {
  const whatsappNumber = config.public.whatsapp || '+2250714158172'
  let message = locale.value === 'fr' 
    ? "Bonjour NADOM, je souhaite commander les produits suivants :\n\n"
    : "Hello NADOM, I would like to order the following products:\n\n"
  
  cartStore.items.forEach(item => {
    const name = item.product[`name_${locale.value}` as keyof typeof item.product] || item.product.name_fr
    message += `- ${name} (Qté: ${item.quantity}) - ${item.product.price.toLocaleString()} FCFA\n`
  })
  
  message += `\n*Total estimé : ${cartStore.totalPrice.toLocaleString()} FCFA*`
  
  if (contactNumber.value) {
    message += `\n\nMon contact : ${contactNumber.value}`
  }

  const encodedUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`
  window.open(encodedUrl, '_blank')
}

const psStore = usePersonalShoppingStore()

const checkout = async () => {
  if (!contactNumber.value) {
    showContactError.value = true
    error(locale.value === 'fr' ? 'Veuillez saisir votre numéro de contact.' : 'Please enter your contact number.')
    return
  }
  
  try {
    const items = cartStore.items.map(item => ({
      productId: item.product.id,
      name_fr: item.product.name_fr,
      name_en: item.product.name_en,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }))

    await psStore.createRequest({
      userId: 'user_1', // Mock user
      contactNumber: contactNumber.value,
      title: locale.value === 'fr' ? `Commande de ${cartStore.totalItems} produits` : `Order of ${cartStore.totalItems} products`,
      description: locale.value === 'fr' ? 'Commande effectuée via le catalogue catalogue.' : 'Order placed via the catalog.',
      items,
      budgetEstimated: cartStore.totalPrice,
      quantity: cartStore.totalItems
    })

    showContactError.value = false
    success(locale.value === 'fr' ? 'Validation réussie ! Notre équipe vous contactera sous peu.' : 'Validation successful! Our team will contact you shortly.')
    cartStore.clearCart()
    cartStore.closeCart()
    contactNumber.value = ''
  } catch (err) {
    error(locale.value === 'fr' ? 'Erreur lors de la validation.' : 'Error during validation.')
  }
}
</script>

<style scoped>
.cart-item img {
  flex-shrink: 0;
}
.x-small {
  font-size: 0.75rem;
}
</style>

<template>
  <div class="offcanvas offcanvas-end cart-sidebar-wide" tabindex="-1" id="cartSidebar" ref="cartRef">
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title fw-bold">
        <i class="bi bi-cart3 me-2"></i>Mon Panier
        <span v-if="cartStore.totalItems > 0" class="badge bg-primary ms-1">{{ cartStore.totalItems }}</span>
      </h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" @click="cartStore.closeCart"></button>
    </div>

    <div class="offcanvas-body">
      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="text-center py-5 px-3">
        <i class="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
        <h6 class="mb-2">Votre panier est vide</h6>
        <p class="text-muted small mb-4">
          Parcourez notre catalogue Personal Shopping pour ajouter des produits, ou faites une demande sur mesure pour un article spécifique.
        </p>
        <div class="d-grid gap-2">
          <NuxtLink to="/personal-shopping" class="btn btn-primary btn-sm" @click="cartStore.closeCart">
            <i class="bi bi-bag-heart me-2"></i>Découvrir les produits
          </NuxtLink>
          <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary btn-sm" @click="cartStore.closeCart">
            <i class="bi bi-plus-circle me-2"></i>Demande sur mesure
          </NuxtLink>
          <button class="btn btn-link btn-sm text-muted" @click="cartStore.closeCart">
            Fermer
          </button>
        </div>
      </div>

      <!-- Liste des articles -->
      <div v-else>
        <div v-for="item in cartStore.items" :key="item.product.id" class="cart-item border-bottom py-3">
          <div class="d-flex gap-3">
            <img
              :src="item.product.image || 'https://placehold.co/80?text=No+Img'"
              class="rounded border"
              width="60" height="60"
              style="object-fit: cover; flex-shrink: 0;"
            />
            <div class="flex-grow-1 min-w-0">
              <h6 class="mb-1 small fw-bold text-truncate">
                {{ item.product[`name_${locale}` as keyof typeof item.product] || item.product.name_fr }}
              </h6>
              <p class="mb-2 small text-primary fw-bold">
                {{ formatCurrency(item.product.price, (item.product as any).currency || 'XOF') }}
              </p>
              <div class="d-flex align-items-center justify-content-between">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(String(item.product.id), item.quantity - 1)">-</button>
                  <span class="btn btn-outline-secondary disabled py-0 px-3">{{ item.quantity }}</span>
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(String(item.product.id), item.quantity + 1)">+</button>
                </div>
                <button class="btn btn-link text-danger p-0" @click="cartStore.removeItem(String(item.product.id))">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer de finalisation -->
    <div v-if="!cartStore.isEmpty" class="offcanvas-footer border-top p-3 bg-light">
      <!-- Formulaire de contact -->
      <div class="mb-3">
        <div class="mb-2">
          <label class="form-label small fw-bold mb-1">Nom complet *</label>
          <input
            v-model="contactName"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Prénom Nom"
          />
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>
        <div class="mb-2">
          <label class="form-label small fw-bold mb-1">WhatsApp *</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-whatsapp text-success"></i></span>
            <input
              v-model="contactNumber"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': errors.phone }"
              placeholder="+225 07 XX XX XX"
            />
          </div>
          <div v-if="errors.phone" class="invalid-feedback d-block">{{ errors.phone }}</div>
        </div>
        <div class="mb-2">
          <label class="form-label small fw-bold mb-1">Email *</label>
          <input
            v-model="contactEmail"
            type="email"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors.email }"
            placeholder="email@exemple.com"
          />
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>
      </div>

      <!-- Devise -->
      <div class="mb-2">
        <label class="form-label small fw-bold mb-1 d-flex align-items-center gap-2">
          Devise
          <span v-if="psStore.loading && currencies.length === 0" class="spinner-border spinner-border-sm text-primary" style="width: .75rem; height: .75rem;" role="status" aria-hidden="true"></span>
        </label>
        <select v-model="selectedCurrency" class="form-select form-select-sm">
          <option v-for="cur in currencies" :key="cur.id" :value="cur.code">
            {{ cur.label }}{{ cur.code !== cur.label ? ` (${cur.code})` : '' }}
          </option>
        </select>
      </div>

      <!-- Total -->
      <div class="d-flex justify-content-between mb-3 border-top pt-2">
        <span class="fw-bold">Total estimé</span>
        <span class="fw-bold text-primary fs-6">{{ formatCurrency(cartStore.totalPrice, selectedCurrency) }}</span>
      </div>

      <!-- Actions -->
      <div class="d-grid gap-2">
        <button class="btn btn-primary" :disabled="submitting" @click="checkout">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-check-circle me-2"></i>
          {{ submitting ? 'Envoi en cours...' : 'Valider ma demande' }}
        </button>
        <button class="btn btn-success" @click="contactWhatsApp">
          <i class="bi bi-whatsapp me-2"></i>Commander via WhatsApp
        </button>
        <button class="btn btn-outline-danger btn-sm" :disabled="submitting" @click="cartStore.clearCart">
          Vider le panier
        </button>
      </div>
      <p class="text-muted x-small mt-2 mb-0 text-center">
        * Frais de service et d'expédition calculés après validation.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

const { locale } = useI18n()
const router = useRouter()
const cartStore = useCartStore()
const psStore = usePersonalShoppingStore()
const authStore = useAuthStore()
const { success, error: notifyError } = useNotification()
const { formatCurrency } = useFormatters()
const config = useRuntimeConfig()

/** Devise dominante du panier (premier produit avec une devise renseignée, sinon XOF). */
const cartCurrency = computed(() => {
  for (const item of cartStore.items) {
    const c = (item.product as any).currency
    if (c) return String(c).toUpperCase()
  }
  return 'XOF'
})

/** Liste des devises disponibles — alignée sur le formulaire /personal-shopping/new
 *  (catégories préfixées DVS dans la table categories). */
const currencies = computed(() => {
  const fromStore = (psStore.categories || [])
    .filter((c: any) => {
      const slug = (c.slug || '').toString()
      return slug === 'DVS' || slug.startsWith('DVS-')
    })
    .map((c: any) => ({
      id: c.uuid || c.id,
      code: (c.code || c.label || '').toString().toUpperCase(),
      label: c.label || c.code || '',
    }))
    .filter((c: any) => c.code)
  return fromStore.length > 0 ? fromStore : [{ id: 'xof', code: 'XOF', label: 'CFA (FCFA)' }]
})

/** Devise sélectionnée par l'utilisateur — pré-remplie depuis les produits, modifiable. */
const selectedCurrency = ref<string>('XOF')

/** Initialise / met à jour la devise quand les produits ou la liste arrive. */
watch([cartCurrency, currencies], ([detected, list]) => {
  if (!list.length) return
  const codes = list.map(c => c.code)
  if (selectedCurrency.value && codes.includes(selectedCurrency.value)) return
  // Priorité : devise détectée sur les produits si présente dans la liste.
  if (codes.includes(detected)) {
    selectedCurrency.value = detected
  } else {
    selectedCurrency.value = codes[0]
  }
}, { immediate: true })

const contactName   = ref('')
const contactNumber = ref('')
const contactEmail  = ref('')
const submitting    = ref(false)
const cartRef       = ref<HTMLElement | null>(null)
let cartOffcanvas: any = null

const errors = ref({ name: '', phone: '', email: '' })

onMounted(async () => {
  // Pré-remplir avec les infos du compte connecté
  const u: any = authStore.currentUser
  if (u) {
    contactName.value   = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    contactEmail.value  = u.email || ''
    contactNumber.value = u.phone || ''
  }

  // Charger les devises (catégories DVS) si pas déjà en mémoire
  if (!psStore.categories || psStore.categories.length === 0) {
    await psStore.fetchCategories()
  }

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    cartOffcanvas = new (window as any).bootstrap.Offcanvas(cartRef.value)
    cartRef.value?.addEventListener('hidden.bs.offcanvas', () => cartStore.closeCart())
  }
})

watch(() => cartStore.isOpen, (val) => {
  val ? cartOffcanvas?.show() : cartOffcanvas?.hide()
})

const validate = () => {
  errors.value = { name: '', phone: '', email: '' }
  if (!contactName.value.trim() || contactName.value.trim().length < 2)
    errors.value.name = 'Nom complet requis'
  if (!contactNumber.value || !/^[\+]?[0-9\s\-]{8,20}$/.test(contactNumber.value))
    errors.value.phone = 'Numéro invalide'
  if (!contactEmail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value))
    errors.value.email = 'Email invalide'
  return !errors.value.name && !errors.value.phone && !errors.value.email
}

const checkout = async () => {
  if (!validate()) return

  submitting.value = true
  try {
    const items = cartStore.items.map(item => ({
      product_id: String(item.product.id),
      quantity:   item.quantity,
      price:      item.product.price,
    }))

    const productNames = cartStore.items
      .map(i => `${i.quantity}x ${i.product[`name_${locale.value}` as keyof typeof i.product] || i.product.name_fr}`)
      .join(', ')

    const request: any = await psStore.createRequest({
      title:           locale.value === 'fr'
        ? `Commande de ${cartStore.totalItems} article(s)`
        : `Order of ${cartStore.totalItems} item(s)`,
      description:     productNames,
      contactNumber:   contactNumber.value,
      contactFullname: contactName.value,
      contactEmail:    contactEmail.value,
      budgetEstimated: cartStore.totalPrice,
      currency:        selectedCurrency.value,
      quantity:        cartStore.totalItems,
      items,
    } as any)

    success(locale.value === 'fr'
      ? 'Demande envoyée ! Notre équipe vous contacte sous 24h.'
      : 'Request sent! Our team will contact you within 24h.')

    cartStore.clearCart()
    cartStore.closeCart()
    errors.value = { name: '', phone: '', email: '' }

    if (request?.id) {
      router.push(`/personal-shopping/${request.id}`)
    }
  } catch (err: any) {
    notifyError(err.message || (locale.value === 'fr' ? 'Erreur lors de la validation.' : 'Error during checkout.'))
  } finally {
    submitting.value = false
  }
}

const contactWhatsApp = () => {
  const whatsappNumber = (config.public.whatsapp || '+2250714158172').replace('+', '')
  let message = locale.value === 'fr'
    ? 'Bonjour NADOM, je souhaite commander :\n\n'
    : 'Hello NADOM, I would like to order:\n\n'

  cartStore.items.forEach(item => {
    const name = item.product[`name_${locale.value}` as keyof typeof item.product] || item.product.name_fr
    message += `- ${name} (x${item.quantity}) — ${formatCurrency(item.product.price, selectedCurrency.value)}\n`
  })
  message += `\n*Total : ${formatCurrency(cartStore.totalPrice, selectedCurrency.value)}*`
  if (contactNumber.value) message += `\nContact : ${contactNumber.value}`

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>

<style scoped>
.cart-item img { flex-shrink: 0; }
.x-small { font-size: 0.75rem; }
.min-w-0 { min-width: 0; }

/* Largeur du panier — plus généreux que le 400px par défaut de Bootstrap */
.cart-sidebar-wide {
  --bs-offcanvas-width: 560px;
}
@media (max-width: 575.98px) {
  .cart-sidebar-wide {
    --bs-offcanvas-width: 100vw;
  }
}
@media (min-width: 576px) and (max-width: 991.98px) {
  .cart-sidebar-wide {
    --bs-offcanvas-width: 480px;
  }
}
</style>

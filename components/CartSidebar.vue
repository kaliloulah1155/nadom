<template>
  <div class="offcanvas offcanvas-end cart-sidebar-wide" tabindex="-1" id="cartSidebar" ref="cartRef">

    <!-- ===== HEADER ===== -->
    <div class="offcanvas-header cart-header border-bottom px-4 py-3">
      <div class="d-flex align-items-center gap-2">
        <span class="cart-header-icon">🛒</span>
        <div>
          <h5 class="mb-0 fw-bold lh-1">
            Mon Panier
            <span v-if="cartStore.totalItems > 0" class="badge bg-primary ms-1" style="font-size:.65rem;vertical-align:middle;">{{ cartStore.totalItems }}</span>
          </h5>
          <span class="text-muted" style="font-size:0.78rem;">
            {{ cartStore.totalItems > 0 ? `${cartStore.totalItems} article${cartStore.totalItems > 1 ? 's' : ''}` : 'Vide' }}
          </span>
        </div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" @click="cartStore.closeCart"></button>
    </div>

    <!-- ===== BODY ===== -->
    <div class="offcanvas-body cart-offcanvas-body p-0">

      <!-- Scroll zone : liste des articles -->
      <div class="cart-offcanvas-scroll">

        <!-- Panier vide -->
        <div v-if="cartStore.isEmpty" class="cart-empty text-center px-4 py-5">
          <div class="cart-empty-icon mb-3">
            <i class="bi bi-bag-x"></i>
          </div>
          <h6 class="fw-bold mb-1">Votre panier est vide</h6>
          <p class="text-muted small mb-4">
            Parcourez notre catalogue ou faites une demande sur mesure.
          </p>
          <div class="d-grid gap-2 mx-auto" style="max-width:260px;">
            <NuxtLink to="/personal-shopping" class="btn btn-primary" @click="cartStore.closeCart">
              <i class="bi bi-bag-heart me-2"></i>Voir les produits
            </NuxtLink>
            <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary" @click="cartStore.closeCart">
              <i class="bi bi-plus-circle me-2"></i>Demande sur mesure
            </NuxtLink>
          </div>
        </div>

        <!-- Liste des articles -->
        <ul v-else class="cart-items-list list-unstyled mb-0 px-3 pt-3">
          <li
            v-for="item in cartStore.items"
            :key="`${item.product.id}-${item.quantity}`"
            class="cart-item-card mb-3"
          >
            <div class="d-flex gap-3">
              <img
                :src="resolveStorageAssetUrl(item.product.image) || 'https://placehold.co/80?text=?'"
                class="cart-item-img rounded-3"
                width="72" height="72"
                loading="lazy"
              />
              <div class="flex-grow-1 min-w-0 d-flex flex-column justify-content-between">
                <div class="d-flex justify-content-between align-items-start gap-1">
                  <h6 class="mb-0 fw-semibold text-truncate small" style="max-width:180px;">
                    {{ item.product[`name_${locale}` as keyof typeof item.product] || item.product.name_fr }}
                  </h6>
                  <button
                    class="btn-remove-item"
                    @click="cartStore.removeItem(String(item.product.id))"
                    title="Supprimer"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <div class="d-flex align-items-center justify-content-between mt-2">
                  <!-- Contrôle quantité -->
                  <div class="qty-control">
                    <button
                      class="qty-btn"
                      :disabled="item.quantity <= 1"
                      @click="cartStore.updateQuantity(String(item.product.id), item.quantity - 1)"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button
                      class="qty-btn"
                      @click="cartStore.updateQuantity(String(item.product.id), item.quantity + 1)"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <!-- Sous-total ligne -->
                  <span class="item-subtotal fw-bold text-primary">
                    {{ formatCurrency(item.product.price * item.quantity, (item.product as any).currency || selectedCurrency) }}
                  </span>
                </div>
                <span class="text-muted mt-1" style="font-size:0.72rem;">
                  {{ formatCurrency(item.product.price, (item.product as any).currency || selectedCurrency) }} / unité
                </span>
              </div>
            </div>
          </li>
        </ul>

      </div>
      <!-- fin scroll zone -->

      <!-- ===== SECTION CHECKOUT (fixed bottom) ===== -->
      <div v-if="!cartStore.isEmpty" class="cart-checkout-section">

        <!-- Devise + Total -->
        <div class="checkout-summary px-4 pt-3 pb-2">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label small fw-semibold mb-0 text-muted">Devise</label>
            <select v-model="selectedCurrency" class="form-select form-select-sm w-auto">
              <option v-for="cur in currencies" :key="cur.id" :value="cur.code">
                {{ cur.label }}{{ cur.code !== cur.label ? ` (${cur.code})` : '' }}
              </option>
            </select>
          </div>
          <div class="total-row d-flex justify-content-between align-items-center">
            <span class="fw-semibold">Total estimé</span>
            <span class="total-amount fw-bold text-primary fs-5">
              {{ formatCurrency(cartStore.totalPrice, selectedCurrency) }}
            </span>
          </div>
        </div>

        <!-- Formulaire de contact (accordéon) -->
        <div class="contact-form-section px-4 pb-2">
          <button
            class="contact-toggle w-100 d-flex justify-content-between align-items-center"
            type="button"
            @click="showContactForm = !showContactForm"
          >
            <span class="d-flex align-items-center gap-2 small fw-semibold">
              <i class="bi bi-person-lines-fill text-primary"></i>
              Informations de contact
              <i v-if="isContactFilled" class="bi bi-check-circle-fill text-success" style="font-size:.85rem;"></i>
            </span>
            <i :class="showContactForm ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" class="text-muted small"></i>
          </button>

          <Transition name="slide-down">
            <div v-if="showContactForm" class="contact-form-body mt-2">
              <div class="mb-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-person text-muted"></i></span>
                  <input
                    v-model="contactName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Nom complet *"
                  />
                </div>
                <div v-if="errors.name" class="text-danger mt-1" style="font-size:0.72rem;">{{ errors.name }}</div>
              </div>
              <div class="mb-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-whatsapp text-success"></i></span>
                  <input
                    v-model="contactNumber"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.phone }"
                    placeholder="WhatsApp * (+225 07 XX XX)"
                  />
                </div>
                <div v-if="errors.phone" class="text-danger mt-1" style="font-size:0.72rem;">{{ errors.phone }}</div>
              </div>
              <div class="mb-1">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white"><i class="bi bi-envelope text-muted"></i></span>
                  <input
                    v-model="contactEmail"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="Email * (optionnel)"
                  />
                </div>
                <div v-if="errors.email" class="text-danger mt-1" style="font-size:0.72rem;">{{ errors.email }}</div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Actions -->
        <div class="cart-actions px-4 pb-3 d-grid gap-2">
          <button class="btn btn-primary btn-checkout" :disabled="submitting" @click="checkout">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-bag-check me-2"></i>
            {{ submitting ? 'Envoi en cours…' : 'Valider ma demande' }}
          </button>
          <button class="btn btn-success btn-whatsapp" @click="contactWhatsApp">
            <i class="bi bi-whatsapp me-2"></i>Commander via WhatsApp
          </button>
          <button class="btn-vider" :disabled="submitting" @click="cartStore.clearCart">
            <i class="bi bi-trash3 me-1"></i>Vider le panier
          </button>
        </div>

        <p class="text-center text-muted pb-2 mb-0" style="font-size:0.7rem;">
          Frais de service &amp; livraison calculés après validation.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { usePersonalShoppingStore, DEFAULT_CART_CURRENCIES } from '~/stores/personalShopping'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

const { locale, t } = useI18n()
const router = useRouter()
const cartStore = useCartStore()
const psStore = usePersonalShoppingStore()
const authStore = useAuthStore()
const { success, error: notifyError } = useNotification()
const { formatCurrency } = useFormatters()
const { categoryLabel } = useCategoryLabel()
const config = useRuntimeConfig()

const showContactForm = ref(false)

const isContactFilled = computed(() =>
  contactName.value.trim().length >= 2 &&
  /^[\+]?[0-9\s\-]{8,20}$/.test(contactNumber.value) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value)
)

/** Devise dominante du panier (premier produit avec devise renseignée, sinon XOF). */
const cartCurrency = computed(() => {
  for (const item of cartStore.items) {
    const c = (item.product as any).currency
    if (c) return String(c).toUpperCase()
  }
  return 'XOF'
})

/** Devises : cache DVS du store, sinon liste par défaut (affichage immédiat). */
const currencies = computed(() => {
  const mapRow = (c: any) => ({
    id: String(c.uuid || c.id || c.code),
    code: (c.code || c.label || '').toString().toUpperCase(),
    label: c.uuid ? categoryLabel(c) : String(c.label || c.code || ''),
  })

  const fromCache = (psStore.currencies || []).map(mapRow).filter((c) => c.code)
  if (fromCache.length > 0) return fromCache

  const fromCategories = (psStore.categories || [])
    .filter((c: any) => {
      const slug = (c.slug || '').toString().toUpperCase()
      return slug === 'DVS' || slug.startsWith('DVS-')
    })
    .map(mapRow)
    .filter((c) => c.code)
  if (fromCategories.length > 0) return fromCategories

  return DEFAULT_CART_CURRENCIES
})

const selectedCurrency = ref<string>('XOF')

watch([cartCurrency, currencies], ([detected, list]) => {
  if (!list.length) return
  const codes = list.map(c => c.code)
  if (selectedCurrency.value && codes.includes(selectedCurrency.value)) return
  selectedCurrency.value = codes.includes(detected) ? detected : codes[0]
}, { immediate: true })

const contactName   = ref('')
const contactNumber = ref('')
const contactEmail  = ref('')
const submitting    = ref(false)
const cartRef       = ref<HTMLElement | null>(null)
let cartOffcanvas: any = null

const errors = ref({ name: '', phone: '', email: '' })

onMounted(async () => {
  const u: any = authStore.currentUser
  if (u) {
    contactName.value   = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    contactEmail.value  = u.email || ''
    contactNumber.value = u.phone || ''
    if (contactName.value || contactEmail.value || contactNumber.value) {
      showContactForm.value = true
    }
  }

  void psStore.fetchCurrencies()

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    cartOffcanvas = new (window as any).bootstrap.Offcanvas(cartRef.value)
    cartRef.value?.addEventListener('hidden.bs.offcanvas', () => cartStore.closeCart())
  }
})

watch(() => cartStore.isOpen, (val) => {
  if (val && !psStore.currenciesFetched) {
    void psStore.fetchCurrencies()
  }
  val ? cartOffcanvas?.show() : cartOffcanvas?.hide()
})

const validate = () => {
  errors.value = { name: '', phone: '', email: '' }
  if (!contactName.value.trim() || contactName.value.trim().length < 2)
    errors.value.name = 'Nom complet requis (min. 2 caractères)'
  if (!contactNumber.value || !/^[\+]?[0-9\s\-]{8,20}$/.test(contactNumber.value))
    errors.value.phone = 'Numéro invalide (ex: +225 07 XX XX XX)'
  if (!contactEmail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value))
    errors.value.email = 'Adresse email invalide'
  if (!isContactFilled.value) showContactForm.value = true
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
      title:           t('cart.orderTitle', { n: cartStore.totalItems }),
      description:     productNames,
      contactNumber:   contactNumber.value,
      contactFullname: contactName.value,
      contactEmail:    contactEmail.value,
      budgetEstimated: cartStore.totalPrice,
      currency:        selectedCurrency.value,
      quantity:        cartStore.totalItems,
      items,
    } as any)

    success(t('cart.orderSent'))

    cartStore.clearCart()
    cartStore.closeCart()
    errors.value = { name: '', phone: '', email: '' }

    if (request?.id) {
      router.push(`/personal-shopping/${request.id}`)
    }
  } catch (err: any) {
    notifyError(err.message || t('auth.checkoutError'))
  } finally {
    submitting.value = false
  }
}

const contactWhatsApp = () => {
  const whatsappNumber = (config.public.whatsapp || '+2250714158172').replace('+', '')
  let message = t('cart.whatsappIntro')

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
/* ---- Utilitaires ---- */
.min-w-0 { min-width: 0; }

/* ---- Largeur sidebar ---- */
.cart-sidebar-wide { --bs-offcanvas-width: 420px; }
@media (max-width: 575.98px) { .cart-sidebar-wide { --bs-offcanvas-width: 100vw; } }
@media (min-width: 576px) and (max-width: 991.98px) { .cart-sidebar-wide { --bs-offcanvas-width: 380px; } }

/* ---- Structure globale ---- */
#cartSidebar.cart-sidebar-wide {
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
#cartSidebar.cart-sidebar-wide > .offcanvas-header { flex-shrink: 0; }
#cartSidebar.cart-sidebar-wide .cart-offcanvas-body {
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto;
}
.cart-offcanvas-scroll {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ---- Header ---- */
.cart-header { background: #fff; }
.cart-header-icon { font-size: 1.5rem; line-height: 1; }

/* ---- Panier vide ---- */
.cart-empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: #f1f0fe;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
  color: #6366f1;
}

/* ---- Items ---- */
.cart-items-list { padding-bottom: 0.5rem; }
.cart-item-card {
  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 14px;
  padding: 12px;
  transition: box-shadow .15s;
}
.cart-item-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.07); }
.cart-item-img {
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #f0f0f0;
}

/* ---- Bouton supprimer ---- */
.btn-remove-item {
  background: none;
  border: none;
  padding: 2px 4px;
  color: #9ca3af;
  font-size: .8rem;
  cursor: pointer;
  border-radius: 6px;
  transition: color .15s, background .15s;
  flex-shrink: 0;
}
.btn-remove-item:hover { color: #ef4444; background: #fef2f2; }

/* ---- Contrôle quantité ---- */
.qty-control {
  display: inline-flex;
  align-items: center;
  background: #f4f4f5;
  border-radius: 99px;
  padding: 2px;
  gap: 0;
}
.qty-btn {
  width: 28px; height: 28px;
  border: none;
  background: #fff;
  border-radius: 50%;
  font-size: .85rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #374151;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  transition: background .15s;
}
.qty-btn:hover:not(:disabled) { background: #ede9fe; color: #4f46e5; }
.qty-btn:disabled { opacity: .4; cursor: default; box-shadow: none; }
.qty-value {
  min-width: 28px;
  text-align: center;
  font-size: .85rem;
  font-weight: 600;
  color: #111;
}
.item-subtotal { font-size: .88rem; }

/* ---- Checkout section ---- */
.cart-checkout-section {
  border-top: 2px solid #f1f0fe;
  background: #fafafa;
  min-height: 0;
  max-height: min(55vh, 26rem);
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

/* ---- Résumé total ---- */
.checkout-summary {
  background: #fff;
  border-bottom: 1px solid #f1f1f1;
}
.total-row { padding: 6px 0 2px; }
.total-amount { letter-spacing: -.5px; }

/* ---- Formulaire contact ---- */
.contact-toggle {
  background: none;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  color: #374151;
  transition: background .15s;
}
.contact-toggle:hover { background: #f4f4f5; }
.contact-form-body .input-group-text {
  border-right: none;
}
.contact-form-body .form-control {
  border-left: none;
  font-size: .85rem;
}
.contact-form-body .form-control:focus { border-color: #d1d5db; box-shadow: none; }

/* ---- Actions ---- */
.btn-checkout {
  border-radius: 12px;
  font-weight: 600;
  padding: .6rem 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
}
.btn-checkout:hover:not(:disabled) { opacity: .9; }
.btn-whatsapp {
  border-radius: 12px;
  font-weight: 600;
  padding: .6rem 1rem;
  background: #25d366;
  border: none;
}
.btn-whatsapp:hover { background: #1dba58; }
.btn-vider {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: .78rem;
  cursor: pointer;
  padding: 4px;
  text-align: center;
  transition: color .15s;
}
.btn-vider:hover:not(:disabled) { color: #ef4444; }

/* ---- Transition accordéon ---- */
.slide-down-enter-active,
.slide-down-leave-active { transition: all .2s ease; overflow: hidden; }
.slide-down-enter-from,
.slide-down-leave-to { max-height: 0; opacity: 0; }
.slide-down-enter-to,
.slide-down-leave-from { max-height: 300px; opacity: 1; }
</style>

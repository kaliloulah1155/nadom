<template>
  <div class="ps-page">
    <!-- Hero Section -->
    <section class="ps-hero">
      <div class="container position-relative">
        <div class="row align-items-center">
          <div class="col-lg-8 text-white">
            <div class="mb-3">
              <span class="badge bg-warning text-white px-3">
                <i class="bi bi-bag-heart me-1"></i>{{ t('personalShopping.badge') }}
              </span>
            </div>
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('personalShopping.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">{{ t('personalShopping.subtitle') }}</p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <div class="d-flex justify-content-lg-end gap-2">
              <button class="btn btn-warning btn-md text-white position-relative" @click="toggleCart">
                <i class="bi bi-cart3 me-2"></i>{{ t('personalShopping.myCart') || 'Mon Panier' }}
                <span v-if="cartStore.totalItems > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ cartStore.totalItems }}
                </span>
              </button>
              <NuxtLink to="/personal-shopping/new" class="btn btn-light btn-md">
                <i class="bi bi-plus-circle me-2"></i>{{ t('personalShopping.newRequest') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container mt-1">
      <!-- How It Works -->
      <section class="how-it-works-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('personalShopping.howItWorks') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.processTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.processSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <div v-for="(step, index) in steps" :key="index" class="col-6 col-lg">
            <div class="card h-100 border-0 shadow-sm text-center step-card">
              <div class="card-body p-4">
                <div class="step-number mx-auto mb-3">{{ index + 1 }}</div>
                <h5>{{ step.title }}</h5>
                <p class="text-muted mb-0 small">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Procédures en PDF (nouvelle demande / panier), localisées -->
        <div class="text-center mt-4 d-flex flex-wrap gap-2 justify-content-center">
          <a :href="procedurePdfUrl('new')" target="_blank" rel="noopener" class="btn btn-outline-primary">
            <i class="bi bi-file-earmark-pdf me-2"></i>{{ t('personalShopping.procedurePdfNew') }}
          </a>
          <a :href="procedurePdfUrl('cart')" target="_blank" rel="noopener" class="btn btn-outline-primary">
            <i class="bi bi-file-earmark-pdf me-2"></i>{{ t('personalShopping.procedurePdfCart') }}
          </a>
        </div>
      </section>

      <!-- Categories -->
      <section class="categories-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-primary-subtle text-primary mb-2">{{ t('personalShopping.categories') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.categoriesTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.categoriesSubtitle') }}</p>
        </div>

        <!-- Barre de recherche produit -->
        <div class="row justify-content-center mb-4">
          <div class="col-md-8 col-lg-6">
            <div class="input-group input-group-lg shadow-sm">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input
                v-model="productSearch"
                type="search"
                class="form-control border-start-0"
                :placeholder="t('personalShopping.searchPlaceholder') || 'Rechercher un produit…'"
              />
            </div>
          </div>
        </div>

        <!-- Méga-menu catégories (style Jumia) : parents à gauche, sous-catégories à droite -->
        <div class="row g-0 mega-cats shadow-sm rounded overflow-hidden border">
          <!-- Colonne gauche : catégories parentes -->
          <div class="col-12 col-md-4 col-lg-3 mega-cats-parents">
            <button
              v-for="category in categories"
              :key="category.id"
              type="button"
              class="mega-parent"
              :class="{ active: activeCategory === category.id }"
              @mouseenter="hoveredCategory = category.id"
              @click="selectParent(category.id)"
            >
              <span class="mega-ic" :style="{ background: category.color + '20', color: category.color }">
                <i :class="category.icon"></i>
              </span>
              <span class="flex-grow-1 text-start">{{ category.displayLabel }}</span>
              <i v-if="hasChildren(category.id)" class="bi bi-chevron-right text-muted"></i>
            </button>
          </div>

          <!-- Colonne droite : sous-catégories de la catégorie active -->
          <div class="col-12 col-md-8 col-lg-9 mega-cats-panel p-4" @mouseleave="hoveredCategory = null">
            <template v-if="activeCategory">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">{{ getCategoryName(activeCategory) }}</h5>
                <button class="btn btn-sm btn-primary" @click="selectParent(activeCategory)">{{ t('personalShopping.categoryMenu.viewProducts') }}</button>
              </div>

              <div v-if="activeSubCategories.length" class="row g-2">
                <div v-for="sub in activeSubCategories" :key="sub.id" class="col-6 col-md-4">
                  <a
                    href="#"
                    class="mega-subcat"
                    :class="{ active: selectedCategory === activeCategory && selectedSubCategory === sub.id }"
                    @click.prevent="pickSubCategory(activeCategory, sub.id)"
                  >
                    <i class="bi bi-dot"></i>{{ sub.displayLabel }}
                  </a>
                </div>
              </div>
              <p v-else class="text-muted mb-0">
                <i class="bi bi-info-circle me-1"></i>{{ t('personalShopping.categoryMenu.noSubcategories', { name: getCategoryName(activeCategory) }) }}
              </p>
            </template>
            <p v-else class="text-muted mb-0 d-none d-md-block">
              <i class="bi bi-arrow-left me-1"></i>{{ t('personalShopping.categoryMenu.hoverHint') }}
            </p>
          </div>
        </div>

        <!-- Products Listing -->
        <div v-if="selectedCategory || productSearch.trim()" class="mt-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="fw-bold mb-0">{{ selectedCategory ? getCategoryName(selectedCategory) : (t('personalShopping.searchResults') || 'Résultats de recherche') }}</h3>
            <span class="text-muted">{{ filteredProducts.length }} produits</span>
          </div>
          
          <div class="row g-4">
            <div v-for="prod in filteredProducts" :key="prod.id" class="col-md-6 col-lg-4 col-xl-3">
              <div class="card h-100 border-0 shadow-sm product-card">
                    <div class="product-img-wrapper mb-3">
                      <img :src="resolveStorageAssetUrl(prod.image) || 'https://placehold.co/400x400?text=No+Img'" :alt="prod[`name_${locale}`] || prod.name_fr" class="img-fluid rounded" />
                      <div class="product-actions">
                        <button class="btn btn-light btn-sm rounded-circle shadow-sm" @click="openZoom(prod)" title="Zoom">
                          <i class="bi bi-search"></i>
                        </button>
                        <button class="btn btn-primary btn-sm rounded-circle shadow-sm" @click="addToCart(prod)" title="Ajouter au panier">
                          <i class="bi bi-cart-plus"></i>
                        </button>
                      </div>
                    </div>
                <div class="card-body">
                  <h6 class="fw-bold mb-1">{{ prod[`name_${locale}`] || prod.name_fr }}</h6>
                  <p class="text-primary fw-bold mb-2">{{ formatCurrency(publicPrice(Number(prod.price) || 0), prod.currency || 'XOF') }}</p>
                  <p class="text-muted small mb-0" v-html="prod[`description_${locale}`] || prod.description_fr || ''"></p>
                </div>
                <div class="card-footer bg-transparent border-0 pt-0">
                  <button class="btn btn-outline-primary w-100" @click="addToCart(prod)">
                    <i class="bi bi-cart-plus me-2"></i>{{ t('personalShopping.addToCart') || 'Ajouter au panier' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="filteredProducts.length === 0" class="col-12 text-center py-5 bg-light rounded-4">
              <i class="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
              <p class="text-muted mb-0">Aucun produit pré-enregistré dans cette catégorie.</p>
              <p class="small text-muted">Vous pouvez toujours faire une demande personnalisée.</p>
              <NuxtLink to="/personal-shopping/new" class="btn btn-sm btn-primary mt-3">
                <i class="bi bi-plus-circle me-1"></i>Faire une demande
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Zoom Modal -->
      <div class="modal fade" id="zoomModal" tabindex="-1" ref="zoomModalRef">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content bg-transparent border-0">
            <div class="modal-body p-0 position-relative text-center">
              <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" style="z-index: 1060;"></button>
              <img v-if="zoomedProduct" :src="resolveStorageAssetUrl(zoomedProduct.image)" class="img-fluid rounded shadow-lg" style="max-height: 90vh; cursor: pointer;" @click="zoomModal?.hide()" />
            </div>
          </div>
        </div>
      </div>


      <!-- Pricing Section -->
      <section class="pricing-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-info-subtle text-info mb-2">{{ t('pricing.title') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.pricingTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.pricingSubtitle') }}</p>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card border-0 shadow-lg pricing-card">
              <div class="card-body p-4">
                <div v-if="pricingStore.loading && pricingServices.length === 0" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                  <p class="text-muted small mb-0 mt-2">Chargement des tarifs...</p>
                </div>

                <div
                  v-for="(service, idx) in pricingServices"
                  :key="service.id"
                  class="pricing-item"
                  :class="{ 'border-0': idx === pricingServices.length - 1 }"
                >
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i :class="serviceIcon(service.slug)"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ formatServiceName(service.key) }}</h6>
                      <small class="text-muted">{{ stripHtml(service.description) || '—' }}</small>
                    </div>
                  </div>
                  <span class="fw-bold text-primary">{{ formatServiceValue(service.value) }}</span>
                </div>

                <!-- Lien calcul expedition (toujours dispo) -->
                <div class="pricing-item border-0">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-truck"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.shipping') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.shippingDesc') }}</small>
                    </div>
                  </div>
                  <NuxtLink to="/import-export/calculator" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-calculator me-1"></i>{{ t('personalShopping.pricing.calculate') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Advantages -->
      <section class="advantages-section mb-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('personalShopping.whyUs') }}</h2>
        </div>

        <div class="row g-4">
          <div v-for="(adv, index) in advantages" :key="index" class="col-md-6 col-lg-3">
            <div class="text-center advantage-item">
              <div class="advantage-icon mx-auto mb-3">
                <i :class="adv.icon"></i>
              </div>
              <h5>{{ adv.title }}</h5>
              <p class="text-muted small mb-0">{{ adv.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CTA Section -->
    <section class="cta-section py-5">
      <div class="cta-pattern"></div>
      <div class="container text-center position-relative">
        <h2 class="fw-bold text-white mb-3">{{ t('personalShopping.ctaTitle') }}</h2>
        <p class="lead text-white opacity-75 mb-4">{{ t('personalShopping.ctaSubtitle') }}</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <NuxtLink to="/personal-shopping/new" class="btn btn-light btn-lg">
            <i class="bi bi-bag-plus me-2"></i>{{ t('personalShopping.newRequest') }}
          </NuxtLink>
          <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-light btn-lg">
            <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useCartStore } from '~/stores/cart'
import { usePricingStore } from '~/stores/pricing'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'
import { POD_CATEGORY_COLORS, resolvePodCategoryIcon } from '~/composables/usePodCategoryDisplay'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('seo.personalShopping.title'),
  description: () => t('seo.personalShopping.description'),
  ogTitle: () => t('seo.personalShopping.title'),
  ogDescription: () => t('seo.personalShopping.description'),
})
const { label: podCategoryLabel } = usePodCategoryLabel()
const { resolveList } = useI18nResolved()

const PS_ADV_ICONS = ['bi bi-shield-check', 'bi bi-cash-stack', 'bi bi-chat-dots', 'bi bi-geo-alt']

const steps = computed(() =>
  resolveList('personalShopping.psSteps', ['title', 'description'] as const),
)

// PDF des procédures (généré par le backend, localisé selon la langue courante).
const procedurePdfUrl = (kind: 'new' | 'cart') =>
  `${(config.public.apiBase as string).replace(/\/$/, '')}/personal-shopping/procedure/${kind}/pdf?lang=${locale.value}`

const advantages = computed(() =>
  resolveList('personalShopping.advantagesList', ['title', 'description'] as const).map((item, i) => ({
    ...item,
    icon: PS_ADV_ICONS[i] || 'bi bi-check-circle',
  })),
)
const route = useRoute()
const router = useRouter()
const psStore = usePersonalShoppingStore()
const cartStore = useCartStore()
const pricingStore = usePricingStore()
const { success } = useNotification()
const { formatCurrency } = useFormatters()
const { publicPrice } = usePayment()
const config = useRuntimeConfig()

const pricingServices = computed(() =>
  (pricingStore.services || []).filter((s: any) => Number(s.status) === 1)
)

const formatServiceName = (key: string) => {
  if (!key) return ''
  return key.replace(/^SERVICE_/, '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

/** Décode la valeur stockée : soit un nombre brut, soit un JSON {amount, currency}. */
const parseServicePayload = (raw: any): { amount: number; currency: string } => {
  if (typeof raw === 'number') return { amount: raw, currency: 'XOF' }
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (s.startsWith('{')) {
      try {
        const p = JSON.parse(s)
        if (p && typeof p === 'object' && 'amount' in p) {
          return {
            amount: Number(p.amount) || 0,
            currency: String(p.currency || 'XOF').toUpperCase(),
          }
        }
      } catch {}
    }
    const n = parseFloat(s)
    if (Number.isFinite(n)) return { amount: n, currency: 'XOF' }
  }
  return { amount: 0, currency: 'XOF' }
}

const formatServiceValue = (value: string | number) => {
  const { amount, currency } = parseServicePayload(value)
  if (!Number.isFinite(amount) || amount === 0) return t('personalShopping.pricing.free') || 'Gratuit'
  // Si la valeur est entre 0 et 100 ET stockée en XOF (donc pas une vraie devise spécifique),
  // on l'interprète comme un pourcentage — heuristique alignée avec l'admin.
  if (currency === 'XOF' && amount > 0 && amount <= 100) return amount + '%'
  return formatCurrency(amount, currency)
}

/** Retire les balises HTML pour un affichage condensé dans la carte tarifs. */
const stripHtml = (html: string | null | undefined): string => {
  if (!html) return ''
  return html
    .replace(/<\/(p|br|li|h[1-6]|div)>/gi, ' ')  // remplace les blocks par un espace
    .replace(/<[^>]+>/g, '')                       // supprime toutes les balises
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const SERVICE_ICONS: Record<string, string> = {
  search: 'bi bi-search',
  commission: 'bi bi-percent',
  inspection: 'bi bi-eye',
  packaging: 'bi bi-box-seam',
  shipping: 'bi bi-truck',
  personal_shopping: 'bi bi-bag-check',
  visa: 'bi bi-passport',
  guide: 'bi bi-person-badge',
}
const serviceIcon = (slug: string) => {
  const key = (slug || '').replace(/^service_/, '').toLowerCase()
  return SERVICE_ICONS[key] || 'bi bi-tag'
}

const categories = computed(() =>
  [...(psStore.categories || [])]
    .filter((c: any) => (c.slug || '').toUpperCase() === 'POD' && !c.parent_id)
    .sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((c: any, i: number) => ({
      id: String(c.id),
      uuid: c.uuid,
      code: (c.code && String(c.code).trim()) || '',
      displayLabel: podCategoryLabel(c),
      icon: resolvePodCategoryIcon(c),
      color: POD_CATEGORY_COLORS[i % POD_CATEGORY_COLORS.length],
    })),
)

const selectedCategory = ref<string | null>(null)

function categoryUrlToken(cat: { code?: string; id: string }) {
  return cat.code || cat.id
}

function syncCategoryUrl() {
  const sel = selectedCategory.value
  let token = 'POD'
  if (sel) {
    const cat = categories.value.find(c => c.id === sel)
    if (cat) token = categoryUrlToken(cat)
  }
  if (String(route.query.category || '') === token) return
  router.replace({ path: '/personal-shopping', query: { category: token } })
}

function applyCategoryQuery() {
  const raw = route.query.category
  const q =
    typeof raw === 'string'
      ? raw.trim()
      : Array.isArray(raw)
        ? String(raw[0] || '').trim()
        : ''
  if (!q || q.toUpperCase() === 'POD') {
    selectedCategory.value = null
    return
  }
  if (/^\d+$/.test(q)) {
    const sid = String(parseInt(q, 10))
    if (categories.value.some(c => c.id === sid)) {
      selectedCategory.value = sid
      return
    }
  }
  const found = categories.value.find(c => (c.code || '').toLowerCase() === q.toLowerCase())
  selectedCategory.value = found ? found.id : null
}

watch(categories, () => applyCategoryQuery())

watch(
  () => route.query.category,
  () => applyCategoryQuery(),
)

// Recherche texte sur le nom du produit
const productSearch = ref('')
// Sous-catégorie sélectionnée (enfant de la catégorie courante)
const selectedSubCategory = ref<string | null>(null)
// Catégorie survolée dans le méga-menu (panneau de droite)
const hoveredCategory = ref<string | null>(null)

/** Enfants (sous-catégories) d'une catégorie donnée. */
const childrenOf = (catId: string | null) => {
  if (!catId) return []
  return [...(psStore.categories || [])]
    .filter((c: any) => String(c.parent_id ?? '') === String(catId))
    .sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((c: any) => ({ id: String(c.id), displayLabel: podCategoryLabel(c) }))
}

const hasChildren = (catId: string) => childrenOf(catId).length > 0

/** Catégorie active du panneau de droite : survolée, sinon sélectionnée. */
const activeCategory = computed(() => hoveredCategory.value || selectedCategory.value)
const activeSubCategories = computed(() => childrenOf(activeCategory.value))

/** Sous-catégories de la catégorie sélectionnée. */
const subCategories = computed(() => childrenOf(selectedCategory.value))

/** Identifiants de la catégorie + toutes ses sous-catégories (récursif). */
const descendantCategoryIds = (catId: string): string[] => {
  const ids = [String(catId)]
  const children = (psStore.categories || []).filter(
    (c: any) => String(c.parent_id ?? '') === String(catId),
  )
  for (const ch of children) ids.push(...descendantCategoryIds(String(ch.id)))
  return ids
}

const filteredProducts = computed(() => {
  const term = productSearch.value.trim().toLowerCase()
  let list: any[] = psStore.products || []

  if (selectedCategory.value) {
    const ids = selectedSubCategory.value
      ? [String(selectedSubCategory.value)]
      : descendantCategoryIds(selectedCategory.value)
    const idSet = new Set(ids)
    list = list.filter((p: any) => idSet.has(String(p.category_id ?? p.categoryId ?? '')))
  } else if (!term) {
    // Sans catégorie ni recherche : rien (on affiche les cartes de catégories)
    return []
  }

  if (term) {
    list = list.filter((p: any) => {
      const names = [p.name_fr, p.name_en, p.name_zh, p[`name_${locale.value}`]]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return names.includes(term)
    })
  }

  return list
})

const selectCategory = (id: string) => {
  const sid = String(id)
  selectedCategory.value = selectedCategory.value === sid ? null : sid
  selectedSubCategory.value = null
  syncCategoryUrl()
}

const selectSubCategory = (id: string | null) => {
  selectedSubCategory.value = id ? (selectedSubCategory.value === id ? null : id) : null
}

/** Sélectionne une catégorie parente (méga-menu) et affiche ses produits. */
const selectParent = (id: string) => {
  selectedCategory.value = String(id)
  selectedSubCategory.value = null
  syncCategoryUrl()
}

/** Sélectionne une sous-catégorie depuis le panneau de droite. */
const pickSubCategory = (parentId: string, subId: string) => {
  selectedCategory.value = String(parentId)
  selectedSubCategory.value = String(subId)
  syncCategoryUrl()
}

onMounted(async () => {
  await Promise.all([
    psStore.fetchCategories({ page: 1, limit: 100, slug: 'POD' }),
    psStore.fetchProducts(),
    pricingStore.fetchServices({ page: 1, limit: 50, status: 1 }),
  ])
  applyCategoryQuery()
  cartStore.loadFromLocalStorage()

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    zoomModal = new (window as any).bootstrap.Modal(zoomModalRef.value)
  }
})

const getCategoryName = (id: string) => {
  const sid = String(id)
  const cat = categories.value.find(c => c.id === sid)
  return cat?.displayLabel || ''
}

const addToCart = (product: any) => {
  // L'ajout est synchrone côté UI (cf. cart.ts) — l'item apparaît immédiatement
  // dans le panier. La synchro API (si l'utilisateur est connecté) se fait
  // en tâche de fond sans bloquer l'affichage.
  cartStore.openCart()
  cartStore.addItem(product)
  success(t('cart.addedToCart'))
}

const toggleCart = () => {
  cartStore.toggleCart()
}

const zoomedProduct = ref<any>(null)
const zoomModalRef = ref<HTMLElement | null>(null)
let zoomModal: any = null


const openZoom = (product: any) => {
  zoomedProduct.value = product
  zoomModal?.show()
}

</script>

<style scoped>
.ps-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.ps-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding-bottom: 100px;
  position: relative;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.how-it-works-section,
.categories-section,
.pricing-section,
.advantages-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.step-card {
  transition: transform 0.3s ease;
  border-radius: 16px;
}

.step-card:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 16px;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.category-card.selected {
  border: 2px solid var(--bs-primary) !important;
  background: rgba(var(--bs-primary-rgb), 0.05);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.pricing-card {
  border-radius: 16px;
}

/* ---- Méga-menu catégories (style Jumia) ---- */
.mega-cats { background: #fff; min-height: 320px; }
.mega-cats-parents {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 6px 0;
}
.mega-parent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: none;
  padding: 11px 16px;
  font-size: .92rem;
  color: #374151;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.mega-parent:hover,
.mega-parent.active {
  background: rgba(var(--bs-primary-rgb), 0.06);
  color: var(--bs-primary);
}
.mega-parent.active { font-weight: 600; }
.mega-ic {
  width: 34px; height: 34px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.mega-cats-panel { background: #fcfcfd; }
.mega-subcat {
  display: block;
  padding: 6px 8px;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  font-size: .88rem;
  transition: background .15s, color .15s;
}
.mega-subcat:hover,
.mega-subcat.active {
  background: rgba(var(--bs-primary-rgb), 0.08);
  color: var(--bs-primary);
}
@media (max-width: 767.98px) {
  .mega-cats-parents { border-right: none; border-bottom: 1px solid #f0f0f0; }
}

.pricing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.pricing-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}

.advantage-item {
  padding: 20px;
}

.advantage-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.cta-section {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  position: relative;
  overflow: hidden;
}

.cta-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none;
}

.product-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
}

.product-img-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-img-wrapper img {
  transform: scale(1.05);
}

.product-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.x-small {
  font-size: 0.75rem;
}
</style>

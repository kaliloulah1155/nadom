import { usePersonalShoppingStore } from '~/stores/personalShopping'

/** Précharge les devises (DVS) pour le panier et les formulaires publics. */
export default defineNuxtPlugin(() => {
  const psStore = usePersonalShoppingStore()
  void psStore.fetchCurrencies()
})

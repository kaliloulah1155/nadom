import { ref } from 'vue'
import { useApi, getToken } from '~/composables/useApi'
import { useSwal } from '~/composables/useSwal'

export type PayableType = 'cart' | 'guide_booking' | 'shipment' | 'personal_shopping' | 'visa'

export interface CheckoutResult {
  transaction_id: string
  reference: string
  checkout_url: string
  amount_net: number
  amount_public: number
  commission: number
}

/**
 * Démarre un paiement GeniusPay pour une entité payable (ou le panier) et
 * redirige le client vers la page de paiement hébergée (checkout_url).
 */
export function usePayment() {
  const api = useApi()
  const { error: notifyError } = useSwal()

  // Référence en cours de traitement (pour désactiver le bon bouton dans une liste)
  const processing = ref<string | null>(null)

  async function pay(payableType: PayableType, payableId?: string | null): Promise<boolean> {
    processing.value = payableId || payableType
    try {
      const res = await api.post<CheckoutResult>('/payments/checkout', {
        payable_type: payableType,
        payable_id: payableId ?? null,
      })

      if (res.success && res.data?.checkout_url) {
        // Redirection vers la page de paiement GeniusPay
        if (typeof window !== 'undefined') {
          window.location.href = res.data.checkout_url
        }
        return true
      }

      notifyError(res.message || 'Impossible de démarrer le paiement.')
      return false
    } catch (e: any) {
      notifyError(e?.message || 'Erreur lors du démarrage du paiement.')
      return false
    } finally {
      processing.value = null
    }
  }

  /**
   * Paiement INVITÉ (sans connexion) : le client fournit ses références et paie son panier.
   */
  async function payGuest(
    customer: { name: string; phone: string; email?: string },
    items: Array<{ product_id: string; quantity: number }>,
  ): Promise<boolean> {
    processing.value = 'guest'
    try {
      const res = await api.post<CheckoutResult>('/payments/guest-checkout', { customer, items })
      if (res.success && res.data?.checkout_url) {
        if (typeof window !== 'undefined') {
          window.location.href = res.data.checkout_url
        }
        return true
      }
      notifyError(res.message || 'Impossible de démarrer le paiement.')
      return false
    } catch (e: any) {
      notifyError(e?.message || 'Erreur lors du démarrage du paiement.')
      return false
    } finally {
      processing.value = null
    }
  }

  /**
   * (Admin) Génère un lien de paiement pour une demande validée.
   * Renvoie { checkout_url, whatsapp_url?, whatsapp_message? } ou null.
   */
  async function createPaymentLink(
    payableType: PayableType,
    payableId: string,
    customer?: { name?: string; phone?: string; email?: string },
  ): Promise<(CheckoutResult & { whatsapp_url?: string; whatsapp_message?: string }) | null> {
    processing.value = payableId
    try {
      const res = await api.post<CheckoutResult & { whatsapp_url?: string; whatsapp_message?: string }>(
        '/payments/generate-link',
        { payable_type: payableType, payable_id: payableId, customer },
      )
      if (res.success && res.data?.checkout_url) {
        return res.data
      }
      notifyError(res.message || 'Impossible de générer le lien de paiement.')
      return null
    } catch (e: any) {
      notifyError(e?.message || 'Erreur lors de la génération du lien.')
      return null
    } finally {
      processing.value = null
    }
  }

  /**
   * Calcule le Prix public (frais GeniusPay inclus) à partir du Prix de vente (net).
   * Doit refléter le calcul backend : arrondi_100_sup( net*(1+taux) + frais_fixe ).
   */
  function publicPrice(net: number): number {
    const cfg = useRuntimeConfig()
    const rate = Number(cfg.public.geniuspayFeeRate ?? 0.064)
    const fixed = Number(cfg.public.geniuspayFixedFee ?? 100)
    const commissionRate = Number(cfg.public.geniuspayCommissionRate ?? 0.10)
    const payoutFeeFixed = Number(cfg.public.geniuspayPayoutFeeFixed ?? 1000)
    const payoutFeeRate = Number(cfg.public.geniuspayPayoutFeeRate ?? 0)
    // Le client paie : net + commission + frais de reversement + frais wallet.
    // Le Marchand touche le net entier ; le Consultant garde sa commission.
    const base = net + Math.round(net * commissionRate) + Math.round(payoutFeeFixed + net * payoutFeeRate)
    const gross = Math.max(0, base * (1 + rate) + fixed)
    return Math.ceil(gross / 100) * 100
  }

  const isProcessing = (id: string) => processing.value === id

  /** Télécharge le reçu de paiement (PDF) d'une transaction (authentifié). */
  async function downloadReceipt(reference: string): Promise<void> {
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase as string
      const token = getToken()
      // Langue courante (cookie i18n) pour générer le PDF dans la bonne langue
      const lang = (useCookie('i18n_redirected').value as string) || 'fr'
      const headers: Record<string, string> = { Accept: 'application/pdf', 'X-Locale': lang }
      if (token) headers.Authorization = `Bearer ${token}`
      const blob = await $fetch<Blob>(`/payments/${reference}/receipt`, {
        baseURL,
        responseType: 'blob',
        query: { lang },
        headers,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recu-${reference}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      notifyError('Impossible de télécharger le reçu.')
    }
  }

  return { pay, payGuest, createPaymentLink, publicPrice, processing, isProcessing, downloadReceipt }
}

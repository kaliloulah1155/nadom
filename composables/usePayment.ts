import { ref } from 'vue'
import { useApi, getToken } from '~/composables/useApi'
import { useSwal } from '~/composables/useSwal'

export type PayableType = 'cart' | 'guide_booking' | 'shipment' | 'personal_shopping' | 'visa'

export interface ManualPaymentMethod {
  value: 'cash' | 'wave_manual' | 'orange_money_manual' | 'moov_manual' | 'bank_transfer'
  label: string
}

export const MANUAL_PAYMENT_METHODS: ManualPaymentMethod[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'wave_manual', label: 'Wave (confirmé de visu)' },
  { value: 'orange_money_manual', label: 'Orange Money (confirmé de visu)' },
  { value: 'moov_manual', label: 'Moov Money (confirmé de visu)' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
]

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
   * Paiement INVITÉ d'une entité (réservation guide, visa, …) sans connexion.
   * Le client fournit ses références ; redirige vers la page de paiement.
   */
  async function payGuestEntity(
    payableType: PayableType,
    payableId: string,
    customer: { name: string; phone: string; email?: string },
  ): Promise<boolean> {
    processing.value = payableId
    try {
      const res = await api.post<CheckoutResult>('/payments/guest-checkout', {
        payable_type: payableType,
        payable_id: payableId,
        customer,
      })
      if (res.success && res.data?.checkout_url) {
        if (typeof window !== 'undefined') window.location.href = res.data.checkout_url
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
   * (Admin, Phase 4) Enregistre un encaissement manuel (espèces / Wave / Orange
   * Money / Moov confirmé de visu, sans passerelle) sur une Envoi de colis ou
   * une demande Personal Shopping.
   */
  async function recordManualPayment(payload: {
    payable_type: 'shipment' | 'personal_shopping'
    payable_id: string
    amount: number
    payment_method: ManualPaymentMethod['value']
    note?: string
  }): Promise<boolean> {
    processing.value = payload.payable_id
    try {
      const res = await api.post('/payments/manual', payload)
      if (res.success) {
        return true
      }
      notifyError(res.message || "Impossible d'enregistrer l'encaissement.")
      return false
    } catch (e: any) {
      notifyError(e?.message || "Erreur lors de l'enregistrement de l'encaissement.")
      return false
    } finally {
      processing.value = null
    }
  }

  /** (Admin) Historique des encaissements (manuels + GeniusPay) d'un élément payable. */
  async function fetchPayablePayments(
    payableType: 'shipment' | 'personal_shopping',
    payableId: string,
  ): Promise<{ transactions: any[]; total_collected: number }> {
    try {
      const res = await api.get<{ transactions: any[]; total_collected: number }>(
        `/payments/for/${payableType}/${payableId}`,
      )
      if (res.success && res.data) return res.data
      return { transactions: [], total_collected: 0 }
    } catch {
      return { transactions: [], total_collected: 0 }
    }
  }

  /**
   * Prix client = net NADOM (plus de frais GeniusPay).
   */
  function publicPrice(net: number): number {
    return Math.max(0, Math.round(Number(net) || 0))
  }

  /**
   * Détail Net → Prix client. Les frais GeniusPay sont à 0.
   */
  function priceBreakdown(net: number) {
    const total = publicPrice(net)
    return {
      net: total,
      commission: 0,
      commissionRate: 0,
      payoutFee: 0,
      walletFees: 0,
      total,
    }
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

  return { pay, payGuest, payGuestEntity, createPaymentLink, publicPrice, priceBreakdown, processing, isProcessing, downloadReceipt, recordManualPayment, fetchPayablePayments }
}

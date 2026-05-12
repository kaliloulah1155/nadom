/** Options pour le message WhatsApp envoye par l'admin vers le client. */
export interface ClientWhatsAppOptions {
  quotationUrl?: string | null
  totalLabel?: string | null
  /** Demande confirmee / expediee — formulation adaptee */
  confirmed?: boolean
  trackingNumber?: string | null
  /** URL publique page suivi (ex. site/import-export/tracking?tracking=...) */
  trackingPageUrl?: string | null
}

export const useWhatsApp = () => {
  // Numéro WhatsApp par défaut (à configurer)
  const defaultNumber = useRuntimeConfig().public.whatsapp;

  // Générer le lien WhatsApp
  const generateLink = (phone: string, message?: string): string => {
    const cleanPhone = phone.replace(/[^\d+]/g, '').replace('+', '')
    const baseUrl = 'https://wa.me/'

    if (message) {
      const encodedMessage = encodeURIComponent(message)
      return `${baseUrl}${cleanPhone}?text=${encodedMessage}`
    }

    return `${baseUrl}${cleanPhone}`
  }

  // Ouvrir WhatsApp avec un message prédéfini
  const openChat = (phone: string = defaultNumber, message?: string) => {
    const link = generateLink(phone, message)
    if (typeof window !== 'undefined') {
      window.open(link, '_blank')
    }
    return link
  }

  // Message pour une nouvelle demande (cote client → equipe support)
  const contactForRequest = (requestTitle: string, requestId: string) => {
    const message = `Bonjour ! Je souhaite discuter de ma demande Personal Shopping :

📦 Produit : ${requestTitle}
🔖 Référence : ${requestId}

Merci de me contacter pour plus d'informations.`

    return openChat(defaultNumber, message)
  }

  // Message cote admin/agent → client (target le numero du client)
  const contactClientForRequest = (
    clientPhone: string | undefined | null,
    requestTitle: string,
    requestId: string,
    options: ClientWhatsAppOptions = {},
  ) => {
    if (!clientPhone) return contactForRequest(requestTitle, requestId)
    const message = buildClientRequestMessage(requestTitle, requestId, options)
    return openChat(clientPhone, message)
  }

  /** Message admin → client : sans emoji (compatibilite encodage), avec PDF et suivi si disponibles. */
  const buildClientRequestMessage = (
    requestTitle: string,
    requestId: string,
    options: ClientWhatsAppOptions = {},
  ): string => {
    const lines: string[] = []

    lines.push('Bonjour,')
    lines.push('')
    lines.push('Nous vous contactons depuis NADOM concernant votre demande Personal Shopping.')
    lines.push('')
    lines.push(`Produit / demande : ${requestTitle}`)
    lines.push(`Reference : ${requestId}`)

    if (options.totalLabel) {
      lines.push(`Montant du devis : ${options.totalLabel}`)
    }

    if (options.quotationUrl) {
      lines.push('')
      lines.push('Telechargement du devis (PDF) :')
      lines.push(String(options.quotationUrl))
    }

    const tn = options.trackingNumber?.trim()
    const tp = options.trackingPageUrl?.trim()
    if (tp || tn) {
      lines.push('')
      lines.push('Suivi de colis :')
      if (tp) lines.push(tp)
      if (tn) lines.push(`Numero de suivi : ${tn}`)
    }

    lines.push('')
    if (options.confirmed) {
      lines.push('Pour toute question sur le reglement ou la livraison, repondez a ce message.')
    } else {
      lines.push('Pourrions-nous echanger pour finaliser votre commande ?')
    }
    lines.push('')
    lines.push('Cordialement,')
    lines.push('Equipe NADOM')

    return lines.join('\n')
  }

  // Message pour suivi de colis
  const contactForTracking = (trackingNumber: string) => {
    const message = `Bonjour ! Je souhaite avoir des informations sur mon colis :

📦 Numéro de suivi : ${trackingNumber}

Merci de me donner le statut actuel.`

    return openChat(defaultNumber, message)
  }

  // Message pour réservation guide
  const contactForGuide = (guideName: string, dates: string) => {
    const message = `Bonjour ! Je souhaite réserver un guide :

👤 Guide : ${guideName}
📅 Dates : ${dates}

Merci de me confirmer la disponibilité.`

    return openChat(defaultNumber, message)
  }

  // Message pour demande de visa
  const contactForVisa = (visaType: string) => {
    const message = `Bonjour ! Je souhaite des informations sur le visa :

📋 Type : ${visaType}

Merci de me donner plus de détails sur les démarches.`

    return openChat(defaultNumber, message)
  }

  // Message générique
  const contactSupport = (subject?: string) => {
    let message = `Bonjour ! J'ai besoin d'aide.`

    if (subject) {
      message = `Bonjour ! J'ai une question concernant : ${subject}`
    }

    return openChat(defaultNumber, message)
  }

  return {
    generateLink,
    openChat,
    contactForRequest,
    contactClientForRequest,
    buildClientRequestMessage,
    contactForTracking,
    contactForGuide,
    contactForVisa,
    contactSupport,
    defaultNumber
  }
}

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

  // Message pour une nouvelle demande
  const contactForRequest = (requestTitle: string, requestId: string) => {
    const message = `Bonjour ! Je souhaite discuter de ma demande Personal Shopping :

📦 Produit : ${requestTitle}
🔖 Référence : ${requestId}

Merci de me contacter pour plus d'informations.`

    return openChat(defaultNumber, message)
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
    contactForTracking,
    contactForGuide,
    contactForVisa,
    contactSupport,
    defaultNumber
  }
}

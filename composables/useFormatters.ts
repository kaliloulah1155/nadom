export const useFormatters = () => {
  // Formatage monétaire
  const formatCurrency = (
    amount: number,
    currency: string = 'XOF',
    locale: string = 'fr-FR'
  ): string => {
    if (currency === 'XOF' || currency === 'FCFA') {
      // Format spécial pour le Franc CFA
      return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' FCFA'
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  // Formatage des nombres
  const formatNumber = (
    num: number,
    decimals: number = 0,
    locale: string = 'fr-FR'
  ): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  // Formatage de date
  const formatDate = (
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    locale: string = 'fr-FR'
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, options).format(d)
  }

  // Formatage de date courte
  const formatDateShort = (date: string | Date, locale: string = 'fr-FR'): string => {
    return formatDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }, locale)
  }

  // Formatage de date relative (il y a X jours, etc.)
  const formatRelativeDate = (date: string | Date, locale: string = 'fr-FR'): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'À l\'instant'
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `Il y a ${months} mois`
    }

    const years = Math.floor(diffDays / 365)
    return `Il y a ${years} an${years > 1 ? 's' : ''}`
  }

  // Formatage de poids
  const formatWeight = (weightKg: number): string => {
    if (weightKg < 1) {
      return `${Math.round(weightKg * 1000)} g`
    }
    return `${formatNumber(weightKg, 1)} kg`
  }

  // Formatage de numéro de téléphone
  const formatPhone = (phone: string): string => {
    // Retire les espaces et caractères non numériques sauf +
    const cleaned = phone.replace(/[^\d+]/g, '')

    // Format international
    if (cleaned.startsWith('+')) {
      // +225 XX XX XX XX XX (Côte d'Ivoire)
      if (cleaned.startsWith('+225')) {
        const rest = cleaned.slice(4)
        return `+225 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)} ${rest.slice(8, 10)}`.trim()
      }
      return cleaned
    }

    return phone
  }

  // Tronquer un texte
  const truncate = (text: string, length: number = 100, suffix: string = '...'): string => {
    if (text.length <= length) return text
    return text.slice(0, length).trim() + suffix
  }

  // Capitaliser première lettre
  const capitalize = (text: string): string => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  // Slug d'un texte
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Formatage statut demande
  const formatRequestStatus = (status: string): { label: string; color: string; bgColor: string } => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: 'En attente', color: '#f59e0b', bgColor: '#fef3c7' },
      searching: { label: 'Recherche en cours', color: '#3b82f6', bgColor: '#dbeafe' },
      negotiating: { label: 'Négociation', color: '#8b5cf6', bgColor: '#ede9fe' },
      confirmed: { label: 'Confirmé', color: '#10b981', bgColor: '#d1fae5' },
      preparing: { label: 'Préparation', color: '#06b6d4', bgColor: '#cffafe' },
      shipped: { label: 'Expédié', color: '#6366f1', bgColor: '#e0e7ff' },
      delivered: { label: 'Livré', color: '#22c55e', bgColor: '#dcfce7' },
      cancelled: { label: 'Annulé', color: '#ef4444', bgColor: '#fee2e2' }
    }

    return statusMap[status] || { label: status, color: '#6b7280', bgColor: '#f3f4f6' }
  }

  // Formatage statut expédition
  const formatShipmentStatus = (status: string): { label: string; color: string; icon: string } => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      pending: { label: 'En attente', color: '#f59e0b', icon: 'bi-clock' },
      picked_up: { label: 'Collecté', color: '#3b82f6', icon: 'bi-box-seam' },
      in_transit: { label: 'En transit', color: '#8b5cf6', icon: 'bi-truck' },
      in_customs: { label: 'En douane', color: '#f97316', icon: 'bi-building' },
      out_for_delivery: { label: 'En livraison', color: '#06b6d4', icon: 'bi-bicycle' },
      delivered: { label: 'Livré', color: '#22c55e', icon: 'bi-check-circle' }
    }

    return statusMap[status] || { label: status, color: '#6b7280', icon: 'bi-question-circle' }
  }

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateShort,
    formatRelativeDate,
    formatWeight,
    formatPhone,
    truncate,
    capitalize,
    slugify,
    formatRequestStatus,
    formatShipmentStatus
  }
}

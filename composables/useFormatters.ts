export const useFormatters = () => {
  const { t, locale: i18nLocale } = useI18n()

  const intlLocale = (): string => {
    if (i18nLocale.value === 'en') return 'en-US'
    if (i18nLocale.value === 'zh') return 'zh-CN'
    return 'fr-FR'
  }

  const statusLabel = (key: string, fallback = key): string => {
    const msg = t(key)
    return msg !== key ? msg : fallback
  }

  // Formatage monétaire
  const formatCurrency = (
    amount: number | string | null | undefined,
    currency: string = 'XOF',
    locale?: string
  ): string => {
    const loc = locale ?? intlLocale()
    const n = Number(amount)
    const safe = Number.isFinite(n) ? n : 0
    const code = (currency || 'XOF').toString().toUpperCase()
    // CFA : ISO distinct (XOF UEMOA, XAF CEMAC) — affichage habituel « FCFA » côté FR.
    if (code === 'XOF' || code === 'XAF' || code === 'FCFA') {
      return new Intl.NumberFormat(loc, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(safe) + ' FCFA'
    }
    try {
      return new Intl.NumberFormat(loc, {
        style: 'currency',
        currency: code,
      }).format(safe)
    } catch (_) {
      return new Intl.NumberFormat(loc).format(safe) + ' ' + code
    }
  }

  // Formatage des nombres
  const formatNumber = (
    num: number,
    decimals: number = 0,
    locale?: string
  ): string => {
    return new Intl.NumberFormat(locale ?? intlLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  // Formatage de date (suit la locale i18n : fr / en / zh)
  const formatDate = (
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    locale?: string,
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!d || Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale ?? intlLocale(), options).format(d)
  }

  // Formatage de date courte
  const formatDateShort = (date: string | Date, locale?: string): string => {
    const loc = locale ?? intlLocale()
    return new Intl.DateTimeFormat(loc, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(typeof date === 'string' ? new Date(date) : date)
  }

  const formatDateTime = (date: string | Date, locale?: string): string => {
    const loc = locale ?? intlLocale()
    const d = typeof date === 'string' ? new Date(date) : date
    if (!d || Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(loc, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d)
  }

  // Formatage de date relative
  const formatRelativeDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!d || Number.isNaN(d.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return t('admin.time.justNow')
    if (diffMinutes < 60) return t('admin.time.minutesAgo', { n: diffMinutes })
    if (diffHours < 24) return t('admin.time.hoursAgo', { n: diffHours })
    if (diffDays < 7) return t('admin.time.daysAgo', { n: diffDays })
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return t('admin.time.weeksAgo', { n: weeks })
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return t('admin.time.monthsAgo', { n: months })
    }
    const years = Math.floor(diffDays / 365)
    return t('admin.time.yearsAgo', { n: years })
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
  // `text` est typé `string`, mais les valeurs viennent de l'API où le champ est
  // nullable : une demande « Envoi de colis » n'a pas de titre produit. Sans ce
  // garde-fou, `null.length` remontait jusqu'au rendu et laissait le tableau de
  // bord et la liste des expéditions entièrement blancs.
  const truncate = (text: string | null | undefined, length: number = 100, suffix: string = '...'): string => {
    const s = text == null ? '' : String(text)
    if (s.length <= length) return s
    return s.slice(0, length).trim() + suffix
  }

  /**
   * Libellé affichable d'une demande. Le `title` ne concerne que le Personal
   * Shopping (nom du produit à acheter) ; pour un envoi de colis, on se rabat
   * sur le numéro de suivi, puis sur un libellé générique — plutôt qu'une
   * cellule vide qui ne dit rien à l'agent.
   */
  const requestTitle = (request: any): string => {
    if (!request) return ''
    if (request.title) return request.title
    if (request.requestType === 'package_sending' || request.request_type === 'package_sending') {
      const ref = request.trackingNumber || request.tracking_number
      return ref ? `${t('admin.requests.typePackageSending')} — ${ref}` : t('admin.requests.typePackageSending')
    }
    return request.description || '—'
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

  const REQUEST_STATUS_STYLE: Record<string, { color: string; bgColor: string }> = {
    pending: { color: '#f59e0b', bgColor: '#fef3c7' },
    searching: { color: '#3b82f6', bgColor: '#dbeafe' },
    negotiating: { color: '#8b5cf6', bgColor: '#ede9fe' },
    confirmed: { color: '#10b981', bgColor: '#d1fae5' },
    preparing: { color: '#06b6d4', bgColor: '#cffafe' },
    shipped: { color: '#6366f1', bgColor: '#e0e7ff' },
    delivered: { color: '#22c55e', bgColor: '#dcfce7' },
    cancelled: { color: '#ef4444', bgColor: '#fee2e2' },
    total: { color: '#6b7280', bgColor: '#f3f4f6' },
  }

  const formatRequestStatus = (status: string): { label: string; color: string; bgColor: string } => {
    const style = REQUEST_STATUS_STYLE[status] ?? { color: '#6b7280', bgColor: '#f3f4f6' }
    if (status === 'total') {
      return { label: statusLabel('admin.dashboard.total', 'Total'), ...style }
    }
    return {
      label: statusLabel(`admin.requests.status.${status}`, status),
      ...style,
    }
  }

  const SHIPMENT_STATUS_STYLE: Record<string, { color: string; icon: string }> = {
    pending: { color: '#f59e0b', icon: 'bi-clock' },
    picked_up: { color: '#3b82f6', icon: 'bi-box-seam' },
    in_transit: { color: '#8b5cf6', icon: 'bi-truck' },
    in_customs: { color: '#f97316', icon: 'bi-building' },
    out_for_delivery: { color: '#06b6d4', icon: 'bi-bicycle' },
    delivered: { color: '#22c55e', icon: 'bi-check-circle' },
    order_placed: { color: '#6b7280', icon: 'bi-cart-check' },
    returned: { color: '#ef4444', icon: 'bi-arrow-return-left' },
  }

  const formatShipmentStatus = (status: string): { label: string; color: string; icon: string } => {
    const style = SHIPMENT_STATUS_STYLE[status] ?? { color: '#6b7280', icon: 'bi-question-circle' }
    return {
      label: statusLabel(`admin.shipments.status.${status}`, status),
      ...style,
    }
  }

  /**
   * Vignette liste : les demandes « panier » ont l’image sur les articles (produit), pas sur request.images.
   */
  const requestThumbnailUrl = (
    request: { images?: string[] | null; items?: Array<{ image?: string | null }> | null },
    placeholderPx: number = 40
  ): string => {
    const items = request.items
    if (Array.isArray(items)) {
      for (const it of items) {
        const u = (it?.image && String(it.image).trim()) || ''
        // resolveStorageAssetUrl : préfixe /storage + rebase sur le bon host (VPS).
        if (u) return resolveStorageAssetUrl(u)
      }
    }
    const imgs = request.images
    if (Array.isArray(imgs)) {
      for (const u of imgs) {
        const s = typeof u === 'string' ? u.trim() : ''
        if (s) return resolveStorageAssetUrl(s)
      }
    }
    return `https://placehold.co/${placeholderPx}?text=%3F`
  }

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateShort,
    formatDateTime,
    formatRelativeDate,
    formatWeight,
    formatPhone,
    truncate,
    requestTitle,
    capitalize,
    slugify,
    formatRequestStatus,
    formatShipmentStatus,
    requestThumbnailUrl,
  }
}

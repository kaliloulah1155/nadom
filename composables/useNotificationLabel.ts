import type { AppNotification } from '~/stores/notifications'

/**
 * Le titre d'une notification (ex. "Nouvelle demande de {nom}") est genere
 * cote backend et stocke en francais fige (NotificationService::notifyAdmins,
 * PersonalShoppingRequestController/TicketController/GuideBookingService) —
 * il reste en francais quelle que soit la langue choisie dans l'admin
 * (signale par capture ecran : interface en chinois, notifications restees
 * en francais). Le backend fournit deja tout ce qu'il faut pour un rendu
 * localise cote client : `type` ('request.created', 'ticket.created',
 * 'guide_booking.created') et les donnees brutes dans `message`
 * (ex. client_name) — ce composable reconstruit le titre a partir de ca via
 * i18n, plutot que d'afficher le texte fige stocke en base. Repli sur le
 * titre stocke pour tout type non reconnu (nouveau type ajoute cote
 * backend sans equivalent i18n cote front pas encore livre).
 */
export function useNotificationLabel() {
  const { t } = useI18n()

  const notificationTitle = (n: Pick<AppNotification, 'type' | 'title' | 'message'>): string => {
    const meta = n.message && typeof n.message === 'object' ? n.message : {}
    const name = (meta as any).client_name || ''

    switch (n.type) {
      case 'request.created':
        return t('admin.notifications.types.requestCreated', { name })
      case 'ticket.created':
        return t('admin.notifications.types.ticketCreated')
      case 'guide_booking.created':
        return t('admin.notifications.types.guideBookingCreated', { name })
      default:
        return n.title
    }
  }

  return { notificationTitle }
}

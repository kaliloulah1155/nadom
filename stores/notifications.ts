import { defineStore } from 'pinia'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: any
  link?: string | null
  is_read: boolean
  created_at: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as AppNotification[],
    unread: 0,
    loading: false,
    page: 1,
    perPage: 20,
    total: 0,
    bound: false,
  }),

  actions: {
    async fetch(page = 1, limit = 20) {
      const api = useApi()
      this.loading = true
      try {
        const res = await api.get<any>(`/notifications?page=${page}&limit=${limit}`)
        if (res.success && res.data) {
          const payload = res.data
          if (Array.isArray(payload)) {
            this.items = payload
            this.unread = payload.filter((n: any) => !n.is_read).length
            this.total = payload.length
          } else {
            const items = payload.items?.data ?? payload.items ?? payload.data ?? []
            this.items = items
            this.unread = payload.unread ?? items.filter((n: any) => !n.is_read).length
            this.total = payload.items?.total ?? items.length
          }
          this.page = page
          this.perPage = limit
        }
      } catch (_) {
        // silent
      } finally {
        this.loading = false
      }
    },

    async markRead(id: string) {
      const api = useApi()
      const res = await api.put(`/notifications/${id}/read`, {})
      if (res.success) {
        const n = this.items.find(i => i.id === id)
        if (n && !n.is_read) {
          n.is_read = true
          this.unread = Math.max(0, this.unread - 1)
        }
      }
    },

    async markAllRead() {
      const api = useApi()
      const res = await api.put('/notifications/read-all', {})
      if (res.success) {
        this.items.forEach(n => { n.is_read = true })
        this.unread = 0
      }
    },

    pushFromBroadcast(payload: any) {
      const item: AppNotification = {
        id: 'live-' + (payload.created_at || Date.now()),
        type: payload.type || 'info',
        title: payload.title || '',
        message: payload.message ?? payload.meta ?? null,
        link: payload.link ?? null,
        is_read: false,
        created_at: payload.created_at || new Date().toISOString(),
      }
      this.items.unshift(item)
      this.unread++
      if (this.items.length > 50) this.items.length = 50
    },

    bindRealtime() {
      if (this.bound) return
      const { $echo } = useNuxtApp() as any
      if (!$echo) {
        console.warn('[Pusher] $echo non disponible — vérifier la cle Pusher dans nuxt.config.ts')
        return
      }
      try {
        // Public channel — pas d'auth
        const publicCh = $echo.channel('public-notifications')
        publicCh.listen('.notification', (e: any) => {
          console.log('[Pusher] notification recue (public):', e)
          this.pushFromBroadcast(e)
        })

        // Canal public admin — pas d'auth requise
        const adminCh = $echo.channel('admin-notifications')
        adminCh.listen('.notification', (e: any) => {
          this.pushFromBroadcast(e)
        })

        // Ping de connexion
        const pusher: any = ($echo as any).connector?.pusher
        if (pusher?.connection) {
          const state = pusher.connection.state
          if (state !== 'connected') {
            pusher.connection.bind('connected', () => {})
          }
        }

        this.bound = true
      } catch (e: any) {
        console.error('[Pusher] bindRealtime echec:', e)
      }
    },

    unbindRealtime() {
      const { $echo } = useNuxtApp() as any
      if (!$echo) return
      try {
        $echo.leave('public-notifications')
        $echo.leave('admin-notifications')  // public channel
      } catch (_) {
        // ignore
      }
      this.bound = false
    },
  },
})

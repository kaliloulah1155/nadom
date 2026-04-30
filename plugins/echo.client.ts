import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<any>
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const key = config.public.pusherKey as string
  const cluster = config.public.pusherCluster as string

  if (!key) {
    return { provide: { echo: null as Echo<any> | null } }
  }

  window.Pusher = Pusher

  const echo = new Echo({
    broadcaster: 'pusher',
    Pusher,
    key,
    cluster,
    forceTLS: true,
    encrypted: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: apiBase.replace(/\/$/, '') + '/broadcasting/auth',
    auth: {
      headers: {
        Accept: 'application/json',
      },
    },
    authorizer: (channel: any) => ({
      authorize: async (socketId: string, callback: Function) => {
        try {
          const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('nadom_token') : null
          const res = await fetch(apiBase.replace(/\/$/, '') + '/broadcasting/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
            body: `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channel.name)}`,
          })
          if (!res.ok) throw new Error(`Auth failed (${res.status})`)
          const data = await res.json()
          callback(null, data)
        } catch (e: any) {
          callback(e, null)
        }
      },
    }),
  })

  window.Echo = echo

  const pusherInstance: any = (echo as any).connector?.pusher
  if (pusherInstance?.connection) {
    pusherInstance.connection.bind('error', (err: any) => {
      console.error('[Pusher] Connection error:', err)
    })
    pusherInstance.connection.bind('state_change', (states: any) => {
      console.log('[Pusher] State:', states.previous, '->', states.current)
    })
  }

  return {
    provide: {
      echo,
    },
  }
})

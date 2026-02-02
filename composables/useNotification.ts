import { ref } from 'vue'

export interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const notifications = ref<Notification[]>([])

export const useNotification = () => {
  const addNotification = (
    message: string,
    type: Notification['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now()

    notifications.value.push({
      id,
      message,
      type,
      duration
    })

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // Raccourcis
  const success = (message: string, duration?: number) => {
    return addNotification(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return addNotification(message, 'error', duration)
  }

  const warning = (message: string, duration?: number) => {
    return addNotification(message, 'warning', duration)
  }

  const info = (message: string, duration?: number) => {
    return addNotification(message, 'info', duration)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  }
}

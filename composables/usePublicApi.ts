import type { FetchOptions } from 'ofetch'

interface ApiResponse<T = any> {
  success: boolean
  status?: string
  message: string
  data: T
}

export const usePublicApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const request = async <T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {})
    }

    const isFormData = options.body instanceof FormData

    // Laravel workaround: PUT/PATCH requests with FormData (file uploads)
    // require method tunneling via POST + _method field
    if (isFormData && options.body && (options.method === 'PUT' || options.method === 'PATCH')) {
      (options.body as FormData).append('_method', options.method)
      options.method = 'POST'
    }

    if (!isFormData && !headers['Content-Type'] && options.method && options.method !== 'GET') {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const rawResponse = await $fetch<any>(endpoint, {
        baseURL,
        ...options,
        headers
      })

      const response: ApiResponse<T> = {
        ...rawResponse,
        success: rawResponse.success ?? (rawResponse.status === 'success')
      }

      return response
    } catch (error: any) {
      const status = error?.response?.status
      const data = error?.response?._data

      // Ne PAS rediriger automatiquement sur erreur 401 pour les APIs publiques
      // Juste retourner l'erreur pour que le store gère lui-même

      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>
      }

      let message = 'Une erreur est survenue'
      if (!status && (error?.message?.includes('Failed to fetch') || error?.name === 'FetchError')) {
        message = `Impossible de contacter le serveur (${baseURL}). Vérifiez que le backend est démarré.`
      } else if (status === 404) {
        message = 'Ressource introuvable'
      } else if (status === 422 && data?.errors) {
        const first = Object.values(data.errors)[0]
        message = Array.isArray(first) ? first[0] : data.message || 'Données invalides'
      } else if (data?.message) {
        message = data.message
      } else if (error?.message && !error.message.startsWith('[')) {
        message = error.message
      }

      return { success: false, message, data: null as any }
    }
  }

  return {
    get: <T = any>(endpoint: string, options: FetchOptions = {}) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(endpoint: string, body?: any, options: FetchOptions = {}) =>
      request<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T = any>(endpoint: string, body?: any, options: FetchOptions = {}) =>
      request<T>(endpoint, { ...options, method: 'PUT', body }),

    delete: <T = any>(endpoint: string, options: FetchOptions = {}) =>
      request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}
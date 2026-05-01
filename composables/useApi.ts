import type { FetchOptions } from 'ofetch'

export interface ApiResponse<T = any> {
  success: boolean
  status?: string
  message: string
  data: T
}

const TOKEN_KEY = 'nadom_token'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const request = async <T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> => {
    const token = getToken()
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

    if (token) headers.Authorization = `Bearer ${token}`

    try {
      const rawResponse = await $fetch<any>(endpoint, {
        baseURL,
        ...options,
        headers
      })

      // Normalisation de la réponse (Gestion du format status: 'success/error')
      const response: ApiResponse<T> = {
        ...rawResponse,
        success: rawResponse.success ?? (rawResponse.status === 'success')
      }

      return response
    } catch (error: any) {
      const status = error?.response?.status
      const data = error?.response?._data

      // Only redirect on 401 if the user had a token (session expired).
      // Without a token, the user is on a public page — return the error
      // instead of forcing them to /login.
      if (status === 401 && token) {
        clearToken()
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          await navigateTo('/login')
        }
      }

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

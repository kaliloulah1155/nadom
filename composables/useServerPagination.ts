import { ref, watch, unref, type Ref } from 'vue'
import { useApi } from '~/composables/useApi'

interface PaginationOptions {
  endpoint: string
  method?: 'GET' | 'POST'
  initialLimit?: number
  initialFilters?: Record<string, any>
  immediate?: boolean
}

export function useServerPagination<T = any>(options: PaginationOptions) {
  const api = useApi()
  
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(options.initialLimit || 15)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref({ ...(options.initialFilters || {}) })

  const fetchItems = async (params: { page?: number; limit?: number; filters?: Record<string, any> } = {}) => {
    loading.value = true
    error.value = null
    
    // Update local state if params are provided
    if (params.page) currentPage.value = params.page
    if (params.limit) perPage.value = params.limit
    if (params.filters) filters.value = { ...filters.value, ...params.filters }

    try {
      const method = options.method || 'POST'
      const payload = {
        ...filters.value,
        page: currentPage.value,
        limit: perPage.value
      }

      const fetchOptions = method === 'POST' 
        ? { body: payload, query: { page: currentPage.value, limit: perPage.value } } 
        : { query: { ...payload } }

      const res = await (method === 'POST' 
        ? api.post<any>(options.endpoint, fetchOptions.body, { query: fetchOptions.query })
        : api.get<any>(options.endpoint, { query: fetchOptions.query }))

      if (res.success && res.data) {
        // Handle standard Laravel pagination structure or custom wrap
        const data = res.data.data !== undefined ? res.data.data : res.data
        items.value = data || []
        total.value = res.data.total || (Array.isArray(data) ? data.length : 0)
        currentPage.value = res.data.current_page || currentPage.value
        lastPage.value = res.data.last_page || 1
      } else {
        error.value = res.message || 'Erreur lors du chargement des données'
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur réseau'
      console.error('Pagination fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  // Handle page/limit changes automatically if needed, 
  // but usually triggered by AdminPagination events
  const onPageChange = (page: number) => {
    currentPage.value = page
    fetchItems()
  }

  const onLimitChange = (limit: number) => {
    perPage.value = limit
    currentPage.value = 1 // Reset to page 1 on limit change
    fetchItems()
  }

  const applyFilters = (newFilters: Record<string, any>) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
    fetchItems()
  }

  if (options.immediate !== false) {
    onMounted(() => {
      fetchItems()
    })
  }

  return {
    items,
    total,
    currentPage,
    perPage,
    lastPage,
    loading,
    error,
    filters,
    fetchItems,
    onPageChange,
    onLimitChange,
    applyFilters
  }
}

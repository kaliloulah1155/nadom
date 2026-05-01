import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface RolePermission {
  [key: string]: boolean // Format: 'action:menu' -> true/false
}

export interface Role {
  id: number
  uuid: string
  libelle: string
  code: string
  description?: string
  status: number
  created_at: string
}

export interface RoleWithPermissions {
  role: Role
  perm: RolePermission
}

interface RolesState {
  roles: RoleWithPermissions[]
  paginatedRoles: RoleWithPermissions[]
  allActions: any[]
  allMenus: any[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  loading: boolean
  error: string | null
}

export const useRolesStore = defineStore('roles', {
  state: (): RolesState => ({
    roles: [],
    paginatedRoles: [],
    allActions: [],
    allMenus: [],
    total: 0,
    currentPage: 1,
    perPage: 5,
    lastPage: 1,
    loading: false,
    error: null
  }),

  actions: {
    async fetchRoles(params: { page?: number; limit?: number } = {}) {
      // Appel sans paramètres = liste complète (pour dropdowns)
      // Appel avec page/limit = pagination serveur (pour tables)
      const hasPaging = params.page !== undefined || params.limit !== undefined
      try {
        const api = useApi()
        if (hasPaging) {
          this.loading = true
          const page = params.page ?? this.currentPage
          const limit = params.limit ?? this.perPage
          const res = await api.post<any>('/role/all', { page, limit }, { query: { page, limit } })
          if (res.success && res.data) {
            this.paginatedRoles = res.data.data || []
            this.total = res.data.total || 0
            this.currentPage = res.data.current_page || 1
            this.perPage = res.data.per_page || limit
            this.lastPage = res.data.last_page || 1
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<RoleWithPermissions[]>('/role/all')
          if (res.success && res.data) {
            this.roles = res.data
          }
        }
      } catch (err: any) {
        this.error = 'Erreur lors du chargement des rôles'
      } finally {
        this.loading = false
      }
    },

    async fetchRolesPaginated(params: { page?: number; limit?: number } = {}) {
      // Alias rétrocompatible
      return this.fetchRoles({
        page: params.page ?? this.currentPage,
        limit: params.limit ?? this.perPage
      })
    },

    async fetchMatrixConfig() {
      const api = useApi()
      try {
        const [actionsRes, menusRes] = await Promise.all([
          api.get<any[]>('/action/all'),
          api.get<any[]>('/menu/all')
        ])
        
        if (actionsRes.success) this.allActions = actionsRes.data
        if (menusRes.success) this.allMenus = menusRes.data
      } catch (e) {
        console.error('Failed to fetch matrix config')
      }
    },

    async saveRole(roleData: { libelle: string; code: string; description?: string; permissions?: string[] }, uuid?: string) {
      const api = useApi()
      const isUpdate = !!uuid
      
      const res = isUpdate 
        ? await api.put<RoleWithPermissions>(`/role/${uuid}`, roleData)
        : await api.post<RoleWithPermissions>('/role', roleData)

      if (res.success && res.data) {
        await this.fetchRoles() // Rafraîchir tout pour être sûr
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteRole(uuid: string) {
      const api = useApi()
      const res = await api.delete(`/role/${uuid}`)
      if (res.success) {
        this.roles = this.roles.filter(r => r.role.uuid !== uuid)
        this.paginatedRoles = this.paginatedRoles.filter(r => r.role.uuid !== uuid)
        return true
      }
      throw new Error(res.message)
    }
  }
})

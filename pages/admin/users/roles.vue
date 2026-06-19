<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.users.rolesTitle') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.users.rolesProfilesCount', { n: rolesStore.total }) }}</p>
      </div>
      <button v-can="['create', 'roles']" class="btn btn-primary px-4" @click="openModal()">
        <i class="bi bi-shield-plus me-2"></i>{{ t('admin.users.newRole') }}
      </button>
    </div>

    <!-- Liste paginée des rôles -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th style="width: 250px;">{{ t('admin.users.label') }}</th>
                <th style="width: 180px;">{{ t('admin.users.code') }}</th>
                <th>{{ t('admin.users.description') }}</th>
                <th style="width: 120px;">{{ t('admin.dashboard.status') }}</th>
                <th style="width: 160px;">{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rolesStore.loading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </td>
              </tr>
              <tr v-else-if="rolesStore.paginatedRoles.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">{{ t('admin.users.noRoles') }}</td>
              </tr>
              <tr
                v-for="item in rolesStore.paginatedRoles"
                :key="item.role.uuid"
                :class="{ 'table-active': selectedRole?.role.uuid === item.role.uuid }"
                style="cursor: pointer;"
                @click="selectRole(item)"
              >
                <td class="fw-medium">{{ item.role.libelle }}</td>
                <td><code class="small">{{ item.role.code }}</code></td>
                <td class="text-muted small">{{ item.role.description || '-' }}</td>
                <td>
                  <span class="badge rounded-pill" :class="item.role.status === 1 ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                    {{ item.role.status === 1 ? t('admin.common.active') : t('admin.common.inactive') }}
                  </span>
                </td>
                <td @click.stop>
                  <button v-can="['update', 'roles']" class="btn btn-sm btn-outline-info me-2" @click="openModal(item.role)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-can="['delete', 'roles']" class="btn btn-sm btn-outline-danger" @click="handleDelete(item.role)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="rolesStore.currentPage"
          v-model:limit="rolesStore.perPage"
          :total-items="rolesStore.total"
          @update:current-page="(p: number) => fetchRoles(p)"
          @update:limit="(l: number) => fetchRoles(1, l)"
        />
      </div>
    </div>

    <div class="row g-4">
      <!-- Permission Matrix -->
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom p-4  justify-content-center">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
              <!-- Selected role info -->
              <div v-if="selectedRole" class="d-flex align-items-center gap-3">
                <i class="bi bi-shield-check fs-2 text-primary"></i>
                <div>
                  <small class="text-muted text-uppercase fw-bold">{{ t('admin.users.selectedProfile') }}</small>
                  <h5 class="mb-0">{{ selectedRole.role.libelle }}</h5>
                </div>
              </div>
              <div v-else class="text-muted">
                <i class="bi bi-info-circle me-2"></i>{{ t('admin.users.selectRoleHint') }}
              </div>
            </div>
          </div>
          
          <div class="card-body p-0 ">
            <div class="table-responsive" style="max-height: 700px; overflow-y: auto;">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light sticky-top">
                  <tr>
                    <th class="ps-4" style="min-width: 200px;">{{ t('admin.users.modulesMenus') }}</th>
                    <th v-for="action in rolesStore.allActions" :key="action.uuid" class="text-center small text-uppercase">
                      {{ action.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="menu in rolesStore.allMenus" :key="menu.menu.uuid">
                    <td class="ps-4">
                      <div class="fw-medium">{{ menu.menu.libelle }}</div>
                      <small class="text-muted">{{ menu.menu.code }}</small>
                    </td>
                    <td v-for="action in rolesStore.allActions" :key="action.uuid" class="text-center">
                      <div class="form-check d-inline-block">
                        <input 
                          type="checkbox" 
                          class="form-check-input" 
                          :checked="hasPermission(action.code, menu.menu.code)"
                          @change="togglePermission(action.code, menu.menu.code)"
                          :disabled="!isEditable(action.code, menu.menu.code)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card-footer bg-transparent border-top-0 p-4 text-end">
            <button class="btn btn-primary px-5" :disabled="submitting || !hasChanges" @click="savePermissions">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ t('admin.users.saveAccess') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <div class="modal fade" id="roleModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pt-4 px-4">
            <h5 class="modal-title fw-bold">{{ editingRole ? t('admin.users.modalEditRole') : t('admin.users.newRole') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSaveRole">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label small text-uppercase fw-bold">Nom du rôle *</label>
                <input v-model="roleForm.libelle" type="text" class="form-control" required placeholder="Ex: Manager Logistique" />
              </div>
              <div class="mb-3">
                <label class="form-label small text-uppercase fw-bold">Code unique *</label>
                <input v-model="roleForm.code" type="text" class="form-control" required placeholder="Ex: manager_log" :disabled="!!editingRole" />
              </div>
              <div class="mb-0">
                <label class="form-label small text-uppercase fw-bold">Description</label>
                <WysiwygEditor v-model="roleForm.description" height="140px" placeholder="Description courte des responsabilités..." />
              </div>
            </div>
            <div class="modal-footer border-0 pb-4 px-4">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
                {{ editingRole ? 'Mettre à jour' : 'Créer le rôle' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive, onMounted } from 'vue'
import { useRolesStore } from '~/stores/roles'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const rolesStore = useRolesStore()
const { success, error } = useNotification()

// State
const selectedRole = ref<any>(null)
const editingRole = ref<any>(null)
const submitting = ref(false)
const hasChanges = ref(false)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const roleForm = reactive({
  libelle: '',
  code: '',
  description: '',
  permissions: [] as string[]
})

// Permissions state (local copy for editing)
const currentPermissions = ref<Record<string, boolean>>({})

const fetchRoles = async (page?: number, limit?: number) => {
  await rolesStore.fetchRoles({
    page: page ?? rolesStore.currentPage,
    limit: limit ?? rolesStore.perPage
  })
}

onMounted(async () => {
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }

  await Promise.all([
    fetchRoles(1),
    rolesStore.fetchMatrixConfig()
  ])

  if (rolesStore.paginatedRoles.length > 0) {
    selectRole(rolesStore.paginatedRoles[0])
  }
})

const selectRole = (roleWithPerms: any) => {
  selectedRole.value = roleWithPerms
  currentPermissions.value = { ...roleWithPerms.perm }
  hasChanges.value = false
}

const hasPermission = (action: string, menu: string) => {
  return currentPermissions.value[`${action}:${menu}`] || false
}

const isEditable = (action: string, menuCode: string) => {
  // Check if the backend actually linked this action to this menu
  const menuData = rolesStore.allMenus.find(m => m.menu.code === menuCode)
  if (!menuData) return false
  
  // Note: Backend format for allMenus[i].actions is [{ code: '...', permissions: { code: true/false } }]
  const actionData = menuData.actions.find((a: any) => a.code === action)
  return actionData?.permissions[action] === true
}

const togglePermission = (action: string, menu: string) => {
  const key = `${action}:${menu}`
  currentPermissions.value[key] = !currentPermissions.value[key]
  hasChanges.value = true
}

const openModal = (role?: any) => {
  if (role) {
    editingRole.value = role
    roleForm.libelle = role.libelle
    roleForm.code = role.code
    roleForm.description = role.description || ''
  } else {
    editingRole.value = null
    roleForm.libelle = ''
    roleForm.code = ''
    roleForm.description = ''
  }
  modalInstance?.show()
}

const handleSaveRole = async () => {
  submitting.value = true
  try {
    const payload = {
      libelle: roleForm.libelle,
      code: roleForm.code,
      description: roleForm.description,
      // Ne pas envoyer permissions pour éviter de les supprimer involontairement
    }
    await rolesStore.saveRole(payload, editingRole.value?.uuid)
    success(editingRole.value ? t('admin.users.roleUpdated') : t('admin.users.roleCreated'))
    modalInstance?.hide()
    await fetchRoles(rolesStore.currentPage)
  } catch (err: any) {
    error(err.message)
  } finally {
    submitting.value = false
  }
}

const savePermissions = async () => {
  if (!selectedRole.value) return
  submitting.value = true
  
  try {
    const permissions = Object.keys(currentPermissions.value)
      .filter(key => currentPermissions.value[key])
    
    await rolesStore.saveRole({
      libelle: selectedRole.value.role.libelle,
      code: selectedRole.value.role.code,
      permissions
    }, selectedRole.value.role.uuid)
    
    hasChanges.value = false
    success(t('admin.users.permissionsUpdated'))
  } catch (err: any) {
    error(err.message)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (role: any) => {
  if (await useSwal().confirmDelete(t('admin.users.confirmDeleteRole', { name: role.libelle }))) {
    try {
      await rolesStore.deleteRole(role.uuid)
      success(t('admin.users.roleDeleted'))
      await fetchRoles(rolesStore.currentPage)
      selectedRole.value = rolesStore.paginatedRoles[0] || null
      if (selectedRole.value) currentPermissions.value = { ...selectedRole.value.perm }
    } catch (err: any) {
      error(err.message)
    }
  }
}
</script>

<style scoped>
.form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.list-group-item.active {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
  color: white !important;
}

.shadow-hover {
  transition: transform 0.2s;
}

.shadow-hover:hover {
  transform: translateY(-2px);
}

.table th {
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  vertical-align: middle;
}

.table td {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>

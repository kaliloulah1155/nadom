import { useAbility } from '@casl/vue'

/**
 * Habilitations back-office (CASL) avec contournement super-admin.
 */
export function useAdminAbility() {
  const ability = useAbility()
  const authStore = useAuthStore()

  const roleCode = computed(() => {
    const role = authStore.currentUser?.role
    return String(typeof role === 'object' ? role?.code : role || '').toLowerCase().trim()
  })

  const isSuperAdmin = computed(() => roleCode.value === 'super-admin')

  function can(action: string, subject: string): boolean {
    if (isSuperAdmin.value) return true
    if (ability.can('manage', 'all')) return true
    return ability.can(action, subject)
  }

  return { can, isSuperAdmin, roleCode, ability }
}

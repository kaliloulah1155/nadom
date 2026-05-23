import { watch } from 'vue'
import { abilitiesPlugin } from '@casl/vue'
import { Ability } from '@casl/ability'
import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const ability = new Ability([])

  const resolveArgs = (value: any): [string, string] | null => {
    if (Array.isArray(value) && value.length >= 2) {
      return [String(value[0]), String(value[1])]
    }
    if (typeof value === 'string' && value.includes(':')) {
      const [a, s] = value.split(':')
      return [a.trim(), s.trim()]
    }
    return null
  }

  const isSuperAdminUser = () => {
    try {
      const authStore = useAuthStore()
      const role = authStore.currentUser?.role
      const code = String(typeof role === 'object' ? role?.code : role || '').toLowerCase().trim()
      return code === 'super-admin'
    } catch {
      return false
    }
  }

  const applyCan = (el: HTMLElement, binding: any) => {
    if (!el || !el.style) return
    const parsed = resolveArgs(binding.value)
    if (!parsed) return
    const [action, subject] = parsed

    if (isSuperAdminUser() || ability.can('manage', 'all')) {
      el.style.removeProperty('display')
      return
    }

    const hasRules = (ability as any).rules?.length > 0
    if (!hasRules) {
      el.style.removeProperty('display')
      return
    }
    if (!ability.can(action, subject)) {
      el.style.display = 'none'
    } else {
      el.style.removeProperty('display')
    }
  }

  // Register the directive synchronously FIRST so it is resolvable on both
  // server and client, regardless of whether auth wiring below succeeds.
  nuxtApp.vueApp.directive('can', {
    mounted: applyCan,
    updated: applyCan,
    getSSRProps: () => ({})
  })

  try {
    nuxtApp.vueApp.use(abilitiesPlugin, ability, {
      useGlobalProperties: true
    })
  } catch {}

  // Auth rules only exist client-side; avoid touching the store during SSR.
  if (import.meta.client) {
    try {
      const authStore = useAuthStore()
      watch(
        () => authStore.currentUser?.ability?.rules,
        (newRules) => {
          if (newRules && Array.isArray(newRules)) {
            ability.update(newRules)
          } else {
            ability.update([])
          }
        },
        { immediate: true, deep: true }
      )
    } catch {}
  }
})

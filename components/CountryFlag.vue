<template>
  <span
    class="country-flag d-inline-flex align-items-center justify-content-center flex-shrink-0"
    :style="wrapperStyle"
    role="img"
    :aria-label="aria"
  >
    <span
      v-if="normalizedIso"
      class="fi rounded border border-black border-opacity-10 shadow-sm"
      :class="`fi-${normalizedIso}`"
      aria-hidden="true"
    />
    <span v-else-if="emoji" class="country-flag-emoji lh-1">{{ emoji }}</span>
    <i v-else class="bi bi-globe2 text-muted opacity-75" aria-hidden="true"></i>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** ISO 3166-1 alpha-2 (CI, CM, FR…) */
    iso?: string | null
    /** Fallback si pas de code ISO connu */
    emoji?: string | null
    /** Accessibilité */
    label?: string
    /** Taille du drapeau (SVG CSS flag-icons) */
    size?: string
  }>(),
  {
    iso: null,
    emoji: null,
    label: '',
    size: '1.25rem',
  }
)

const normalizedIso = computed(() => {
  const c = (props.iso || '').trim().toLowerCase()
  if (!c || c.length !== 2 || !/^[a-z]{2}$/.test(c)) return ''
  return c
})

const aria = computed(() => props.label?.trim() || 'Pays')

const wrapperStyle = computed(() => ({
  fontSize: props.size,
}))
</script>

<style scoped>
.country-flag .fi {
  width: 1.35em;
  height: 1.02em;
  background-size: cover;
}
.country-flag-emoji {
  font-size: 1.15em;
}
</style>

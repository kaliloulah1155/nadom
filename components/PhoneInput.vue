<template>
  <div class="phone-input">
    <input
      ref="inputRef"
      type="tel"
      class="form-control"
      :class="[sizeClass, { 'is-invalid': showError }]"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="onInput"
      @blur="touched = true"
    />
    <div v-if="showError" class="invalid-feedback d-block">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * Champ téléphone international (`intl-tel-input`) : drapeau + indicatif séparé,
 * validation de longueur par pays, v-model en E.164 (`+225…`).
 *
 * Affichage : layout flex (conteneur pays en flux) pour éviter le chevauchement
 * indicatif / numéro — le padding absolu d’iti est trop fragile avec Bootstrap.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import intlTelInput from 'intl-tel-input/intlTelInputWithUtils'
import type { Iti } from 'intl-tel-input'
import 'intl-tel-input/build/css/intlTelInput.css'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    /** Pays présélectionné (code ISO à 2 lettres). */
    country?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    /** Reprend les tailles Bootstrap : 'lg' | 'sm' | ''. */
    size?: string
  }>(),
  { modelValue: '', country: 'ci', placeholder: '', required: false, disabled: false, size: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  /** Vrai tant que le numéro saisi n'est pas valide pour le pays choisi. */
  (e: 'invalid', v: boolean): void
}>()

const { t } = useI18n()

const inputRef = ref<HTMLInputElement | null>(null)
const touched = ref(false)
const erreur = ref<string | null>(null)
let iti: Iti | null = null

/**
 * Dernière valeur remontée au parent. Le parent la réinjecte aussitôt via
 * `modelValue`, ce qui réveillait le `watch` et faisait réécrire le champ par
 * `setNumber()` en pleine frappe : avec `separateDialCode`, l'indicatif est
 * affiché à part, si bien que la réécriture le rajoutait dans la saisie et
 * produisait des valeurs comme « +23+225789 ». On ignore donc l'écho.
 */
let derniereValeurEmise: string | null = null

const remonter = (valeur: string) => {
  derniereValeurEmise = valeur
  emit('update:modelValue', valeur)
}

const sizeClass = computed(() => (props.size ? `form-control-${props.size}` : ''))
const showError = computed(() => touched.value && !!erreur.value)
const errorMessage = computed(() => erreur.value || '')

/**
 * Traduit le code d'erreur d'`intl-tel-input` en message lisible. Les codes
 * proviennent de libphonenumber : 2 = trop court, 3 = trop long.
 */
const messagePour = (code: number | null): string | null => {
  if (code === null) return null
  if (code === 3) return t('phone.tooLong')
  if (code === 2) return t('phone.tooShort')
  return t('phone.invalid')
}

/** Retire un indicatif collé dans la saisie (collage E.164 alors que l’indicatif est déjà affiché à part). */
const normaliserSaisieSansIndicatif = () => {
  if (!iti || !inputRef.value) return
  const brut = inputRef.value.value.trim()
  if (!brut) return

  const data = iti.getSelectedCountryData()
  const dial = data?.dialCode
  if (!dial) return

  let national = brut
  if (national.startsWith('+')) {
    // Collage international → laisser setNumber reconstruire l’affichage national.
    iti.setNumber(national)
    return
  }
  // « 22507… » ou « 00225… » collé dans le champ national
  const digits = national.replace(/\D/g, '')
  if (digits.startsWith(dial) && digits.length > dial.length + 4) {
    iti.setNumber(`+${digits}`)
  }
}

const evaluer = () => {
  if (!iti) return
  const brut = inputRef.value?.value?.trim() ?? ''

  // Champ vide : l'obligation éventuelle est gérée par le formulaire parent.
  if (!brut) {
    erreur.value = props.required ? t('phone.required') : null
    emit('invalid', props.required)
    remonter('')
    return
  }

  normaliserSaisieSansIndicatif()

  if (iti.isValidNumber()) {
    erreur.value = null
    emit('invalid', false)
    remonter(iti.getNumber() || brut)
    return
  }

  // Trop long : souvent un indicatif en double après collage / préremplissage.
  const codeErr = iti.getValidationError()
  if (codeErr === 3) {
    normaliserSaisieSansIndicatif()
    if (iti.isValidNumber()) {
      erreur.value = null
      emit('invalid', false)
      remonter(iti.getNumber() || '')
      return
    }
  }

  erreur.value = messagePour(codeErr)
  emit('invalid', true)
  // On remonte tout de même la saisie : la vider à l'insu de l'utilisateur
  // effacerait son travail sans explication.
  remonter(iti.getNumber() || brut)
}

const onInput = () => {
  // On n'affiche l'erreur qu'une fois le champ quitté, pour ne pas harceler
  // pendant la frappe — mais on évalue en continu pour l'état `invalid`.
  evaluer()
}

/** Avec le layout flex, l’indicatif est hors du champ : on annule le padding-left calculé par iti. */
const appliquerPadding = () => {
  if (!inputRef.value) return
  inputRef.value.style.setProperty('padding-left', '0.75rem', 'important')
}

const onCountryChange = () => {
  nextTick(() => {
    appliquerPadding()
    evaluer()
  })
}

onMounted(async () => {
  await nextTick()
  if (!inputRef.value) return
  iti = intlTelInput(inputRef.value, {
    initialCountry: props.country,
    // separateDialCode force nationalMode=false côté lib ; l’indicatif reste hors input.
    formatOnDisplay: true,
    separateDialCode: true,
    allowDropdown: true,
    autoPlaceholder: 'polite',
    // Rattache la liste des pays au <body> : dans une modale (demande de visa,
    // « Nouvelle demande » du back-office), elle serait sinon rognée par le
    // conteneur et l'utilisateur ne pourrait pas changer d'indicatif.
    dropdownContainer: document.body,
  })
  if (props.modelValue) iti.setNumber(props.modelValue)
  appliquerPadding()
  requestAnimationFrame(appliquerPadding)
  inputRef.value.addEventListener('countrychange', onCountryChange)
  window.addEventListener('resize', appliquerPadding)
})

onBeforeUnmount(() => {
  inputRef.value?.removeEventListener('countrychange', onCountryChange)
  window.removeEventListener('resize', appliquerPadding)
  iti?.destroy()
  iti = null
})

// Le parent peut renseigner la valeur après coup (préremplissage profil,
// carnet d'adresses) : le widget doit alors se resynchroniser.
watch(
  () => props.modelValue,
  async (v) => {
    if (!iti || !v) return
    // Écho de notre propre émission : ne pas réécrire le champ.
    if (v === derniereValeurEmise) return
    if ((iti.getNumber() || '') !== v) {
      iti.setNumber(v)
      await nextTick()
      appliquerPadding()
    }
  },
)
</script>

<style scoped>
.phone-input {
  width: 100%;
}
/*
 * Un seul champ visuel : [drapeau + indicatif] | [numéro]
 * Évite le chevauchement +225 / bordure input (separateDialCode + absolute).
 */
.phone-input :deep(.iti) {
  width: 100%;
  display: flex !important;
  align-items: stretch;
  position: relative;
  border: 1px solid var(--bs-border-color, #dee2e6) !important;
  border-radius: 0.375rem;
  background-color: var(--bs-light, #f8f9fa);
  overflow: hidden;
}
.phone-input :deep(.iti__country-container) {
  position: static !important;
  flex: 0 0 auto;
  z-index: 2;
  padding: 0 !important;
  top: auto !important;
  bottom: auto !important;
  left: auto !important;
}
.phone-input :deep(.iti__selected-country) {
  height: 100%;
  padding: 0 0.35rem 0 0.5rem;
}
.phone-input :deep(.iti__selected-dial-code) {
  margin-left: 0.35rem;
  margin-right: 0.25rem;
  white-space: nowrap;
  font-size: 0.95em;
  color: var(--bs-body-color, #212529);
  font-weight: 500;
}
.phone-input :deep(.iti input.form-control),
.phone-input :deep(.iti input.iti__tel-input) {
  flex: 1 1 auto;
  width: auto !important;
  min-width: 0;
  height: 56px;
  box-sizing: border-box;
  margin: 0 !important;
  border: none !important;
  border-left: 1px solid var(--bs-border-color, #dee2e6) !important;
  border-radius: 0 !important;
  background-color: var(--bs-light, #f8f9fa) !important;
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
  box-shadow: none !important;
}
.phone-input :deep(.iti input.form-control:focus),
.phone-input :deep(.iti input.iti__tel-input:focus) {
  box-shadow: none !important;
  outline: none;
}
.phone-input :deep(.iti:focus-within) {
  border-color: var(--bs-primary-border-subtle, #f1aeb5) !important;
}
.phone-input :deep(.iti input.form-control-lg) {
  font-size: 1rem;
  line-height: 1.5;
}
.phone-input :deep(.iti input.form-control-sm) {
  height: auto;
}
.phone-input :deep(.iti input.is-invalid) {
  border-left-color: var(--bs-form-invalid-border-color, #dc3545) !important;
}
</style>

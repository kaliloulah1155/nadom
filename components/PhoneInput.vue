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
 * Champ téléphone international, reposant sur `intl-tel-input` : indicatif pays,
 * drapeau, et surtout **contrôle de la longueur propre à chaque pays** — un numéro
 * ivoirien plus long que 10 chiffres est refusé, là où un simple `type="tel"`
 * acceptait n'importe quelle suite de caractères.
 *
 * Le `v-model` porte le numéro au format international E.164 (« +2250712345678 »),
 * qui est ce que l'API attend.
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

  if (iti.isValidNumber()) {
    erreur.value = null
    emit('invalid', false)
    remonter(iti.getNumber() || brut)
    return
  }

  erreur.value = messagePour(iti.getValidationError())
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

onMounted(async () => {
  await nextTick()
  if (!inputRef.value) return
  iti = intlTelInput(inputRef.value, {
    initialCountry: props.country,
    nationalMode: false,
    formatOnDisplay: true,
    separateDialCode: true,
    allowDropdown: true,
    // Rattache la liste des pays au <body> : dans une modale (demande de visa,
    // « Nouvelle demande » du back-office), elle serait sinon rognée par le
    // conteneur et l'utilisateur ne pourrait pas changer d'indicatif.
    dropdownContainer: document.body,
  })
  if (props.modelValue) iti.setNumber(props.modelValue)
  inputRef.value.addEventListener('countrychange', evaluer)
})

onBeforeUnmount(() => {
  inputRef.value?.removeEventListener('countrychange', evaluer)
  iti?.destroy()
  iti = null
})

// Le parent peut renseigner la valeur après coup (préremplissage profil,
// carnet d'adresses) : le widget doit alors se resynchroniser.
watch(
  () => props.modelValue,
  (v) => {
    if (!iti || !v) return
    // Écho de notre propre émission : ne pas réécrire le champ.
    if (v === derniereValeurEmise) return
    if ((iti.getNumber() || '') !== v) iti.setNumber(v)
  },
)
</script>

<style scoped>
.phone-input :deep(.iti) {
  width: 100%;
}
</style>

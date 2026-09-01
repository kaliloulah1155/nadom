<template>
  <div>
    <ClientOnly>
      <NavbarDark />
    </ClientOnly>

    <section class="bg-cover position-relative" :style="heroStyle" data-overlay="6">
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-xl-7 col-lg-9 col-md-12">
            <div class="fpc-capstion text-center my-4">
              <div class="fpc-captions">
                <h1 class="xl-heading text-light">{{ heroTitle }}</h1>
                <p class="text-lg text-light">{{ heroSubtitle }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-content-between g-4 mt-lg-5 mt-4">
          <div
            v-for="(card, idx) in displayCards"
            :key="'crd-' + idx"
            class="col-xl-4 col-lg-4 col-md-6"
          >
            <div class="card p-4 rounded-4 bg-transparents border-0 text-center h-100">
              <div class="crds-icons d-inline-flex mx-auto mb-3 text-light fs-2">
                <i :class="card.icon"></i>
              </div>
              <div class="crds-desc">
                <h5 class="text-light">{{ card.title }}</h5>
                <p class="fs-6 text-md lh-2 text-light opacity-75 mb-0 whitespace-pre">{{ card.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="row align-items-center justify-content-between g-4">
          <div class="col-xl-7 col-lg-7 col-md-12">
            <div class="contactForm pe-xl-5 pe-lg-4">
              <div v-if="submitted" class="alert alert-success d-flex align-items-center gap-2 rounded-4 mb-4" role="alert">
                <i class="fa-solid fa-circle-check fs-5"></i>
                <span>{{ submittedMessage }}</span>
              </div>
              <form @submit.prevent="submitForm">
                <div class="row align-items-center">
                  <div class="col-xl-12 col-lg-12 col-md-12">
                    <div class="touch-block d-flex flex-column mb-4">
                      <h2>{{ formTitle }}</h2>
                      <p>{{ formIntro }}</p>
                      <p class="small text-muted mb-0">
                        {{ t('contact.fieldLengths') }}
                      </p>
                    </div>
                  </div>

                  <div class="col-xl-6 col-lg-6 col-md-6">
                    <div class="form-group form-border">
                      <label class="form-label">{{ labels.name }}</label>
                      <input
                        type="text"
                        class="form-control bg-light"
                        autocomplete="name"
                        :value="form.name"
                        :maxlength="LIMITS.name"
                        :class="{ 'is-invalid': blur.name && fieldErrors.name }"
                        required
                        @blur="blur.name = true"
                        @input="onInput('name', ($event.target as HTMLInputElement).value)"
                      />
                      <div v-if="blur.name && fieldErrors.name" class="invalid-feedback d-block">{{ fieldErrors.name }}</div>
                    </div>
                  </div>

                  <div class="col-xl-6 col-lg-6 col-md-6">
                    <div class="form-group form-border">
                      <label class="form-label">{{ labels.email }}</label>
                      <input
                        type="email"
                        inputmode="email"
                        class="form-control bg-light"
                        autocomplete="email"
                        :value="form.email"
                        :maxlength="LIMITS.email"
                        :class="{ 'is-invalid': blur.email && fieldErrors.email }"
                        required
                        @blur="blur.email = true"
                        @input="onInput('email', ($event.target as HTMLInputElement).value)"
                      />
                      <div v-if="blur.email && fieldErrors.email" class="invalid-feedback d-block">{{ fieldErrors.email }}</div>
                    </div>
                  </div>

                  <div class="col-xl-6 col-lg-6 col-md-6">
                    <div class="form-group form-border">
                      <label class="form-label">{{ labels.phone }}</label>
                      <PhoneInput
                        :model-value="form.phone"
                        country="ci"
                        @update:model-value="(v: string) => onInput('phone', v)"
                      />
                    </div>
                  </div>

                  <div class="col-xl-6 col-lg-6 col-md-6">
                    <div class="form-group form-border">
                      <label class="form-label">{{ labels.subject }}</label>
                      <input
                        type="text"
                        class="form-control bg-light"
                        :value="form.subject"
                        :maxlength="LIMITS.subject"
                        :class="{ 'is-invalid': blur.subject && fieldErrors.subject }"
                        required
                        @blur="blur.subject = true"
                        @input="onInput('subject', ($event.target as HTMLInputElement).value)"
                      />
                      <div v-if="blur.subject && fieldErrors.subject" class="invalid-feedback d-block">{{ fieldErrors.subject }}</div>
                    </div>
                  </div>

                  <div class="col-xl-12 col-lg-12 col-md-12">
                    <div class="form-group form-border">
                      <label class="form-label">{{ labels.message }} ({{ form.message.length }} / {{ LIMITS.message }})</label>
                      <textarea
                        class="form-control ht-120 bg-light"
                        rows="6"
                        :value="form.message"
                        :maxlength="LIMITS.message"
                        :class="{ 'is-invalid': blur.message && fieldErrors.message }"
                        required
                        @blur="blur.message = true"
                        @input="onInput('message', ($event.target as HTMLTextAreaElement).value)"
                      ></textarea>
                      <div v-if="blur.message && fieldErrors.message" class="invalid-feedback d-block">{{ fieldErrors.message }}</div>
                    </div>
                  </div>

                  <div class="col-xl-12 col-lg-12 col-md-12">
                    <div class="form-group form-border">
                      <button
                        type="submit"
                        class="btn fw-medium btn-primary d-inline-flex align-items-center gap-2"
                        :disabled="sending"
                      >
                        <span v-if="sending" class="spinner-border spinner-border-sm"></span>
                        {{ labels.submit }}
                        <i v-if="!sending" class="fa-solid fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="col-xl-5 col-lg-5 col-md-12">
            <iframe
              v-if="mapUrl"
              class="full-width ht-100 grayscale rounded"
              :src="mapUrl"
              height="500"
              style="border:0;"
              aria-hidden="false"
              tabindex="0"
            />
          </div>
        </div>
      </div>
    </section>

    <FooterTop />
    <FooterOne />
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import PhoneInput from '~/components/PhoneInput.vue'
import fallbackBg from '@/assets/img/title-banner.jpg'
import { computed, onMounted, reactive, ref } from 'vue'
import { useSiteStaticPagesStore } from '~/stores/siteStaticPages'
import { resolveStorageAssetUrl } from '~/composables/useStorageAssetUrl'
import { usePublicApi } from '~/composables/usePublicApi'
import { useNotification } from '~/composables/useNotification'
import { CONTACT_FORM_LIMITS, sanitizePlainText } from '~/composables/usePublicContactFormConstraints'

const LIMITS = CONTACT_FORM_LIMITS

const { locale, t } = useI18n()

useSeoMeta({
  title: () => t('seo.contactUs.title'),
  description: () => t('seo.contactUs.description'),
  ogTitle: () => t('seo.contactUs.title'),
  ogDescription: () => t('seo.contactUs.description'),
})
const { success, error } = useNotification()

const sending = ref(false)
const attempted = ref(false)
// Retour visible après soumission (le toast n'est pas rendu sur le layout public).
const submitted = ref(false)
const submittedMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const blur = reactive({
  name: false,
  email: false,
  subject: false,
  message: false
})

function onInput(key: keyof typeof form, raw: string) {
  const limitsByKey = {
    name: LIMITS.name,
    email: LIMITS.email,
    phone: LIMITS.phone,
    subject: LIMITS.subject,
    message: LIMITS.message
  } satisfies Record<keyof typeof form, number>
  const max = limitsByKey[key]
  let v = sanitizePlainText(raw, max)
  if (key === 'email') {
    v = v.toLowerCase()
  }
  form[key] = v
  // L'utilisateur recommence à écrire → on masque l'ancien message de succès.
  if (submitted.value) submitted.value = false
}

function resetForm(): void {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.subject = ''
  form.message = ''
  blur.name = false
  blur.email = false
  blur.subject = false
  blur.message = false
  attempted.value = false
}

const simpleEmailOk = (e: string) => /^[^\s@]{1,200}@[^\s@]{1,200}\.[^\s@]{2,}$/.test(e)

const fieldErrors = computed(() => {
  const err: { name?: string; email?: string; subject?: string; message?: string } = {}

  const nameOk = sanitizePlainText(form.name, LIMITS.name)
  if ((blur.name || attempted.value) && nameOk.length < 2) {
    err.name = t('contactForm.nameMin')
  }

  const em = sanitizePlainText(form.email, LIMITS.email).toLowerCase()
  if ((blur.email || attempted.value) && em.length === 0) {
    err.email = t('contactForm.emailRequired')
  } else if ((blur.email || attempted.value) && em.length > 0 && !simpleEmailOk(em)) {
    err.email = t('contactForm.emailInvalid')
  }

  const subj = sanitizePlainText(form.subject, LIMITS.subject)
  if ((blur.subject || attempted.value) && subj.length < 2) {
    err.subject = t('contactForm.subjectMin')
  }

  const msg = sanitizePlainText(form.message, LIMITS.message)
  if ((blur.message || attempted.value) && msg.length < 10) {
    err.message = t('contactForm.messageMin')
  }

  return err
})

const labels = computed(() => ({
  name: t('contactForm.name'),
  email: t('contactForm.email'),
  phone: t('contactForm.phone'),
  subject: t('contactForm.subject'),
  message: t('contactForm.message'),
  submit: t('contactForm.submit'),
}))

const pages = useSiteStaticPagesStore()

onMounted(() => {
  pages.fetchPublic().catch(() => {})
})

const payload = computed(() => pages.contactPayload as Record<string, any>)

function loc(obj?: { fr?: string | null; en?: string | null; zh?: string | null }, zhFallback = ''): string {
  if (!obj) return ''
  const current = String(locale.value || '')
  if (current.startsWith('zh')) {
    return String(obj.zh ?? zhFallback ?? obj.en ?? obj.fr ?? '').trim()
  }
  if (current.startsWith('en')) {
    return String(obj.en ?? obj.fr ?? obj.zh ?? '').trim()
  }
  return String(obj.fr ?? obj.en ?? obj.zh ?? '').trim()
}

const heroTitle = computed(() => loc(payload.value.hero?.title, t('contactForm.heroFallback')) || t('contactForm.heroFallback'))
const heroSubtitle = computed(() => loc(payload.value.hero?.subtitle))

const heroStyle = computed(() => {
  const path = payload.value.hero?.background_path
  const u = path ? resolveStorageAssetUrl(String(path)) : ''
  const url = u || fallbackBg
  return { backgroundImage: `url(${url})` }
})

const displayCards = computed(() => {
  const raw = Array.isArray(payload.value.cards) ? payload.value.cards : []
  return raw.map((c: any) => ({
    icon: String(c?.icon || 'fa-solid fa-circle'),
    title: loc(c?.title),
    body: loc(c?.body)
  }))
})

const formTitle = computed(() => loc(payload.value.form_block?.title, t('contactForm.formTitleFallback')) || t('contactForm.formTitleFallback'))
const formIntro = computed(() => loc(payload.value.form_block?.intro))

const mapUrl = computed(() => String(payload.value.map_embed_url || '').trim())

async function submitForm() {
  attempted.value = true
  blur.name = true
  blur.email = true
  blur.subject = true
  blur.message = true

  const errs = fieldErrors.value
  if (errs.name || errs.email || errs.subject || errs.message) {
    error(t('contactForm.formErrors'))
    return
  }

  const body = {
    name: sanitizePlainText(form.name, LIMITS.name),
    email: sanitizePlainText(form.email, LIMITS.email).toLowerCase(),
    phone: sanitizePlainText(form.phone, LIMITS.phone) || null,
    subject: sanitizePlainText(form.subject, LIMITS.subject),
    message: sanitizePlainText(form.message, LIMITS.message)
  }

  sending.value = true
  try {
    const api = usePublicApi()
    const res = await api.post<{ message?: string }>('/contact/lead', body)
    if (!res.success) {
      throw new Error(res.message || t('contactForm.sendFailed'))
    }
    const msg = String(res.message || t('contactForm.sendSuccess'))
    success(msg)
    submittedMessage.value = msg
    submitted.value = true
    resetForm()
  } catch (e: any) {
    error(e?.message || t('contactForm.sendFailed'))
  } finally {
    sending.value = false
  }
}
</script>


<style scoped>
.whitespace-pre {
  white-space: pre-line;
}
</style>

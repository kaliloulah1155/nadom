<template>
  <div class="label-page py-5">
    <div class="container">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else-if="err" class="alert alert-danger">{{ err }}</div>
      <div v-else-if="payload" class="label-sheet card border-0 shadow-lg mx-auto">
        <div class="card-body p-4 p-md-5">
          <div class="row align-items-center g-4">
            <div class="col-md-7">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div v-if="payload.logo_data_uri" class="label-logo-wrap">
                  <img :src="payload.logo_data_uri" alt="NADOM" class="label-logo" />
                </div>
                <div>
                  <div class="display-6 fw-bold text-danger">NADOM</div>
                  <div class="text-muted small">Import-Export &amp; personal shopping</div>
                </div>
              </div>
              <div class="text-uppercase small text-muted mb-1">Numéro de suivi / Tracking</div>
              <div class="track-code display-6 fw-bold text-primary">{{ payload.tracking_number }}</div>
              <p class="text-muted small mt-3 mb-0">
                Scannez le code pour suivre ce colis sur le site (recherche lancée automatiquement).
              </p>
              <div class="mt-3 d-flex flex-wrap gap-2">
                <NuxtLink
                  class="btn btn-primary btn-sm"
                  :to="`/import-export/tracking?tracking=${encodeURIComponent(payload.tracking_number)}`"
                >
                  Ouvrir le suivi
                </NuxtLink>
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="printLabel">
                  Imprimer
                </button>
              </div>
            </div>
            <div class="col-md-5 text-center">
              <img v-if="payload.qr_data_uri" class="label-qr img-fluid" :src="payload.qr_data_uri" alt="QR code" />
              <div class="small text-muted mt-2">Scanner → Suivi</div>
              <code class="small d-block mt-2 text-break">{{ payload.tracking_url }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

definePageMeta({ layout: 'default' })

interface LabelPayload {
  tracking_number: string
  tracking_url: string
  qr_data_uri: string
  logo_data_uri?: string | null
}

const route = useRoute()
const pub = usePublicApi()

const loading = ref(true)
const err = ref('')
const payload = ref<LabelPayload | null>(null)

async function load() {
  loading.value = true
  err.value = ''
  payload.value = null
  const c = typeof route.params.code === 'string' ? route.params.code : Array.isArray(route.params.code) ? route.params.code[0] : ''
  if (!c?.trim()) {
    err.value = 'Numéro manquant.'
    loading.value = false
    return
  }
  const res = await pub.get<LabelPayload>(`/shipments/label-data/${encodeURIComponent(c.trim())}`)
  if (res.success && res.data) {
    payload.value = res.data
  } else {
    err.value = res.message || 'Étiquette introuvable.'
  }
  loading.value = false
}

function printLabel() {
  if (typeof window !== 'undefined') window.print()
}

watch(
  () => route.params.code,
  () => load(),
  { immediate: true }
)
</script>

<style scoped>
.label-page {
  min-height: 70vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
.label-sheet {
  max-width: 720px;
}
.label-logo-wrap {
  width: 72px;
  height: 48px;
  flex-shrink: 0;
}
.label-logo {
  max-width: 100%;
  max-height: 48px;
  object-fit: contain;
}
.track-code {
  font-size: clamp(1.25rem, 4vw, 2rem);
  word-break: break-all;
}
.label-qr {
  max-width: 220px;
}
@media print {
  .label-page {
    background: white;
    min-height: auto;
  }
  .btn {
    display: none !important;
  }
}
</style>

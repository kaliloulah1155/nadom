<template>
  <div class="envoi-colis-form">
    <div v-if="isAdminFlow && !embedded" class="mb-4">
      <NuxtLink to="/admin/requests" class="btn btn-link p-0">
        <i class="bi bi-arrow-left me-1"></i>{{ t("admin.requests.backToList") }}
      </NuxtLink>
    </div>

    <!-- Step indicator -->
    <div class="wizard-steps d-flex justify-content-between mb-5">
      <div v-for="s in 4" :key="s" class="wizard-step text-center flex-fill" :class="{ active: currentStep === s, done: currentStep > s }">
        <div class="wizard-step-circle mx-auto mb-1">
          <i v-if="currentStep > s" class="bi bi-check-lg"></i>
          <span v-else>{{ s }}</span>
        </div>
        <small class="d-none d-sm-block">{{ t(`envoiColis.form.step${s}`) }}</small>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Step 1: Origine & Destination -->
      <div v-if="currentStep === 1">
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button type="button" class="nav-link" :class="{ active: originDestTab === 'origin' }" @click="originDestTab = 'origin'">
            <i class="bi bi-box-arrow-up-right me-1"></i>{{ t('envoiColis.form.originSection') }}
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" :class="{ active: originDestTab === 'destination', 'text-danger': errors.destinationId }" @click="originDestTab = 'destination'">
            <i class="bi bi-box-arrow-in-down-left me-1"></i>{{ t('envoiColis.form.destinationSection') }}
          </button>
        </li>
      </ul>

      <div v-if="originDestTab === 'origin'">
        <div v-if="addressBookStore.origins.length > 0" class="mb-4">
          <label class="form-label fw-medium small text-muted">{{ t('envoiColis.form.savedAddresses') }}</label>
          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="a in addressBookStore.origins"
              :key="a.id"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="applyOriginAddress(a)"
            >
              <i class="bi bi-person-badge me-1"></i>{{ a.fullname }}<span v-if="a.city"> — {{ a.city }}</span>
            </button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium d-flex align-items-center gap-2">
              {{ t('envoiColis.form.originCountry') }}
              <span v-if="countriesStore.loading" class="spinner-border spinner-border-sm text-primary" style="width: .9rem; height: .9rem;"></span>
            </label>
            <select v-model="form.originCountry" class="form-select form-select-lg" :disabled="countriesStore.loading">
              <option value="">{{ countriesStore.loading ? t('calculator.loading') : t('envoiColis.form.selectCountry') }}</option>
              <option v-for="c in originCountries" :key="c.uuid" :value="c.label">{{ c.flag_emoji ? c.flag_emoji + ' ' : '' }}{{ c.label }}</option>
            </select>
          </div>
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium">{{ t('envoiColis.form.originCity') }}</label>
            <input v-model="form.originCity" type="text" class="form-control form-control-lg" />
          </div>
        </div>
        <!-- Expéditeur -->
        <h6 class="text-uppercase text-muted small fw-bold mb-3 mt-4">
          <i class="bi bi-person-badge me-1"></i>{{ t('envoiColis.form.senderSection') }}
        </h6>
        <div class="row">
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium">{{ t('personalShopping.formExtra.fullName') }}</label>
            <input v-model="form.senderFullname" type="text" class="form-control form-control-lg" />
          </div>
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium">{{ t('envoiColis.form.senderPhone') }}</label>
            <PhoneInput v-model="form.senderNumber" country="cn" size="lg" />
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label fw-medium">{{ t('auth.email') }}</label>
          <input v-model="form.senderEmail" type="email" class="form-control form-control-lg" placeholder="email@exemple.com" />
        </div>
      </div>

      <div v-else>
        <div v-if="addressBookStore.destinations.length > 0" class="mb-4">
          <label class="form-label fw-medium small text-muted">{{ t('envoiColis.form.savedAddresses') }}</label>
          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="a in addressBookStore.destinations"
              :key="a.id"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="applyDestinationAddress(a)"
            >
              <i class="bi bi-person-check me-1"></i>{{ a.fullname }}<span v-if="a.city"> — {{ a.city }}</span>
            </button>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label fw-medium">{{ t('envoiColis.form.destination') }} *</label>
          <select
            v-model="form.destinationId"
            class="form-select form-select-lg"
            :class="{ 'is-invalid': errors.destinationId }"
            required
            :disabled="destinations.length === 0"
            @change="form.shippingModeId = ''"
          >
            <option value="">{{ t('envoiColis.form.selectDestination') }}</option>
            <option v-for="d in destinations" :key="d.id" :value="d.id">
              {{ d.country }}<template v-if="d.city">, {{ d.city }}</template>
            </option>
          </select>
          <div v-if="errors.destinationId" class="invalid-feedback">{{ errors.destinationId }}</div>
        </div>
        <!-- Destinataire -->
        <h6 class="text-uppercase text-muted small fw-bold mb-3 mt-4">
          <i class="bi bi-person-check me-1"></i>{{ t('envoiColis.form.recipientSection') }}
        </h6>
        <div class="row">
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium">{{ t('personalShopping.formExtra.fullName') }} *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input
                v-model="form.contactFullname"
                type="text"
                class="form-control form-control-lg"
                :class="{ 'is-invalid': errors.contactFullname }"
                :placeholder="t('personalShopping.formExtra.fullNamePlaceholder')"
                required
              />
            </div>
            <div v-if="errors.contactFullname" class="invalid-feedback d-block">{{ errors.contactFullname }}</div>
          </div>
          <div class="col-md-6 mb-4">
            <label class="form-label fw-medium"><i class="bi bi-whatsapp text-success me-1"></i>{{ t('personalShopping.formExtra.whatsappContact') }} *</label>
            <PhoneInput v-model="form.contactNumber" country="ci" size="lg" required />
            <div v-if="errors.contactNumber" class="invalid-feedback d-block">{{ errors.contactNumber }}</div>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label fw-medium">{{ t('auth.email') }}</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input
              v-model="form.contactEmail"
              type="email"
              class="form-control form-control-lg"
              placeholder="email@exemple.com"
            />
          </div>
        </div>
      </div>
      </div>
      <!-- /Step 1 -->

      <!-- Step 2: Détails du colis -->
      <div v-if="currentStep === 2">
      <!-- Liste des colis (plusieurs colis de dimensions/poids différents) -->
      <div v-for="(item, idx) in packageItems" :key="item.id" class="border rounded p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <strong>{{ t('envoiColis.form.packageN', { n: idx + 1 }) }}</strong>
          <button
            v-if="packageItems.length > 1"
            type="button"
            class="btn btn-sm btn-outline-danger"
            @click="removePackageItem(item.id)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <!-- Quantité et poids côte à côte, puis les 3 dimensions groupées
             sous un seul libellé "Dimensions (cm)" : chaque champ dispose
             ainsi d'une largeur utilisable, au lieu de 5 colonnes étroites
             amputées chacune d'un suffixe d'unité. -->
        <div class="row g-3">
          <div class="col-6 col-lg-3">
            <label class="form-label fw-medium small pkg-field-label" :title="t('envoiColis.form.quantityHint')">{{ t('envoiColis.form.quantity') }}</label>
            <input v-model.number="item.quantity" type="number" min="1" max="999" class="form-control form-control-lg" :class="{ 'is-invalid': errors.quantity }" />
          </div>
          <div class="col-6 col-lg-3">
            <label class="form-label fw-medium small pkg-field-label">{{ t('envoiColis.form.declaredWeight') }} *</label>
            <input
              v-model.number="item.weight"
              type="number"
              min="0"
              max="1000"
              step="any"
              class="form-control form-control-lg"
              :class="{ 'is-invalid': (idx === 0 && errors.declaredWeight) || errors.weight }"
            />
          </div>
          <div class="col-12 col-lg-6">
            <label class="form-label fw-medium small pkg-field-label">{{ t('envoiColis.form.dimensions') }} *</label>
            <div class="d-flex align-items-center gap-2 pkg-dims" :class="{ 'pkg-dims-invalid': invalidDimensionItemIds.has(item.id) }">
              <input
                v-model.number="item.length"
                type="number"
                min="0"
                step="any"
                class="form-control form-control-lg"
                :placeholder="t('envoiColis.form.dimLengthShort')"
                :aria-label="t('envoiColis.form.dimLength')"
              />
              <span class="text-muted">×</span>
              <input
                v-model.number="item.width"
                type="number"
                min="0"
                step="any"
                class="form-control form-control-lg"
                :placeholder="t('envoiColis.form.dimWidthShort')"
                :aria-label="t('envoiColis.form.dimWidth')"
              />
              <span class="text-muted">×</span>
              <input
                v-model.number="item.height"
                type="number"
                min="0"
                step="any"
                class="form-control form-control-lg"
                :placeholder="t('envoiColis.form.dimHeightShort')"
                :aria-label="t('envoiColis.form.dimHeight')"
              />
            </div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label fw-medium small">{{ t('envoiColis.form.itemDescription') }} *</label>
            <!-- Contenu rattaché à des catégories plutôt qu'à du texte libre :
                 l'agent classe ainsi la marchandise de façon homogène. -->
            <div class="d-flex flex-wrap gap-2" :class="{ 'pkg-cat-invalid': invalidItemIds.has(item.id) }">
              <button
                v-for="c in packageCategories"
                :key="c.uuid"
                type="button"
                class="btn btn-sm rounded-pill px-3"
                :class="item.categories.includes(c.label) ? 'btn-primary' : 'btn-outline-secondary'"
                @click="toggleItemCategory(item, c.label)"
              >
                {{ c.label }}
              </button>
              <span v-if="packageCategories.length === 0" class="text-muted small">{{ t('calculator.loading') }}</span>
            </div>
            <div v-if="invalidItemIds.has(item.id)" class="text-danger small mt-1">
              {{ t('envoiColis.validation.itemDescription') }}
            </div>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium small">{{ t('envoiColis.form.itemNote') }}</label>
            <input
              v-model="item.description"
              type="text"
              class="form-control"
              :placeholder="t('envoiColis.form.itemDescriptionPlaceholder')"
            />
          </div>
        </div>

        <!-- Photos de ce colis -->
        <div class="mt-2">
          <label class="form-label fw-medium small">{{ t('envoiColis.form.photos') }}</label>
          <div
            class="upload-zone upload-zone-sm"
            :class="{ dragging: isDragging[item.id] }"
            @dragover.prevent="isDragging[item.id] = true"
            @dragleave.prevent="isDragging[item.id] = false"
            @drop.prevent="handleDrop(item, $event)"
            @click="triggerFileInput(item.id)"
          >
            <input
              :ref="(el) => setFileInputRef(item.id, el)"
              type="file"
              multiple
              accept="image/*"
              class="d-none"
              @change="handleFileSelect(item, $event)"
            />
            <div class="text-center py-2">
              <i class="bi bi-cloud-arrow-up text-primary me-1"></i>
              <span class="small text-muted">{{ t("personalShopping.form.dragDrop") }}</span>
            </div>
          </div>
          <div v-if="item.imagePreviews.length > 0" class="row g-2 mt-2">
            <div v-for="(preview, index) in item.imagePreviews" :key="index" class="col-3 col-md-2">
              <div class="image-preview position-relative">
                <img :src="preview" :alt="`Image ${index + 1}`" class="img-fluid rounded cursor-zoom" @click="openZoom(preview)" />
                <button
                  type="button"
                  class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                  style="width: 20px; height: 20px; padding: 0; font-size: 0.65rem;"
                  @click="removeImage(item, index)"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="invalidDimensionItemIds.size > 0" class="text-danger small mb-2">{{ t('envoiColis.validation.dimensions') }}</div>
      <div v-if="errors.declaredWeight" class="text-danger small mb-2">{{ errors.declaredWeight }}</div>
      <div v-if="errors.quantity" class="text-danger small mb-2">{{ errors.quantity }}</div>
      <div v-if="errors.weight" class="text-danger small mb-3">{{ errors.weight }}</div>

      <button type="button" class="btn btn-outline-primary mb-4" @click="addPackageItem">
        <i class="bi bi-plus-lg me-1"></i>{{ t('envoiColis.form.addPackage') }}
      </button>

      <!-- Totaux agrégés -->
      <div class="alert alert-light border d-flex justify-content-around text-center mb-4">
        <div>
          <small class="text-muted d-block">{{ t('envoiColis.form.ctnCount') }}</small>
          <strong>{{ totalCtnCount }}</strong>
        </div>
        <div>
          <small class="text-muted d-block">{{ t('envoiColis.form.declaredWeight') }}</small>
          <strong>{{ totalWeight }} kg</strong>
        </div>
        <div>
          <small class="text-muted d-block">{{ t('envoiColis.form.cbm') }}</small>
          <strong>{{ totalCbm }} m³</strong>
        </div>
      </div>

      <!-- Shipping mode -->
      <div class="mb-4">
        <label class="form-label fw-medium">{{ t('envoiColis.form.shippingMode') }}</label>
        <select
          v-model="form.shippingModeId"
          class="form-select form-select-lg"
          :disabled="!form.destinationId || shippingModes.length === 0"
        >
          <option value="">
            {{ shippingModes.length === 0 ? t('envoiColis.form.noModeAvailable') : t('envoiColis.form.selectShippingMode') }}
          </option>
          <option v-for="m in shippingModes" :key="m.id" :value="m.id">
            {{ shippingStore.getShippingModeLabel(m.mode) }} — {{ m.duration }}
          </option>
        </select>
        <small v-if="!form.destinationId" class="text-muted">{{ t('envoiColis.form.selectDestinationFirst') }}</small>
      </div>

      <!-- Aucun montant n'est affiché au client : c'est un agent Nadom qui établit
           le devis à partir du fret du pays de destination, du mode d'envoi et des
           caractéristiques déclarées ci-dessus. -->
      <div class="alert alert-light border d-flex align-items-start gap-2 mb-4">
        <i class="bi bi-info-circle text-primary mt-1"></i>
        <span class="small text-muted">{{ t('envoiColis.form.quoteByAgent') }}</span>
      </div>

      </div>
      <!-- /Step 2 -->

      <!-- Step 3: Description -->
      <div v-if="currentStep === 3">
      <!-- Description du colis -->
      <div class="mb-4">
        <label class="form-label fw-medium">{{ t('envoiColis.form.description') }}</label>
        <textarea
          v-model="form.description"
          class="form-control"
          rows="3"
          :placeholder="t('envoiColis.form.descriptionPlaceholder')"
        ></textarea>
      </div>
      </div>
      <!-- /Step 3 -->

      <!-- Step 4: Récapitulatif -->
      <div v-if="currentStep === 4">
        <!-- Panier : envois déjà déclarés dans cette session -->
        <div v-if="cart.length > 0" class="mb-4">
          <h6 class="text-uppercase text-muted small fw-bold mb-2">
            <i class="bi bi-basket me-1"></i>{{ t('envoiColis.form.cartTitle', { n: cart.length }) }}
          </h6>
          <ul class="list-group mb-2">
            <li v-for="c in cart" :key="c.id" class="list-group-item d-flex justify-content-between align-items-center">
              <span class="small">{{ c.summary }}</span>
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeCartEntry(c.id)">
                <i class="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>

        <h6 class="text-uppercase text-muted small fw-bold mb-3">{{ t('envoiColis.form.recapTitle') }}<span v-if="cart.length > 0"> — {{ t('envoiColis.form.currentShipment') }}</span></h6>
        <div class="recap-box border rounded p-3 mb-4">
          <div class="row g-2 small">
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.originSection') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ form.originCity || form.originCountry ? `${form.originCity || ''}${form.originCity && form.originCountry ? ', ' : ''}${form.originCountry || ''}` : '—' }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.destination') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ recapDestinationLabel }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.shippingMode') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ recapShippingModeLabel }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.ctnCount') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ form.ctnCount ?? '—' }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.declaredWeight') }}</span> / <span class="text-muted">{{ t('envoiColis.form.cbm') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ form.declaredWeight != null ? `${form.declaredWeight} kg` : '—' }} / {{ form.cbm != null ? `${form.cbm} m³` : '—' }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.photos') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ totalPhotosCount }}</div>
            <div v-if="form.senderFullname" class="col-6"><span class="text-muted">{{ t('envoiColis.form.senderSection') }}</span></div>
            <div v-if="form.senderFullname" class="col-6 text-end fw-medium">{{ form.senderFullname }}{{ form.senderNumber ? ` (${form.senderNumber})` : '' }}</div>
            <div class="col-6"><span class="text-muted">{{ t('envoiColis.form.recipientSection') }} — {{ t('personalShopping.formExtra.fullName') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ form.contactFullname || '—' }}</div>
            <div class="col-6"><span class="text-muted">{{ t('personalShopping.formExtra.whatsappContact') }}</span></div>
            <div class="col-6 text-end fw-medium">{{ form.contactNumber || '—' }}</div>
          </div>
        </div>

        <!-- Paiement en ligne — préparé pour une future API de paiement,
             désactivé pour l'instant (l'encaissement reste manuel, §11). -->
        <div class="border rounded p-3 mb-4 bg-light">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="text-uppercase text-muted small fw-bold mb-0">
              <i class="bi bi-credit-card me-1"></i>{{ t('envoiColis.form.paymentSection') }}
            </h6>
            <span class="badge bg-secondary-subtle text-secondary">{{ t('envoiColis.form.paymentComingSoon') }}</span>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-4">
              <button type="button" class="btn btn-outline-secondary w-100" disabled>
                <i class="bi bi-phone me-1"></i>Mobile Money
              </button>
            </div>
            <div class="col-4">
              <button type="button" class="btn btn-outline-secondary w-100" disabled>
                <i class="bi bi-credit-card-2-front me-1"></i>{{ t('envoiColis.form.paymentCard') }}
              </button>
            </div>
            <div class="col-4">
              <button type="button" class="btn btn-outline-secondary w-100" disabled>
                <i class="bi bi-cash-coin me-1"></i>{{ t('envoiColis.form.paymentCash') }}
              </button>
            </div>
          </div>
          <small class="text-muted">{{ t('envoiColis.form.paymentHint') }}</small>
        </div>
      </div>
      <!-- /Step 4 -->

      <!-- Navigation -->
      <div class="d-flex align-items-center gap-2 mt-4">
        <button
          v-if="currentStep > 1"
          type="button"
          class="btn btn-outline-secondary btn-lg"
          @click="prevStep"
        >
          <i class="bi bi-arrow-left me-1"></i>{{ t('envoiColis.form.previous') }}
        </button>
        <button
          v-if="currentStep < 4"
          type="button"
          class="btn btn-primary btn-lg px-4 ms-auto"
          @click="nextStep"
        >
          {{ t('envoiColis.form.next') }}<i class="bi bi-arrow-right ms-1"></i>
        </button>
        <button
          v-else
          type="submit"
          class="btn btn-primary btn-lg px-4 ms-auto"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? t("common.loading") : (cart.length > 0 ? t('envoiColis.form.submitAll', { n: cart.length + 1 }) : t("envoiColis.form.submit")) }}
        </button>
      </div>
      <div v-if="currentStep === 4" class="text-center mt-2">
        <button type="button" class="btn btn-outline-primary" :disabled="loading" @click="addAnotherShipment">
          <i class="bi bi-plus-lg me-1"></i>{{ t('envoiColis.form.addAnotherShipment') }}
        </button>
      </div>
      <div class="text-center mt-2">
        <button v-if="embedded" type="button" class="btn btn-link text-muted" @click="emit('close')">
          {{ t("common.cancel") }}
        </button>
        <NuxtLink
          v-else
          :to="isAdminFlow ? '/admin/requests' : '/import-export'"
          class="btn btn-link text-muted"
        >
          {{ isAdminFlow ? t("admin.requests.backToList") : t("common.cancel") }}
        </NuxtLink>
      </div>
    </form>

    <!-- Visionneuse d'image -->
    <div v-if="zoomedImage" class="zoom-modal" @click="closeZoom">
      <div class="zoom-content">
        <button class="zoom-close" @click="closeZoom">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="zoomedImage" alt="Zoomed image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import PhoneInput from '~/components/PhoneInput.vue'
import { useAuthStore } from '~/stores/auth'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useNotification } from '~/composables/useNotification'
import { useImageCompress } from '~/composables/useImageCompress'
import { usePublicApi } from '~/composables/usePublicApi'
import { useCountriesStore } from '~/stores/countries'
import { useAddressBookStore, type SavedAddress } from '~/stores/addressBook'
import { useFormatters } from '~/composables/useFormatters'

const props = withDefaults(
  defineProps<{
    /** Rendu dans une modale : pas de navigation, on remonte l'événement au parent. */
    embedded?: boolean
    /** Force le parcours admin (sinon déduit de la route / des droits). */
    admin?: boolean
  }>(),
  { embedded: false, admin: false },
)

const emit = defineEmits<{
  (e: 'submitted', ids: string[]): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const isAdminFlow = computed(
  () => props.admin || route.query.for === 'admin' || authStore.hasBackofficeAccess,
)
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const countriesStore = useCountriesStore()
const addressBookStore = useAddressBookStore()
const { success, error: notifyError } = useNotification()
const swal = useSwal()

const applyOriginAddress = (a: SavedAddress) => {
  if (a.country) form.originCountry = a.country
  if (a.city) form.originCity = a.city
  if (a.address) form.originAddress = a.address
  if (a.fullname) form.senderFullname = a.fullname
  if (a.phone) form.senderNumber = a.phone
  if (a.email) form.senderEmail = a.email
}

const applyDestinationAddress = (a: SavedAddress) => {
  if (a.fullname) form.contactFullname = a.fullname
  if (a.phone) form.contactNumber = a.phone
  if (a.email) form.contactEmail = a.email
  if (a.address) form.destinationAddress = a.address
}

const destinations = computed(() => shippingStore.destinations)
const shippingModes = computed(() => {
  if (!form.destinationId) return []
  return shippingStore.getShippingModesByDestinationId(form.destinationId) as any[]
})
const originCountries = computed(() => countriesStore.activeCountries)
const { formatCurrency } = useFormatters()
const originDestTab = ref<'origin' | 'destination'>('origin')
const currencies = computed(() => {
  const fromStore = (psStore.currencies || [])
    .filter((c: any) => {
      const slug = (c.slug || '').toString()
      return slug === 'DVS' || slug.startsWith('DVS-')
    })
    .map((c: any) => ({
      id: c.uuid || c.id,
      code: (c.code || c.label || '').toString().toUpperCase(),
      label: c.label || c.code || '',
    }))
    .filter((c: any) => c.code)
  return fromStore.length > 0 ? fromStore : [{ id: 'xof', code: 'XOF', label: 'CFA' }]
})

onMounted(async () => {
  await Promise.all([
    shippingStore.fetchDestinations(),
    psStore.fetchCategories({ page: 1, limit: 100, slug: 'POD' }),
    psStore.fetchCurrencies(),
    countriesStore.fetchAll(),
  ])
  if (!form.currency && currencies.value.length > 0) {
    form.currency = currencies.value[0].code
  }
  if (!form.originCountry) {
    const china = countriesStore.getByLabel('Chine') || countriesStore.getByCode('cn')
    form.originCountry = china?.label || 'Chine'
  }
  if (!form.destinationId) {
    const civ = destinations.value.find((d: any) => (d.country || '').toLowerCase().includes('ivoire'))
    if (civ) form.destinationId = civ.id
  }
  // La session peut ne pas être encore hydratée au montage : sans cette attente,
  // `currentUser` est null, le carnet d'adresses n'est jamais chargé et les
  // adresses enregistrées n'apparaissent sur aucun des deux onglets.
  if (!authStore.isAuthenticated) await authStore.initializeAuth()
  const u: any = authStore.currentUser
  // En flux admin, l'utilisateur connecté (staff) crée la demande POUR un
  // client — préremplir avec ses propres nom/email/téléphone donnerait
  // l'impression que l'admin est le client. On ne préremplit que pour un
  // client qui saisit sa propre demande.
  if (u && !isAdminFlow.value) {
    if (!form.contactFullname) {
      form.contactFullname = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    }
    if (!form.contactEmail) form.contactEmail = u.email || ''
    if (!form.contactNumber) form.contactNumber = u.phone || ''
    if (!form.senderFullname) {
      form.senderFullname = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    }
    if (!form.senderEmail) form.senderEmail = u.email || ''
    if (!form.senderNumber) form.senderNumber = u.phone || ''
    await addressBookStore.fetchAll()
  } else if (u && isAdminFlow.value) {
    // Un admin peut avoir son propre carnet d'adresses (rare) mais surtout
    // veut pouvoir réutiliser les adresses déjà enregistrées par le client
    // qu'il sert — utile même sans préremplissage automatique.
    await addressBookStore.fetchAll()
  }
})

const loading = ref(false)

const { fileToCompressedBlob } = useImageCompress()
const isDragging = ref<Record<number, boolean>>({})
const fileInputs = ref<Record<number, HTMLInputElement | null>>({})
const zoomedImage = ref<string | null>(null)

const setFileInputRef = (itemId: number, el: unknown) => {
  fileInputs.value[itemId] = el as HTMLInputElement | null
}

const triggerFileInput = (itemId: number) => {
  fileInputs.value[itemId]?.click()
}

const addFilesToItem = (item: PackageItem, files: File[]) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const validFiles = files.filter((f) => imageTypes.includes(f.type))

  if (item.imagePreviews.length + validFiles.length > 5) {
    notifyError(t('personalShopping.formExtra.maxImages'))
    return
  }

  validFiles.forEach((file) => {
    item.imageFiles.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        item.imagePreviews.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

const handleFileSelect = (item: PackageItem, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) addFilesToItem(item, Array.from(target.files))
  target.value = ''
}

const handleDrop = (item: PackageItem, event: DragEvent) => {
  isDragging.value[item.id] = false
  if (event.dataTransfer?.files) addFilesToItem(item, Array.from(event.dataTransfer.files))
}

const removeImage = (item: PackageItem, index: number) => {
  item.imagePreviews.splice(index, 1)
  item.imageFiles.splice(index, 1)
}

const openZoom = (image: string) => {
  zoomedImage.value = image
  document.body.style.overflow = 'hidden'
}

const closeZoom = () => {
  zoomedImage.value = null
  document.body.style.overflow = ''
}

async function resolveItemImages(item: PackageItem): Promise<string[]> {
  const api = usePublicApi()
  const out: string[] = []
  for (const file of item.imageFiles) {
    const blob = await fileToCompressedBlob(file)
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    const fd = new FormData()
    fd.append('image', blob, name)
    const res = await api.post<{ url?: string; path?: string }>('/upload/public-image', fd)
    const stored = res.success ? (res.data?.path || res.data?.url) : null
    if (!stored) {
      throw new Error(t('personalShopping.formExtra.uploadFailed'))
    }
    out.push(stored)
  }
  return out
}

async function resolveAllPackageImages(): Promise<Record<number, string[]>> {
  const result: Record<number, string[]> = {}
  for (const item of packageItems.value) {
    result[item.id] = item.imageFiles.length > 0 ? await resolveItemImages(item) : []
  }
  return result
}

const totalPhotosCount = computed(() =>
  packageItems.value.reduce((sum, i) => sum + i.imagePreviews.length, 0),
)

const form = reactive({
  originCountry: '',
  originCity: 'Guangzhou',
  originAddress: '',
  destinationId: '',
  destinationAddress: '',
  shippingModeId: '',
  ctnCount: null as number | null,
  declaredWeight: null as number | null,
  cbm: null as number | null,
  declaredValue: null as number | null,
  currency: 'XOF',
  description: '',
  senderFullname: '',
  senderNumber: '',
  senderEmail: '',
  contactNumber: '',
  contactFullname: '',
  contactEmail: '',
})

// Les champs téléphone reposent sur <PhoneInput>, qui gère indicatif, drapeau
// et contrôle de la longueur propre au pays.

// Plusieurs colis possibles par demande (dimensions/poids différents), sur le
// modèle des "parcels" répétables de pickngo — ctn_count/declared_weight/cbm
// du formulaire restent les totaux agrégés, calculés ci-dessous.
interface PackageItem {
  id: number
  quantity: number
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  /** Catégories de marchandise sélectionnées (remplace l'ancien texte libre). */
  categories: string[]
  description: string
  imageFiles: File[]
  imagePreviews: string[]
}

let packageItemSeq = 1
/**
 * Catégories proposées pour le contenu d'un colis. Ce sont les catégories produit
 * de la boutique, hors « DVS » qui sert aux devises — celles-ci alimentent le
 * sélecteur de monnaie, pas le contenu d'un carton.
 */
const packageCategories = computed(() =>
  (psStore.categories || []).filter((c: any) => {
    const slug = (c.slug || '').toString()
    return slug !== 'DVS' && !slug.startsWith('DVS-')
  }),
)

const toggleItemCategory = (item: PackageItem, label: string) => {
  const i = item.categories.indexOf(label)
  if (i === -1) item.categories.push(label)
  else item.categories.splice(i, 1)
}

const makePackageItem = (): PackageItem => ({
  id: packageItemSeq++,
  quantity: 1,
  weight: null,
  length: null,
  width: null,
  height: null,
  categories: [],
  description: '',
  imageFiles: [],
  imagePreviews: [],
})

const packageItems = ref<PackageItem[]>([makePackageItem()])
const invalidItemIds = ref<Set<number>>(new Set())
const invalidDimensionItemIds = ref<Set<number>>(new Set())

/** Chaque colis doit avoir une description de contenu (obligatoire côté pickngo). */
const validatePackageDescriptions = (): boolean => {
  // Le contenu est désormais exprimé par des catégories : c'est lui qui est requis,
  // la note libre restant facultative.
  const missing = packageItems.value.filter((i) => !i.categories || i.categories.length === 0)
  invalidItemIds.value = new Set(missing.map((i) => i.id))
  return missing.length === 0
}

/**
 * Les dimensions n'étaient jamais vérifiées : un colis pouvait être soumis
 * sans longueur/largeur/hauteur, et le volume (CBM) — pourtant nécessaire à
 * l'agent pour établir le devis fret — restait silencieusement à 0/absent.
 */
const validatePackageDimensions = (): boolean => {
  const missing = packageItems.value.filter((i) => !i.length || !i.width || !i.height)
  invalidDimensionItemIds.value = new Set(missing.map((i) => i.id))
  return missing.length === 0
}

/**
 * Bornes de plausibilité (pas des limites métier strictes) : elles existent
 * uniquement pour intercepter une saisie clairement fautive — un chiffre en
 * trop tape par erreur — avant qu'elle ne parte dans une demande impossible
 * à traiter par l'agent (ex. observe en prod : 2773 cartons de 14 tonnes
 * chacun, faute de frappe sur quantite/poids jamais detectee).
 */
const MAX_QUANTITY_PER_ITEM = 999
const MAX_WEIGHT_PER_CARTON_KG = 1000

const validatePackageSanity = (): boolean => {
  const tooManyCartons = packageItems.value.some((i) => Number(i.quantity) > MAX_QUANTITY_PER_ITEM)
  const tooHeavy = packageItems.value.some((i) => Number(i.weight) > MAX_WEIGHT_PER_CARTON_KG)
  errors.quantity = tooManyCartons ? t('envoiColis.validation.quantityTooHigh') : ''
  errors.weight = tooHeavy ? t('envoiColis.validation.weightTooHigh') : ''
  return !tooManyCartons && !tooHeavy
}

const addPackageItem = () => {
  packageItems.value.push(makePackageItem())
}

const removePackageItem = (id: number) => {
  packageItems.value = packageItems.value.filter((i) => i.id !== id)
}

const totalCtnCount = computed(() =>
  packageItems.value.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
)

const totalWeight = computed(() => {
  const total = packageItems.value.reduce((sum, i) => sum + (Number(i.weight) || 0) * (Number(i.quantity) || 0), 0)
  return Math.round(total * 100) / 100
})

const totalCbm = computed(() => {
  const total = packageItems.value.reduce((sum, i) => {
    const { length: l, width: w, height: h, quantity: q } = i
    if (!l || !w || !h) return sum
    return sum + (l * w * h * (Number(q) || 1)) / 1_000_000
  }, 0)
  // 6 décimales : avec des cartons réels (dizaines de cm) le résultat reste
  // lisible, mais évite d'afficher "0 m³" (donc l'air de ne rien calculer)
  // pour de très petites dimensions de test.
  return Math.round(total * 1_000_000) / 1_000_000
})

watch([totalCtnCount, totalWeight, totalCbm], ([ctn, weight, cbm]) => {
  form.ctnCount = ctn
  form.declaredWeight = weight > 0 ? weight : null
  form.cbm = cbm > 0 ? cbm : null
}, { immediate: true })

// Aucun devis n'est calculé ni affiché côté client : le prix est établi par un
// agent Nadom depuis le back-office, à partir du fret du pays de destination, du
// mode d'envoi et des caractéristiques déclarées. Le formulaire se contente donc
// de collecter destination, mode, devise, poids et volume.

const errors = reactive({
  destinationId: '',
  ctnCount: '',
  declaredWeight: '',
  contactNumber: '',
  contactFullname: '',
  quantity: '',
  weight: '',
})

const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    (errors as any)[key] = ''
  })

  if (!form.destinationId) errors.destinationId = t('envoiColis.validation.destination')
  if (!form.ctnCount || form.ctnCount < 1) errors.ctnCount = t('envoiColis.validation.ctnCount')
  if (form.declaredWeight == null || form.declaredWeight <= 0) errors.declaredWeight = t('envoiColis.validation.declaredWeight')
  if (!form.contactNumber || !/^[\+]?[0-9\s\-]{8,20}$/.test(form.contactNumber))
    errors.contactNumber = t('personalShopping.formExtra.validationContact')
  if (!form.contactFullname || form.contactFullname.trim().length < 2)
    errors.contactFullname = t('personalShopping.formExtra.validationName')

  const descriptionsOk = validatePackageDescriptions()
  const dimensionsOk = validatePackageDimensions()
  const sanityOk = validatePackageSanity()
  return !Object.values(errors).some((e) => e) && descriptionsOk && dimensionsOk && sanityOk
}

const currentStep = ref(1)

/** Ne valide que les champs de l'étape courante, pour ne pas bloquer le "Suivant"
 *  sur des champs d'une étape pas encore atteinte. */
const validateStep = (step: number) => {
  Object.keys(errors).forEach((key) => {
    (errors as any)[key] = ''
  })

  if (step === 1) {
    if (!form.destinationId) {
      errors.destinationId = t('envoiColis.validation.destination')
      originDestTab.value = 'destination'
    }
    if (!form.contactNumber || !/^[\+]?[0-9\s\-]{8,20}$/.test(form.contactNumber)) {
      errors.contactNumber = t('personalShopping.formExtra.validationContact')
      originDestTab.value = 'destination'
    }
    if (!form.contactFullname || form.contactFullname.trim().length < 2) {
      errors.contactFullname = t('personalShopping.formExtra.validationName')
      originDestTab.value = 'destination'
    }
  } else if (step === 2) {
    if (!form.ctnCount || form.ctnCount < 1) errors.ctnCount = t('envoiColis.validation.ctnCount')
    if (form.declaredWeight == null || form.declaredWeight <= 0) errors.declaredWeight = t('envoiColis.validation.declaredWeight')
  }

  const descriptionsOk = step === 2 ? validatePackageDescriptions() : true
  const dimensionsOk = step === 2 ? validatePackageDimensions() : true
  const sanityOk = step === 2 ? validatePackageSanity() : true
  return !Object.values(errors).some((e) => e) && descriptionsOk && dimensionsOk && sanityOk
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  currentStep.value = Math.min(4, currentStep.value + 1)
}

const prevStep = () => {
  currentStep.value = Math.max(1, currentStep.value - 1)
}

const recapDestinationLabel = computed(() => {
  const d = destinations.value.find((x: any) => x.id === form.destinationId)
  return d ? `${d.country}${d.city ? ', ' + d.city : ''}` : '—'
})

const recapShippingModeLabel = computed(() => {
  const m = shippingModes.value.find((x: any) => x.id === form.shippingModeId)
  return m ? `${shippingStore.getShippingModeLabel(m.mode)} — ${m.duration}` : '—'
})

const buildPayload = (itemImages: Record<number, string[]>) => ({
  requestType: 'package_sending',
  ctnCount: form.ctnCount!,
  declaredWeight: form.declaredWeight!,
  cbm: form.cbm,
  declaredValue: form.declaredValue,
  // Union de toutes les photos (tous colis confondus) — compat avec tout
  // affichage générique de `request.images` ; le détail par colis est dans
  // packageItems[].images.
  images: Object.values(itemImages).flat(),
  destinationId: form.destinationId,
  destinationAddress: form.destinationAddress || null,
  shippingModeId: form.shippingModeId || null,
  currency: form.currency,
  originCountry: form.originCountry || null,
  originCity: form.originCity || null,
  originAddress: form.originAddress || null,
  description: form.description || null,
  senderFullname: form.senderFullname || null,
  senderNumber: form.senderNumber || null,
  senderEmail: form.senderEmail || null,
  packageItems: packageItems.value.map((i) => ({
    quantity: i.quantity,
    weight: i.weight,
    length: i.length,
    width: i.width,
    height: i.height,
    categories: i.categories ?? [],
    description: i.description || null,
    images: itemImages[i.id] || [],
  })),
  contactNumber: form.contactNumber,
  contactFullname: form.contactFullname,
  contactEmail: form.contactEmail || null,
})

// Panier multi-envois : le client peut déclarer plusieurs envois (destinations
// différentes) avant de tout soumettre ensemble — pas de paiement à cette
// étape (l'encaissement reste un acte manuel admin, comme pour un envoi seul).
interface CartEntry {
  id: number
  summary: string
  payload: ReturnType<typeof buildPayload>
}
let cartSeq = 1
const cart = ref<CartEntry[]>([])

const cartSummaryLabel = () => {
  const dest = recapDestinationLabel.value
  return `${dest} · ${totalCtnCount.value} colis · ${totalWeight.value} kg`
}

const resetFormForNextShipment = () => {
  form.destinationId = ''
  form.destinationAddress = ''
  form.shippingModeId = ''
  form.declaredValue = null
  form.description = ''
  form.contactNumber = ''
  form.contactFullname = ''
  form.contactEmail = ''
  packageItems.value = [makePackageItem()]
  const u: any = authStore.currentUser
  if (u && !isAdminFlow.value) {
    form.contactFullname = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    form.contactEmail = u.email || ''
    form.contactNumber = u.phone || ''
  }
  originDestTab.value = 'destination'
  currentStep.value = 1
}

const addAnotherShipment = async () => {
  if (!validateForm()) return
  loading.value = true
  try {
    const itemImages = await resolveAllPackageImages()
    cart.value.push({ id: cartSeq++, summary: cartSummaryLabel(), payload: buildPayload(itemImages) })
    success(t('envoiColis.form.addedToCart'))
    resetFormForNextShipment()
  } catch (err: any) {
    notifyError(err?.message || t('envoiColis.submitError'))
  } finally {
    loading.value = false
  }
}

const removeCartEntry = (id: number) => {
  cart.value = cart.value.filter((c) => c.id !== id)
}


// Ramène l'utilisateur sur l'étape (et l'onglet) qui contient le premier champ en
// erreur. Sans cela, une erreur portant sur un champ de l'étape 1 restait invisible
// depuis l'étape 4 : le bouton "Soumettre" semblait ne rien faire du tout.
const goToFirstError = () => {
  if (errors.destinationId || errors.contactNumber || errors.contactFullname) {
    currentStep.value = 1
    originDestTab.value = 'destination'
    return
  }
  if (
    errors.ctnCount ||
    errors.declaredWeight ||
    errors.quantity ||
    errors.weight ||
    invalidItemIds.value.size > 0 ||
    invalidDimensionItemIds.value.size > 0
  ) {
    currentStep.value = 2
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    goToFirstError()
    notifyError(t('envoiColis.validation.fixErrors'))
    return
  }

  loading.value = true
  try {
    const itemImages = await resolveAllPackageImages()
    const allPayloads = [...cart.value.map((c) => c.payload), buildPayload(itemImages)]

    const createdIds: string[] = []
    const trackingNumbers: string[] = []
    for (const payload of allPayloads) {
      const request: any = await psStore.createRequest(payload as any)
      const requestId = request?.id ?? request?.uuid
      if (requestId) createdIds.push(requestId)
      const tracking = request?.trackingNumber ?? request?.tracking_number
      if (tracking) trackingNumbers.push(tracking)
    }

    if (createdIds.length === 0) {
      notifyError(t('envoiColis.submitError'))
      return
    }

    // En modale, le parent reprend la main (fermeture + rafraîchissement de sa
    // liste) : naviguer ferait justement quitter la page que l'on veut conserver.
    if (props.embedded) {
      success(
        createdIds.length > 1
          ? t('envoiColis.form.multiSubmitSuccess', { n: createdIds.length })
          : t('envoiColis.submitSuccess'),
      )
      emit('submitted', createdIds)
      cart.value = []
      return
    }

    // Parcours public : le client n'a pas de prix à consulter (le devis est établi
    // par un agent), donc plutôt que de l'envoyer sur une fiche de demande, on lui
    // confirme la prise en compte — en lui laissant sa référence de suivi — puis on
    // lui rend un formulaire vierge pour un éventuel envoi suivant.
    const refs = trackingNumbers.length > 0 ? trackingNumbers.join(', ') : ''
    await swal.successModal({
      title:
        createdIds.length > 1
          ? t('envoiColis.form.multiSubmitSuccess', { n: createdIds.length })
          : t('envoiColis.submitSuccess'),
      text: refs
        ? t('envoiColis.form.processingWithRef', { refs })
        : t('envoiColis.form.processing'),
      confirmButtonText: t('common.close'),
    })

    cart.value = []
    resetFormForNextShipment()
    originDestTab.value = 'origin'
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: any) {
    const msg = psStore.error || err?.data?.message || err?.message || t('envoiColis.submitError')
    // Un échec doit être aussi visible que le succès : un toast fugace laissait
    // croire que l'envoi était passé alors que rien n'avait été enregistré (cas
    // vécu lors d'une coupure de la base). La saisie est conservée pour permettre
    // de réessayer sans tout ressaisir. Vaut aussi en modale back-office, où
    // l'agent doit savoir que la demande n'a pas été créée.
    await swal.errorModal({
      title: t('envoiColis.submitError'),
      text: t('envoiColis.form.submitRetry', { reason: msg }),
      confirmButtonText: t('common.close'),
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  margin-bottom: -50px;
  padding-bottom: 80px;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone-sm {
  border-radius: 8px;
}

/* Aligne les inputs d'une même rangée même si un libellé passe sur plusieurs
   lignes dans une autre langue (ex. traduction plus longue). */
.pkg-field-label {
  display: flex;
  align-items: flex-end;
  min-height: 2.4em;
}

/* Sur petit écran, les trois champs de dimension se partagent la largeur : on
   réduit la police pour que leur intitulé tienne entièrement plutôt que d'être
   tronqué en plein mot. */
@media (max-width: 575.98px) {
  .pkg-dims .form-control-lg {
    font-size: 1rem;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
  }
}

/* Surlignage d'erreur : dimensions manquantes (nouveau) et categorie de
   contenu manquante (pkg-cat-invalid existait deja dans le template mais
   n'avait jamais recu de style). */
.pkg-dims-invalid .form-control,
.pkg-cat-invalid {
  border: 1px solid var(--bs-danger, #dc3545);
  border-radius: 0.375rem;
}
.pkg-dims-invalid .form-control {
  border-radius: 0.375rem !important;
}

/* intl-tel-input : aligner sur la taille des .form-control-lg de Bootstrap. */
:deep(.iti) {
  width: 100%;
}
:deep(.iti input.form-control) {
  width: 100%;
  padding-left: 90px !important;
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.05);
}

.image-preview {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cursor-zoom {
  cursor: zoom-in;
}

.zoom-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;
  padding: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .zoom-hint {
  opacity: 1;
}

.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.zoom-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.zoom-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.zoom-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.wizard-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.wizard-step.active .wizard-step-circle {
  background: var(--bs-primary);
  color: #fff;
}

.wizard-step.done .wizard-step-circle {
  background: #198754;
  color: #fff;
}

.wizard-step small {
  color: #94a3b8;
}

.wizard-step.active small,
.wizard-step.done small {
  color: #1e293b;
  font-weight: 500;
}

.recap-box {
  background: #f8fafc;
}
</style>

<template>
  <div class="page-wrapper">
    <!-- Hero Banner -->
    <section class="page-hero">
      <div class="container">
        <div class="row justify-content-center">
          <h1 class="fw-bold text-white text-center">
            {{ t("personalShopping.newRequest") }}
          </h1>
          <p class="opacity-75 text-white text-center">
            {{ t('personalShopping.newRequestSubtitle') }}
          </p>
        </div>
      </div>
    </section>
    <div class="container py-5 mt-2">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Form Card -->
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-lg-5">
              <form @submit.prevent="handleSubmit">
                <!-- Category -->
                <div class="mb-4">
                  <label class="form-label fw-medium"
                    >{{ t("personalShopping.form.category") }} *</label
                  >
                  <select
                    v-model="form.category"
                    class="form-select form-select-lg"
                    :class="{ 'is-invalid': errors.category }"
                    required
                    :disabled="podCategories.length === 0"
                  >
                    <option value="">
                      {{
                        podCategories.length === 0
                          ? t('personalShopping.formExtra.noCategoriesAvailable')
                          : t('personalShopping.formExtra.selectCategory')
                      }}
                    </option>
                    <option
                      v-for="cat in podCategories"
                      :key="cat.code"
                      :value="cat.code"
                    >
                      {{ cat.label }}
                    </option>
                  </select>
                  <div v-if="errors.category" class="invalid-feedback">
                    {{ errors.category }}
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-4">
                  <label class="form-label fw-medium"
                    >{{ t("personalShopping.form.productName") }} *</label
                  >
                  <input
                    v-model="form.title"
                    type="text"
                    class="form-control form-control-lg"
                    :class="{ 'is-invalid': errors.title }"
                    :placeholder="t('personalShopping.formExtra.productExample')"
                    required
                  />
                  <div v-if="errors.title" class="invalid-feedback">
                    {{ errors.title }}
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <label class="form-label fw-medium"
                    >{{ t("personalShopping.form.description") }} *</label
                  >
                  <textarea
                    v-model="form.description"
                    class="form-control"
                    :class="{ 'is-invalid': errors.description }"
                    rows="4"
                    :placeholder="t('personalShopping.formExtra.describeDetail')"
                    required
                  ></textarea>
                  <div v-if="errors.description" class="invalid-feedback">
                    {{ errors.description }}
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{
                    t("personalShopping.form.images")
                  }}</label>
                  <p class="text-muted small mb-3">
                    {{ t('personalShopping.formExtra.uploadMax') }}
                  </p>

                  <!-- Upload Zone -->
                  <div
                    class="upload-zone"
                    :class="{ dragging: isDragging }"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop"
                    @click="triggerFileInput"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      class="d-none"
                      @change="handleFileSelect"
                    />
                    <div class="text-center py-4">
                      <i
                        class="bi bi-cloud-arrow-up fs-1 text-primary mb-2"
                      ></i>
                      <p class="mb-1 fw-medium">
                        {{ t("personalShopping.form.dragDrop") }}
                      </p>
                      <p class="text-muted small mb-2">
                        {{ t("personalShopping.form.or") }}
                      </p>
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                      >
                        <i class="bi bi-folder2-open me-1"></i
                        >{{ t("personalShopping.form.browse") }}
                      </button>
                    </div>
                  </div>

                  <!-- Image Previews -->
                  <div v-if="imagePreviews.length > 0" class="row g-3 mt-3">
                    <div
                      v-for="(preview, index) in imagePreviews"
                      :key="index"
                      class="col-4 col-md-3"
                    >
                      <div class="image-preview position-relative">
                        <img
                          :src="preview"
                          :alt="`Image ${index + 1}`"
                          class="img-fluid rounded cursor-zoom"
                          @click="openZoom(preview)"
                        />
                        <button
                          type="button"
                          class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                          style="width: 24px; height: 24px; padding: 0"
                          @click="removeImage(index)"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                        <div class="zoom-hint">
                          <i class="bi bi-zoom-in"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Client Info -->
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-medium"
                      >{{ t('personalShopping.formExtra.fullName') }} *</label
                    >
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
                    <div v-if="errors.contactFullname" class="invalid-feedback d-block">
                      {{ errors.contactFullname }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-medium"
                      >{{ t('auth.email') }} *</label
                    >
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input
                        v-model="form.contactEmail"
                        type="email"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': errors.contactEmail }"
                        placeholder="email@exemple.com"
                        required
                      />
                    </div>
                    <div v-if="errors.contactEmail" class="invalid-feedback d-block">
                      {{ errors.contactEmail }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <!-- Quantity -->
                  <div class="col-md-4 mb-4">
                    <label class="form-label fw-medium"
                      >{{ t("personalShopping.form.quantity") }} *</label
                    >
                    <input
                      v-model.number="form.quantity"
                      type="number"
                      class="form-control form-control-lg"
                      :class="{ 'is-invalid': errors.quantity }"
                      min="1"
                      required
                    />
                    <div v-if="errors.quantity" class="invalid-feedback">
                      {{ errors.quantity }}
                    </div>
                  </div>

                  <!-- Budget -->
                  <div class="col-md-4 mb-4">
                    <label class="form-label fw-medium"
                      >{{ t("personalShopping.form.budget") }} *</label
                    >
                    <div class="input-group">
                      <input
                        v-model.number="form.budgetEstimated"
                        type="number"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': errors.budgetEstimated }"
                        placeholder="500000"
                        min="0"
                        step="any"
                        required
                      />
                      <select
                        v-model="form.currency"
                        class="form-select form-select-lg"
                        style="max-width: 130px;"
                      >
                        <option
                          v-for="cur in currencies"
                          :key="cur.id"
                          :value="cur.code"
                        >
                          {{ cur.label }}
                        </option>
                      </select>
                    </div>
                    <div v-if="errors.budgetEstimated" class="invalid-feedback d-block">
                      {{ errors.budgetEstimated }}
                    </div>
                    <small class="text-muted">{{ t('personalShopping.formExtra.budgetTotalHint') }}</small>
                  </div>

                  <!-- Contact Number -->
                  <div class="col-md-4 mb-4">
                    <label class="form-label fw-medium"
                      >{{ t('personalShopping.formExtra.whatsappContact') }} *</label
                    >
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-whatsapp text-success"></i>
                      </span>
                      <input
                        v-model="form.contactNumber"
                        type="tel"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': errors.contactNumber }"
                        placeholder="+225 07 XX XX XX XX"
                        pattern="^[\+]?[0-9\s\-]{8,20}$"
                        required
                      />
                    </div>
                    <div v-if="errors.contactNumber" class="invalid-feedback d-block">
                      {{ errors.contactNumber }}
                    </div>
                    <small class="text-muted">{{ t('personalShopping.formExtra.contactHint') }}</small>
                  </div>
                </div>

                <!-- Info Box -->
                <div class="alert alert-primary mb-4 border-0">
                  <div class="d-flex">
                    <i class="bi bi-info-circle fs-4 me-3"></i>
                    <div>
                      <strong>{{ t('personalShopping.formExtra.infoTitle') }}</strong>
                      <p class="mb-0 small">
                        {{ t('personalShopping.formExtra.infoBody') }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Submit -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{
                      loading
                        ? t("common.loading")
                        : t("personalShopping.form.submit")
                    }}
                  </button>
                  <NuxtLink
                    to="/personal-shopping"
                    class="btn btn-outline-secondary"
                  >
                    {{ t("common.cancel") }}
                  </NuxtLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zoom Modal -->
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
import { ref, reactive, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { usePersonalShoppingStore } from "~/stores/personalShopping";
import { useNotification } from "~/composables/useNotification";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { label: podCategoryLabel } = usePodCategoryLabel()
const { categoryLabel } = useCategoryLabel()
const { fileToCompressedBlob } = useImageCompress();
const router = useRouter();
const authStore = useAuthStore();
const psStore = usePersonalShoppingStore();
const { success, error: notifyError } = useNotification();

const podCategories = computed(() =>
  (psStore.categories || [])
    .filter((c: any) => String(c.slug || '') === 'POD')
    .map((c: any) => ({
      code: String(c.code || '').trim(),
      label: podCategoryLabel(c),
    }))
    .filter((c: any) => c.code),
);

const currencies = computed(() => {
  const fromStore = (psStore.categories || [])
    .filter((c: any) => {
      const slug = (c.slug || '').toString()
      return slug === 'DVS' || slug.startsWith('DVS-')
    })
    .map((c: any) => ({
      id: c.uuid || c.id,
      code: (c.code || c.label || '').toString().toUpperCase(),
      label: categoryLabel(c),
    }))
    .filter((c: any) => c.code)
  return fromStore.length > 0 ? fromStore : [{ id: 'xof', code: 'XOF', label: 'CFA' }]
})

onMounted(async () => {
  await psStore.fetchCategories({ page: 1, limit: 100, slug: 'POD' });
  if (!form.currency && currencies.value.length > 0) {
    form.currency = currencies.value[0].code
  }
  // Pre-remplit avec les infos du compte connecte (le client peut les modifier).
  const u: any = authStore.currentUser
  if (u) {
    if (!form.contactFullname) {
      form.contactFullname = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    }
    if (!form.contactEmail) form.contactEmail = u.email || ''
    if (!form.contactNumber) form.contactNumber = u.phone || ''
  }
});
const loading = ref(false);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreviews = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const zoomedImage = ref<string | null>(null);

const form = reactive({
  category: "",
  title: "",
  description: "",
  quantity: 1,
  budgetEstimated: null as number | null,
  currency: "" as string,
  contactNumber: "",
  contactFullname: "",
  contactEmail: "",
});

const errors = reactive({
  category: "",
  title: "",
  description: "",
  quantity: "",
  budgetEstimated: "",
  contactNumber: "",
  contactFullname: "",
  contactEmail: "",
});

// File handling
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const addFiles = (files: File[]) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const validFiles = files.filter((f) => imageTypes.includes(f.type));

  if (imagePreviews.value.length + validFiles.length > 5) {
    notifyError(t('personalShopping.formExtra.maxImages'));
    return;
  }

  validFiles.forEach((file) => {
    imageFiles.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index: number) => {
  imagePreviews.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
};

// Zoom
const openZoom = (image: string) => {
  zoomedImage.value = image;
  document.body.style.overflow = "hidden";
};

const closeZoom = () => {
  zoomedImage.value = null;
  document.body.style.overflow = "";
};

// Form validation
const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = "";
  });

  const fe = 'personalShopping.formExtra'

  if (!form.category) errors.category = t(`${fe}.validationCategorySelect`);
  if (!form.title || form.title.length < 5) errors.title = t(`${fe}.validationTitleShort`);
  if (!form.description || form.description.length < 20)
    errors.description = t(`${fe}.validationDescriptionShort`);
  if (!form.quantity || form.quantity < 1) errors.quantity = t(`${fe}.validationQuantity`);
  if (form.budgetEstimated == null || form.budgetEstimated <= 0)
    errors.budgetEstimated = t(`${fe}.validationBudget`);
  if (!form.contactNumber || !/^[\+]?[0-9\s\-]{8,20}$/.test(form.contactNumber))
    errors.contactNumber = t(`${fe}.validationContact`);
  if (!form.contactFullname || form.contactFullname.trim().length < 2)
    errors.contactFullname = t(`${fe}.validationName`);
  if (!form.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
    errors.contactEmail = t(`${fe}.validationEmail`);

  return !Object.values(errors).some((e) => e);
};

async function resolveImagesForSubmit(): Promise<string[]> {
  const api = usePublicApi();
  const out: string[] = [];
  for (const file of imageFiles.value) {
    // Compression/redimensionnement avant envoi → petits fichiers (évite 413).
    const blob = await fileToCompressedBlob(file);
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    const fd = new FormData();
    fd.append('image', blob, name);
    const res = await api.post<{ url?: string; path?: string }>('/upload/public-image', fd);
    // On stocke le CHEMIN relatif (servi via l'API / apiFile), jamais de base64 en base.
    const stored = res.success ? (res.data?.path || res.data?.url) : null;
    if (!stored) {
      throw new Error(res.message || t('personalShopping.formExtra.submitError'));
    }
    out.push(stored);
  }
  return out;
}

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const selected = podCategories.value.find((c) => c.code === form.category);
    const images = imageFiles.value.length > 0 ? await resolveImagesForSubmit() : [];
    const request: any = await psStore.createRequest({
      category: selected?.label || form.category,
      title: form.title,
      description: form.description,
      images,
      quantity: form.quantity,
      budgetEstimated: form.budgetEstimated!,
      currency: form.currency,
      contactNumber: form.contactNumber,
      contactFullname: form.contactFullname,
      contactEmail: form.contactEmail,
    } as any);

    success(t('personalShopping.formExtra.submitSuccess'));
    const requestId = request?.id ?? (request as any)?.uuid;
    if (!requestId) {
      notifyError(t('personalShopping.formExtra.submitError'));
      return;
    }
    router.push(`/personal-shopping/${requestId}`);
  } catch (err: any) {
    const msg =
      psStore.error ||
      err?.data?.message ||
      err?.message ||
      t('personalShopping.formExtra.submitError');
    notifyError(msg);
  } finally {
    loading.value = false;
  }
};
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
</style>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!request" class="text-center py-5">
      <h4>{{ t('admin.requests.detail.notFound') }}</h4>
      <NuxtLink to="/admin/requests" class="btn btn-primary">{{ t('common.back') }}</NuxtLink>
    </div>

    <!-- Request Detail -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <NuxtLink to="/admin/requests" class="btn btn-link p-0 mb-2">
            <i class="bi bi-arrow-left me-1"></i>{{ t('admin.requests.backToList') }}
          </NuxtLink>
          <h4 class="mb-0">{{ t('admin.requests.detail.title', { id: String(request.id ?? '').slice(-6) }) }}</h4>
        </div>
        <div class="d-flex flex-column align-items-end gap-1">
          <select
            :value="request.status"
            class="form-select"
            :disabled="isStatusLocked"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
          >
            <option value="pending">{{ t('admin.requests.status.pending') }}</option>
            <option value="searching">{{ t('admin.requests.status.searching') }}</option>
            <option value="negotiating">{{ t('admin.requests.status.negotiating') }}</option>
            <option value="confirmed">{{ t('admin.requests.status.confirmed') }}</option>
            <option value="preparing">{{ t('admin.requests.status.preparing') }}</option>
            <!-- « Expédié » et « Livré » sont pilotés par l'expédition, non sélectionnables à la main. -->
            <option value="shipped" disabled>{{ t('admin.requests.status.shipped') }}</option>
            <option value="delivered" disabled>{{ t('admin.requests.status.delivered') }}</option>
            <option value="cancelled">{{ t('admin.requests.status.cancelled') }}</option>
          </select>
          <small v-if="isStatusLocked" class="text-muted">{{ t('admin.requests.detail.statusLocked') }}</small>
          <small v-else-if="request.status === 'shipped'" class="text-muted">{{ t('admin.requests.detail.statusShipmentDriven') }}</small>
        </div>
      </div>

      <div class="row g-4">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Envoi de colis : infos déclarées (CTN/CBM/poids/valeur/destination) -->
          <div v-if="request.requestType === 'package_sending'" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0"><i class="bi bi-box-seam me-2"></i>{{ t('admin.requests.detail.packageInfo') }}</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <small class="text-muted d-block">{{ t('admin.requests.ctnCountLabel') }}</small>
                  <strong>{{ request.ctnCount ?? t('admin.shipments.na') }}</strong>
                </div>
                <div class="col-md-3">
                  <small class="text-muted d-block">{{ t('admin.requests.declaredWeightLabel') }}</small>
                  <strong>{{ request.declaredWeight != null ? `${request.declaredWeight} kg` : t('admin.shipments.na') }}</strong>
                </div>
                <div class="col-md-3">
                  <small class="text-muted d-block">{{ t('admin.requests.cbmLabel') }}</small>
                  <strong>{{ request.cbm != null ? `${request.cbm} m³` : t('admin.shipments.na') }}</strong>
                </div>
                <div class="col-md-3">
                  <small class="text-muted d-block">{{ t('admin.requests.declaredValueLabel') }}</small>
                  <strong>{{ request.declaredValue != null ? formatCurrency(request.declaredValue, requestCurrency) : t('admin.shipments.na') }}</strong>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">{{ t('admin.shipments.destination') }}</small>
                  <strong>{{ (request as any).destination?.country || t('admin.shipments.na') }}</strong>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">{{ t('admin.shipments.mode') }}</small>
                  <strong>{{ shippingModeLabel((request as any).shippingMode?.mode) }}</strong>
                </div>
                <div v-if="(request as any).originCountry || (request as any).originCity" class="col-md-6">
                  <small class="text-muted d-block">{{ t('envoiColis.form.originSection') }}</small>
                  <strong>{{ [(request as any).originCity, (request as any).originCountry].filter(Boolean).join(', ') }}</strong>
                </div>
                <div v-if="(request as any).destinationAddress" class="col-md-6">
                  <small class="text-muted d-block">{{ t('envoiColis.form.destinationAddress') }}</small>
                  <strong>{{ (request as any).destinationAddress }}</strong>
                </div>
                <div v-if="(request as any).senderFullname || (request as any).senderCompany" class="col-md-6">
                  <small class="text-muted d-block">{{ t('envoiColis.form.senderSection') }}</small>
                  <strong>{{ (request as any).senderFullname }}<template v-if="(request as any).senderNumber"> — {{ (request as any).senderNumber }}</template></strong>
                  <div v-if="(request as any).senderEmail" class="small text-muted">{{ (request as any).senderEmail }}</div>
                  <div v-if="(request as any).senderType === 'company' && (request as any).senderCompany" class="small">
                    <span class="badge bg-secondary-subtle text-secondary">
                      <i class="bi bi-building me-1"></i>{{ (request as any).senderCompany }}
                    </span>
                  </div>
                </div>
                <div v-if="(request as any).contactFullname || (request as any).contactCompany" class="col-md-6">
                  <small class="text-muted d-block">{{ t('envoiColis.form.recipientSection') }}</small>
                  <strong>{{ (request as any).contactFullname }}<template v-if="(request as any).contactNumber"> — {{ (request as any).contactNumber }}</template></strong>
                  <div v-if="(request as any).contactEmail" class="small text-muted">{{ (request as any).contactEmail }}</div>
                  <div v-if="(request as any).contactType === 'company' && (request as any).contactCompany" class="small">
                    <span class="badge bg-secondary-subtle text-secondary">
                      <i class="bi bi-building me-1"></i>{{ (request as any).contactCompany }}
                    </span>
                  </div>
                </div>
                <div v-if="request.description" class="col-12">
                  <small class="text-muted d-block">{{ t('envoiColis.form.description') }}</small>
                  <span>{{ request.description }}</span>
                </div>
                <div v-if="(request as any).packageItems?.length" class="col-12">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-muted">{{ t('envoiColis.form.addPackage') }}</small>
                    <!-- L'agent ajuste les valeurs déclarées par le client (poids,
                         dimensions, photos) avant d'établir le devis. -->
                    <div v-if="canEditQuotation" class="d-flex gap-2">
                      <template v-if="editPackages">
                        <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="savingPackages" @click="cancelPackageEdit">
                          {{ t('admin.common.cancel') }}
                        </button>
                        <button type="button" class="btn btn-sm btn-success" :disabled="savingPackages" @click="savePackages">
                          <span v-if="savingPackages" class="spinner-border spinner-border-sm me-1"></span>
                          {{ t('admin.requests.detail.savePackages') }}
                        </button>
                      </template>
                      <button v-else type="button" class="btn btn-sm btn-outline-primary" @click="startPackageEdit">
                        <i class="bi bi-pencil me-1"></i>{{ t('admin.requests.detail.editPackages') }}
                      </button>
                    </div>
                  </div>

                  <!-- Mode édition -->
                  <div v-if="editPackages">
                    <div v-for="(pi, idx) in packageDraft" :key="idx" class="border rounded p-3 mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="small">{{ t('envoiColis.form.packageN', { n: idx + 1 }) }}</strong>
                        <button v-if="packageDraft.length > 1" type="button" class="btn btn-sm btn-outline-danger" @click="packageDraft.splice(idx, 1)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                      <div class="row g-2">
                        <div class="col-6 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.quantity') }}</label>
                          <input v-model.number="pi.quantity" type="number" min="1" class="form-control form-control-sm" />
                        </div>
                        <div class="col-6 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.declaredWeight') }}</label>
                          <input v-model.number="pi.weight" type="number" min="0" step="any" class="form-control form-control-sm" />
                        </div>
                        <div class="col-4 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.dimLengthShort') }}</label>
                          <input v-model.number="pi.length" type="number" min="0" step="any" class="form-control form-control-sm" />
                        </div>
                        <div class="col-4 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.dimWidthShort') }}</label>
                          <input v-model.number="pi.width" type="number" min="0" step="any" class="form-control form-control-sm" />
                        </div>
                        <div class="col-4 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.dimHeightShort') }}</label>
                          <input v-model.number="pi.height" type="number" min="0" step="any" class="form-control form-control-sm" />
                        </div>
                        <div class="col-12 col-lg-2">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.itemNote') }}</label>
                          <input v-model="pi.description" type="text" class="form-control form-control-sm" />
                        </div>
                        <div class="col-12">
                          <label class="form-label small mb-1">{{ t('envoiColis.form.itemDescription') }}</label>
                          <div class="d-flex flex-wrap gap-2">
                            <button
                              v-for="c in packageCategories"
                              :key="c.uuid"
                              type="button"
                              class="btn btn-sm rounded-pill px-3"
                              :class="(pi.categories || []).includes(c.label) ? 'btn-primary' : 'btn-outline-secondary'"
                              @click="toggleDraftCategory(pi, c.label)"
                            >
                              {{ c.label }}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="mt-3">
                        <label class="form-label small mb-1">{{ t('envoiColis.form.photos') }}</label>
                        <div class="d-flex gap-2 flex-wrap align-items-center">
                          <div v-for="(img, i) in pi.images" :key="i" class="position-relative">
                            <img :src="resolveStorageAssetUrl(img)" class="rounded border pkg-thumb" width="56" height="56" alt="" />
                            <button
                              type="button"
                              class="btn btn-sm btn-danger pkg-thumb-remove"
                              :title="t('admin.requests.detail.removePhoto')"
                              @click="pi.images.splice(i, 1)"
                            >
                              <i class="bi bi-x"></i>
                            </button>
                          </div>
                          <label class="btn btn-sm btn-outline-secondary mb-0">
                            <i class="bi bi-plus-lg me-1"></i>{{ t('admin.requests.detail.addPhoto') }}
                            <input type="file" accept="image/*" multiple hidden @change="onPackagePhotos(idx, $event)" />
                          </label>
                          <span v-if="uploadingPhotos" class="spinner-border spinner-border-sm text-primary"></span>
                        </div>
                      </div>
                    </div>
                    <div class="alert alert-info py-2 small mb-0">
                      {{ t('admin.requests.detail.packagesRecomputed') }}
                    </div>
                  </div>

                  <div v-else class="table-responsive">
                    <table class="table table-sm mb-0 pkg-table align-middle">
                      <thead>
                        <tr>
                          <th>{{ t('envoiColis.form.quantity') }}</th>
                          <th>{{ t('envoiColis.form.declaredWeight') }}</th>
                          <th>{{ t('envoiColis.form.dimLength') }}×{{ t('envoiColis.form.dimWidth') }}×{{ t('envoiColis.form.dimHeight') }}</th>
                          <th>{{ t('envoiColis.form.itemDescription') }}</th>
                          <th>{{ t('envoiColis.form.photos') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(pi, idx) in (request as any).packageItems" :key="idx">
                          <td>{{ pi.quantity }}</td>
                          <td>{{ pi.weight != null ? `${pi.weight} kg` : '—' }}</td>
                          <td>{{ pi.length && pi.width && pi.height ? `${pi.length}×${pi.width}×${pi.height} cm` : '—' }}</td>
                          <td>
                            <span v-if="pi.categories?.length" class="d-flex flex-wrap gap-1">
                              <span v-for="(c, ci) in pi.categories" :key="ci" class="badge bg-secondary-subtle text-secondary">{{ c }}</span>
                            </span>
                            <span v-else class="text-muted">—</span>
                            <div v-if="pi.description" class="small text-muted mt-1">{{ pi.description }}</div>
                          </td>
                          <td>
                            <div v-if="pi.images?.length" class="d-flex gap-1 flex-wrap">
                              <img
                                v-for="(img, i) in pi.images"
                                :key="i"
                                :src="resolveStorageAssetUrl(img)"
                                class="rounded border pkg-thumb"
                                width="56"
                                height="56"
                                :alt="`${t('envoiColis.form.photos')} ${i + 1}`"
                                @click="openZoom(img)"
                              />
                            </div>
                            <span v-else class="text-muted">—</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ordered Items (from Catalog) -->
          <div v-else-if="request.items && request.items.length > 0" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">{{ t('admin.requests.detail.orderedProducts') }}</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>{{ t('admin.dashboard.product') }}</th>
                      <th>{{ t('admin.requests.detail.price') }}</th>
                      <th>{{ t('admin.requests.detail.qty') }}</th>
                      <th class="text-end">{{ t('admin.dashboard.total') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in request.items" :key="item.productId">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="resolveStorageAssetUrl(item.image) || 'https://placehold.co/40?text=%3F'" class="rounded me-2" width="40" height="40" style="object-fit: cover;" />
                          <span>{{ itemDisplayName(item) }}</span>
                        </div>
                      </td>
                      <td>{{ formatCurrency(item.price, requestCurrency) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="text-end fw-bold">{{ formatCurrency(item.price * item.quantity, requestCurrency) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Product Info (Original Request) -->
          <div v-else class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">{{ t('admin.requests.detail.productInfo') }}</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <img
                    :src="requestThumbnailUrl(request, 200)"
                    class="img-fluid rounded"
                    alt=""
                  />
                  <div v-if="(request.images?.length ?? 0) > 1" class="d-flex gap-2 mt-2 flex-wrap">
                    <img
                      v-for="(img, i) in request.images.slice(1)"
                      :key="i"
                      :src="resolveStorageAssetUrl(img)"
                      class="rounded border pkg-thumb"
                      width="50"
                      height="50"
                      :alt="`${t('admin.requests.detail.photos')} ${i + 2}`"
                      @click="openZoom(img)"
                    />
                  </div>
                </div>
                <div class="col-md-8">
                  <h5>{{ request.title }}</h5>
                  <span class="badge bg-secondary mb-3">{{ request.category }}</span>
                  <div class="text-muted request-description">{{ request.description }}</div>
                  <div class="row g-2">
                    <div class="col-6">
                      <small class="text-muted d-block">{{ t('admin.requests.detail.quantity') }}</small>
                      <strong>{{ request.quantity }}</strong>
                    </div>
                    <div class="col-6">
                      <small class="text-muted d-block">{{ t('admin.requests.detail.estimatedBudget') }}</small>
                      <strong>{{ formatCurrency(request.budgetEstimated, requestCurrency) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Photos de la demande (plusieurs images) -->
          <div v-if="(request.images?.length ?? 0) > 0" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">{{ t('admin.requests.detail.photos') }}</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <img
                  v-for="(img, i) in request.images"
                  :key="i"
                  :src="resolveStorageAssetUrl(img)"
                  class="rounded border pkg-thumb"
                  width="110"
                  height="110"
                  :alt="`${t('admin.requests.detail.photos')} ${i + 1}`"
                  @click="openZoom(img)"
                />
              </div>
            </div>
          </div>

          <!-- Quotation -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 class="mb-0">
                {{ t('admin.requests.detail.quoteTitle') }}
                <small class="text-muted fs-6 ms-2">— {{ t('admin.requests.detail.currencyLabel') }} : <strong>{{ requestCurrency }}</strong></small>
              </h5>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-if="!showQuotationForm && !request.quotedPrice && canEditQuotation"
                  class="btn btn-sm btn-primary"
                  @click="openQuotationForm()"
                >
                  <i class="bi bi-plus me-1"></i>{{ t('admin.requests.detail.createQuote') }}
                </button>
                <button
                  v-if="!showQuotationForm && request.quotedPrice && canEditQuotation"
                  class="btn btn-sm btn-outline-primary"
                  @click="openQuotationForm()"
                >
                  <i class="bi bi-pencil me-1"></i>{{ t('admin.requests.detail.editQuote') }}
                </button>
                <button
                  v-if="request.quotedPrice"
                  class="btn btn-sm btn-outline-secondary"
                  :disabled="downloadingPdf"
                  @click="downloadQuotationPdf"
                >
                  <span v-if="downloadingPdf" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-file-earmark-pdf me-1"></i>{{ t('admin.requests.detail.pdfQuote') }}
                </button>
                <button
                  v-if="request.quotedPrice"
                  class="btn btn-sm btn-primary"
                  :disabled="generatingLink"
                  @click="generatePaymentLink"
                >
                  <span v-if="generatingLink" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-link-45deg me-1"></i>{{ t('admin.requests.detail.generatePaymentLink') }}
                </button>
                <button
                  v-if="request.status === 'confirmed' || request.status === 'preparing'"
                  class="btn btn-sm btn-success"
                  @click="openShipmentModal"
                >
                  <i class="bi bi-box-seam me-1"></i>{{ t('admin.requests.detail.createShipment') }}
                </button>
                <NuxtLink
                  v-if="request.shipmentId"
                  :to="`/admin/shipments/${request.shipmentId}`"
                  class="btn btn-sm btn-info text-white"
                >
                  <i class="bi bi-box-seam me-1"></i>{{ t('admin.requests.detail.viewShipment') }}
                </NuxtLink>
              </div>
            </div>
            <div class="card-body">
              <!-- Existing Quotation -->
              <div v-if="request.quotedPrice && request.quotedDetails && !showQuotationForm">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <tbody>
                      <template v-if="isPackageSending">
                        <tr>
                          <td>{{ t('admin.requests.detail.transport') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.packaging') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.packagingFee, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.customs') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.customsFee, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.localDelivery') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.localDeliveryFee, requestCurrency) }}</td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr>
                          <td>{{ t('admin.requests.detail.productCost') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.productCost, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.commission') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.serviceFee, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.inspection') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.inspectionFee, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.packaging') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.packagingFee, requestCurrency) }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('admin.requests.detail.shippingLine') }}</td>
                          <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost, requestCurrency) }}</td>
                        </tr>
                      </template>
                      <tr class="fw-bold border-top border-2">
                        <td>{{ t('admin.requests.detail.total') }} <span class="badge bg-success-subtle text-success">net NADOM</span></td>
                        <td class="text-end text-success fs-6">{{ formatCurrency(request.quotedPrice, requestCurrency) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="border rounded p-3 bg-light mt-3">
                  <div class="text-uppercase small fw-bold text-muted mb-2">
                    <i class="bi bi-receipt me-1"></i>{{ t('admin.requests.detail.priceDetailTitle') }}
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">{{ t('admin.requests.detail.netMerchantNadom') }}</span>
                    <span>{{ formatCurrency(qBreakdown.net, requestCurrency) }}</span>
                  </div>
                  <div class="d-flex justify-content-between pt-2 mt-1 border-top fw-bold text-primary fs-5">
                    <span>{{ t('admin.requests.detail.clientPrice') }}</span>
                    <span>{{ formatCurrency(qBreakdown.total, requestCurrency) }}</span>
                  </div>
                </div>
              </div>

              <!-- Quotation Form -->
              <form v-else-if="showQuotationForm" @submit.prevent="submitQuotation">
                <!-- Envoi de colis : le client possède déjà sa marchandise. Le devis
                     part donc du fret (pays de destination + mode), sans coût produit,
                     inspection d'achat ni commission sur achat. -->
                <div v-if="isPackageSending" class="row g-3">
                  <div class="col-12">
                    <label class="form-label">{{ t('admin.requests.detail.transport') }} ({{ requestCurrency }})</label>
                    <div class="input-group">
                      <input v-model.number="quotation.shippingCost" type="number" min="0" step="any" class="form-control" required />
                      <button
                        v-if="transportEstimate"
                        type="button"
                        class="btn btn-outline-primary"
                        :title="t('admin.requests.detail.applyTariff')"
                        @click="applyTransportEstimate"
                      >
                        <i class="bi bi-calculator me-1"></i>{{ formatCurrency(transportEstimate.amount, requestCurrency) }}
                      </button>
                    </div>
                    <small v-if="transportEstimate" class="text-muted">
                      {{ t('admin.requests.detail.tariffBasis', {
                        qty: transportEstimate.qty,
                        unit: transportEstimate.unit,
                        rate: formatCurrency(transportEstimate.rate, requestCurrency),
                      }) }}
                    </small>
                    <small v-else class="text-muted">{{ t('admin.requests.detail.noTariff') }}</small>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label quote-label">{{ t('admin.requests.detail.packaging') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.packagingFee" type="number" min="0" step="any" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label quote-label">{{ t('admin.requests.detail.customs') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.customsFee" type="number" min="0" step="any" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label quote-label">{{ t('admin.requests.detail.localDelivery') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.localDeliveryFee" type="number" min="0" step="any" class="form-control" />
                  </div>
                </div>

                <div v-else class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.productCost') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.productCost" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.inspection') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.inspectionFee" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label quote-label">{{ t('admin.requests.detail.packaging') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.packagingFee" type="number" min="0" step="any" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ t('admin.requests.detail.shippingLine') }} ({{ requestCurrency }})</label>
                    <input v-model.number="quotation.shippingCost" type="number" min="0" step="any" class="form-control" required />
                  </div>
                </div>

                <div class="alert alert-info mt-3 mb-0 d-flex justify-content-between align-items-center">
                  <span><strong>{{ t('admin.requests.detail.estimatedTotal') }}</strong> <span class="badge bg-success-subtle text-success">net NADOM</span></span>
                  <strong>{{ formatCurrency(quotationTotal, requestCurrency) }}</strong>
                </div>
                <div class="border rounded p-3 bg-light mt-2">
                  <div class="text-uppercase small fw-bold text-muted mb-2"><i class="bi bi-receipt me-1"></i>{{ t('admin.requests.detail.priceDetailTitle') }}</div>
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">{{ t('admin.requests.detail.netMerchant') }}</span><span>{{ formatCurrency(formBreakdown.net, requestCurrency) }}</span></div>
                  <div class="d-flex justify-content-between pt-2 mt-1 border-top fw-bold text-primary fs-5"><span>{{ t('admin.requests.detail.clientPrice') }}</span><span>{{ formatCurrency(formBreakdown.total, requestCurrency) }}</span></div>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success">
                    <i class="bi bi-check me-1"></i>{{ t('admin.common.save') }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="showQuotationForm = false">
                    {{ t('admin.common.cancel') }}
                  </button>
                </div>
              </form>

              <div v-else class="text-center py-3 text-muted">
                {{ t('admin.requests.detail.noQuote') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Status -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.currentStatus') }}</h6>
              <span
                class="badge fs-6"
                :style="{
                  backgroundColor: formatRequestStatus(request.status).bgColor,
                  color: formatRequestStatus(request.status).color
                }"
              >
                {{ formatRequestStatus(request.status).label }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.info') }}</h6>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.client') }}</small>
                <div class="fw-medium">
                  {{ clientFullName || t('admin.requests.detail.anonymousClient') }}
                </div>
                <small class="text-muted">
                  {{ (request as any).user?.email || (request as any).contactEmail || '' }}
                </small>
              </div>
              <div v-if="clientPhone" class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.clientContact') }}</small>
                <div class="d-flex align-items-center justify-content-between">
                  <a
                    :href="`tel:${clientPhone}`"
                    class="text-decoration-none"
                  >
                    <i class="bi bi-telephone text-primary me-2"></i>
                    <strong>{{ clientPhone }}</strong>
                  </a>
                  <a
                    :href="whatsappLinkForClient"
                    target="_blank"
                    class="btn btn-sm btn-success"
                    :title="t('admin.requests.detail.openWhatsapp')"
                  >
                    <i class="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
              <div v-else class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.clientContact') }}</small>
                <span class="text-muted small fst-italic">{{ t('admin.shipments.noPhone') }}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.createdOn') }}</small>
                <span>{{ formatDate(request.createdAt) }}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">{{ t('admin.requests.detail.updatedOn') }}</small>
                <span>{{ formatDate(request.updatedAt) }}</span>
              </div>
              <div>
                <small class="text-muted d-block">{{ t('admin.requests.detail.whatsappMessages') }}</small>
                <span>{{ request.whatsappMessages }}</span>
              </div>
            </div>
          </div>

          <!-- Encaissement (Phase 4) -->
          <AdminPaymentBlock
            payable-type="personal_shopping"
            :payable-id="String(request.id)"
            :amount-due="request.quotedPrice ? Number(request.quotedPrice) : null"
          />

          <!-- Actions -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="mb-3">{{ t('admin.requests.detail.actions') }}</h6>
              <div class="d-grid gap-2">
                <a href="#" class="btn btn-success" @click.prevent="openWhatsApp">
                  <i class="bi bi-whatsapp me-2"></i>{{ t('admin.requests.detail.contactClient') }}
                </a>
                <small v-if="isConfirmed && quotationPdfUrl" class="text-success d-flex align-items-center gap-1">
                  <i class="bi bi-file-earmark-pdf"></i>
                  {{ t('admin.requests.detail.confirmSendQuote') }}
                </small>
                <small v-else-if="!isConfirmed && quotationPdfUrl" class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-info-circle"></i>
                  {{ t('admin.requests.detail.confirmToSendQuote') }}
                </small>
                <button class="btn btn-outline-danger" @click="deleteRequest">
                  <i class="bi bi-trash me-2"></i>{{ t('admin.common.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Shipment Modal -->
    <div v-if="showShipmentModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('admin.requests.detail.createShipmentModal') }}</h5>
            <button type="button" class="btn-close" @click="showShipmentModal = false"></button>
          </div>
          <div class="modal-body">
            <p>{{ t('admin.requests.detail.createShipmentConfirm') }}</p>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.requests.detail.shippingMode') }}</label>
              <select v-model="shipmentForm.shippingMode" class="form-select">
                <option value="air_normal">{{ t('admin.shipments.airStandard') }}</option>
                <option value="air_express">{{ t('admin.shipments.airExpress') }}</option>
                <option value="sea">{{ t('admin.shipments.sea') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('admin.requests.detail.estimatedWeight') }}</label>
              <input v-model.number="shipmentForm.weight" type="number" step="0.1" class="form-control" />
            </div>
            <div class="alert alert-info">
              {{ t('admin.requests.detail.createShipmentHint') }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showShipmentModal = false">{{ t('admin.common.cancel') }}</button>
            <button class="btn btn-primary" @click="createShipment" :disabled="creatingShipment">
              <span v-if="creatingShipment" class="spinner-border spinner-border-sm me-2"></span>
              {{ t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Visionneuse plein écran, partagée par les photos de la demande et
         celles de chaque colis. -->
    <div v-if="zoomedImage" class="zoom-modal" @click="closeZoom">
      <div class="zoom-content" @click.stop>
        <button type="button" class="zoom-close" :aria-label="t('common.close')" @click="closeZoom">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="zoomedImage" :alt="t('admin.requests.detail.photos')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const pdfLangQuery = () => {
  const lang = ['fr', 'en', 'zh'].includes(locale.value) ? locale.value : 'fr'
  return `?lang=${lang}`
}

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useShippingStore } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import { useImageCompress } from '~/composables/useImageCompress'
import { useWhatsApp } from '~/composables/useWhatsApp'
import { getToken } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const psStore = usePersonalShoppingStore()
const shippingStore = useShippingStore()
const { field } = useLocaleField()
const { formatCurrency, formatDate, formatRequestStatus, requestThumbnailUrl } = useFormatters()

// --- Édition des colis par l'agent -------------------------------------------
// Le client déclare poids, dimensions et photos ; l'agent les corrige au besoin
// (pesée réelle, photo floue…) AVANT d'établir le devis, puisque le transport se
// calcule sur ces valeurs.
const editPackages = ref(false)
const savingPackages = ref(false)
const uploadingPhotos = ref(false)
const packageDraft = ref<any[]>([])

const packageCategories = computed(() =>
  (psStore.categories || []).filter((c: any) => {
    const slug = (c.slug || '').toString()
    return slug !== 'DVS' && !slug.startsWith('DVS-')
  }),
)

const toggleDraftCategory = (item: any, label: string) => {
  if (!Array.isArray(item.categories)) item.categories = []
  const i = item.categories.indexOf(label)
  if (i === -1) item.categories.push(label)
  else item.categories.splice(i, 1)
}

const startPackageEdit = () => {
  // Copie profonde : annuler doit vraiment tout restaurer.
  packageDraft.value = JSON.parse(JSON.stringify((request.value as any)?.packageItems ?? []))
    .map((i: any) => ({ ...i, images: Array.isArray(i.images) ? i.images : [], categories: Array.isArray(i.categories) ? i.categories : [] }))
  editPackages.value = true
}

const cancelPackageEdit = () => {
  editPackages.value = false
  packageDraft.value = []
}

const onPackagePhotos = async (idx: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return
  uploadingPhotos.value = true
  try {
    const { fileToCompressedBlob } = useImageCompress()
    for (const file of files) {
      const blob = await fileToCompressedBlob(file)
      const fd = new FormData()
      fd.append('image', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg')
      const res = await useApi().post<{ url?: string; path?: string }>('/upload/public-image', fd)
      const stored = res.success ? (res.data?.path || res.data?.url) : null
      if (!stored) throw new Error('upload')
      packageDraft.value[idx].images.push(stored)
    }
  } catch {
    notifyError(t('admin.requests.detail.photoUploadFailed'))
  } finally {
    uploadingPhotos.value = false
    input.value = ''
  }
}

const savePackages = async () => {
  savingPackages.value = true
  try {
    const items = packageDraft.value.map((i: any) => ({
      quantity: Number(i.quantity) || 1,
      weight: i.weight != null && i.weight !== '' ? Number(i.weight) : null,
      length: i.length != null && i.length !== '' ? Number(i.length) : null,
      width: i.width != null && i.width !== '' ? Number(i.width) : null,
      height: i.height != null && i.height !== '' ? Number(i.height) : null,
      categories: i.categories ?? [],
      description: i.description || null,
      images: i.images ?? [],
    }))

    // Les totaux de l'en-tête découlent des colis : les recalculer évite qu'ils
    // contredisent le détail après correction (et le devis s'appuie dessus).
    const ctn = items.reduce((n, i) => n + (i.quantity || 0), 0)
    const poids = items.reduce((n, i) => n + (i.weight || 0) * (i.quantity || 1), 0)
    const volume = items.reduce((n, i) => {
      if (!i.length || !i.width || !i.height) return n
      return n + (i.length * i.width * i.height) / 1_000_000 * (i.quantity || 1)
    }, 0)

    await psStore.updateRequest(requestId, {
      packageItems: items,
      ctnCount: ctn || null,
      declaredWeight: Math.round(poids * 100) / 100 || null,
      cbm: Math.round(volume * 1_000_000) / 1_000_000 || null,
      images: items.flatMap((i) => i.images),
    } as any)

    await psStore.fetchRequestById(requestId)
    editPackages.value = false
    packageDraft.value = []
    success(t('admin.requests.detail.packagesSaved'))
  } catch {
    notifyError(t('common.error'))
  } finally {
    savingPackages.value = false
  }
}

// --- Visionneuse d'image -------------------------------------------------------
const zoomedImage = ref<string | null>(null)

const openZoom = (img: string) => {
  zoomedImage.value = resolveStorageAssetUrl(img)
}
const closeZoom = () => {
  zoomedImage.value = null
}
const onZoomKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeZoom()
}
onMounted(() => window.addEventListener('keydown', onZoomKeydown))
onUnmounted(() => window.removeEventListener('keydown', onZoomKeydown))

const itemDisplayName = (item: Record<string, unknown>) =>
  field(item, 'name') || String(item.name_fr || item.name_en || '')
const { success, error: notifyError } = useNotification()
const { contactClientForRequest, generateLink, buildClientRequestMessage } = useWhatsApp()

const { createPaymentLink, publicPrice, priceBreakdown } = usePayment()

// Décomposition net → prix client (devis enregistré et formulaire)
const qBreakdown = computed(() => priceBreakdown(Number(request.value?.quotedPrice) || 0))
const formBreakdown = computed(() => priceBreakdown(Number(quotationTotal.value) || 0))

const loading = ref(true)
const showQuotationForm = ref(false)
const showShipmentModal = ref(false)
const creatingShipment = ref(false)
const downloadingPdf = ref(false)
const generatingLink = ref(false)

/**
 * Génère un lien de paiement GeniusPay pour la demande validée et l'envoie au
 * client (copie + ouverture WhatsApp pré-rempli).
 */
const generatePaymentLink = async () => {
  if (!request.value) return
  generatingLink.value = true
  const data = await createPaymentLink('personal_shopping', String(request.value.id))
  generatingLink.value = false
  if (!data) return
  await useSwal().paymentLink({ url: data.checkout_url, whatsappUrl: data.whatsapp_url })
}

const quotation = reactive({
  // Lignes « Personal Shopping » (Nadom achète pour le client)
  productCost: 0,
  inspectionFee: 5000,
  packagingFee: 3000,
  shippingCost: 0,
  // Lignes propres à l'envoi de colis (le client possède déjà sa marchandise)
  customsFee: 0,
  localDeliveryFee: 0,
})

// Un envoi de colis ne se chiffre pas comme un achat pour compte de tiers : pas de
// coût produit, pas d'inspection d'achat, pas de commission de 5 % sur l'achat.
const isPackageSending = computed(
  () => (request.value as any)?.requestType === 'package_sending',
)

// Transport estimé depuis la grille tarifaire (poids × tarif/kg, ou CBM × tarif/m³
// pour le maritime) de la destination et du mode choisis sur la demande.
const transportEstimate = computed(() => {
  const r: any = request.value
  if (!r) return null
  const mode = r.shippingMode
  const rate = Number(mode?.cost_per_kg ?? mode?.costPerKg)
  if (!rate || Number.isNaN(rate)) return null

  const isSea = (mode?.mode || '') === 'sea'
  const qty = isSea ? Number(r.cbm) : Number(r.declaredWeight)
  if (!qty || Number.isNaN(qty)) return null

  return {
    amount: Math.round(qty * rate * 100) / 100,
    qty,
    rate,
    unit: isSea ? 'm³' : 'kg',
  }
})

const applyTransportEstimate = () => {
  if (transportEstimate.value) quotation.shippingCost = transportEstimate.value.amount
}

const shipmentForm = reactive({
  shippingMode: 'air_normal' as any,
  weight: 1
})

const requestId = route.params.id as string

onMounted(async () => {
  // Récupération ciblée : chercher la demande dans la page de liste chargée
  // affichait « Demande non trouvée » dès qu'elle se trouvait sur une autre page,
  // qu'un filtre était actif, ou en accès direct à l'URL (rafraîchissement).
  await psStore.fetchRequestById(requestId)
  loading.value = false
})

const request = computed(() => psStore.getRequestById(requestId))

const requestCurrency = computed(() => {
  const c = (request.value as any)?.currency
  return (c || 'XOF').toString().toUpperCase()
})

const shippingModeLabel = (mode?: string) => {
  if (mode === 'air_express') return t('admin.shipments.airExpress')
  if (mode === 'sea') return t('admin.shipments.sea')
  return t('admin.shipments.airNormal')
}

/** Montant produit déduit de la demande : total des articles, ou budget estimé. */
const requestProductTotal = computed(() => {
  const items = request.value?.items
  if (Array.isArray(items) && items.length) {
    return items.reduce((sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)
  }
  return Number((request.value as any)?.budgetEstimated) || 0
})

const EDITABLE_QUOTATION_STATUSES: RequestStatus[] = ['pending', 'searching', 'negotiating']
const canEditQuotation = computed(() => {
  const status = request.value?.status as RequestStatus | undefined
  return !!status && EDITABLE_QUOTATION_STATUSES.includes(status)
})

// États finaux : statut verrouillé. « shipped »/« delivered » ne sont jamais
// modifiables à la main (pilotés par l'expédition).
const FINAL_STATUSES = ['delivered', 'cancelled']
const SHIPMENT_DRIVEN_STATUSES = ['shipped', 'delivered']
const isStatusLocked = computed(() =>
  FINAL_STATUSES.includes(String(request.value?.status))
)

const openQuotationForm = () => {
  const d = request.value?.quotedDetails
  if (d) {
    // Toutes les lignes sont restaurées, y compris celles propres à l'envoi de
    // colis : sans cela, rouvrir un devis existant remettrait silencieusement la
    // douane et la livraison locale à zéro.
    quotation.productCost = Number(d.productCost) || 0
    quotation.inspectionFee = Number(d.inspectionFee) || 0
    quotation.packagingFee = Number(d.packagingFee) || 0
    quotation.shippingCost = Number(d.shippingCost) || 0
    quotation.customsFee = Number(d.customsFee) || 0
    quotation.localDeliveryFee = Number(d.localDeliveryFee) || 0
  } else if (isPackageSending.value) {
    // Le client possède déjà sa marchandise : pas de coût produit ni d'inspection.
    // Le transport est pré-rempli depuis la grille tarifaire quand elle s'applique.
    quotation.productCost = 0
    quotation.inspectionFee = 0
    quotation.packagingFee = 3000
    quotation.shippingCost = transportEstimate.value?.amount ?? 0
    quotation.customsFee = 0
    quotation.localDeliveryFee = 0
  } else {
    // Pré-rempli avec le montant produit de la demande (reste modifiable).
    quotation.productCost = requestProductTotal.value
    quotation.inspectionFee = 5000
    quotation.packagingFee = 3000
    quotation.shippingCost = 0
    quotation.customsFee = 0
    quotation.localDeliveryFee = 0
  }
  showQuotationForm.value = true
}

const quotationTotal = computed(() => {
  if (isPackageSending.value) {
    // Transport + emballage/manutention + douane + livraison locale.
    return (
      (quotation.shippingCost || 0) +
      (quotation.packagingFee || 0) +
      (quotation.customsFee || 0) +
      (quotation.localDeliveryFee || 0)
    )
  }
  const subtotal = quotation.productCost + quotation.inspectionFee + quotation.packagingFee + quotation.shippingCost
  const serviceFee = quotation.productCost * 0.05
  return subtotal + serviceFee
})

const updateStatus = async (status: string) => {
  // Garde-fous : pas de retour sur un état final, pas de passage manuel à « expédié »/« livré ».
  if (status === request.value?.status) return
  if (isStatusLocked.value) {
    notifyError(t('admin.requests.detail.statusLocked'))
    return
  }
  if (SHIPMENT_DRIVEN_STATUSES.includes(status)) {
    notifyError(t('admin.requests.detail.statusShipmentDriven'))
    return
  }
  try {
    await psStore.updateRequestStatus(requestId, status as RequestStatus)
    success(t('admin.requests.detail.statusUpdated'))
  } catch (err) {
    notifyError(t('common.error'))
  }
}

const openShipmentModal = () => {
  showShipmentModal.value = true
}

const createShipment = async () => {
  if (!request.value) return
  
  creatingShipment.value = true
  try {
    const newShipment = await shippingStore.createShipment({
      userId: request.value.userId,
      requestId: request.value.id,
      destinationCountry: 'Côte d\'Ivoire', // Default
      destinationCity: 'Abidjan', // Default
      shippingMode: shipmentForm.shippingMode,
      weight: shipmentForm.weight,
      declaredValue: request.value.budgetEstimated,
      shippingCost: request.value.quotedDetails?.shippingCost || 0
    })
    
    success(t('admin.requests.detail.shipmentCreated'))
    showShipmentModal.value = false
    
    // Refresh to show new status
    await psStore.fetchRequestById(requestId)

    // Redirect to shipment. L'API renvoie `tracking_number` (snake_case) : lire
    // uniquement `trackingNumber` menait à /admin/shipments/undefined.
    const created: any = newShipment
    const ref = created?.tracking_number ?? created?.trackingNumber ?? created?.id
    if (ref) router.push(`/admin/shipments/${ref}`)
    else router.push('/admin/shipments')
  } catch (err) {
    notifyError(t('admin.requests.detail.shipmentCreateError'))
  } finally {
    creatingShipment.value = false
  }
}

const submitQuotation = async () => {
  const isUpdate = !!request.value?.quotedPrice
  let quotedDetails: Record<string, number>

  if (isPackageSending.value) {
    // Le transport est la seule ligne indispensable : sans lui, l'envoi n'est pas chiffré.
    if (!quotation.shippingCost || quotation.shippingCost <= 0) {
      notifyError(t('admin.requests.detail.transportRequired'))
      return
    }
    quotedDetails = {
      shippingCost: quotation.shippingCost,
      packagingFee: quotation.packagingFee || 0,
      customsFee: quotation.customsFee || 0,
      localDeliveryFee: quotation.localDeliveryFee || 0,
      totalPrice: quotationTotal.value,
    }
  } else {
    // Le coût produit est obligatoire (> 0) — sinon le devis partirait sans le produit,
    // et la commission (5 %) + le prix client seraient faussés.
    if (!quotation.productCost || quotation.productCost <= 0) {
      notifyError(
        requestProductTotal.value > 0
          ? `Le coût produit est requis (articles commandés : ${formatCurrency(requestProductTotal.value, requestCurrency.value)}).`
          : 'Le coût produit doit être supérieur à 0.'
      )
      return
    }
    quotedDetails = {
      productCost: quotation.productCost,
      serviceFee: quotation.productCost * 0.05,
      inspectionFee: quotation.inspectionFee,
      packagingFee: quotation.packagingFee,
      shippingCost: quotation.shippingCost,
      totalPrice: quotationTotal.value,
    }
  }

  try {
    await psStore.addQuotation(requestId, quotationTotal.value, quotedDetails)
    showQuotationForm.value = false
    success(isUpdate ? t('admin.requests.detail.quotationUpdated') : t('admin.requests.detail.quotationCreated'))
  } catch (err) {
    notifyError(t('common.error'))
  }
}

const clientFullName = computed(() => {
  const r = request.value as any
  if (!r) return ''
  const u = r.user
  if (u) {
    const name = [u.firstname, u.lastname].filter(Boolean).join(' ').trim()
    if (name) return name
  }
  return r.contactFullname || ''
})

const clientPhone = computed(() => {
  const r: any = request.value
  if (!r) return ''
  return r.user?.phone || r.contactNumber || r.contact_number || ''
})

/** URL publique du PDF de devis — accessible sans authentification (route publique). */
const quotationPdfUrl = computed(() => {
  if (!request.value?.quotedPrice) return null
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '').replace(/\/$/, '')
  return `${base}/personal-shopping-requests/${request.value.id}/pdf${pdfLangQuery()}`
})

/** Numero de suivi : colonne demande ou colis lie */
const requestTrackingNumber = computed(() => {
  const r = request.value as any
  if (!r) return null
  return (
    r.trackingNumber ||
    r.tracking_number ||
    r.shipment?.tracking_number ||
    r.shipment?.trackingNumber ||
    null
  )
})

/** Lien public vers la page suivi du site (meme origine que l'admin). */
const clientTrackingPageUrl = computed(() => {
  const tn = requestTrackingNumber.value
  if (!tn) return null
  if (typeof window === 'undefined' || !window.location?.origin) return null
  return `${window.location.origin}/import-export/tracking?tracking=${encodeURIComponent(String(tn))}`
})

const isConfirmed = computed(() => {
  const st = request.value?.status
  return ['confirmed', 'preparing', 'shipped', 'delivered'].includes(st || '')
})

const whatsappOptions = computed(() => {
  const r = request.value
  if (!r) {
    return {
      quotationUrl: null as string | null,
      totalLabel: null as string | null,
      confirmed: false,
      trackingNumber: null as string | null,
      trackingPageUrl: null as string | null,
    }
  }
  return {
    quotationUrl: r.quotedPrice ? quotationPdfUrl.value : null,
    totalLabel: r.quotedPrice ? formatCurrency(r.quotedPrice, requestCurrency.value) : null,
    confirmed: isConfirmed.value,
    trackingNumber: requestTrackingNumber.value,
    trackingPageUrl: clientTrackingPageUrl.value,
  }
})

const whatsappLinkForClient = computed(() => {
  if (!request.value) return '#'
  if (!clientPhone.value) return '#'
  const message = buildClientRequestMessage(
    request.value.title,
    request.value.id,
    whatsappOptions.value,
  )
  return generateLink(clientPhone.value, message)
})

const openWhatsApp = () => {
  if (!request.value) return
  contactClientForRequest(
    clientPhone.value,
    request.value.title,
    request.value.id,
    whatsappOptions.value,
  )
}

const downloadQuotationPdf = async () => {
  if (!request.value) return
  downloadingPdf.value = true
  try {
    const config = useRuntimeConfig()
    const token = getToken()
    const url = `${config.public.apiBase}/personal-shopping-requests/${request.value.id}/pdf${pdfLangQuery()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' } })
    if (!res.ok) throw new Error('Erreur PDF')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `devis-${request.value.id}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    notifyError(t('admin.requests.detail.pdfError'))
  } finally {
    downloadingPdf.value = false
  }
}

const deleteRequest = async () => {
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteRequest'))) return

  try {
    await psStore.deleteRequest(requestId)
    success(t('admin.requests.detail.requestDeleted'))
    router.push('/admin/requests')
  } catch (err) {
    notifyError(t('common.error'))
  }
}
</script>
<style scoped>
/* Chaque colis est une ligne à part entière : un trait franc les sépare, sinon
   deux colis successifs se lisent comme un seul bloc. */
.pkg-table > :not(caption) > * > * {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.pkg-table tbody tr + tr {
  border-top: 2px solid #dee2e6;
}

/* Les libellés du devis passent sur deux lignes quand ils sont longs
   (« Douane / dédouanement (XOF) ») : une hauteur minimale commune garde les
   champs de la rangée alignés entre eux. */
.quote-label {
  display: flex;
  align-items: flex-end;
  min-height: 3em;
  margin-bottom: 0.25rem;
}

/* Vignettes de photos (demande et colis) : cliquables, agrandies au survol.
   La taille reste portée par les attributs width/height de chaque image, pour
   que la même classe serve aux grandes vignettes comme aux petites. */
.pkg-thumb {
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.15s ease;
}
.pkg-thumb:hover {
  transform: scale(1.08);
}

/* Croix de suppression posée sur la vignette, en mode édition. */
.pkg-thumb-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  padding: 0;
  line-height: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.zoom-modal {
  position: fixed;
  inset: 0;
  z-index: 1080;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: zoom-out;
}
.zoom-content {
  position: relative;
  max-width: 92vw;
  max-height: 92vh;
  cursor: default;
}
.zoom-content img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 8px;
}
.zoom-close {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #212529;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.request-description :deep(img),
.request-description img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

.request-description {
  line-height: 1.6;
  /* Champ texte libre (pas de HTML) : preserve les retours a la ligne saisis. */
  white-space: pre-line;
}
</style>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="mb-1">Pages À propos &amp; Contact</h4>
        <p class="text-muted mb-0">
          Textes FR/EN, images de fond (upload + miniature). Enregistrez chaque page séparément.
        </p>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          role="tab"
          :class="{ active: tab === 'contact_us' }"
          @click="tab = 'contact_us'"
        >
          Contact
        </button>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          role="tab"
          :class="{ active: tab === 'about_us' }"
          @click="tab = 'about_us'"
        >
          À propos
        </button>
      </li>
    </ul>

    <!-- CONTACT -->
    <div v-show="tab === 'contact_us'" class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <ul class="nav nav-pills flex-wrap gap-1 mb-3 site-page-subnav" role="tablist">
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: contactSub === 'hero' }" @click="contactSub = 'hero'">Bandeau héros</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: contactSub === 'cards' }" @click="contactSub = 'cards'">Trois encarts</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: contactSub === 'form' }" @click="contactSub = 'form'">Formulaire &amp; carte</button>
          </li>
        </ul>

        <div v-show="contactSub === 'hero'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Bandeau héros</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Titre (FR)</label>
              <input v-model="c.hero.title.fr" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Title (EN)</label>
              <input v-model="c.hero.title.en" type="text" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Sous-titre (FR)</label>
              <textarea v-model="c.hero.subtitle.fr" rows="2" class="form-control"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label">Subtitle (EN)</label>
              <textarea v-model="c.hero.subtitle.en" rows="2" class="form-control"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label d-block">Image de fond</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="form-control mb-2"
                :disabled="uploadKey === 'c-hero'"
                @change="onUpload($event, 'contact_us', 'hero.background_path')"
              />
              <span v-if="uploadKey === 'c-hero'" class="spinner-border spinner-border-sm me-2"></span>
              <div v-if="c.hero.background_path" class="d-flex align-items-center gap-2 flex-wrap">
                <img
                  class="img-thumbnail"
                  style="max-height: 120px"
                  :src="resolveStorageAssetUrl(c.hero.background_path)"
                  alt=""
                />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="c.hero.background_path = null">
                  Retirer
                </button>
              </div>
              <small class="text-muted d-block mt-1">Dossier : site-static-pages (max ~2&nbsp;Mo, formats usuels).</small>
            </div>
          </div>
        </div>

        <div v-show="contactSub === 'cards'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Trois encarts sous le bandeau</h5>
          <div v-for="(card, idx) in c.cards" :key="idx" class="border rounded p-3 mb-3">
            <strong class="d-block mb-2">Carte {{ idx + 1 }}</strong>
            <div class="row g-2">
              <div class="col-md-12">
                <label class="form-label">Classe icône (Font Awesome)</label>
                <input v-model="card.icon" type="text" class="form-control" placeholder="fa-solid fa-briefcase" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Titre FR</label>
                <input v-model="card.title.fr" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Title EN</label>
                <input v-model="card.title.en" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Texte FR</label>
                <textarea v-model="card.body.fr" rows="3" class="form-control"></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label">Text EN</label>
                <textarea v-model="card.body.en" rows="3" class="form-control"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-show="contactSub === 'form'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Bloc formulaire &amp; carte</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Titre FR</label>
              <input v-model="c.form_block.title.fr" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Title EN</label>
              <input v-model="c.form_block.title.en" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Intro FR</label>
              <textarea v-model="c.form_block.intro.fr" rows="2" class="form-control"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Intro EN</label>
              <textarea v-model="c.form_block.intro.en" rows="2" class="form-control"></textarea>
            </div>
            <div class="col-12">
              <label class="form-label">URL iframe Google Maps (embed)</label>
              <input v-model="c.map_embed_url" type="url" class="form-control" />
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-top">
          <button
            v-can="['update', 'site-static-pages']"
            type="button"
            class="btn btn-primary d-inline-flex align-items-center gap-2"
            :disabled="savingContact"
            @click="saveContact"
          >
            <span v-if="savingContact" class="spinner-border spinner-border-sm"></span>
            Enregistrer la page Contact
          </button>
        </div>
      </div>
    </div>

    <!-- À PROPOS -->
    <div v-show="tab === 'about_us'" class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <ul class="nav nav-pills flex-wrap gap-1 mb-3 site-page-subnav" role="tablist">
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'hero' }" @click="aboutSub = 'hero'">Bandeau héros</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'mission_intro' }" @click="aboutSub = 'mission_intro'">Intro mission</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'mission' }" @click="aboutSub = 'mission'">Bloc mission</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'counters' }" @click="aboutSub = 'counters'">Compteurs</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'promo' }" @click="aboutSub = 'promo'">Bandeau promo</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'process' }" @click="aboutSub = 'process'">Processus</button>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :class="{ active: aboutSub === 'reviews_team' }" @click="aboutSub = 'reviews_team'">Avis &amp; équipe</button>
          </li>
        </ul>

        <div v-show="aboutSub === 'hero'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Bandeau héros</h5>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Titre FR</label><input v-model="a.hero.title.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Title EN</label><input v-model="a.hero.title.en" type="text" class="form-control" /></div>
            <div class="col-12"><label class="form-label">Sous-titre FR</label><textarea v-model="a.hero.subtitle.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-12"><label class="form-label">Subtitle EN</label><textarea v-model="a.hero.subtitle.en" rows="2" class="form-control"></textarea></div>
            <div class="col-12">
              <label class="form-label">Image de fond</label>
              <input type="file" accept="image/*" class="form-control mb-2" :disabled="uploadKey === 'a-hero'" @change="onUpload($event, 'about_us', 'hero.background_path')" />
              <span v-if="uploadKey === 'a-hero'" class="spinner-border spinner-border-sm me-2"></span>
              <div v-if="a.hero.background_path" class="d-flex align-items-center gap-2">
                <img class="img-thumbnail" style="max-height:120px" :src="resolveStorageAssetUrl(a.hero.background_path)" alt="" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="a.hero.background_path = null">Retirer</button>
              </div>
            </div>
          </div>
        </div>

        <div v-show="aboutSub === 'mission_intro'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Intro mission (titre section)</h5>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Titre FR</label><input v-model="a.mission_intro.heading.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Heading EN</label><input v-model="a.mission_intro.heading.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Accroche FR</label><textarea v-model="a.mission_intro.lead.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Lead EN</label><textarea v-model="a.mission_intro.lead.en" rows="2" class="form-control"></textarea></div>
          </div>
        </div>

        <div v-show="aboutSub === 'mission'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Bloc mission</h5>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Badge FR</label><input v-model="a.mission.badge.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Badge EN</label><input v-model="a.mission.badge.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Titre FR</label><input v-model="a.mission.title.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Title EN</label><input v-model="a.mission.title.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Texte FR</label><textarea v-model="a.mission.body_fr" rows="5" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Text EN</label><textarea v-model="a.mission.body_en" rows="5" class="form-control"></textarea></div>
            <div class="col-12">
              <label class="form-label">Image illustrative</label>
              <input type="file" accept="image/*" class="form-control mb-2" :disabled="uploadKey === 'a-mission'" @change="onUpload($event, 'about_us', 'mission.image_path')" />
              <span v-if="uploadKey === 'a-mission'" class="spinner-border spinner-border-sm"></span>
              <div v-if="a.mission.image_path" class="d-flex align-items-center gap-2">
                <img class="img-thumbnail" style="max-height:140px" :src="resolveStorageAssetUrl(a.mission.image_path)" alt="" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="a.mission.image_path = null">Retirer</button>
              </div>
            </div>
            <div class="col-md-6"><label class="form-label">Bouton FR</label><input v-model="a.mission.cta_label.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Button EN</label><input v-model="a.mission.cta_label.en" type="text" class="form-control" /></div>
            <div class="col-12"><label class="form-label">Lien du bouton</label><input v-model="a.mission.cta_href" type="text" class="form-control" placeholder="/contact-us" /></div>
          </div>
        </div>

        <div v-show="aboutSub === 'counters'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Compteurs</h5>
          <div v-for="(ctr, idx) in a.counters" :key="idx" class="row g-2 mb-3 border-bottom pb-2">
            <div class="col-md-3"><label class="form-label">Valeur</label><input v-model.number="ctr.value" type="number" min="0" step="1" class="form-control" /></div>
            <div class="col-md-3"><label class="form-label">Suffixe</label><input v-model="ctr.suffix" type="text" class="form-control" placeholder="K ou vide" /></div>
            <div class="col-md-6"><label class="form-label">Libellé FR</label><input v-model="ctr.label.fr" type="text" class="form-control" /></div>
            <div class="col-12"><label class="form-label">Label EN</label><input v-model="ctr.label.en" type="text" class="form-control" /></div>
          </div>
        </div>

        <div v-show="aboutSub === 'promo'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Bandeau promotion (pleine largeur)</h5>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Image de fond</label>
              <input type="file" accept="image/*" class="form-control mb-2" :disabled="uploadKey === 'a-promo'" @change="onUpload($event, 'about_us', 'promo_banner.background_path')" />
              <span v-if="uploadKey === 'a-promo'" class="spinner-border spinner-border-sm"></span>
              <div v-if="a.promo_banner.background_path" class="d-flex align-items-center gap-2">
                <img class="img-thumbnail" style="max-height:120px" :src="resolveStorageAssetUrl(a.promo_banner.background_path)" alt="" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="a.promo_banner.background_path = null">Retirer</button>
              </div>
            </div>
            <div class="col-md-6"><label class="form-label">Badge FR</label><input v-model="a.promo_banner.badge.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Badge EN</label><input v-model="a.promo_banner.badge.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Titre FR</label><input v-model="a.promo_banner.headline.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Headline EN</label><input v-model="a.promo_banner.headline.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Sous-titre FR</label><textarea v-model="a.promo_banner.subheadline.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Sub EN</label><textarea v-model="a.promo_banner.subheadline.en" rows="2" class="form-control"></textarea></div>
          </div>
        </div>

        <div v-show="aboutSub === 'process'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Processus (3 colonnes)</h5>
          <div class="row g-3 mb-2">
            <div class="col-md-6"><label class="form-label">Titre section FR</label><input v-model="a.process_section.heading.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Heading EN</label><input v-model="a.process_section.heading.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Intro FR</label><textarea v-model="a.process_section.intro.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Intro EN</label><textarea v-model="a.process_section.intro.en" rows="2" class="form-control"></textarea></div>
          </div>
          <div v-for="(pi, ix) in a.process_section.items" :key="ix" class="border rounded p-3 mb-2">
            <strong>Étape {{ ix + 1 }}</strong>
            <div class="row g-2 mt-1">
              <div class="col-md-12"><label class="form-label">Icône Bootstrap</label><input v-model="pi.icon" type="text" class="form-control" placeholder="bi bi-pin-map-fill" /></div>
              <div class="col-md-6"><label class="form-label">Titre FR</label><input v-model="pi.title.fr" type="text" class="form-control" /></div>
              <div class="col-md-6"><label class="form-label">Title EN</label><input v-model="pi.title.en" type="text" class="form-control" /></div>
              <div class="col-md-6"><label class="form-label">Desc FR</label><textarea v-model="pi.description.fr" rows="2" class="form-control"></textarea></div>
              <div class="col-md-6"><label class="form-label">Desc EN</label><textarea v-model="pi.description.en" rows="2" class="form-control"></textarea></div>
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-md-6"><label class="form-label">Bouton bas FR</label><input v-model="a.process_section.bottom_cta.label.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Bottom EN</label><input v-model="a.process_section.bottom_cta.label.en" type="text" class="form-control" /></div>
            <div class="col-12"><label class="form-label">Lien bouton bas</label><input v-model="a.process_section.bottom_cta.href" type="text" class="form-control" /></div>
          </div>
        </div>

        <div v-show="aboutSub === 'reviews_team'" class="pt-1">
          <h5 class="mb-3 text-muted small text-uppercase">Titres sections Avis / Équipe</h5>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Avis titre FR</label><input v-model="a.reviews_section.heading.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Reviews EN</label><input v-model="a.reviews_section.heading.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Avis intro FR</label><textarea v-model="a.reviews_section.intro.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Reviews intro EN</label><textarea v-model="a.reviews_section.intro.en" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Équipe titre FR</label><input v-model="a.team_section.heading.fr" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Team EN</label><input v-model="a.team_section.heading.en" type="text" class="form-control" /></div>
            <div class="col-md-6"><label class="form-label">Équipe intro FR</label><textarea v-model="a.team_section.intro.fr" rows="2" class="form-control"></textarea></div>
            <div class="col-md-6"><label class="form-label">Team intro EN</label><textarea v-model="a.team_section.intro.en" rows="2" class="form-control"></textarea></div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-top">
          <button
            v-can="['update', 'site-static-pages']"
            type="button"
            class="btn btn-primary d-inline-flex align-items-center gap-2"
            :disabled="savingAbout"
            @click="saveAbout"
          >
            <span v-if="savingAbout" class="spinner-border spinner-border-sm"></span>
            Enregistrer la page À propos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useSiteStaticPagesStore } from '~/stores/siteStaticPages'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'
import { resolveStorageAssetUrl } from '~/composables/useStorageAssetUrl'

definePageMeta({ layout: 'admin' })

const store = useSiteStaticPagesStore()
const { success, error } = useNotification()
const api = useApi()

const tab = ref<'contact_us' | 'about_us'>('contact_us')
const contactSub = ref<'hero' | 'cards' | 'form'>('hero')
const aboutSub = ref<'hero' | 'mission_intro' | 'mission' | 'counters' | 'promo' | 'process' | 'reviews_team'>('hero')
const savingContact = ref(false)
const savingAbout = ref(false)
const uploadKey = ref<string>('')

watch(tab, (v) => {
  if (v === 'contact_us') contactSub.value = 'hero'
  else aboutSub.value = 'hero'
})

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function loc(obj: Record<string, string | undefined>): { fr: string; en: string } {
  return { fr: String(obj?.fr ?? ''), en: String(obj?.en ?? '') }
}

function normalizeContact(raw: Record<string, unknown>) {
  const o = raw && typeof raw === 'object' ? deepClone(raw) : {}
  ;(o as any).hero = (o as any).hero || {}
  ;(o as any).hero.title = loc((o as any).hero.title || {})
  ;(o as any).hero.subtitle = loc((o as any).hero.subtitle || {})
  if ((o as any).hero.background_path === undefined) (o as any).hero.background_path = null
  const cards = Array.isArray((o as any).cards) ? (o as any).cards : []
  while (cards.length < 3) {
    cards.push({ icon: '', title: loc({}), body: loc({}) })
  }
  ;(o as any).cards = cards.slice(0, 3).map((c: any) => ({
    icon: String(c?.icon ?? ''),
    title: loc(c?.title || {}),
    body: loc(c?.body || {})
  }))
  ;(o as any).form_block = (o as any).form_block || {}
  ;(o as any).form_block.title = loc((o as any).form_block.title || {})
  ;(o as any).form_block.intro = loc((o as any).form_block.intro || {})
  ;(o as any).map_embed_url = String((o as any).map_embed_url ?? '')
  return o as ContactShape
}

function normalizeAbout(raw: Record<string, unknown>) {
  const o = raw && typeof raw === 'object' ? deepClone(raw) : {}
  const bcDef = [
    [{ label: 'Accueil', href: '/' }, { label: 'Pages', href: null }, { label: 'À propos', href: null }],
    [{ label: 'Home', href: '/' }, { label: 'Pages', href: null }, { label: 'About Us', href: null }]
  ]
  ;(o as any).hero = (o as any).hero || {}
  ;(o as any).hero.title = loc((o as any).hero.title || {})
  ;(o as any).hero.subtitle = loc((o as any).hero.subtitle || {})
  if ((o as any).hero.background_path === undefined) (o as any).hero.background_path = null
  ;(o as any).breadcrumbs = (o as any).breadcrumbs || { fr: bcDef[0], en: bcDef[1] }
  ;(o as any).mission_intro = (o as any).mission_intro || {}
  ;(o as any).mission_intro.heading = loc((o as any).mission_intro.heading || {})
  ;(o as any).mission_intro.lead = loc((o as any).mission_intro.lead || {})
  ;(o as any).mission = (o as any).mission || {}
  ;(o as any).mission.badge = loc((o as any).mission.badge || {})
  ;(o as any).mission.title = loc((o as any).mission.title || {})
  ;(o as any).mission.body_fr = String((o as any).mission.body_fr ?? '')
  ;(o as any).mission.body_en = String((o as any).mission.body_en ?? '')
  if ((o as any).mission.image_path === undefined) (o as any).mission.image_path = null
  ;(o as any).mission.cta_label = loc((o as any).mission.cta_label || {})
  ;(o as any).mission.cta_href = String((o as any).mission.cta_href ?? '/contact-us')
  let counters = Array.isArray((o as any).counters) ? (o as any).counters : []
  while (counters.length < 4) counters.push({ value: 0, suffix: '', label: loc({}) })
  ;(o as any).counters = counters.slice(0, 4).map((c: any) => ({
    value: Number(c?.value ?? 0),
    suffix: String(c?.suffix ?? ''),
    label: loc(c?.label || {})
  }))
  ;(o as any).promo_banner = (o as any).promo_banner || {}
  ;(o as any).promo_banner.badge = loc((o as any).promo_banner.badge || {})
  ;(o as any).promo_banner.headline = loc((o as any).promo_banner.headline || {})
  ;(o as any).promo_banner.subheadline = loc((o as any).promo_banner.subheadline || {})
  if ((o as any).promo_banner.background_path === undefined) (o as any).promo_banner.background_path = null
  ;(o as any).process_section = (o as any).process_section || {}
  ;(o as any).process_section.heading = loc((o as any).process_section.heading || {})
  ;(o as any).process_section.intro = loc((o as any).process_section.intro || {})
  let items = Array.isArray((o as any).process_section.items) ? (o as any).process_section.items : []
  while (items.length < 3) items.push({ icon: '', title: loc({}), description: loc({}) })
  ;(o as any).process_section.items = items.slice(0, 3).map((p: any) => ({
    icon: String(p?.icon ?? ''),
    title: loc(p?.title || {}),
    description: loc(p?.description || {})
  }))
  ;(o as any).process_section.bottom_cta = (o as any).process_section.bottom_cta || {}
  ;(o as any).process_section.bottom_cta.label = loc((o as any).process_section.bottom_cta.label || {})
  ;(o as any).process_section.bottom_cta.href = String((o as any).process_section.bottom_cta.href ?? '/contact-us')
  ;(o as any).reviews_section = (o as any).reviews_section || {}
  ;(o as any).reviews_section.heading = loc((o as any).reviews_section.heading || {})
  ;(o as any).reviews_section.intro = loc((o as any).reviews_section.intro || {})
  ;(o as any).team_section = (o as any).team_section || {}
  ;(o as any).team_section.heading = loc((o as any).team_section.heading || {})
  ;(o as any).team_section.intro = loc((o as any).team_section.intro || {})
  return o as AboutShape
}

type Loc = { fr: string; en: string }

interface ContactShape {
  hero: { title: Loc; subtitle: Loc; background_path: string | null }
  cards: Array<{ icon: string; title: Loc; body: Loc }>
  form_block: { title: Loc; intro: Loc }
  map_embed_url: string
}

interface AboutShape {
  hero: { title: Loc; subtitle: Loc; background_path: string | null }
  breadcrumbs: Record<string, Array<{ label: string; href: string | null }>>
  mission_intro: { heading: Loc; lead: Loc }
  mission: {
    badge: Loc
    title: Loc
    body_fr: string
    body_en: string
    image_path: string | null
    cta_label: Loc
    cta_href: string
  }
  counters: Array<{ value: number; suffix: string; label: Loc }>
  promo_banner: {
    background_path: string | null
    badge: Loc
    headline: Loc
    subheadline: Loc
  }
  process_section: {
    heading: Loc
    intro: Loc
    items: Array<{ icon: string; title: Loc; description: Loc }>
    bottom_cta: { label: Loc; href: string }
  }
  reviews_section: { heading: Loc; intro: Loc }
  team_section: { heading: Loc; intro: Loc }
}

const c = reactive<ContactShape>(
  normalizeContact({}) as unknown as Record<string, unknown>
)

const a = reactive<AboutShape>(
  normalizeAbout({}) as unknown as Record<string, unknown>
)

async function hydrate() {
  await store.fetchAdminBundle()
  Object.assign(c, normalizeContact((store.adminPages.contact_us ?? {}) as Record<string, unknown>))
  Object.assign(a, normalizeAbout((store.adminPages.about_us ?? {}) as Record<string, unknown>))
}

onMounted(() => {
  hydrate()
})

async function saveContact() {
  savingContact.value = true
  try {
    await store.savePage('contact_us', JSON.parse(JSON.stringify(c)))
    await hydrate()
    success('Page Contact enregistrée.')
  } catch (e: any) {
    error(e?.message || 'Erreur')
  } finally {
    savingContact.value = false
  }
}

async function saveAbout() {
  savingAbout.value = true
  try {
    await store.savePage('about_us', JSON.parse(JSON.stringify(a)))
    await hydrate()
    success('Page À propos enregistrée.')
  } catch (e: any) {
    error(e?.message || 'Erreur')
  } finally {
    savingAbout.value = false
  }
}

async function onUpload(ev: Event, pageMode: string, dotted: string) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  let key = pageMode === 'contact_us' ? 'c-' : 'a-'
  key += dotted.includes('promo') ? 'promo' : dotted.includes('mission.image') ? 'mission' : 'hero'
  uploadKey.value = key
  const fd = new FormData()
  fd.append('image', file)
  fd.append('folder', 'site-static-pages')
  try {
    const res = await api.post<{ path?: string } & { url?: string }>('/upload/image', fd as any)
    const path =
      typeof res.data === 'object' && res.data !== null ? (res.data as any).path : undefined
    if (!res.success || !path) throw new Error((res.message as string) || 'Échec upload')
    const p = dotted.split('.')
    if (pageMode === 'contact_us') {
      if (p[0] === 'hero') (c as any).hero.background_path = path
    } else {
      if (p[0] === 'hero') a.hero.background_path = path
      if (p[0] === 'mission') a.mission.image_path = path
      if (p[0] === 'promo_banner') a.promo_banner.background_path = path
    }
    success('Image enregistrée sur le serveur.')
  } catch (e: any) {
    error(e?.message || 'Upload impossible')
  } finally {
    uploadKey.value = ''
    input.value = ''
  }
}
</script>

<style scoped>
.site-page-subnav .nav-link {
  border-radius: 999px;
  font-size: 0.875rem;
  padding: 0.4rem 0.9rem;
  color: var(--bs-secondary);
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
}
.site-page-subnav .nav-link:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}
.site-page-subnav .nav-link.active {
  color: #fff;
  background: var(--bs-primary);
  border-color: var(--bs-primary);
}
</style>

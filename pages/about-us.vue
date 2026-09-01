<template>
  <div>
    <ClientOnly>
      <NavbarDark />
    </ClientOnly>

    <section
      class="bg-cover position-relative"
      :style="{ backgroundImage: `url(${heroBg})`, backgroundRepeat: 'no-repeat' }"
      data-overlay="6"
    >
      <div class="container">
        <div class="row justify-content-center align-items-center">
          <div class="col-xl-7 col-lg-9 col-md-12 col-sm-12">
            <div class="position-relative text-center mb-5 pt-lg-0 pt-5">
              <h1 class="text-light xl-heading">{{ heroTitle }}</h1>
              <p v-if="heroLead" class="text-light opacity-90 mb-3">{{ heroLead }}</p>
              <nav id="breadcrumbs" class="breadcrumbs light">
                <ul>
                  <li v-for="(bc, bi) in breadcrumbs" :key="'bc-' + bi">
                    <NuxtLink v-if="bc.href" :to="bc.href">{{ bc.label }}</NuxtLink>
                    <span v-else>{{ bc.label }}</span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-5">
      <div class="container">
        <div class="row">
          <div class="row justify-content-center align-items-center">
            <div class="col-xl-10 col-lg-11 col-md-12 col-sm-12">
              <div class="secHeading-wrap text-center">
                <h3 class="sectionHeading">{{ missionIntroHeading }}</h3>                <p>{{ missionIntroLead }}</p>
              </div>
            </div>
          </div>
          <div class="row justify-content-between align-items-center g-4 mb-5">
            <div class="col-xl-5 col-lg-5 col-md-6 col-sm-12">
              <div class="missionImg">
                <img :src="missionImg" class="img-fluid" alt="" />
              </div>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
              <div class="missioncaps">
                <div class="d-block mb-4">
                  <div class="d-flex align-items-start mb-2">
                    <span class="badge badge-xs badge-success rounded-pill">{{ missionBadge }}</span>
                  </div>
                  <h2>{{ missionTitle }}</h2>
                </div>
                <p v-for="(para, pi) in missionParagraphs" :key="'mp-' + pi">{{ para }}</p>
                <div class="d-flex align-items-start mt-4">
                  <NuxtLink :to="missionCtaHref" class="btn btn-light-primary rounded-pill px-5">{{ missionCtaLabel }}</NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-content-between align-items-center g-4 border-top pt-5">
            <div
              v-for="(cnt, ci) in counters"
              :key="'cnt-' + ci"
              class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6"
            >
              <div class="counter-wrap text-center">
                <h2 class="mb-0">
                  <count-up class="ctr text-primary me-1 d-inline" :end-val="Number(cnt.value ?? 0)">
                    {{ Number(cnt.value ?? 0) }}
                  </count-up>
                  <span v-if="cnt.suffix" class="text-primary">{{ cnt.suffix }}</span>
                </h2>
                <p class="m-0">{{ cnt.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="bg-cover"
      :style="{ backgroundImage: `url(${promoBg})`, backgroundColor: '#ffffff', backgroundRepeat: 'no-repeat' }"
      data-overlay="5"
    >
      <div class="container">
        <div class="row">
          <div class="row justify-content-center align-items-center mb-5">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div class="position-relative text-center py-5">
                <div class="promoTitle d-flex align-items-center justify-content-center">
                  <span class="badge badge-xs badge-transparent rounded-pill">{{ promoBadge }}</span>
                </div>
                <div class="promoHeading mb-5 mt-4">
                  <h2 class="text-light">{{ promoHead }}</h2>
                  <h3 class="text-light">{{ promoSub }}</h3>
                </div>
                <div class="promoButtons">
                  <button type="button" class="btn btn-whites fw-medium rounded-pill px-4">
                    <i class="bi bi-play-circle-fill me-2"></i>
                    {{ t('about.watchPromo') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="row justify-content-center align-items-center">
          <div class="col-xl-10 col-lg-11 col-md-12 col-sm-12">
            <div class="secHeading-wrap text-center">
              <h3 class="sectionHeading">{{ processHeading }}</h3>
              <p>{{ processIntro }}</p>
            </div>
          </div>
        </div>

        <div class="row justify-content-center g-md-5 g-4">
          <div v-for="(item, idx) in processItems" :key="'pr-' + idx" class="col-xl-4 col-lg-4 col-md-6">
            <div class="processWrap px-xl-4">
              <div class="text-center">
                <div class="processIcons d-block">
                  <div class="Icons">
                    <i :class="item.icon"></i>
                  </div>
                </div>
                <div class="processCaps">
                  <h4 class="fw-medium">{{ item.title }}</h4>
                  <p class="m-0">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-12 col-lg-12 col-md-12">
            <div class="d-flex align-items-center justify-content-center mt-4">
              <NuxtLink :to="processBtnHref" class="btn btn-light-primary rounded-pill px-5">
                {{ processBtnLabel }}<i class="bi bi-caret-right ms-2"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-light">
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-xl-7 col-lg-8 col-md-11 col-sm-12">
            <div class="secHeading-wrap text-center">
              <h3 class="sectionHeading">{{ reviewsHeading }}</h3>
              <p>{{ reviewsIntro }}</p>
            </div>
          </div>
        </div>
        <ClientOne />
      </div>
    </section>

    <section>
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-xl-7 col-lg-8 col-md-11 col-sm-12">
            <div class="secHeading-wrap text-center">
              <h3 class="sectionHeading">{{ teamHeading }}</h3>
              <p>{{ teamIntro }}</p>
            </div>
          </div>
        </div>
        <TeamOne />
      </div>
    </section>

    <FooterTop />
    <FooterOne />
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import fallbackHero from '@/assets/img/title-banner.jpg'
import fallbackMission from '@/assets/img/side-img.png'
import fallbackPromo from '@/assets/img/banner-2.jpg'
import CountUp from 'vue-countup-v3'
import { computed, onMounted } from 'vue'
import { useSiteStaticPagesStore } from '~/stores/siteStaticPages'
import { resolveStorageAssetUrl } from '~/composables/useStorageAssetUrl'

const { locale, t } = useI18n()

useSeoMeta({
  title: () => t('seo.aboutUs.title'),
  description: () => t('seo.aboutUs.description'),
  ogTitle: () => t('seo.aboutUs.title'),
  ogDescription: () => t('seo.aboutUs.description'),
})
const store = useSiteStaticPagesStore()

onMounted(() => {
  store.fetchPublic().catch(() => {})
})

const payload = computed(() => store.aboutPayload as Record<string, any>)

function loc(
  obj?: { fr?: string | null; en?: string | null; zh?: string | null },
  zhFallback = ''
): string {
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

function paragraphsFrom(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const heroBg = computed(() => {
  const p = payload.value.hero?.background_path
  const u = p ? resolveStorageAssetUrl(String(p)) : ''
  return u || fallbackHero
})

const heroTitle = computed(() => loc(payload.value.hero?.title, '关于 NADOM'))
const heroLead = computed(() => loc(payload.value.hero?.subtitle, '中国进出口、代购与物流解决方案。'))

const breadcrumbs = computed(() => {
  const bc = payload.value.breadcrumbs || {}
  const current = String(locale.value || '')
  const key = current.startsWith('zh') ? 'zh' : (current.startsWith('en') ? 'en' : 'fr')
  const list = bc[key]
  if (Array.isArray(list) && list.length) return list
  if (current.startsWith('zh')) {
    return [
      { label: '首页', href: '/' },
      { label: '页面', href: null },
      { label: '关于我们', href: null }
    ]
  }
  return bc.zh || bc.fr || bc.en || []
})

const missionIntroHeading = computed(() => loc(payload.value.mission_intro?.heading, '我们的使命'))

const missionIntroLead = computed(() => loc(payload.value.mission_intro?.lead, '我们为您提供从采购到交付的一站式支持。'))

const missionImg = computed(() => {
  const p = payload.value.mission?.image_path
  const u = p ? resolveStorageAssetUrl(String(p)) : ''
  return u || fallbackMission
})

const missionBadge = computed(() => loc(payload.value.mission?.badge, '我们的使命'))
const missionTitle = computed(() => loc(payload.value.mission?.title, '我们的定位'))
const missionParagraphs = computed(() => {
  const frBody = payload.value.mission?.body_fr
  const enBody = payload.value.mission?.body_en
  const zhBody = payload.value.mission?.body_zh
  const current = String(locale.value || '')
  const raw = String(
    current.startsWith('zh')
      ? (zhBody ?? enBody ?? frBody)
      : current.startsWith('en')
        ? (enBody ?? frBody ?? zhBody)
        : (frBody ?? enBody ?? zhBody)
      ?? ''
  )
  const pars = paragraphsFrom(raw)
  return pars.length ? pars : []
})

const missionCtaLabel = computed(() => loc(payload.value.mission?.cta_label, '联系我们'))
const missionCtaHref = computed(() => String(payload.value.mission?.cta_href || '/contact-us'))

const counters = computed(() => {
  const arr = Array.isArray(payload.value.counters) ? payload.value.counters : []
  return arr.map((c: any) => ({
    value: Number(c?.value ?? 0),
    suffix: String(c?.suffix ?? ''),
    label: loc(c?.label)
  }))
})

const promoBg = computed(() => {
  const p = payload.value.promo_banner?.background_path
  const u = p ? resolveStorageAssetUrl(String(p)) : ''
  return u || fallbackPromo
})

const promoBadge = computed(() => loc(payload.value.promo_banner?.badge, 'NADOM'))
const promoHead = computed(() => loc(payload.value.promo_banner?.headline, '让您的中非贸易更简单'))
const promoSub = computed(() => loc(payload.value.promo_banner?.subheadline, '专业团队，透明流程，可靠交付'))

const processHeading = computed(() => loc(payload.value.process_section?.heading, '我们的流程'))
const processIntro = computed(() => loc(payload.value.process_section?.intro, '清晰步骤，快速执行。'))

const processItems = computed(() => {
  const items = Array.isArray(payload.value.process_section?.items) ? payload.value.process_section.items : []
  return items.map((item: any) => ({
    icon: String(item?.icon ?? 'bi bi-circle'),
    title: loc(item?.title),
    desc: loc(item?.description)
  }))
})

const processBtnLabel = computed(() => loc(payload.value.process_section?.bottom_cta?.label, '开始您的项目'))
const processBtnHref = computed(() => String(payload.value.process_section?.bottom_cta?.href || '/contact-us'))

const reviewsHeading = computed(() => loc(payload.value.reviews_section?.heading, '客户评价'))
const reviewsIntro = computed(() => loc(payload.value.reviews_section?.intro, '客户对我们的信任是我们前进的动力。'))
const teamHeading = computed(() => loc(payload.value.team_section?.heading, '我们的团队'))
const teamIntro = computed(() => loc(payload.value.team_section?.intro, '在每一步为您提供专业支持。'))
</script>

<template>
  <div class="main-wrapper">
    <!-- Header Navigation -->
    <header class="header-listinghub" :class="{ 'header-scrolled': isScrolled }">
      <div class="container">
        <nav class="navbar-listinghub">
          <!-- Logo -->
          <NuxtLink class="navbar-brand" to="/">
            <img :src="config.public.logo" :alt="config.public.siteName" class="brand-logo" />
          </NuxtLink>

          <!-- Mobile Toggle -->
          <button class="navbar-toggler d-lg-none" @click="toggleMenu = !toggleMenu">
            <i class="bi bi-list"></i>
          </button>

          <!-- Mobile Actions -->
          <div class="mobile-actions d-lg-none">
            <NuxtLink v-if="!isAuthenticated" to="/login" class="mobile-action-btn">
              <i class="bi bi-person-circle"></i>
            </NuxtLink>
            <NuxtLink v-else to="/dashboard" class="mobile-action-btn">
              <i class="bi bi-person-circle"></i>
            </NuxtLink>
          </div>

          <!-- Main Navigation -->
          <div class="lh-collapse" :class="{ show: toggleMenu }">
            <span class="lh-close d-lg-none" @click="toggleMenu = false">&times;</span>

            <ul class="lh-nav">
              <!-- Accueil -->
              <li class="lh-nav-item" :class="{ active: isActive('/') }">
                <NuxtLink class="lh-link" to="/">{{ t('nav.home') }}</NuxtLink>
              </li>

              <!-- Personal Shopping -->
              <li class="lh-nav-item lh-dropdown" :class="{ active: isActive('/personal-shopping') }">
                <a class="lh-link" href="#" @click.prevent="toggleDropdown('personal')">
                  {{ t('nav.personalShopping') }}
                  <i class="bi bi-chevron-down"></i>
                </a>
                <ul class="lh-dropdown-menu" :class="{ show: activeDropdown === 'personal' }">
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/personal-shopping">
                      <i class="bi bi-info-circle me-2"></i>
                      {{ locale === 'fr' ? 'Comment ca marche' : 'How it works' }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/personal-shopping/new">
                      <i class="bi bi-plus-circle me-2"></i>
                      {{ t('personalShopping.newRequest') }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>

              <!-- Import-Export -->
              <li class="lh-nav-item lh-dropdown" :class="{ active: isActive('/import-export') }">
                <a class="lh-link" href="#" @click.prevent="toggleDropdown('import')">
                  {{ t('nav.importExport') }}
                  <i class="bi bi-chevron-down"></i>
                </a>
                <ul class="lh-dropdown-menu" :class="{ show: activeDropdown === 'import' }">
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/import-export">
                      <i class="bi bi-box-seam me-2"></i>
                      {{ locale === 'fr' ? 'Nos services' : 'Our services' }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/import-export/calculator">
                      <i class="bi bi-calculator me-2"></i>
                      {{ t('nav.calculator') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/import-export/tracking">
                      <i class="bi bi-truck me-2"></i>
                      {{ t('nav.tracking') }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>

              <!-- Resources -->
              <li class="lh-nav-item lh-dropdown" :class="{ active: isActive('/resources') }">
                <a class="lh-link" href="#" @click.prevent="toggleDropdown('resources')">
                  {{ t('nav.resources') }}
                  <i class="bi bi-chevron-down"></i>
                </a>
                <ul class="lh-dropdown-menu" :class="{ show: activeDropdown === 'resources' }">
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/resources/pricing">
                      <i class="bi bi-tag me-2"></i>
                      {{ t('nav.pricing') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/visa">
                      <i class="bi bi-passport me-2"></i>
                      {{ t('nav.visa') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/guide">
                      <i class="bi bi-map me-2"></i>
                      {{ t('nav.guide') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/resources/blog">
                      <i class="bi bi-journal-text me-2"></i>
                      {{ t('nav.blog') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/faq">
                      <i class="bi bi-question-circle me-2"></i>
                      {{ t('nav.faq') }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>

              <!-- Pages -->
              <li class="lh-nav-item lh-dropdown">
                <a class="lh-link" href="#" @click.prevent="toggleDropdown('pages')">
                  Pages
                  <i class="bi bi-chevron-down"></i>
                </a>
                <ul class="lh-dropdown-menu" :class="{ show: activeDropdown === 'pages' }">
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/about-us">
                      <i class="bi bi-building me-2"></i>
                      {{ locale === 'fr' ? 'A propos' : 'About us' }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="lh-dropdown-item" to="/contact-us">
                      <i class="bi bi-envelope me-2"></i>
                      Contact
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>

            <!-- Right Side -->
            <ul class="lh-nav lh-nav-right">
              <!-- Language Switcher -->
              <li class="lh-nav-item lh-dropdown d-none d-lg-block">
                <a class="lh-link" href="#" @click.prevent="toggleDropdown('lang')">
                  <span :class="['fi', currentFlag, 'me-1']"></span>
                  {{ currentLang }}
                  <i class="bi bi-chevron-down"></i>
                </a>
                <ul class="lh-dropdown-menu lh-dropdown-end" :class="{ show: activeDropdown === 'lang' }">
                  <li>
                    <a class="lh-dropdown-item" href="#" @click.prevent="switchLanguage('fr')">
                      <span class="fi fi-fr me-1"></span> Francais
                    </a>
                  </li>
                  <li>
                    <a class="lh-dropdown-item" href="#" @click.prevent="switchLanguage('en')">
                      <span class="fi fi-gb me-1"></span> English
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>

    <!-- Spacer for fixed header -->
    <div v-if="isScrolled" class="header-spacer"></div>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer skin-dark-footer">
      <div class="container">
        <div class="row">
          <!-- Logo & Description -->
          <div class="col-lg-4 col-md-6">
            <div class="footer-widget pe-xl-4 mb-5">
              <NuxtLink to="/" class="footerLogo mb-3 d-inline-block">
                <img :src="config.public.logo" class="img-fluid" :alt="config.public.siteName" />
              </NuxtLink>
              <p class="text-white opacity-75 mb-4">
                {{ t('footer.aboutText') }}
              </p>
              <div class="footerSocialwrap">
                <ul class="footersocial d-flex gap-2">
                  <li><a href="#" class="social-link text-white"><i class="bi bi-facebook"></i></a></li>
                  <li><a href="#" class="social-link text-white"><i class="bi bi-instagram"></i></a></li>
                  <li><a href="#" class="social-link text-white"><i class="bi bi-whatsapp"></i></a></li>
                  <li><a href="#" class="social-link text-white"><i class="bi bi-youtube"></i></a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Services -->
          <div class="col-lg-2 col-md-6">
            <div class="footer-widget mb-5">
              <h4 class="widget-title text-white">{{ t('footer.services') }}</h4>
              <ul class="footer-menu">
                <li><NuxtLink to="/personal-shopping" class="text-white opacity-75">{{ t('nav.personalShopping') }}</NuxtLink></li>
                <li><NuxtLink to="/import-export" class="text-white opacity-75">{{ t('nav.importExport') }}</NuxtLink></li>
                <li><NuxtLink to="/visa" class="text-white opacity-75">{{ t('nav.visa') }}</NuxtLink></li>
                <li><NuxtLink to="/guide" class="text-white opacity-75">{{ t('nav.guide') }}</NuxtLink></li>
              </ul>
            </div>
          </div>

          <!-- Liens Utiles -->
          <div class="col-lg-2 col-md-6">
            <div class="footer-widget mb-5">
              <h4 class="widget-title text-white">{{ t('footer.quickLinks') }}</h4>
              <ul class="footer-menu">
                <li><NuxtLink to="/faq" class="text-white opacity-75">{{ t('nav.faq') }}</NuxtLink></li>
                <li><NuxtLink to="/resources/blog" class="text-white opacity-75">{{ t('nav.blog') }}</NuxtLink></li>
                <li><NuxtLink to="/resources/pricing" class="text-white opacity-75">{{ t('nav.pricing') }}</NuxtLink></li>
                <li><NuxtLink to="/about-us" class="text-white opacity-75">{{ t('footer.about') }}</NuxtLink></li>
              </ul>
            </div>
          </div>

          <!-- Contact -->
          <div class="col-lg-4 col-md-6">
            <div class="footer-widget">
              <h4 class="widget-title text-white">{{ t('footer.contact') }}</h4>
              <div class="contactInfowrap">
                <div class="singleinfo d-flex align-items-start mb-3">
                  <div class="icons me-3"><i class="bi bi-geo-alt-fill text-primary"></i></div>
                  <div class="caps">
                    <p class="text-white opacity-75 mb-0">
                      Guangzhou, Chine<br />Abidjan, Cote d'Ivoire
                    </p>
                  </div>
                </div>
                <div class="singleinfo d-flex align-items-start mb-3">
                  <div class="icons me-3"><i class="bi bi-telephone-fill text-primary"></i></div>
                  <div class="caps">
                    <p class="text-white opacity-75 mb-0">
                      +86 138 0000 1234<br />+225 01 23 45 67
                    </p>
                  </div>
                </div>
                <div class="singleinfo d-flex align-items-start">
                  <div class="icons me-3"><i class="bi bi-envelope-fill text-primary"></i></div>
                  <div class="caps">
                    <p class="text-white opacity-75 mb-0">contact@nadom.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="row border-top border-secondary pt-4 mt-4">
          <div class="col-md-6 text-center text-md-start">
            <p class="text-white opacity-50 mb-0">
              &copy; {{ currentYear }} NADOM. {{ t('footer.rights') }}.
            </p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <NuxtLink to="/privacy-policy" class="text-white opacity-50 me-3">
              {{ locale === 'fr' ? 'Confidentialite' : 'Privacy' }}
            </NuxtLink>
            <NuxtLink to="/faq" class="text-white opacity-50">
              {{ locale === 'fr' ? 'CGV' : 'Terms' }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>

    <!-- Notifications Toast -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast show"
        :class="{
          'bg-success text-white': notif.type === 'success',
          'bg-danger text-white': notif.type === 'error',
          'bg-warning': notif.type === 'warning',
          'bg-info text-white': notif.type === 'info'
        }"
        role="alert"
      >
        <div class="toast-body d-flex justify-content-between align-items-center">
          {{ notif.message }}
          <button
            type="button"
            class="btn-close btn-close-white ms-2"
            @click="removeNotification(notif.id)"
          ></button>
        </div>
      </div>
    </div>

    <!-- WhatsApp Button -->
    <a
      :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`"
      target="_blank"
      class="whatsapp-float"
      title="Contactez-nous sur WhatsApp"
    >
      <i class="bi bi-whatsapp"></i>
    </a>

    <!-- Back to Top -->
    <div v-show="isScrolled" class="back-to-top" @click="scrollToTop">
      <i class="bi bi-chevron-up"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { notifications, removeNotification } = useNotification()
const { locale, setLocale, t } = useI18n()

// State
const isScrolled = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const toggleMenu = ref(false)
const activeDropdown = ref<string | null>(null)
const currentYear = new Date().getFullYear()
const orderCount = ref(0)

// Language
const currentLocale = computed(() => locale.value)
const currentFlag = computed(() => (locale.value === 'fr' ? 'fi-fr' : 'fi-gb'))
const currentLang = computed(() => (locale.value === 'fr' ? 'FR' : 'EN'))

const switchLanguage = (lang: 'fr' | 'en') => {
  setLocale(lang)
}

const toggleDropdown = (name: string) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)


// Methods
const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY >= 50
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value > 991) {
    toggleMenu.value = false
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}



// Close menu and dropdowns on route change
watch(
  () => route.path,
  () => {
    toggleMenu.value = false
    activeDropdown.value = null
  }
)

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.lh-nav-item.lh-dropdown')) {
    activeDropdown.value = null
  }
}

// Lifecycle
onMounted(() => {
  authStore.initializeAuth()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.main-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* ===== ListingHub Navbar Styles ===== */
.header-listinghub {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 1000;
}

.header-scrolled {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease;
}

.header-spacer {
  height: 70px;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.navbar-listinghub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 70px;
}

/* Brand/Logo */
.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  height: 45px;
  width: auto;
  object-fit: contain;
}

@media (max-width: 991px) {
  .brand-logo {
    height: 38px;
  }
}

/* Mobile Toggle */
.navbar-toggler {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  padding: 0.5rem;
  order: 3;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  order: 2;
}

.mobile-action-btn {
  color: #555;
  font-size: 1.3rem;
}

/* Navigation Collapse */
.lh-collapse {
  display: none;
}

@media (min-width: 992px) {
  .lh-collapse,
  .lh-collapse.show {
    display: flex !important;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    margin-left: 2rem;
    position: static;
    width: auto;
    height: auto;
    background: transparent;
    box-shadow: none;
    padding: 0;
    animation: none;
  }
}

@media (max-width: 991px) {
  .lh-collapse.show {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100vh;
    background: #fff;
    z-index: 9999;
    overflow-y: auto;
    padding: 1rem;
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.lh-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
}

/* Nav Items */
.lh-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

@media (max-width: 991px) {
  .lh-nav {
    flex-direction: column;
    margin-top: 3rem;
  }
}

.lh-nav-item {
  position: relative;
}

.lh-link {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.75rem 1rem;
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
}

.lh-link:hover,
.lh-nav-item.active > .lh-link {
  color: #dc3545;
}

.lh-link .bi-chevron-down {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

/* Dropdown */
.lh-nav-item.lh-dropdown:hover > .lh-dropdown-menu,
.lh-dropdown-menu.show {
  display: block;
}

.lh-dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: #fff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  z-index: 1000;
  list-style: none;
  margin: 0;
}

.lh-dropdown-menu.lh-dropdown-end {
  right: 0;
  left: auto;
}

@media (max-width: 991px) {
  .lh-dropdown-menu {
    position: static;
    box-shadow: none;
    padding-left: 1rem;
    background: #f8f9fa;
    border-radius: 0;
  }
}

.lh-dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.lh-dropdown-item:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.lh-dropdown-item i {
  color: #999;
  width: 20px;
}

.lh-divider {
  margin: 0.5rem 0;
  border-color: #eee;
}

/* Right Side Nav */
.lh-nav-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 991px) {
  .lh-nav-right {
    flex-direction: column;
    align-items: stretch;
    border-top: 1px solid #eee;
    margin-top: 1rem;
    padding-top: 1rem;
  }
}

.lh-link-signin {
  color: #333 !important;
  font-weight: 600;
}

.lh-link-signin:hover {
  color: #dc3545 !important;
}

/* Cart Badge */
.lh-nav-cart .lh-link {
  position: relative;
}

.lh-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 18px;
  height: 18px;
  background: #dc3545;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* User Avatar */
.lh-link-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lh-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* CTA Button */
.lh-btn-cta {
  background: #dc3545;
  color: #fff !important;
  border: none;
  border-radius: 25px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}

.lh-btn-cta:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
}

/* Footer Logo */
.footer-logo {
  max-width: 160px;
  height: auto;
  filter: brightness(0) invert(1);
}

/* ===== Other Elements ===== */
.whatsapp-float {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: #25d366;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
  z-index: 999;
  transition: all 0.3s ease;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  color: #fff;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 20px;
  width: 45px;
  height: 45px;
  background: var(--bs-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 998;
  transition: all 0.3s ease;
}

.back-to-top:hover {
  transform: translateY(-3px);
}

.toast-container {
  z-index: 9999;
}

/* Flag icons */
.fi {
  width: 20px;
  height: 15px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
  vertical-align: middle;
}

.fi-fr {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3Crect fill='%23002395' width='1' height='2'/%3E%3Crect fill='%23fff' x='1' width='1' height='2'/%3E%3Crect fill='%23ED2939' x='2' width='1' height='2'/%3E%3C/svg%3E");
}

.fi-gb {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3Crect fill='%23012169' width='60' height='30'/%3E%3Cpath d='M0 0L60 30M60 0L0 30' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 0L60 30M60 0L0 30' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0V30M0 15H60' stroke='%23fff' stroke-width='10'/%3E%3Cpath d='M30 0V30M0 15H60' stroke='%23C8102E' stroke-width='6'/%3E%3C/svg%3E");
}
</style>
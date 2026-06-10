<template>
  <div class="wysiwyg-editor">
    <div ref="editorRef" :style="{ height: height || '200px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { youtubeEmbedSrc } from '~/composables/useBlogBodyHtml'

const props = defineProps<{
  modelValue: string
  height?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLElement | null>(null)
let quill: Quill | null = null
let suppressEmit = false
let _modalEl: Element | null = null
let _modalShownHandler: (() => void) | null = null
let _tabRoot: Element | null = null
let _tabShownHandler: ((e: Event) => void) | null = null
let _io: IntersectionObserver | null = null

const isVisible = (el: HTMLElement) => el.offsetParent !== null

const detachDeferredListeners = () => {
  if (_modalEl && _modalShownHandler) {
    _modalEl.removeEventListener('shown.bs.modal', _modalShownHandler)
    _modalShownHandler = null
    _modalEl = null
  }
  if (_tabRoot && _tabShownHandler) {
    _tabRoot.removeEventListener('shown.bs.tab', _tabShownHandler)
    _tabShownHandler = null
    _tabRoot = null
  }
  if (_io) {
    _io.disconnect()
    _io = null
  }
}

const tryInitWhenVisible = () => {
  if (!editorRef.value || quill) return
  if (!isVisible(editorRef.value as HTMLElement)) return
  initQuill()
  detachDeferredListeners()
}

const initQuill = () => {
  if (!editorRef.value || quill) return
  if (!isVisible(editorRef.value as HTMLElement)) return

  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder || 'Saisissez votre texte...',
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['blockquote', 'link', 'video'],
          ['clean'],
        ],
        handlers: {
          // Insertion d'une vidéo : on accepte une URL YouTube (watch, youtu.be,
          // shorts) et on la normalise en /embed/ pour un rendu fiable.
          video() {
            const input = window.prompt('URL de la vidéo (YouTube)')
            if (!input) return
            const src = youtubeEmbedSrc(input) || input.trim()
            const range = quill?.getSelection(true)
            const index = range ? range.index : (quill?.getLength() ?? 1) - 1
            quill?.insertEmbed(index, 'video', src, 'user')
            quill?.setSelection(index + 1, 0, 'silent')
          },
        },
      },
    },
  })

  if (props.modelValue) {
    suppressEmit = true
    quill.clipboard.dangerouslyPasteHTML(props.modelValue)
    suppressEmit = false
  }

  quill.on('text-change', () => {
    if (suppressEmit || !quill) return
    const html = quill.root.innerHTML
    emit('update:modelValue', html === '<p><br></p>' ? '' : html)
  })
}

onMounted(async () => {
  await nextTick()
  if (!editorRef.value) return

  const el = editorRef.value as HTMLElement
  const tabPane = el.closest('.tab-pane') as HTMLElement | null
  const modal = el.closest('.modal')
  const inInactiveTab = Boolean(tabPane && !tabPane.classList.contains('active'))

  if (isVisible(el) && !inInactiveTab) {
    initQuill()
    return
  }

  // Onglet masqué (EN / 中文) : init uniquement quand l'onglet devient actif.
  if (inInactiveTab && tabPane?.id) {
    const tabTarget = `#${tabPane.id}`
    _tabRoot = modal || tabPane.closest('.tab-content') || document.body
    _tabShownHandler = (e: Event) => {
      const target = (e.target as HTMLElement)?.getAttribute?.('data-bs-target')
      if (target === tabTarget) {
        nextTick().then(tryInitWhenVisible)
      }
    }
    _tabRoot.addEventListener('shown.bs.tab', _tabShownHandler)
  }

  // Modal fermé ou onglet actif pas encore peint : attendre shown.bs.modal.
  if (modal && !inInactiveTab) {
    _modalEl = modal
    _modalShownHandler = () => {
      nextTick().then(tryInitWhenVisible)
    }
    modal.addEventListener('shown.bs.modal', _modalShownHandler)
  }

  // Fallback générique : bascule via v-show (ex. footer FR/EN/中文), accordéon, etc.
  // L'IntersectionObserver initialise Quill dès que l'élément devient visible.
  if (!quill && typeof IntersectionObserver !== 'undefined') {
    _io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        nextTick().then(tryInitWhenVisible)
      }
    })
    _io.observe(el)
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!quill) return
    if (newVal === quill.root.innerHTML) return
    suppressEmit = true
    quill.clipboard.dangerouslyPasteHTML(newVal || '')
    suppressEmit = false
  },
)

onBeforeUnmount(() => {
  detachDeferredListeners()
  if (quill) {
    quill.off('text-change')
    quill = null
  }
})
</script>

<style>
.wysiwyg-editor .ql-toolbar.ql-snow {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-color: #e2e8f0;
  background-color: #f8fafc;
  padding: 6px 8px;
  flex-wrap: wrap;
}

.wysiwyg-editor .ql-container.ql-snow {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-color: #e2e8f0;
  font-family: inherit;
  font-size: 0.9rem;
  background-color: #fff;
}

.wysiwyg-editor .ql-editor {
  min-height: 120px;
  line-height: 1.6;
  cursor: text;
}

.wysiwyg-editor .ql-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}

/* Vidéos insérées via le bouton vidéo (Quill) : rendu responsive 16/9 */
.wysiwyg-editor .ql-editor iframe.ql-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  min-height: 180px;
  max-height: 420px;
  border: 0;
  border-radius: 8px;
  display: block;
  margin: 12px 0;
}

.wysiwyg-editor .ql-editor.ql-blank::before {
  color: #94a3b8;
  font-style: normal;
}

.wysiwyg-editor .ql-toolbar.ql-snow .ql-formats {
  margin-right: 8px;
}

/* Dropdowns & tooltips Quill au-dessus du backdrop Bootstrap */
.wysiwyg-editor .ql-toolbar .ql-picker-options,
.wysiwyg-editor .ql-tooltip {
  z-index: 2050;
}

/* Empêche que le scroll du container bloque les clics sur l'éditeur */
.wysiwyg-editor {
  position: relative;
}
</style>

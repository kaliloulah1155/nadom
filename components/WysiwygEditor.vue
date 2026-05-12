<template>
  <div class="wysiwyg-editor">
    <div ref="editorRef" :style="{ height: height || '200px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps<{
  modelValue: string
  height?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLElement | null>(null)
let quill: Quill | null = null
let suppressEmit = false

onMounted(async () => {
  await nextTick()
  if (!editorRef.value) {
    console.warn('[WysiwygEditor] editorRef is null, cannot init Quill')
    return
  }

  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder || 'Saisissez votre texte...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ align: [] }, { direction: 'rtl' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    },
  })

  // Contenu initial
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
  padding: 8px;
}

.wysiwyg-editor .ql-container.ql-snow {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-color: #e2e8f0;
  font-family: inherit;
  font-size: 0.95rem;
  background-color: #fff;
}

.wysiwyg-editor .ql-editor {
  min-height: 150px;
  line-height: 1.6;
}

.wysiwyg-editor .ql-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

.wysiwyg-editor .ql-editor.ql-blank::before {
  color: #94a3b8;
  font-style: normal;
}

.wysiwyg-editor .ql-toolbar.ql-snow .ql-formats {
  margin-right: 12px;
}

/* Au-dessus du backdrop/modal Bootstrap (Quill dropdowns & tooltips) */
.wysiwyg-editor .ql-toolbar .ql-picker-options,
.wysiwyg-editor .ql-tooltip {
  z-index: 2000;
}
</style>

<template>
  <div class="wysiwyg-editor">
    <div ref="editorRef" :style="{ height: height || '200px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  height?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLElement | null>(null)
let quill: any = null

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).Quill) {
    const Quill = (window as any).Quill
    
    quill = new Quill(editorRef.value, {
      theme: 'snow',
      placeholder: props.placeholder || 'Saisissez votre texte...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'clean']
        ]
      }
    })

    // Set initial content
    if (props.modelValue) {
      quill.root.innerHTML = props.modelValue
    }

    // Handle text change
    quill.on('text-change', () => {
      const html = quill.root.innerHTML
      if (html === '<p><br></p>') {
        emit('update:modelValue', '')
      } else {
        emit('update:modelValue', html)
      }
    })
  }
})

// Watch for external content changes
watch(() => props.modelValue, (newVal) => {
  if (quill && newVal !== quill.root.innerHTML) {
    quill.root.innerHTML = newVal || ''
  }
})

onBeforeUnmount(() => {
  if (quill) {
    quill.off('text-change')
    quill = null
  }
})
</script>

<style>
.wysiwyg-editor .ql-toolbar.ql-snow {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-color: #dee2e6;
  background-color: #f8f9fa;
}
.wysiwyg-editor .ql-container.ql-snow {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border-color: #dee2e6;
  font-family: inherit;
  font-size: 0.9rem;
}
.wysiwyg-editor .ql-editor {
  min-height: 100px;
}
</style>
